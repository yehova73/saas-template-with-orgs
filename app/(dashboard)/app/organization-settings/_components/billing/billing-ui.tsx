import { getCurrentSubscriptionAction } from "@/actions/account/subscriptions/get-current-subscription";
import { Panel, SectionTitle } from "../../../settings/_components/components";
import { CurrentSubscriptionStatus } from "../../../settings/billing/_components/current-subscription-status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const BillingUI: React.FC<{
  subscription: Awaited<ReturnType<typeof getCurrentSubscriptionAction>>;
}> = async ({ subscription }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>
          Manage your billing information and subscription plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CurrentSubscriptionStatus subscription={subscription} />
      </CardContent>
    </Card>
  );
};
