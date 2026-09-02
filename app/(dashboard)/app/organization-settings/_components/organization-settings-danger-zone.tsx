"use client";

import { deleteOrganizationAction } from "@/actions/organizations/settings";
import { Button } from "@/components/ui/button";
import useServerAction from "@/hooks/use-server-action";
import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Divider,
  Panel,
  SectionTitle,
  SettingRow,
} from "../../settings/_components/components";
import { ResetDataModal } from "./reset-data-modal";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const OrganizationDangerZoneSettings: React.FC = () => {
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);
  const { update } = useSession();

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
          <Button variant={"destructive"} onClick={() => setResetOpen(true)}>
            <RotateCcw className="h-4 w-4" /> Reset data
          </Button>
        </SettingRow>
        <Divider />

        <SettingRow
          title="Delete organization"
          desc="Delete this organization and all associated data. This action cannot be undone."
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
        <ResetDataModal open={resetOpen} onOpenChange={setResetOpen} />
      </CardContent>
    </Card>
  );
};
