import {
  getProjectWithMemberships,
  getOrganizationMembers,
  requireProjectPermission,
} from "@/actions/organizations/projects/project";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { ProjectSettingsView } from "./_components/project-settings-view";

export const metadata = {
  title: "Project Settings",
};

type ProjectSettingsPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const { projectId } = await params;

  await requireProjectPermission(projectId, "manageSettings");

  // Fetch project with members and organization members
  const [project, orgMembers] = await Promise.all([
    getProjectWithMemberships(projectId),
    getOrganizationMembers(),
  ]);

  return (
    <div className="w-full space-y-6">
      <DashboardPageHeader
        title={`${project.name} Settings`}
        description="Manage project details and members"
      />
      <ProjectSettingsView project={project} availableMembers={orgMembers} />
    </div>
  );
}
