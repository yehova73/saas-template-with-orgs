"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Divider, SettingRow } from "./components";
import { ChangeEmailModal, ChangePasswordModal } from "./modals";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail } from "lucide-react";

export const AccountSettings: React.FC<{
  email: string;
  hasPassword: boolean;
}> = ({ email, hasPassword }) => {
  const [pwOpen, setPwOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Update your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingRow
          title="Email address"
          desc={`${email} — used for sign-in and notifications.`}
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
      </CardContent>
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
    </Card>
  );
};
