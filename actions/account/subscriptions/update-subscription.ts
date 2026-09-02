"use server";

import { requireOrganizationAdmin } from "@/actions/organizations/organization";
import { prisma } from "@/lib/prisma";
import { stripe } from "./config";
import { getCurrentSubscriptionAction } from "./get-current-subscription";
import { handleSubscriptionStatusUpdate } from "./handle-subscription-status-update";
import { ServerActionResponse } from "@/hooks/use-server-action";

export const changeSubscriptionAction = async (
  newPriceId: string,
): Promise<ServerActionResponse<null>> => {
  const { organization } = await requireOrganizationAdmin();

  const subscription = await getCurrentSubscriptionAction();
  if (
    !subscription.states.isActive ||
    !subscription.subscription?.stripeSubscriptionId
  ) {
    return {
      status: "error",
      message: { title: "No active subscription found" },
    };
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.subscription.stripeSubscriptionId,
  );

  const updated = await stripe.subscriptions.update(
    subscription.subscription.stripeSubscriptionId,
    {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      trial_end: "now",
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
    },
  );

  await handleSubscriptionStatusUpdate({
    subscription: updated,
    organizationId: organization.id,
  });

  await prisma.subscription.updateMany({
    where: { organizationId: organization.id },
    data: { stripeCustomerId: updated.customer.toString() },
  });

  return {
    status: "ok",
    requireRefresh: true,
    message: { title: "Subscription updated" },
  };
};
