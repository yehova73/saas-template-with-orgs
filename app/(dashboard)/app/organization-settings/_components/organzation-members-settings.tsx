"use client";

import {
  inviteOrganizationMemberAction,
  removeOrganizationMemberAction,
  resendOrganizationInviteAction,
  revokeOrganizationInviteAction,
  updateOrganizationMemberRoleAction,
} from "@/actions/organizations/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireConfirmation } from "@/components/modals/confirmation-modal/use-confirmation";
import {
  Loader2,
  MailPlus,
  RotateCw,
  Search,
  Trash2,
  UserMinus,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import useServerAction from "@/hooks/use-server-action";
import { ProjectRole } from "@/lib/generated/prisma/enums";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Member = {
  id: string;
  createdAt: Date;
  role: { id: string; name: string };
  user: {
    email: string;
    name: string | null;
    image: string | null;
    id: string;
  };
};

type Invite = {
  id: string;
  email: string;
  role: { id: string; name: string };
  expiresAt: Date;
  createdAt: Date;
  acceptedAt: Date | null;
};

type OrgansationMembersViewProps = {
  organization: {
    memberships: Member[];
    invites: Invite[];
    roles: Array<{ id: string; name: string }>;
    projects: Array<{ id: string; name: string }>;
  };
  currentUserId: string;
};

type MemberRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  invitedAt: Date | null;
  joinedAt: Date | null;
  status: "active" | "invited";
  role: { id: string; name: string };
  inviteId?: string;
  userId: string | null;
};

function formatDate(date: Date | null) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

function getInitials(name: string, email: string) {
  return (name || email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function OrganizationMembersSettings({
  organization,
  currentUserId,
}: OrgansationMembersViewProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(organization.roles[0]?.id ?? "");
  const [inviteProject, setInviteProject] = useState("none");
  const [inviteProjectRole, setInviteProjectRole] = useState<ProjectRole>(
    ProjectRole.USER,
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const { call: inviteMember, loading: invitingMember } = useServerAction(
    inviteOrganizationMemberAction,
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
  const { call: updateMemberRole, loading: updatingMemberRole } =
    useServerAction(updateOrganizationMemberRoleAction);

  const rows = useMemo<MemberRow[]>(() => {
    const invitesByEmail = new Map<string, Invite>();
    for (const invite of organization.invites) {
      const key = invite.email.toLowerCase();
      if (!invitesByEmail.has(key)) invitesByEmail.set(key, invite);
    }

    const members = organization.memberships.map((membership) => {
      const invite = invitesByEmail.get(membership.user.email.toLowerCase());
      return {
        id: membership.id,
        name: membership.user.name || membership.user.email,
        email: membership.user.email,
        image: membership.user.image,
        invitedAt: invite?.createdAt ?? null,
        joinedAt: membership.createdAt,
        status: "active" as const,
        role: membership.role,
        userId: membership.user.id,
      };
    });
    const memberEmails = new Set(
      organization.memberships.map((membership) =>
        membership.user.email.toLowerCase(),
      ),
    );
    const pendingInvites = organization.invites
      .filter(
        (invite) =>
          !invite.acceptedAt && !memberEmails.has(invite.email.toLowerCase()),
      )
      .map((invite) => ({
        id: invite.id,
        name: invite.email,
        email: invite.email,
        image: null,
        invitedAt: invite.createdAt,
        joinedAt: null,
        status: "invited" as const,
        role: invite.role,
        inviteId: invite.id,
        userId: null,
      }));

    return [...members, ...pendingInvites];
  }, [organization]);

  const filteredRows = rows.filter((row) => {
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    const query = search.trim().toLowerCase();
    return (
      matchesStatus &&
      (!query ||
        row.name.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query))
    );
  });

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await inviteMember({
      email: inviteEmail,
      roleId: inviteRole,
      projectId: inviteProject === "none" ? undefined : inviteProject,
      projectRole: inviteProject === "none" ? undefined : inviteProjectRole,
    });
    if (data !== null) {
      setInviteEmail("");
      setInviteRole(organization.roles[0]?.id ?? "");
      setInviteProject("none");
      setInviteProjectRole(ProjectRole.USER);
      setInviteOpen(false);
    }
  }

  async function handleRemoveMember(row: MemberRow) {
    const { promise } = requireConfirmation({
      title: `Remove ${row.name}?`,
      subtitle: "This user will lose access to the organization.",
      buttons: { confirm: "Remove", cancel: "Cancel" },
    });

    if (await promise) {
      await removeMember(row.id);
    }
  }

  async function handleRevokeInvite(row: MemberRow) {
    const { promise } = requireConfirmation({
      title: `Cancel invite to ${row.email}?`,
      subtitle: "This invitation link will no longer work.",
      buttons: { confirm: "Cancel invite", cancel: "Keep invite" },
    });

    if (await promise) {
      await revokeInvite(row.inviteId!);
    }
  }

  async function handleRoleChange(row: MemberRow, roleId: string) {
    if (roleId !== row.role.id) {
      await updateMemberRole({ membershipId: row.id, roleId });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage organization members and their roles
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row ">
          <div className="relative">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="sm:max-w-sm pl-8 w-[240px]"
            />
            <Search className="absolute left-2 top-2" size={16} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Accepted</SelectItem>
              <SelectItem value="invited">Invite</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setInviteOpen(true)}>
            <MailPlus className="size-4" /> Invite member
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Invited at</TableHead>
                <TableHead>Joined at</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {row.image && <AvatarImage src={row.image} alt="" />}
                          <AvatarFallback>
                            {getInitials(row.name, row.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{row.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(row.invitedAt)}</TableCell>
                    <TableCell>{formatDate(row.joinedAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.status === "active" ? "default" : "outline"
                        }
                      >
                        {row.status === "active" ? "Active" : "Invited"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.status === "active" ? (
                        <Select
                          value={row.role.id}
                          onValueChange={(value) =>
                            handleRoleChange(row, value)
                          }
                          disabled={
                            updatingMemberRole || row.userId === currentUserId
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {organization.roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="capitalize">
                          {row.role.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {row.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Remove ${row.name}`}
                            onClick={() => handleRemoveMember(row)}
                            disabled={row.userId === currentUserId}
                          >
                            <UserMinus className="size-4" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Resend invite to ${row.email}`}
                              onClick={() => resendInvite(row.inviteId!)}
                            >
                              <RotateCw className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              aria-label={`Cancel invite to ${row.email}`}
                              onClick={() => handleRevokeInvite(row)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent className="!max-w-md">
            <DialogHeader>
              <DialogTitle>Invite user</DialogTitle>
              <DialogDescription>
                Send an invitation to join this organization.
              </DialogDescription>
            </DialogHeader>
            <form
              id="invite-member-form"
              className="grid gap-4"
              onSubmit={handleInvite}
            >
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  required
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
                    {organization.roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={inviteProject} onValueChange={setInviteProject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {organization.projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project role</Label>
                <Select
                  value={inviteProjectRole}
                  onValueChange={(value) =>
                    setInviteProjectRole(value as ProjectRole)
                  }
                  disabled={inviteProject === "none"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProjectRole.USER}>User</SelectItem>
                    <SelectItem value={ProjectRole.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
            <DialogFooter>
              <Button
                type="submit"
                form="invite-member-form"
                disabled={invitingMember}
              >
                {invitingMember && <Loader2 className="size-4 animate-spin" />}
                Invite user
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
