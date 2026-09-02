"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { SettingRow } from "./components";
import { DeleteAccountModal } from "./modals";

export const AccountSettingsDangerZone: React.FC = () => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Card className="border !border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Irreversible and destructive actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingRow
          title="Delete account"
          desc="[placeholder delete-account description]"
        >
          <Button onClick={() => setDeleteOpen(true)} variant={"destructive"}>
            <Trash2 className="h-4 w-4" /> Delete account
          </Button>
        </SettingRow>

        <DeleteAccountModal open={deleteOpen} onOpenChange={setDeleteOpen} />
      </CardContent>
    </Card>
  );
};
