import { getProjectWithMemberships } from "@/actions/organizations/projects/project";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { StatUI } from "@/components/ui/stats";
import { Activity, Calendar, ClipboardList, Users } from "lucide-react";
import { notFound } from "next/navigation";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  let project;
  try {
    project = await getProjectWithMemberships(projectId);
  } catch {
    notFound();
  }

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title={`Welcome to ${project.name}`}
        description={
          project.description ?? "Manage your project tasks and team."
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatUI
          title="Members"
          stat={project.memberships.length.toString()}
          icon={<Users />}
        />
        <StatUI title="Active Requests" stat="0" icon={<ClipboardList />} />
        <StatUI title="Pending Requests" stat="0" icon={<Activity />} />
        <StatUI
          title="Created"
          stat={project.createdAt.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
          icon={<Calendar />}
        />
      </div>
    </div>
  );
}
