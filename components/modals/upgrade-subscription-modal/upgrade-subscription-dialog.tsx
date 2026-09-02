"use client";

import { getCurrentSubscriptionAction } from "@/actions/account/subscriptions/get-current-subscription";
import { PricingCards } from "@/app/(dashboard)/app/settings/billing/_components/pricing-cards";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useUpgradeSubscriptionModal } from "./use-upgrade-subscription-modal";
import { Button } from "@/components/ui/button";

type Subscription = Awaited<ReturnType<typeof getCurrentSubscriptionAction>>;

export function UpgradeSubscriptionDialog() {
  const { open, closeDialog } = useUpgradeSubscriptionModal();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!open) return;
    getCurrentSubscriptionAction()
      .then(setSubscription)
      .catch(() => setSubscription(null));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && closeDialog()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upgrade your plan</DialogTitle>
          <DialogDescription>
            You&apos;ve hit a limit on your current plan. Upgrade to unlock more
            capacity.
          </DialogDescription>
        </DialogHeader>
        {subscription ? (
          <PricingCards subscription={subscription} />
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading plans&hellip;
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const SubscriptionModalsButton: React.FC = () => {
  const { openDialog } = useUpgradeSubscriptionModal();
  return (
    <Button onClick={() => openDialog()} size="sm" variant="default">
      Upgrade Plan
    </Button>
  );
};

export const CustomerPortalButton: React.FC<{ email: string }> = ({
  email,
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        window.open(
          `https://billing.stripe.com/p/login/${process.env.NEXT_PUBLIC_STRIPE_PORTAL_ID}?prefilled_email=${email}`,
          "_blank",
        )
      }
    >
      Open Customer Portal
    </Button>
  );
};
