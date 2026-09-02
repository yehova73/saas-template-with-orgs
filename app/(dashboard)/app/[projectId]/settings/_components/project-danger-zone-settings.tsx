"use client";

import {
  updateProjectAction,
  deleteProjectAction,
  addProjectMemberAction,
  removeProjectMemberAction,
  updateProjectMemberRoleAction,
} from "@/actions/organizations/projects/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RotateCcw, Trash2, UserMinus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectRole } from "@/lib/generated/prisma/enums";
import { getOrganizationMembers } from "@/actions/organizations/projects/project";
import useServerAction from "@/hooks/use-server-action";
import { Divider, SettingRow } from "../../../settings/_components/components";
import { requireConfirmation } from "@/components/modals/confirmation-modal/use-confirmation";

type Project = {
  id: string;
  name: string;
  description: string | null;
};

type ProjectSettingsViewProps = {
  project: Project;
  availableMembers?: Awaited<ReturnType<typeof getOrganizationMembers>>;
};

export function ProjectDangerZoneSettings({
  project,
}: ProjectSettingsViewProps) {
  const router = useRouter();

  const { call: deleteProject, loading: deletingProject } =
    useServerAction(deleteProjectAction);

  async function handleDeleteProject() {
    const confirmation = requireConfirmation({
      title: "Delete Project",
      subtitle:
        "Are you sure you want to delete this project? This action cannot be undone.",
    });
    const promise = await confirmation.promise;
    if (!promise) {
      return;
    }

    const data = await deleteProject(project.id);
    if (data !== null) {
      router.push("/app/projects");
    }
  }

  return (
    <Card className="border !border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Irreversible and destructive actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingRow
          title="Reset all data"
          desc="[placeholder reset-data description]"
        >
          <Button
            variant={"destructive"}
            // onClick={() => setResetOpen(true)}
          >
            <RotateCcw className="h-4 w-4" /> Reset data
          </Button>
        </SettingRow>
        <Divider />

        <SettingRow
          title="Delete project"
          desc="Delete this project and all associated data. This action cannot be undone."
        >
          <Button
            variant="destructive"
            onClick={handleDeleteProject}
            disabled={deletingProject}
          >
            {/* {deletingOrg && <Loader2 className="size-4 animate-spin" />} */}
            <Trash2 className="size-4" /> Delete project
          </Button>
        </SettingRow>
      </CardContent>
    </Card>
  );
}
