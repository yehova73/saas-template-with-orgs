"use client";

import { getOrganizationMembers } from "@/actions/organizations/projects/project";
import {
  removeProjectMemberAction,
  updateProjectMemberRoleAction,
} from "@/actions/organizations/projects/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectInviteMemberDialog } from "./project-invite-member-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useServerAction from "@/hooks/use-server-action";
import { ProjectRole } from "@/lib/generated/prisma/browser";
import { Loader2, UserMinus } from "lucide-react";

type ProjectUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type ProjectMembership = {
  id: string;
  userId: string;
  role: ProjectRole;
  user: ProjectUser;
  createdAt: Date;
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString();
}

function getInitials(name: string | null, email: string) {
  return (name || email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const ProjectMembersSettings: React.FC<{
  memberships: ProjectMembership[];
  availableMembers?: Awaited<ReturnType<typeof getOrganizationMembers>>;
  organizationRoles: Array<{ id: string; name: string }>;
  projectId: string;
}> = ({ memberships, availableMembers, organizationRoles, projectId }) => {

  const { call: removeMember, loading: removingMember } = useServerAction(
    removeProjectMemberAction,
  );
  const { call: updateMemberRole } = useServerAction(
    updateProjectMemberRoleAction,
  );

  async function handleRemoveMember(memberId: string) {
    await removeMember({ projectId: projectId, memberId });
  }

  async function handleUpdateMemberRole(
    memberId: string,
    role: "ADMIN" | "USER",
  ) {
    await updateMemberRole({ projectId: projectId, memberId, role });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage project members and their roles
          </CardDescription>
        </div>

        <ProjectInviteMemberDialog
          projectId={projectId}
          availableMembers={availableMembers || []}
          projectMemberIds={memberships.map((membership) => membership.userId)}
          organizationRoles={organizationRoles}
        />
      </CardHeader>

      <CardContent>
        {memberships.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No members yet. Add a member to get started.
          </p>
        ) : (
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Added on</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {membership.user.image && (
                            <AvatarImage src={membership.user.image} alt="" />
                          )}
                          <AvatarFallback>
                            {getInitials(
                              membership.user.name,
                              membership.user.email,
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {membership.user.name || membership.user.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {membership.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(membership.createdAt)}</TableCell>
                    <TableCell>
                      <Select
                        value={membership.role}
                        onValueChange={(role) =>
                          handleUpdateMemberRole(
                            membership.id,
                            role as "ADMIN" | "USER",
                          )
                        }
                        disabled={removingMember}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Remove ${membership.user.name || membership.user.email} from project`}
                          onClick={() => handleRemoveMember(membership.id)}
                          disabled={removingMember}
                        >
                          {removingMember ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <UserMinus className="size-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
