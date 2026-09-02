"use server";

import { ServerActionResponse } from "@/hooks/use-server-action";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeatureAccessConfig } from "@/lib/subscriptions";
import { SubscriptionType } from "@/lib/generated/prisma/browser";
import { addDays } from "date-fns";
import { getServerSession } from "next-auth";

export const getPotentialUserFromServerSession = async () => {
  const session = await getServerSession(authOptions);

  return session?.user;
};

export const getUserOrganizationMemberships = async () => {
  const user = await getPotentialUserFromServerSession();

  if (!user?.id) {
    return [];
  }

  return prisma.organizationMembership.findMany({
    where: {
      userId: user.id,
      organization: { deletedAt: null },
    },
    include: {
      organization: true,
    },
    orderBy: { createdAt: "asc" },
  });
};

export const getActiveOrganizationContext = async () => {
  const user = await getPotentialUserFromServerSession();

  if (!user?.id) {
    return null;
  }

  const activeOrgId = user.activeOrgId;

  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId: user.id,
      organization: { deletedAt: null },
      ...(activeOrgId ? { organizationId: activeOrgId } : {}),
    },
    include: {
      organization: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return membership
    ? {
        user,
        membership,
        organization: membership.organization,
      }
    : null;
};

export const requireActiveOrganization = async () => {
  const context = await getActiveOrganizationContext();

  if (!context) {
    throw new Error("No active organization found");
  }

  return context;
};

export const requireOrganizationAdmin = async () => {
  const context = await requireActiveOrganization();

  if (context.membership.role !== "ADMIN") {
    throw new Error("You do not have permission to manage this organization");
  }

  return context;
};

export const setActiveOrganizationAction = async (
  organizationId: string,
): Promise<ServerActionResponse<{ activeOrgId: string }>> => {
  const user = await getPotentialUserFromServerSession();

  if (!user?.id) {
    return {
      status: "error",
      message: { title: "Sign in required" },
    };
  }

  const membership = await prisma.organizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId,
      },
    },
    select: { id: true },
  });

  if (!membership) {
    return {
      status: "error",
      message: { title: "Organization not found" },
    };
  }

  return {
    status: "ok",
    data: { activeOrgId: organizationId },
  };
};

export const createOrganizationAction = async (data: {
  name: string;
}): Promise<ServerActionResponse<{ organizationId: string }>> => {
  const user = await getPotentialUserFromServerSession();
  const name = data.name.trim();

  if (!user?.id) {
    return {
      status: "error",
      message: { title: "Sign in required" },
    };
  }

  if (!name) {
    return {
      status: "error",
      message: { title: "Organization name is required" },
    };
  }

  // Use a transaction so the read-then-increment is atomic
  const organization = await prisma.$transaction(async (tx) => {
    const { organizationsCreated } = await tx.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { organizationsCreated: true },
    });

    // First org gets a 30-day trial; subsequent orgs require a paid subscription immediately
    const isFirstOrg = organizationsCreated === 0;

    const org = await tx.organization.create({
      data: {
        name,
        trialEndsAt: isFirstOrg ? addDays(new Date(), 30) : null,
        memberships: {
          create: {
            userId: user.id,
            role: "ADMIN",
          },
        },
        subscription: {
          create: {
            currentPeriodStart: new Date(),
            status: isFirstOrg ? "ACTIVE" : "INACTIVE",
            type: "STARTER",
            subscriptionStartedAt: new Date(),
          },
        },
        featureAccess: {
          create: {
            ...FeatureAccessConfig[SubscriptionType.STARTER],
          },
        },
      },
      select: { id: true },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { organizationsCreated: { increment: 1 } },
    });

    return org;
  });

  return {
    status: "ok",
    requireRefresh: true,
    message: { title: "Organization created" },
    data: { organizationId: organization.id },
  };
};
