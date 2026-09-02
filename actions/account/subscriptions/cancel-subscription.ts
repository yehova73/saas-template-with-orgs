"use server";

import { requireOrganizationPermission } from "@/actions/organizations/organization";
import { prisma } from "@/lib/prisma";
import { stripe } from "./config";
import { ServerActionResponse } from "@/hooks/use-server-action";

export const cancelSubscriptionAction = async (): Promise<
  ServerActionResponse<null>
> => {
  const { organization } = await requireOrganizationPermission("manageBilling");
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId: organization.id },
  });

  if (!subscription?.stripeSubscriptionId) {
    return {
      status: "error",
      message: { title: "No Stripe subscription found" },
    };
  }

  const canceledSubscription = await stripe.subscriptions.update(
    subscription.stripeSubscriptionId,
    { cancel_at_period_end: true },
  );

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      subscriptionCanceledAt: canceledSubscription.cancel_at
        ? new Date(canceledSubscription.cancel_at * 1000)
        : null,
    },
  });

  return {
    status: "ok",
    requireRefresh: true,
    message: { title: "Subscription canceled" },
  };
};
