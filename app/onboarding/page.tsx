import { getPotentialUserFromSession } from "@/actions/account/account";
import { getUserOrganizationMemberships } from "@/actions/organizations/organization";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./_components/onboarding-form";

export default async function OnboardingPage() {
  const user = await getPotentialUserFromSession();

  if (!user) {
    redirect("/?action=login");
  }

  const memberships = await getUserOrganizationMemberships();

  if (memberships.length > 0) {
    redirect("/app");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <OnboardingForm />
      </div>
    </main>
  );
}
