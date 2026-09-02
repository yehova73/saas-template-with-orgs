"use server";

import { ServerActionResponse } from "@/hooks/use-server-action";
import { emailService } from "@/lib/emails/email-service";
import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";
import { requireOrganizationAdmin } from "./organization";
import { canInviteMember } from "./check-permissions";
import {
  createInviteToken,
  normalizeEmail,
  hashInviteToken,
  INVITE_EXPIRATION_DAYS,
  buildInviteUrl,
} from "./utils";
import { OrganizationRole } from "@/lib/generated/prisma/browser";

export const updateOrganizationNameAction = async (data: {
  name: string;
}): Promise<ServerActionResponse<{ name: string }>> => {
  const { organization } = await requireOrganizationAdmin();
  const name = data.name.trim();

  if (!name) {
    return {
      status: "error",
      message: { title: "Organization name is required" },
    };
  }

  const updated = await prisma.organization.update({
    where: { id: organization.id },
    data: { name },
    select: { name: true },
  });

  return {
    status: "ok",
    requireRefresh: true,
    message: { title: "Organization updated" },
    data: updated,
  };
};

export const deleteOrganizationAction = async (): Promise<
  ServerActionResponse<{ nextOrgId: string | null }>
> => {
  const { organization, user } = await requireOrganizationAdmin();

  const activePaidSubscription = await prisma.subscription.findFirst({
    where: {
      organizationId: organization.id,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  if (activePaidSubscription) {
    return {
      status: "error",
      message: {
        title: "Cancel billing first",
        description:
          "Cancel the paid subscription before deleting this organization.",
      },
    };
  }

  await prisma.organization.update({
    where: { id: organization.id },
    data: { deletedAt: new Date() },
  });

  const nextMembership = await prisma.organizationMembership.findFirst({
    where: {
      userId: user.id,
      organization: { deletedAt: null },
      organizationId: { not: organization.id },
    },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    status: "ok",
    message: { title: "Organization deleted" },
    data: { nextOrgId: nextMembership?.organizationId ?? null },
  };
};

export const inviteOrganizationMemberAction = async (data: {
  email: string;
  role: OrganizationRole;
}): Promise<ServerActionResponse<{ id: string }>> => {
  const { organization, user } = await requireOrganizationAdmin();
  const email = normalizeEmail(data.email);

  const permission = await canInviteMember();
  if (!permission.allowed) {
    return {
      status: "require_subscription_upgrade",
      message: {
        title: "Member limit reached",
        description: "Upgrade your plan to invite more members.",
      },
    };
  }

  if (!email) {
    return {
      status: "error",
      message: { title: "Email is required" },
    };
  }

  const existingMembership = await prisma.organizationMembership.findFirst({
    where: {
      organizationId: organization.id,
      user: { email },
    },
    select: { id: true },
  });

  if (existingMembership) {
    return {
      status: "error",
      message: { title: "This user is already a member" },
    };
  }

  const existingInvite = await prisma.organizationInvite.findFirst({
    where: {
      organizationId: organization.id,
      email,
      acceptedAt: null,
      revokedAt: null,
    },
    select: { id: true },
  });

  if (existingInvite) {
    return {
      status: "error",
      message: { title: "An invitation is already pending for this user" },
    };
  }

  const token = createInviteToken();

  const invite = await prisma.organizationInvite.create({
    data: {
      organizationId: organization.id,
      email,
      role: data.role,
      tokenHash: hashInviteToken(token),
      expiresAt: addDays(new Date(), INVITE_EXPIRATION_DAYS),
      invitedByUserId: user.id,
    },
  });

  const inviteUrl = buildInviteUrl(token);
  await emailService.sendOrganizationInviteEmail({
    email,
    organizationName: organization.name,
    inviterName: user.name || undefined,
    inviteUrl: inviteUrl,
  });

  console.log(`Invite URL: ${inviteUrl}`);

  return {
    status: "ok",
    requireRefresh: true,
    message: { title: "Invite sent" },
    data: { id: invite.id },
  };
};

export const resendOrganizationInviteAction = async (
  inviteId: string,
): Promise<ServerActionResponse<null>> => {
  const { organization, user } = await requireOrganizationAdmin();
  const invite = await prisma.organizationInvite.findFirst({
    where: {
      id: inviteId,
      organizationId: organization.id,
      acceptedAt: null,
      revokedAt: null,
    },
  });

  if (!invite) {
    return {
      status: "error",
      message: { title: "Invite not found" },
    };
  }

  const token = createInviteToken();

  await prisma.organizationInvite.update({
    where: { id: invite.id },
    data: {
      tokenHash: hashInviteToken(token),
      expiresAt: addDays(new Date(), INVITE_EXPIRATION_DAYS),
    },
  });

  const inviteUrl = buildInviteUrl(token);
  await emailService.sendOrganizationInviteEmail({
    email: invite.email,
    organizationName: organization.name,
    inviterName: user.name || undefined,
    inviteUrl: inviteUrl,
  });
  console.log(`Invite URL: ${inviteUrl}`);

  return {
    status: "ok",
    requireRefresh: true,
    message: { title: "Invite resent" },
    data: null,
  };
};

export const revokeOrganizationInviteAction = async (
  inviteId: string,
): Promise<ServerActionResponse<null>> => {
  const { organization } = await requireOrganizationAdmin();

  await prisma.organizationInvite.updateMany({
    where: {
      id: inviteId,
      organizationId: organization.id,
      acceptedAt: null,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });

  return {
    status: "ok",
    requireRefresh: true,
    message: { title: "Invite revoked" },
    data: null,
  };
};

export const removeOrganizationMemberAction = async (
  membershipId: string,
): Promise<ServerActionResponse<null>> => {
  const { organization } = await requireOrganizationAdmin();
  const membership = await prisma.organizationMembership.findFirst({
    where: { id: membershipId, organizationId: organization.id },
  });

  if (!membership) {
    return {
      status: "error",
      message: { title: "Member not found" },
    };
  }

  if (membership.role === "ADMIN") {
    const adminCount = await prisma.organizationMembership.count({
      where: { organizationId: organization.id, role: "ADMIN" },
    });

    if (adminCount <= 1) {
      return {
        status: "error",
        message: { title: "Organizations need at least one admin" },
      };
    }
  }

  await prisma.organizationMembership.delete({ where: { id: membership.id } });

  return {
    status: "ok",
    requireRefresh: true,
    message: { title: "Member removed" },
    data: null,
  };
};

export const updateOrganizationMemberRoleAction = async (data: {
  membershipId: string;
  role: OrganizationRole;
}): Promise<ServerActionResponse<null>> => {
  const { organization } = await requireOrganizationAdmin();
  const membership = await prisma.organizationMembership.findFirst({
    where: { id: data.membershipId, organizationId: organization.id },
    select: { id: true, role: true },
  });

  if (!membership) {
    return {
      status: "error",
      message: { title: "Member not found" },
    };
  }

  if (membership.role === data.role) {
    return { status: "ok", data: null };
  }

  if (
    membership.role === OrganizationRole.ADMIN &&
    data.role !== OrganizationRole.ADMIN
  ) {
    const adminCount = await prisma.organizationMembership.count({
      where: { organizationId: organization.id, role: OrganizationRole.ADMIN },
    });

    if (adminCount <= 1) {
      return {
        status: "error",
        message: { title: "Organizations need at least one admin" },
      };
    }
  }

  await prisma.organizationMembership.update({
    where: { id: membership.id },
    data: { role: data.role },
  });

  return {
    status: "ok",
    requireRefresh: true,
    message: { title: "Member role updated" },
    data: null,
  };
};
