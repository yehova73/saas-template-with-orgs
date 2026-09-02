"use client";

import { getCurrentSubscriptionAction } from "@/actions/account/subscriptions/get-current-subscription";
import { setActiveOrganizationAction } from "@/actions/organizations/organization";
import { deleteOrganizationAction } from "@/actions/organizations/settings";
import { PricingCards } from "@/app/(dashboard)/app/settings/billing/_components/pricing-cards";
import { Button } from "@/components/ui/button";
import { requireConfirmation } from "@/components/modals/confirmation-modal/use-confirmation";
import { useServerAction } from "@/hooks/use-server-action";
import { Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

export function SubscriptionGate({
  subscription,
}: {
  subscription: Awaited<ReturnType<typeof getCurrentSubscriptionAction>>;
  activeOrganizationId?: string;
}) {
  const { update } = useSession();
  const { call: deleteOrg, loading: deletingOrg } = useServerAction(
    deleteOrganizationAction,
  );
  const { call: setActiveOrg } = useServerAction(setActiveOrganizationAction);

  async function handleDeleteOrganization() {
    const { promise } = requireConfirmation({
      title: "Delete organization",
      subtitle: "This cannot be undone. Are you sure?",
      buttons: { confirm: "Delete", cancel: "Cancel" },
    });
    const confirmed = await promise;
    if (!confirmed) return;
    const data = await deleteOrg();
    if (data) {
      if (data.nextOrgId) {
        const orgData = await setActiveOrg(data.nextOrgId);
        await update({
          activeOrgId: orgData?.activeOrgId ?? undefined,
          activeProjectId: null,
        });
        window.location.href = "/app";
      } else {
        await update({ activeOrgId: undefined, activeProjectId: null });
        window.location.href = "/onboarding";
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] px-4">
      <div className="w-full max-w-7xl">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold">Subscription required</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This organization has no active subscription or trial. Upgrade to
            continue.
          </p>
        </div>

        <PricingCards subscription={subscription} />

        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleDeleteOrganization}
            disabled={deletingOrg}
          >
            <Trash2 className="size-4" />
            Delete organization
          </Button>
        </div>
      </div>
    </div>
  );
}
