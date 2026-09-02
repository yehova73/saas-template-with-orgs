import { prisma } from "@/lib/prisma";
import { StatUI } from "@/components/ui/stats";
import { CheckCircle2, ClipboardList, FolderKanban, Users } from "lucide-react";
import { getActiveOrganizationContext } from "@/actions/organizations/organization/context";

export async function OrganizationStats() {
  const context = await getActiveOrganizationContext();

  let projectCount = 0;
  let memberCount = 0;

  if (context) {
    [projectCount, memberCount] = await Promise.all([
      prisma.project.count({
        where: { organizationId: context.organization.id },
      }),
      prisma.organizationMembership.count({
        where: { organizationId: context.organization.id },
      }),
    ]);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatUI
        title="Total Projects"
        stat={projectCount.toString()}
        icon={<FolderKanban />}
      />
      <StatUI
        title="Total Members"
        stat={memberCount.toString()}
        icon={<Users />}
      />
      <StatUI title="Total Requests" stat="0" icon={<ClipboardList />} />
      <StatUI title="Fixed Requests" stat="0" icon={<CheckCircle2 />} />
    </div>
  );
}
