// import { getUserFromSession } from "@/actions/account/account";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { prisma } from "@/lib/prisma";
// import { subscriptionsConfig } from "@/lib/subscriptions";
// import {
//     Activity,
//     BarChart2,
//     BellRing,
//     Building2,
//     Check,
//     Clock,
//     FileDown,
//     Users,
//     X
// } from "lucide-react";

// export async function BillingSection() {
//   const user = await getUserFromSession();
//   const subscription = await getProjectSubscriptionAction();

//   // ── Feature access ────────────────────────────────────────────────────────
//   const featureAccess = await prisma.userFeatureAccess
//     .findFirst({
//       where: {
//         user: {
//           organizations: {
//             some: { role: "CREATOR" },
//           },
//         },
//         userId: user.id,
//       },
//     })
//     .catch(() => null);

//   // ── Usage counts ──────────────────────────────────────────────────────────
//   const now = new Date();
//   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//   const [orgCount, monthlyRequestCount] = await Promise.all([
//     prisma.organizationUser.count({
//       where: { userId: user.id, role: "CREATOR" },
//     }),
//     prisma.aiEvent.count({
//       where: {
//         organization: {
//           organizationUsers: {
//             some: { userId: user.id, role: "CREATOR" },
//           },
//         },
//         timestamp: { gte: startOfMonth },
//       },
//     }),
//   ]);

//   // ── Future invoice ────────────────────────────────────────────────────────
//   let futureInvoiceData: { totalCents: number; date: Date } | undefined;
//   if (subscription.subscription?.stripeSubscriptionId) {
//     try {
//       const futureInvoice = await stripe.invoices.createPreview({
//         subscription: subscription.subscription.stripeSubscriptionId,
//       });
//       futureInvoiceData = {
//         date: new Date(
//           (futureInvoice.next_payment_attempt || futureInvoice.due_date || 0) *
//             1000,
//         ),
//         totalCents: futureInvoice.amount_due > 0 ? futureInvoice.amount_due : 0,
//       };
//     } catch {}
//   }

//   // ── Referral ──────────────────────────────────────────────────────────────
//   const referralCode = await generateReferralCode(user.id || "").catch(
//     () => null,
//   );
//   const referralLink = referralCode
//     ? `${process.env.NEXT_PUBLIC_APP_URL || "localhost:3000"}/auth/signup?ref=${referralCode}`
//     : null;

//   // ── Plan config ───────────────────────────────────────────────────────────
//   const priceConfig = subscriptionsConfig.find(
//     (x) => x.type === subscription.subscription?.subscriptionType,
//   );

//   const priceData = subscriptionsConfig
//     .flatMap((x) => [
//       {
//         price: x.monthly.priceValue,
//         period: "month",
//         priceId: x.monthly.priceId,
//       },
//       {
//         price: x.yearly.priceValue,
//         period: "year",
//         priceId: x.yearly.priceId,
//       },
//     ])
//     .find(
//       (s) => s.priceId === subscription.subscription?.stripeSubscriptionPriceId,
//     );

//   const statusLabel = subscription.states.isTrialActive
//     ? "Trialing"
//     : subscription.states.isActive
//       ? "Active"
//       : subscription.states.isCanceled
//         ? "Canceled"
//         : "Inactive";

//   const isActive =
//     subscription.states.isActive || subscription.states.isTrialActive;

//   // ── Usage limits from feature access (with defaults) ─────────────────────
//   const orgLimit = featureAccess?.totalProjectsLimit;
//   const requestLimit = featureAccess?.totalMonthlyRequestsLimit ?? 10_000;
//   const historyDays = featureAccess?.requestHistoryAccessInDays ?? 7;
//   const teamSeats = featureAccess?.projectTeamSeats;

//   const orgPercent = orgLimit
//     ? Math.min((orgCount / (orgLimit || 10000000)) * 100, 100)
//     : 0;
//   const requestPercent = requestLimit
//     ? Math.min((monthlyRequestCount / requestLimit) * 100, 100)
//     : 0;

//   return (
//     <SettingsCard
//       title="Plan & Billing"
//       description="Your current subscription, usage, and referral"
//     >
//       {/* ── Plan card ─────────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 p-4">
//         <div className="space-y-1">
//           <div className="flex items-center gap-2 flex-wrap">
//             <p className="font-semibold text-foreground">
//               {priceConfig?.name ?? "Free"} Plan
//             </p>
//             {priceConfig?.type && priceConfig?.type !== "FREE" && (
//               <Badge variant={!isActive ? "destructive" : "default"}>
//                 {statusLabel}
//               </Badge>
//             )}
//             {subscription.subscription?.subscriptionCanceledAt &&
//               subscription.states.isActive &&
//               subscription.subscription.subscriptionCanceledAt.valueOf() >
//                 now.valueOf() && (
//                 <Badge variant="destructive">
//                   Cancels on{" "}
//                   {subscription.subscription.subscriptionCanceledAt.toDateString()}
//                 </Badge>
//               )}
//           </div>
//           <p className="text-sm text-muted-foreground">
//             {subscription.states.isCanceled ? (
//               "No future invoice"
//             ) : (
//               <span className="flex items-center gap-1">
//                 Next invoice{" "}
//                 <strong>${(futureInvoiceData?.totalCents ?? 0) / 100}</strong>
//                 {futureInvoiceData
//                   ? ` on ${futureInvoiceData.date.toDateString()}`
//                   : ""}
//                 <FutureInvoicePreviewTooltip />
//               </span>
//             )}
//           </p>
//         </div>
//         <p className="text-xl font-bold text-foreground shrink-0">
//           {priceData ? (
//             <>
//               ${priceData.price}
//               <span className="text-sm font-normal ml-1">
//                 /{priceData.period}
//               </span>
//             </>
//           ) : (
//             "Free"
//           )}
//         </p>
//       </div>

