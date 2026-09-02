"use server";

import { SubscriptionType } from "@/lib/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { FeatureAccessConfig } from "@/lib/subscriptions";

export const updateSubscriptionAndFeatureAccess = async (params: {
  organizationId: string;
  subscriptionType: SubscriptionType;
}) => {
  const { subscriptionType, organizationId } = params;
  const organizationExists = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  });
  if (!organizationExists) {
    throw new Error("Organization not found");
  }

  const data =
    FeatureAccessConfig[subscriptionType] ||
    FeatureAccessConfig[SubscriptionType.FREE];
  console.log("new features for organization", organizationId, data);
  const upserted = await prisma.organizationFeatureAccess.upsert({
    where: { organizationId },
    create: {
      organizationId,
      ...data,
    },
    update: {
      ...data,
    },
  });

  return upserted;
};
