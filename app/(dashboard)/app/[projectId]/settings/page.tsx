import {
  getOrganizationMembers,
  getProjectWithMemberships,
  requireProjectPermission,
} from "@/actions/organizations/projects/project";
import { prisma } from "@/lib/prisma";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { ProjectDetailsSettings } from "./_components/project-details-settings";
import { ProjectMembersSettings } from "./_components/project-settings-members";
import { ProjectDangerZoneSettings } from "./_components/project-danger-zone-settings";

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
  const organizationRoles = await prisma.organizationUserRole.findMany({
    where: { organizationId: project.organizationId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="w-full space-y-6 mx-auto max-w-7xl">
      <DashboardPageHeader
        title={`Project settings for "${project.name}"`}
        description="Manage project details and members"
      />
      <ProjectDetailsSettings project={project} />
      <ProjectMembersSettings
        memberships={project.memberships}
        availableMembers={orgMembers}
        organizationRoles={organizationRoles}
        projectId={projectId}
      />
      <ProjectDangerZoneSettings
        project={project}
        availableMembers={orgMembers}
      />
    </div>
  );
}
