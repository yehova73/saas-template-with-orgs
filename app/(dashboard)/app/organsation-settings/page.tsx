import { requireOrganizationPermission } from "@/actions/organizations/organization";
import { getOrganizationProjects } from "@/actions/organizations/projects/project";
import { prisma } from "@/lib/prisma";
import { OrgansationOverviewView } from "./_components/organsation-overview-view";

export default async function OrgansationSettingsPage() {
  const { organization } = await requireOrganizationPermission("manageSettings");
  const [details, projects] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organization.id },
      select: { id: true, name: true },
    }),
    getOrganizationProjects(),
  ]);

  if (!details) {
    throw new Error("Organization not found");
  }

  return <OrgansationOverviewView organization={details} projects={projects} />;
}
