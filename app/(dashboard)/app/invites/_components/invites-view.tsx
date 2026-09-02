"use client";

import { acceptOrganizationInviteByIdAction } from "@/actions/organizations/join";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useServerAction from "@/hooks/use-server-action";
import { Loader2, MailOpen } from "lucide-react";

type Invite = {
  id: string;
  email: string;
  role: { id: string; name: string };
  project: { id: string; name: string } | null;
  expiresAt: Date;
  createdAt: Date;
  organization: { id: string; name: string };
};

export function InvitesView({ invites }: { invites: Invite[] }) {
  const { call: acceptInvite, loading } = useServerAction(
    acceptOrganizationInviteByIdAction,
  );

  return (
    <div className="space-y-6 mx-auto max-w-7xl w-full">
      <DashboardPageHeader
        title="Organization Invites"
        description="Review invitations sent to your account and join an organization."
      />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-muted-foreground"
                >
                  You have no pending organization invites.
                </TableCell>
              </TableRow>
            ) : (
              invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="font-medium">
                    {invite.organization.name}
                  </TableCell>
                  <TableCell>{invite.project?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {invite.role.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(invite.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(invite.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => acceptInvite(invite.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <MailOpen className="size-4" />
                      )}
                      Accept invite
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
