"use server";

import { prisma } from "@/lib/prisma";
import { requireActiveOrganization } from "./organization";

type PermissionResult =
  | { allowed: true }
  | { allowed: false; reason: "require_subscription_upgrade" };

async function isSubscriptionBlocked(organizationId: string): Promise<boolean> {
  const org = await prisma.organization.findFirst({
    where: { id: organizationId },
    select: {
      trialEndsAt: true,
      subscription: { select: { status: true, currentPeriodEnd: true } },
    },
  });

  const sub = org?.subscription;
  if (!sub) return false;

  const isActive =
    sub.status === "ACTIVE" &&
    (!sub.currentPeriodEnd || sub.currentPeriodEnd >= new Date());

  const isTrialActive =
    isActive && !!org?.trialEndsAt && org.trialEndsAt >= new Date();

  return !isActive && !isTrialActive;
}

export async function canCreateProject(): Promise<PermissionResult> {
  const { organization } = await requireActiveOrganization();

  if (await isSubscriptionBlocked(organization.id))
    return { allowed: false, reason: "require_subscription_upgrade" };

  const featureAccess = await prisma.organizationFeatureAccess.findUnique({
    where: { organizationId: organization.id },
    select: { projectsLimit: true },
  });

  const limit = featureAccess?.projectsLimit ?? null;
  if (limit === null) return { allowed: true };

  const count = await prisma.project.count({
    where: { organizationId: organization.id },
  });

  if (count >= limit)
    return { allowed: false, reason: "require_subscription_upgrade" };
  return { allowed: true };
}

export async function canInviteMember(): Promise<PermissionResult> {
  const { organization } = await requireActiveOrganization();

  if (await isSubscriptionBlocked(organization.id))
    return { allowed: false, reason: "require_subscription_upgrade" };

  const featureAccess = await prisma.organizationFeatureAccess.findUnique({
    where: { organizationId: organization.id },
    select: { membersLimit: true },
  });

  const limit = featureAccess?.membersLimit ?? null;
  if (limit === null) return { allowed: true };

  const count = await prisma.organizationMembership.count({
    where: { organizationId: organization.id },
  });

  if (count >= limit)
    return { allowed: false, reason: "require_subscription_upgrade" };
  return { allowed: true };
}
