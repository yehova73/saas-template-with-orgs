"use server";

import { prisma } from "@/lib/prisma";
import { SubscriptionType } from "@/lib/generated/prisma/enums";
import { FeatureAccessConfig } from "@/lib/subscriptions";
import { requireActiveOrganization } from "@/actions/organizations/organization/context";

export const getCurrentSubscriptionAction = async () => {
  const { organization } = await requireActiveOrganization();
  const organizationDetails = await prisma.organization.findFirst({
    where: { id: organization.id },
    select: {
      trialEndsAt: true,
      trialStartedAt: true,
      subscription: true,
      featureAccess: true,
    },
  });

  if (!organizationDetails) {
    throw new Error("Organization not found");
  }
  if (!organizationDetails?.featureAccess) {
    const newFeatureAccess = await prisma.organizationFeatureAccess.create({
      data: {
        organizationId: organization.id,
        ...FeatureAccessConfig[SubscriptionType.STARTER],
      },
    });

    organizationDetails.featureAccess = newFeatureAccess;
  }

  const isActive =
    !!organizationDetails.subscription &&
    organizationDetails.subscription.status === "ACTIVE" &&
    (!organizationDetails.subscription.currentPeriodEnd ||
      organizationDetails.subscription.currentPeriodEnd >= new Date());

  const subscriptionStatus = organizationDetails.subscription?.status ?? null;
  const cancellationDate =
    organizationDetails.subscription?.subscriptionCanceledAt;
  const isCancellationScheduled =
    isActive && !!cancellationDate && cancellationDate > new Date();

  return {
    organizationId: organization.id,
    subscription: organizationDetails.subscription || undefined,
    states: {
      isActive,
      isTrialActive:
        isActive &&
        !!organizationDetails.trialEndsAt &&
        organizationDetails.trialEndsAt >= new Date(),
      isSubscriptionActive: isActive,
      isInactive: subscriptionStatus === "INACTIVE",
      isPaymentDue: subscriptionStatus === "PAST_DUE",
      isPaymentFailed: subscriptionStatus === "PAYMENT_FAILED",
      isCanceled: subscriptionStatus === "CANCELLED",
      isCancellationScheduled,
      trialEndsAt: organizationDetails.trialEndsAt,
    },
    featureAccess: organizationDetails.featureAccess,
  };
};
