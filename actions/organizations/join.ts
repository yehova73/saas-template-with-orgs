"use server";

import { handleNewUserFields } from "@/actions/account/account";
import { ServerActionResponse } from "@/hooks/use-server-action";
import { authOptions } from "@/lib/auth";
import { emailService } from "@/lib/emails/email-service";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { hashInviteToken } from "./utils";

export const getOrganizationInviteByToken = async (token: string) => {
  const invite = await prisma.organizationInvite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    include: {
      organization: { select: { id: true, name: true } },
      role: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!invite || invite.revokedAt || invite.acceptedAt) {
    return null;
  }

  if (invite.expiresAt < new Date()) {
    return null;
  }

  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    project: invite.project,
    organization: invite.organization,
  };
};

const acceptInviteForUser = async (params: {
  token: string;
  userId: string;
}) => {
  const invite = await prisma.organizationInvite.findUnique({
    where: { tokenHash: hashInviteToken(params.token) },
    select: {
      id: true,
      email: true,
      organizationId: true,
      roleId: true,
      projectId: true,
      projectRole: true,
      acceptedAt: true,
      revokedAt: true,
      expiresAt: true,
      organization: true,
    },
  });

  if (
    !invite ||
    invite.revokedAt ||
    invite.acceptedAt ||
    invite.expiresAt < new Date()
  ) {
    throw new Error("Invite is no longer valid");
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true, email: true },
  });

  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new Error("This invite belongs to a different email address");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.organizationMembership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invite.organizationId,
        },
      },
      create: {
        userId: user.id,
        organizationId: invite.organizationId,
        roleId: invite.roleId,
      },
      update: {},
    });
    if (invite.projectId) {
      await transaction.projectMembership.upsert({
        where: {
          projectId_userId: { projectId: invite.projectId, userId: user.id },
        },
        create: {
          projectId: invite.projectId,
          userId: user.id,
          role: invite.projectRole || "USER",
        },
        update: {},
      });
    }
    await transaction.organizationInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  });

  return invite.organizationId;
};

export const acceptOrganizationInviteAction = async (
  token: string,
): Promise<ServerActionResponse<{ organizationId: string }>> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      status: "error",
      message: { title: "Sign in required" },
    };
  }

  try {
    const organizationId = await acceptInviteForUser({
      token,
      userId: session.user.id,
    });

    return {
      status: "ok",
      requireRefresh: true,
      message: { title: "Invite accepted" },
      data: { organizationId },
    };
  } catch (error) {
    return {
      status: "error",
      message: {
        title:
          error instanceof Error ? error.message : "Unable to accept invite",
      },
    };
  }
};

export const acceptOrganizationInviteByIdAction = async (
  inviteId: string,
): Promise<ServerActionResponse<{ organizationId: string }>> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email) {
    return {
      status: "error",
      message: { title: "Sign in required" },
    };
  }

  const invite = await prisma.organizationInvite.findUnique({
    where: { id: inviteId },
    select: {
      id: true,
      email: true,
      organizationId: true,
      acceptedAt: true,
      revokedAt: true,
      expiresAt: true,
      roleId: true,
      projectId: true,
      projectRole: true,
    },
  });

  if (
    !invite ||
    invite.revokedAt ||
    invite.acceptedAt ||
    invite.expiresAt < new Date()
  ) {
    return {
      status: "error",
      message: { title: "Invite is no longer valid" },
    };
  }

  if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return {
      status: "error",
      message: { title: "This invite belongs to a different email address" },
    };
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.organizationMembership.upsert({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: invite.organizationId,
        },
      },
      create: {
        userId: session.user.id,
        organizationId: invite.organizationId,
        roleId: invite.roleId,
      },
      update: {},
    });
    if (invite.projectId) {
      await transaction.projectMembership.upsert({
        where: {
          projectId_userId: {
            projectId: invite.projectId,
            userId: session.user.id,
          },
        },
        create: {
          projectId: invite.projectId,
          userId: session.user.id,
          role: invite.projectRole || "USER",
        },
        update: {},
      });
    }
    await transaction.organizationInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  });

  return {
    status: "ok",
    requireRefresh: true,
    message: { title: "Invite accepted" },
    data: { organizationId: invite.organizationId },
  };
};

export const createAccountAndAcceptInviteAction = async (params: {
  token: string;
  name: string;
  password: string;
}): Promise<
  ServerActionResponse<{ organizationId: string; email: string }>
> => {
  const invite = await getOrganizationInviteByToken(params.token);

  if (!invite) {
    return {
      status: "error",
      message: { title: "Invite is no longer valid" },
    };
  }

  const name = params.name.trim();
  if (!name || !params.password) {
    return {
      status: "error",
      message: { title: "Name and password are required" },
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      status: "error",
      message: {
        title: "Account already exists. Sign in to accept this invite.",
      },
    };
  }

  const hashedPassword = await bcrypt.hash(params.password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: invite.email,
      password: hashedPassword,
    },
    select: { id: true, email: true, name: true },
  });

  await handleNewUserFields(user.id);
  await emailService.sendWelcomeEmail({
    email: user.email,
    name: user.name || "",
  });

  const organizationId = await acceptInviteForUser({
    token: params.token,
    userId: user.id,
  });

  return {
    status: "ok",
    message: { title: "Account created" },
    data: { organizationId, email: user.email },
  };
};

export const createAccountForInviteAction = async (params: {
  token: string;
  name: string;
  email: string;
  password: string;
}): Promise<{ status: "ok" | "error"; message: { title: string } }> => {
  const invite = await getOrganizationInviteByToken(params.token);

  if (
    !invite ||
    invite.email.toLowerCase() !== params.email.trim().toLowerCase()
  ) {
    return {
      status: "error",
      message: { title: "Invite is no longer valid" },
    };
  }

  const name = params.name.trim();
  const email = params.email.trim().toLowerCase();
  if (!name || !params.password) {
    return {
      status: "error",
      message: { title: "Name and password are required" },
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      status: "error",
      message: { title: "Account already exists. Sign in instead." },
    };
  }

  const hashedPassword = await bcrypt.hash(params.password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, email: true, name: true },
  });

  await handleNewUserFields(user.id);
  await emailService.sendWelcomeEmail({
    email: user.email,
    name: user.name || "",
  });

  return { status: "ok", message: { title: "Account created" } };
};
