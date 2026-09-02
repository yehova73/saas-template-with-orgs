import { requireOrganizationPermission } from "@/actions/organizations/organization/permissions";
import { BillingNotAvailable } from "./billing-not-avaliable";
import { BillingUI } from "./billing-ui";
import { getCurrentSubscriptionAction } from "@/actions/account/subscriptions/get-current-subscription";

export const OrganizationBillingSettings: React.FC = async () => {
  let hasPermission = false;

  try {
    await requireOrganizationPermission("manageBilling");
    hasPermission = true;
  } catch (error) {
    hasPermission = false;
  }
  console.log("hasPermission", hasPermission);
  if (!hasPermission) {
    return <BillingNotAvailable />;
  }

  const [subscription] = await Promise.all([getCurrentSubscriptionAction()]);

  return <BillingUI subscription={subscription} />;
};
