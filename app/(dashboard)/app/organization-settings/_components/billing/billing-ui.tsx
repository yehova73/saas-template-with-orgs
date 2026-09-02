import { stripe } from "@/actions/account/subscriptions/config";
import { getCurrentSubscriptionAction } from "@/actions/account/subscriptions/get-current-subscription";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { subscriptionsConfig } from "@/lib/subscriptions";
import { FutureInvoicePreviewTooltip } from "./future-invoice-preview-tooltip";
import { prisma } from "@/lib/prisma";
import { Check, Folder, Users2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  CustomerPortalButton,
  SubscriptionModalsButton,
} from "@/components/modals/upgrade-subscription-modal/upgrade-subscription-dialog";

export const BillingUI: React.FC<{
  subscription: Awaited<ReturnType<typeof getCurrentSubscriptionAction>>;
  organizationId: string;
  userEmail: string;
}> = async ({ subscription, organizationId, userEmail }) => {
  const priceConfig = subscriptionsConfig.find(
    (x) => x.type === subscription.subscription?.type,
  );

  const statusLabel = subscription.states.isTrialActive
    ? "Trialing"
    : subscription.states.isActive
      ? "Active"
      : subscription.states.isCanceled
        ? "Canceled"
        : "Inactive";

  const isActive =
    subscription.states.isActive || subscription.states.isTrialActive;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let futureInvoiceData: { totalCents: number; date: Date } | undefined;
  if (subscription.subscription?.stripeSubscriptionId) {
    try {
      const futureInvoice = await stripe.invoices.createPreview({
        subscription: subscription.subscription.stripeSubscriptionId,
      });
      futureInvoiceData = {
        date: new Date(
          (futureInvoice.next_payment_attempt || futureInvoice.due_date || 0) *
            1000,
        ),
        totalCents: futureInvoice.amount_due > 0 ? futureInvoice.amount_due : 0,
      };
    } catch {}
  }

  const priceData = subscriptionsConfig
    .flatMap((x) => [
      {
        price: x.monthly.priceValue,
        period: "month",
        priceId: x.monthly.priceId,
      },
      {
        price: x.yearly.priceValue,
        period: "year",
        priceId: x.yearly.priceId,
      },
    ])
    .find((s) => s.priceId === subscription.subscription?.priceId);

  const [projectsCount, membersCount] = await Promise.all([
    prisma.project.count({
      where: { organizationId },
    }),
    prisma.organizationMembership.count({
      where: { organizationId },
    }),
  ]);

  const projectsLimit = subscription.featureAccess.projectsLimit;
  const projectsPercent = projectsLimit
    ? Math.min((projectsCount / projectsLimit) * 100, 100)
    : 0;

  const membersLimit = subscription.featureAccess.membersLimit;
  const membersPercent = membersLimit
    ? Math.min((membersCount / membersLimit) * 100, 100)
    : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>
          Manage your billing information and subscription plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground">
                {priceConfig?.name ?? "Free"} Plan
              </p>
              {priceConfig?.type && (
                <Badge variant={!isActive ? "destructive" : "default"}>
                  {statusLabel}
                </Badge>
              )}
              {subscription.subscription?.subscriptionCanceledAt &&
                subscription.states.isActive &&
                subscription.subscription.subscriptionCanceledAt.valueOf() >
                  now.valueOf() && (
                  <Badge variant="destructive">
                    Cancels on{" "}
                    {subscription.subscription.subscriptionCanceledAt.toDateString()}
                  </Badge>
                )}
            </div>
            <p className="text-sm text-muted-foreground">
              {subscription.states.isCanceled ? (
                "No future invoice"
              ) : (
                <span className="flex items-center gap-1">
                  Next invoice{" "}
                  <strong>${(futureInvoiceData?.totalCents ?? 0) / 100}</strong>
                  {futureInvoiceData
                    ? ` on ${futureInvoiceData.date.toDateString()}`
                    : ""}
                  <FutureInvoicePreviewTooltip />
                </span>
              )}
            </p>
          </div>
          <p className="text-xl font-bold text-foreground shrink-0">
            {priceData ? (
              <>
                ${priceData.price}
                <span className="text-sm font-normal ml-1">
                  /{priceData.period}
                </span>
              </>
            ) : (
              "Free"
            )}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm">Usage this month</p>
          <div className="space-y-3">
            {/* Monthly requests */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Folder className="h-3.5 w-3.5" />
                  Projects
                </span>
                <span className="font-medium">
                  {projectsCount.toLocaleString()}
                  {" / "}
                  {projectsLimit === null
                    ? "Unlimited"
                    : projectsLimit.toLocaleString()}
                </span>
              </div>
              <Progress
                value={projectsLimit === null ? 0 : projectsPercent}
                className={
                  projectsPercent >= 90 ? "text-destructive" : undefined
                }
              />
            </div>

            {/* Organizations */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users2 className="h-3.5 w-3.5" />
                  Organization Members
                </span>
                <span className="font-medium">
                  {membersCount}
                  {" / "}
                  {membersLimit === null ? "Unlimited" : membersLimit}
                </span>
              </div>
              <Progress
                value={membersLimit === null ? 0 : membersPercent}
                className={
                  membersPercent >= 100 ? "text-destructive" : undefined
                }
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm">Features included</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <FeatureItem
              icon={<Folder className="h-3.5 w-3.5" />}
              label="Total Projects"
              value={`${projectsLimit} projects`}
            />
            <FeatureItem
              icon={<Users2 className="h-3.5 w-3.5" />}
              label="Total Members"
              value={membersLimit === null ? "Unlimited" : String(membersLimit)}
            />
          </div>
        </div>

        <div className="flex w-full justify-end gap-2">
          {subscription.subscription?.stripeSubscriptionId && (
            <CustomerPortalButton email={userEmail || ""} />
          )}
          <SubscriptionModalsButton />
        </div>
      </CardContent>
    </Card>
  );
};

function FeatureItem({
  icon,
  label,
  value,
  enabled,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  enabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground truncate">{label}</span>
      <span className="ml-auto shrink-0 font-medium">
        {value !== undefined ? (
          value
        ) : enabled ? (
          <Check className="h-3.5 w-3.5 text-primary" />
        ) : (
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </span>
    </div>
  );
}
