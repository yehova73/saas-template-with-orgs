"use client";

import { getCurrentSubscriptionAction } from "@/actions/account/subscriptions/get-current-subscription";
import { getInvoicesAction } from "@/actions/account/subscriptions/get-invoices";
import {
  deleteOrganizationAction,
  inviteOrganizationMemberAction,
  removeOrganizationMemberAction,
  resendOrganizationInviteAction,
  revokeOrganizationInviteAction,
  updateOrganizationNameAction,
} from "@/actions/organizations/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  MailPlus,
  RotateCw,
  Trash2,
  UserMinus,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CurrentSubscriptionStatus } from "../../settings/billing/_components/current-subscription-status";
import { Invoices } from "../../settings/billing/_components/invoices";
import { PricingCards } from "../../settings/billing/_components/pricing-cards";
import {
  Divider,
  Panel,
  SectionTitle,
  SettingRow,
} from "../../settings/_components/components";
import useServerAction from "@/hooks/use-server-action";

type OrganizationSettingsViewProps = {
  organization: {
    id: string;
    name: string;
    memberships: Array<{
      id: string;
      role: { id: string; name: string };
      user: { email: string; name: string | null; image: string | null };
    }>;
    invites: Array<{
      id: string;
      email: string;
      role: { id: string; name: string };
      expiresAt: Date;
    }>;
  };
  subscription: Awaited<ReturnType<typeof getCurrentSubscriptionAction>>;
  invoices: Awaited<ReturnType<typeof getInvoicesAction>>;
};

export function OrganizationSettingsView({
  organization,
  subscription,
  invoices,
}: OrganizationSettingsViewProps) {
  const [name, setName] = useState(organization.name);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const router = useRouter();
  const { update } = useSession();

  const { call: renameOrg, loading: renamingOrg } = useServerAction(
    updateOrganizationNameAction,
  );
  const { call: inviteMember, loading: invitingMember } = useServerAction(
    inviteOrganizationMemberAction,
  );
  const { call: deleteOrg, loading: deletingOrg } = useServerAction(
    deleteOrganizationAction,
  );
  const { call: removeMember } = useServerAction(
    removeOrganizationMemberAction,
  );
  const { call: resendInvite } = useServerAction(
    resendOrganizationInviteAction,
  );
  const { call: revokeInvite } = useServerAction(
    revokeOrganizationInviteAction,
  );

  async function handleRename() {
    await renameOrg({ name });
  }

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await inviteMember({ email: inviteEmail, roleId: inviteRole });
    if (data !== null) {
      setInviteEmail("");
    }
  }

  async function handleDeleteOrganization() {
    const data = await deleteOrg();
    if (data !== null) {
      await update({ activeOrgId: undefined });
      router.push("/app");
    }
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
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
                  <Button onClick={handleRename} disabled={renamingOrg}>
                    {renamingOrg && <Loader2 className="size-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </SettingRow>
            </Panel>
          </section>

          <section>
            <SectionTitle>Projects</SectionTitle>
            <Panel>
              <SettingRow
                title="Create a project"
                desc="Organize your work by creating projects within your organization."
              >
                <Button asChild>
                  <Link
                    href="/app/projects"
                    className="flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    Create Project
                  </Link>
                </Button>
              </SettingRow>
            </Panel>
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
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <CurrentSubscriptionStatus subscription={subscription} />
          <PricingCards subscription={subscription} />
          <Invoices initialPage={invoices} />
        </TabsContent>

        <TabsContent value="members" className="space-y-8">
          <section>
            <SectionTitle>Members</SectionTitle>
            <Panel>
              {organization.memberships.map((membership, index) => (
                <div key={membership.id}>
                  {index > 0 && <Divider />}
                  <SettingRow
                    title={membership.user.name || membership.user.email}
                    desc={`${membership.user.email} - ${membership.role.name}`}
                  >
                    <Button
                      variant="outline"
                      onClick={() => removeMember(membership.id)}
                    >
                      <UserMinus className="size-4" /> Remove
                    </Button>
                  </SettingRow>
                </div>
              ))}
            </Panel>
          </section>

          <section>
            <SectionTitle>Invites</SectionTitle>
            <Panel>
              <form
                className="grid gap-3 p-4 md:grid-cols-[1fr_160px_auto]"
                onSubmit={handleInvite}
              >
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="teammate@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(value) => setInviteRole(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="self-end"
                  disabled={invitingMember}
                  type="submit"
                >
                  {invitingMember ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MailPlus className="size-4" />
                  )}
                  Invite
                </Button>
              </form>

              {organization.invites.map((invite) => (
                <div key={invite.id}>
                  <Divider />
                  <SettingRow
                    title={invite.email}
                    desc={`${invite.role.name} invite expires ${invite.expiresAt.toLocaleDateString()}`}
                  >
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => resendInvite(invite.id)}
                      >
                        <RotateCw className="size-4" /> Resend
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => revokeInvite(invite.id)}
                      >
                        <Trash2 className="size-4" /> Revoke
                      </Button>
                    </div>
                  </SettingRow>
                </div>
              ))}
            </Panel>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
