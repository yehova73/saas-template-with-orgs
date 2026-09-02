"use client";

import { useState } from "react";
import {
  Panel,
  SectionTitle,
  SettingRow,
} from "../../settings/_components/components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useServerAction from "@/hooks/use-server-action";
import { updateOrganizationNameAction } from "@/actions/organizations/settings";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const OrganizationGeneralSettings: React.FC<{
  organization: { id: string; name: string };
}> = ({ organization }) => {
  const [name, setName] = useState(organization.name);
  const { call: renameOrg, loading: renamingOrg } = useServerAction(
    updateOrganizationNameAction,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Update the organization&apos;s general settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Organization Name</Label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => renameOrg({ name })} disabled={renamingOrg}>
            {renamingOrg && <Loader2 className="size-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
