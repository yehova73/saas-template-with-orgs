import { getProjectApiKeys } from "@/actions/organizations/projects/api-keys";
import { requireProjectPermission } from "@/actions/organizations/projects/project";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { notFound } from "next/navigation";
import { ApiKeysView } from "./_components/api-keys-view";

type ApiKeysPageProps = {
  params: Promise<{ projectId: string }>;
};

export const metadata = {
  title: "API Keys",
};

export default async function ApiKeysPage({ params }: ApiKeysPageProps) {
  const { projectId } = await params;

  try {
    await requireProjectPermission(projectId, "manageSettings");
  } catch {
    notFound();
  }

  const apiKeys = await getProjectApiKeys(projectId);

  return (
    <div className="w-full space-y-6">
      <DashboardPageHeader
        title="API Keys"
        description="Manage API keys for authenticating requests to this project."
      />
      <ApiKeysView projectId={projectId} initialKeys={apiKeys} />
    </div>
  );
}
