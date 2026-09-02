import { getUserFromSession } from "@/actions/account/account";
import { getOrganizationProjects } from "@/actions/organizations/projects/project";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrganizationStats } from "./_components/organization-stats";
import { ProjectsList } from "./_components/projects-list";
import { getActiveOrganizationContext } from "@/actions/organizations/organization/context";

const DashboardPage: React.FC = async () => {
  const user = await getUserFromSession();
  if (user.activeProjectId) {
    redirect(`/app/${user.activeProjectId}`);
  }

  const [projects, activeOrgContext] = await Promise.all([
    getOrganizationProjects(),
    getActiveOrganizationContext(),
  ]);

  const isAdmin = !!activeOrgContext?.membership.role.createProject;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Projects"
        description="Create and manage projects to organize work within your organization."
      />
      <Suspense fallback={<StatsSkeletons />}>
        <OrganizationStats />
      </Suspense>
      {/* {sub.states.isTrialActive && (
        <TrialBox
          trialExpirationDate={
            sub.states.trialEndsAt || addMonths(new Date(), 1)
          }
        />
      )} */}

      <ProjectsList projects={projects} isAdmin={isAdmin} />
    </div>
  );
};

function StatsSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default DashboardPage;
