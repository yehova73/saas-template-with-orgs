"use client";

import {
  deleteOrganizationAction,
  updateOrganizationNameAction,
} from "@/actions/organizations/settings";
import { ProjectsList, type Project } from "../../_components/projects-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useServerAction from "@/hooks/use-server-action";
import {
  Panel,
  SectionTitle,
  SettingRow,
} from "../../settings/_components/components";

type OrgansationOverviewViewProps = {
  organization: { id: string; name: string };
  projects: Project[];
};

export function OrgansationOverviewView({
  organization,
  projects,
}: OrgansationOverviewViewProps) {
  const [name, setName] = useState(organization.name);
  const router = useRouter();
  const { update } = useSession();
  const { call: renameOrg, loading: renamingOrg } = useServerAction(
    updateOrganizationNameAction,
  );
  const { call: deleteOrg, loading: deletingOrg } = useServerAction(
    deleteOrganizationAction,
  );

  async function handleDeleteOrganization() {
    const data = await deleteOrg();
    if (data !== null) {
      await update({ activeOrgId: undefined });
      router.push("/app");
    }
  }

  return (
    <div className="w-full space-y-8">
      <section>
        <SectionTitle>Organization</SectionTitle>
        <Panel>
          <SettingRow
            title="Name"
            desc="Shown in the sidebar and invite emails."
          >
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-64"
              />
              <Button
                onClick={() => renameOrg({ name })}
                disabled={renamingOrg}
              >
                {renamingOrg && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
            </div>
          </SettingRow>
        </Panel>
      </section>

      <section>
        <SectionTitle>Projects</SectionTitle>
        <ProjectsList projects={projects} isAdmin />
      </section>

      <section>
        <SectionTitle>Danger zone</SectionTitle>
        <Panel>
          <SettingRow
            title="Delete organization"
            desc="Soft deletes this organization and keeps your user account intact."
          >
            <Button
              variant="destructive"
              onClick={handleDeleteOrganization}
              disabled={deletingOrg}
            >
              {deletingOrg && <Loader2 className="size-4 animate-spin" />}
              <Trash2 className="size-4" /> Delete organization
            </Button>
          </SettingRow>
        </Panel>
      </section>
    </div>
  );
}
