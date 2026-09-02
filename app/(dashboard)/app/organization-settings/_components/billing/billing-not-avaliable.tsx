import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Panel, SectionTitle } from "../../../settings/_components/components";
import { CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const BillingNotAvailable: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>
          Manage your billing information and subscription plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant={"icon"}>
              <CreditCard />
            </EmptyMedia>
            <EmptyTitle>Billing is not available </EmptyTitle>
            <EmptyDescription>
              Billing is not available for this organization. Please contact
              support if you have any questions.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
};
