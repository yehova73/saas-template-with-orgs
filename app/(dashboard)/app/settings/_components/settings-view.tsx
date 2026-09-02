"use client";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Divider, Panel, SectionTitle, SettingRow } from "./components";
import {
  ChangeEmailModal,
  ChangePasswordModal,
  DeleteAccountModal,
  ResetDataModal,
} from "./modals";

export const SettingsView: React.FC<{
  email: string;
  hasPassword: boolean;
}> = ({ email, hasPassword }) => {
  const [pwOpen, setPwOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto w-full">
      <section className="mt-8">
        <SectionTitle>Account</SectionTitle>
        <Panel>
          <SettingRow
            title="Email address"
            desc={`${email} — used for sign-in and receipts.`}
          >
            <Button onClick={() => setEmailOpen(true)}>
              <Mail className="h-4 w-4" /> Change email
            </Button>
          </SettingRow>
          <Divider />
          <SettingRow
            title="Password"
            desc="Rotate your password regularly. Minimum 8 characters."
          >
            <Button onClick={() => setPwOpen(true)}>
              <KeyRound className="h-4 w-4" /> Change password
            </Button>
          </SettingRow>
        </Panel>
      </section>

      <section className="mt-8">
        <SectionTitle>Danger zone</SectionTitle>
        <Panel>
          <SettingRow
            title="Reset all data"
            desc="[placeholder reset-data description]"
          >
            <Button onClick={() => setResetOpen(true)} variant={"destructive"}>
              <RotateCcw className="h-4 w-4" /> Reset data
            </Button>
          </SettingRow>
          <Divider />
          <SettingRow
            title="Delete account"
            desc="[placeholder delete-account description]"
          >
            <Button onClick={() => setDeleteOpen(true)} variant={"destructive"}>
              <Trash2 className="h-4 w-4" /> Delete account
            </Button>
          </SettingRow>
        </Panel>
      </section>

      <ChangePasswordModal
        open={pwOpen}
        onOpenChange={setPwOpen}
        hasPassword={hasPassword}
      />
      <ChangeEmailModal
        open={emailOpen}
        onOpenChange={setEmailOpen}
        hasPassword={hasPassword}
      />
      <ResetDataModal open={resetOpen} onOpenChange={setResetOpen} />
      <DeleteAccountModal open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
};
