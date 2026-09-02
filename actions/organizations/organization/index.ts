"use server";

import { ServerActionResponse } from "@/hooks/use-server-action";
import { prisma } from "@/lib/prisma";
import { FeatureAccessConfig } from "@/lib/subscriptions";
import { SubscriptionType } from "@/lib/generated/prisma/browser";
import { addDays } from "date-fns";
import { getPotentialUserFromServerSession } from "./context";

export * from "./context";
export * from "./permissions";
export * from "./roles";

export const setActiveOrganizationAction = async (
  organizationId: string,
): Promise<ServerActionResponse<{ activeOrgId: string }>> => {
  const user = await getPotentialUserFromServerSession();
  if (!user?.id)
    return { status: "error", message: { title: "Sign in required" } };

  const membership = await prisma.organizationMembership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId } },
    select: { id: true },
  });
  if (!membership)
    return { status: "error", message: { title: "Organization not found" } };
  return { status: "ok", data: { activeOrgId: organizationId } };
};

export const createOrganizationAction = async (data: {
  name: string;
}): Promise<ServerActionResponse<{ organizationId: string }>> => {
  const user = await getPotentialUserFromServerSession();
  const name = data.name.trim();
  if (!user?.id)
    return { status: "error", message: { title: "Sign in required" } };
  if (!name)
    return {
      status: "error",
      message: { title: "Organization name is required" },
    };

  const organization = await prisma.$transaction(async (tx) => {
    const { organizationsCreated } = await tx.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { organizationsCreated: true },
    });
    const isFirstOrg = organizationsCreated === 0;
    const org = await tx.organization.create({
      data: {
        name,
        trialEndsAt: isFirstOrg ? addDays(new Date(), 30) : null,
        roles: {
          create: [
            {
              name: "Owner",
              manageSettings: true,
              manageBilling: true,
              manageMembers: true,
              createProject: true,
            },
            {
              name: "Admin",
              manageSettings: true,
              manageMembers: true,
              createProject: true,
            },
            { name: "Member" },
          ],
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
          create: { ...FeatureAccessConfig[SubscriptionType.STARTER] },
        },
      },
      select: { id: true, roles: { select: { id: true, name: true } } },
    });
    const ownerRole = org.roles.find((role) => role.name === "Owner");
    if (!ownerRole) throw new Error("Owner role was not created");
    await tx.organizationMembership.create({
      data: { userId: user.id, organizationId: org.id, roleId: ownerRole.id },
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