//       {/* ── Usage ─────────────────────────────────────────────────────── */}
//       <div className="space-y-4">
//         <p className="text-sm font-medium">Usage this month</p>
//         <div className="space-y-3">
//           {/* Monthly requests */}
//           <div className="space-y-1.5">
//             <div className="flex items-center justify-between text-sm">
//               <span className="flex items-center gap-1.5 text-muted-foreground">
//                 <Activity className="h-3.5 w-3.5" />
//                 Requests
//               </span>
//               <span className="font-medium">
//                 {monthlyRequestCount.toLocaleString()}
//                 {" / "}
//                 {requestLimit === null
//                   ? "Unlimited"
//                   : requestLimit.toLocaleString()}
//               </span>
//             </div>
//             <Progress
//               value={requestLimit === null ? 0 : requestPercent}
//               className={requestPercent >= 90 ? "text-destructive" : undefined}
//             />
//           </div>

//           {/* Organizations */}
//           <div className="space-y-1.5">
//             <div className="flex items-center justify-between text-sm">
//               <span className="flex items-center gap-1.5 text-muted-foreground">
//                 <Building2 className="h-3.5 w-3.5" />
//                 Organizations
//               </span>
//               <span className="font-medium">
//                 {orgCount}
//                 {" / "}
//                 {orgLimit === null ? "Unlimited" : orgLimit}
//               </span>
//             </div>
//             <Progress
//               value={orgLimit === null ? 0 : orgPercent}
//               className={orgPercent >= 100 ? "text-destructive" : undefined}
//             />
//           </div>
//         </div>
//       </div>

//       {/* ── Feature access ────────────────────────────────────────────── */}
//       <div className="space-y-3">
//         <p className="text-sm font-medium">Features included</p>
//         <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
//           <FeatureItem
//             icon={<Clock className="h-3.5 w-3.5" />}
//             label="Request history"
//             value={`${historyDays} days`}
//           />
//           <FeatureItem
//             icon={<Users className="h-3.5 w-3.5" />}
//             label="Team seats"
//             value={teamSeats === null ? "Unlimited" : String(teamSeats)}
//           />
//           <FeatureItem
//             icon={<BarChart2 className="h-3.5 w-3.5" />}
//             label="Feature breakdown"
//             enabled={featureAccess?.featureBreakdownAccess ?? false}
//           />
//           <FeatureItem
//             icon={<BarChart2 className="h-3.5 w-3.5" />}
//             label="User breakdown"
//             enabled={featureAccess?.userBreakdownAccess ?? false}
//           />
//           <FeatureItem
//             icon={<FileDown className="h-3.5 w-3.5" />}
//             label="CSV exports"
//             enabled={featureAccess?.csvExports ?? false}
//           />
//           <FeatureItem
//             icon={<BellRing className="h-3.5 w-3.5" />}
//             label="Alerts"
//             value={
//               [
//                 featureAccess?.emailAlerts && "Email",
//                 featureAccess?.slackAlerts && "Slack",
//                 featureAccess?.telegramAlerts && "Telegram",
//                 featureAccess?.teamsAlerts && "Teams",
//               ]
//                 .filter(Boolean)
//                 .join(", ") || "Email only"
//             }
//           />
//         </div>
//       </div>

//       {/* ── Action buttons ─────────────────────────────────────────────── */}
//       <div className="flex w-full justify-end gap-2">
//         {subscription.subscription?.stripeSubscriptionId && (
//           <CustomerPortalButton email={user.email || ""} />
//         )}
//         <SubscriptionModalsButton />
//       </div>

//       {/* <Separator /> */}

//       {/* ── Referral ──────────────────────────────────────────────────── */}
//       {/* <div className="space-y-3">
//         <div className="flex items-center gap-2">
//           <div className="rounded-md bg-primary p-1.5 flex items-center justify-center">
//             <Gift className="h-4 w-4 text-white" />
//           </div>
//           <div>
//             <p className="text-sm font-medium leading-none">Refer a Friend</p>
//             <p className="text-xs text-muted-foreground mt-0.5">
//               You&apos;ll both get{" "}
//               <span className="font-semibold text-foreground">$10 credit</span>
//             </p>
//           </div>
//         </div>
//         {referralLink && <ReferralLink url={referralLink} />}
//         {user.id && (
//           <Suspense>
//             <ReferredPeopleModal userId={user.id} />
//           </Suspense>
//         )}
//       </div> */}
//     </SettingsCard>
//   );
// }

// // ── Helper component ──────────────────────────────────────────────────────────

// function FeatureItem({
//   icon,
//   label,
//   value,
//   enabled,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value?: string;
//   enabled?: boolean;
// }) {
//   return (
//     <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
//       <span className="text-muted-foreground shrink-0">{icon}</span>
//       <span className="text-muted-foreground truncate">{label}</span>
//       <span className="ml-auto shrink-0 font-medium">
//         {value !== undefined ? (
//           value
//         ) : enabled ? (
//           <Check className="h-3.5 w-3.5 text-primary" />
//         ) : (
//           <X className="h-3.5 w-3.5 text-muted-foreground" />
//         )}
//       </span>
//     </div>
//   );
// }
