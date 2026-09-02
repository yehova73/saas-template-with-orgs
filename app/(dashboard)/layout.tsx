import { getPotentialUserFromSession } from "@/actions/account/account";
import { getUserOrganizationMemberships } from "@/actions/organizations/organization";
import { ConfirmationModal } from "@/components/modals/confirmation-modal/confirmation-modal";
import { redirect } from "next/navigation";
import type React from "react";
import { CreateOrganizationModal } from "../../components/modals/create-organization-modal/create-organization-modal";
import { UpgradeSubscriptionDialog } from "@/components/modals/upgrade-subscription-modal/upgrade-subscription-dialog";
import { FeedbackDialog } from "@/components/modals/feedback-modal/feedback-dialog";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getPotentialUserFromSession();
  console.log(user);
  if (!user) {
    return redirect("/?action=login");
  }

  const memberships = await getUserOrganizationMemberships();

  if (memberships.length === 0) {
    return redirect("/onboarding");
  }

  return (
    <>
      {children}
      <FeedbackDialog />
      <CreateOrganizationModal />
      <UpgradeSubscriptionDialog />
      <ConfirmationModal />
    </>
  );
}
