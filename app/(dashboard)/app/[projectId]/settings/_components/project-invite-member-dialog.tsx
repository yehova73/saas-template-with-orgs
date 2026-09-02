"use client";

import { inviteOrganizationMemberAction } from "@/actions/organizations/settings";
import { addProjectMemberAction } from "@/actions/organizations/projects/settings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useServerAction from "@/hooks/use-server-action";
import { ProjectRole } from "@/lib/generated/prisma/browser";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

type AvailableMember = {
  id: string;
  userId: string;
  user: { name: string | null; email: string };
};

type ProjectInviteMemberDialogProps = {
  projectId: string;
  availableMembers: AvailableMember[];
  projectMemberIds: string[];
  organizationRoles: Array<{ id: string; name: string }>;
};

export function ProjectInviteMemberDialog({
  projectId,
  availableMembers,
  projectMemberIds,
  organizationRoles,
}: ProjectInviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("organization-member");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [email, setEmail] = useState("");
  const [organizationRoleId, setOrganizationRoleId] = useState(
    organizationRoles[0]?.id ?? "",
  );
  const [projectRole, setProjectRole] = useState<ProjectRole>(ProjectRole.USER);

  const { call: addMember, loading: addingMember } = useServerAction(
    addProjectMemberAction,
  );
  const { call: inviteMember, loading: invitingMember } = useServerAction(
    inviteOrganizationMemberAction,
  );

  const nonProjectMembers = availableMembers.filter(
    (member) => !projectMemberIds.includes(member.userId),
  );
  const loading = addingMember || invitingMember;

  function reset() {
    setSelectedMemberId("");
    setEmail("");
    setOrganizationRoleId(organizationRoles[0]?.id ?? "");
    setProjectRole(ProjectRole.USER);
    setMode("organization-member");
  }

  async function handleAddOrganizationMember() {
    if (!selectedMemberId) return;
    const result = await addMember({
      projectId,
      userId: selectedMemberId,
      role: projectRole,
    });
    if (result !== null) {
      reset();
      setOpen(false);
    }
  }

  async function handleInviteNewUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await inviteMember({
      email,
      roleId: organizationRoleId,
      projectId,
      projectRole,
    });
    if (result !== null) {
      reset();
      setOpen(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-2 size-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project Member</DialogTitle>
          <DialogDescription>
            Add an organization member or invite someone new to this project.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="w-full">
            <TabsTrigger value="organization-member">
              Invite org user
            </TabsTrigger>
            <TabsTrigger value="new-user">Invite new user</TabsTrigger>
          </TabsList>

          <TabsContent value="organization-member" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-select">Select Member</Label>
              <Select
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
                disabled={loading || nonProjectMembers.length === 0}
              >
                <SelectTrigger id="member-select" className="w-full">
                  <SelectValue
                    placeholder={
                      nonProjectMembers.length === 0
                        ? "No available members"
                        : "Select a member to add"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {nonProjectMembers.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.user.name || member.user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project role</Label>
              <ProjectRoleSelect
                value={projectRole}
                onChange={setProjectRole}
                disabled={loading}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddOrganizationMember}
                disabled={loading || !selectedMemberId}
              >
                {addingMember && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Add Member
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="new-user" className="py-4">
            <form
              id="invite-new-user-form"
              className="grid gap-4"
              onSubmit={handleInviteNewUser}
            >
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="teammate@company.com"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Organization role</Label>
                <Select
                  value={organizationRoleId}
                  onValueChange={setOrganizationRoleId}
                  disabled={loading || organizationRoles.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an organization role" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project role</Label>
                <ProjectRoleSelect
                  value={projectRole}
                  onChange={setProjectRole}
                  disabled={loading}
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  form="invite-new-user-form"
                  disabled={loading || !organizationRoleId}
                >
                  {invitingMember && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Invite user
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ProjectRoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: ProjectRole;
  onChange: (value: ProjectRole) => void;
  disabled: boolean;
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as ProjectRole)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ProjectRole.USER}>User</SelectItem>
        <SelectItem value={ProjectRole.ADMIN}>Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
