import { getCurrentSubscriptionAction } from "@/actions/account/subscriptions/get-current-subscription";
import { getInvoicesAction } from "@/actions/account/subscriptions/get-invoices";
import { requireOrganizationAdmin } from "@/actions/organizations/organization";
import { CurrentSubscriptionStatus } from "../../settings/billing/_components/current-subscription-status";
import { Invoices } from "../../settings/billing/_components/invoices";
import { PricingCards } from "../../settings/billing/_components/pricing-cards";

export default async function OrgansationSettingsBillingPage() {
  await requireOrganizationAdmin();
  const [subscription, invoices] = await Promise.all([
    getCurrentSubscriptionAction(),
    getInvoicesAction(),
  ]);

  return (
    <div className="w-full space-y-6">
      <CurrentSubscriptionStatus subscription={subscription} />
      <PricingCards subscription={subscription} />
      <Invoices initialPage={invoices} />
    </div>
  );
}
