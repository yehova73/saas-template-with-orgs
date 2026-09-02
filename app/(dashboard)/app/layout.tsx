import type { Metadata } from "next";
import { getPotentialUserFromSession } from "@/actions/account/account";
import {
  getActiveOrganizationContext,
  getUserOrganizationMemberships,
} from "@/actions/organizations/organization";
import { getOrganizationProjects } from "@/actions/organizations/projects/project";
import { PaymentCompleteModal } from "@/components/modals/payment-complete-modal/payment-complete-modal";
import { NewProjectDialog } from "@/components/modals/new-project-modal/new-project-dialog";
import { DashboardProviders } from "@/components/providers";
import { AppSidebar } from "@/components/sidebar/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { UserDropdown } from "./_components/user-dropdown";
import { ProjectsDropdown } from "./_components/projects-dropdown";
import { SubscriptionGate } from "./_components/subscription-gate";
import { getCurrentSubscriptionAction } from "@/actions/account/subscriptions/get-current-subscription";

export const metadata: Metadata = {
  title: "[placeholder title] — Dashboard",
  description: "[placeholder dashboard description]",
  openGraph: {
    title: "[placeholder title] — Dashboard",
    description: "[placeholder dashboard og description]",
    url: "https://example.com/dashboard",
    siteName: "[placeholder title]",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "[placeholder dashboard og image alt]",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "[placeholder title] — Dashboard",
    description: "[placeholder dashboard twitter description]",
    images: ["/og-image.png"],
  },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getPotentialUserFromSession();
  if (!user) {
    return redirect("/?action=login");
  }

  const [memberships, activeOrganizationContext, projects, subscription] =
    await Promise.all([
      getUserOrganizationMemberships(),
      getActiveOrganizationContext(),
      getOrganizationProjects(),
      getCurrentSubscriptionAction().catch(() => null),
    ]);

  const cookiesState = await cookies();
  const sidebarCookie = cookiesState.get("sidebar_state");

  return (
    <DashboardProviders>
      <div className="[--header-height:calc(--spacing(14))]" id="dashboard">
        <SidebarProvider
          className="flex flex-col"
          defaultOpen={sidebarCookie?.value !== "false"}
        >
          {/* <DashboardHeader
            organizations={
              userDetails?.organizations.map((x) => x.organization) || []
            }
          /> */}
          {/* {!hasOrganizations && <NoOrganizationsZeroState />} */}

          <div className="flex flex-1">
            <AppSidebar />
            {/* overflow-auto max-h-[calc(100vh-48px)] */}
            <SidebarInset>
              <header className="sticky top-0 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="ml-auto flex gap-2 items-center">
                  <ProjectsDropdown
                    projects={projects.map((project) => ({
                      id: project.id,
                      name: project.name,
                    }))}
                    activeProjectId={user.activeProjectId}
                    permissions={{
                      createProject:
                        !!activeOrganizationContext?.membership.role
                          .createProject,
                    }}
                  />
                  <UserDropdown
                    user={{
                      name: user.name || "",
                      image: user.image || "",
                      email: user.email || "",
                    }}
                    activeOrganizationId={
                      activeOrganizationContext?.organization.id
                    }
                    permissions={{
                      viewOrganizationSettings:
                        !!activeOrganizationContext?.membership.role
                          .manageSettings,
                    }}
                    organizations={memberships.map((membership) => ({
                      id: membership.organization.id,
                      name: membership.organization.name,
                      role: membership.role,
                    }))}
                  />
                </div>
              </header>
              {subscription &&
              !subscription.states.isActive &&
              !subscription.states.isTrialActive ? (
                <SubscriptionGate
                  subscription={subscription}
                  activeOrganizationId={
                    activeOrganizationContext?.organization.id
                  }
                />
              ) : (
                <main className="p-2 md:p-6 min-h-[calc(100vh-var(--header-height)-2px)]">
                  <div className="flex-1 flex flex-col h-full  w-full mx-auto ">
                    {children}
                  </div>
                </main>
              )}
            </SidebarInset>
          </div>
          <Suspense>
            <PaymentCompleteModal />
          </Suspense>
          <NewProjectDialog />
        </SidebarProvider>
      </div>
    </DashboardProviders>
  );
}
