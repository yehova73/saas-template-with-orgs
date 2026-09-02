"use client";

import { subscriptionsConfig } from "@/lib/subscriptions";
import { useState } from "react";
import { PlanCard } from "./plan-card";
import { UnsubscribeModal } from "./unsubscribe-modal";
import { getCurrentSubscriptionAction } from "@/actions/account/subscriptions/get-current-subscription";
import { createStripeSessionAction } from "@/actions/account/subscriptions/create-stripe-session";
import { changeSubscriptionAction } from "@/actions/account/subscriptions/update-subscription";
import { cancelSubscriptionAction } from "@/actions/account/subscriptions/cancel-subscription";
import useServerAction from "@/hooks/use-server-action";

export function PricingCards({
  subscription,
}: {
  subscription: Awaited<ReturnType<typeof getCurrentSubscriptionAction>>;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const { call: createSession, loading: isLoading } = useServerAction(
    createStripeSessionAction,
  );
  const { call: changeSubscription } = useServerAction(
    changeSubscriptionAction,
  );
  const { call: cancelSubscription } = useServerAction(
    cancelSubscriptionAction,
  );
  const isPro = subscription.subscription?.type === "PRO";

  async function selectPlan(plan: (typeof subscriptionsConfig)[number]) {
    if (plan.type === "STARTER") {
      setCancelOpen(true);
      return;
    }

    if (isPro) {
      await changeSubscription(plan.monthly.priceId);
      return;
    }

    const data = await createSession(plan.monthly.priceId);
    if (data?.url) {
      window.location.assign(data.url);
    }
  }

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {subscriptionsConfig.map((sub) => (
          <PlanCard
            key={sub.name}
            name={sub.name}
            price={{
              priceId: sub.monthly.priceId,
              monthlyPrice: sub.monthly.priceValue
                ? `$${sub.monthly.priceValue}`
                : "Free",
            }}
            features={sub.features}
            active={subscription?.subscription?.type === sub.type}
            onSelect={() => selectPlan(sub)}
            disabled={isLoading}
          />
        ))}
      </div>

      <UnsubscribeModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => cancelSubscription()}
      />
    </div>
  );
}
