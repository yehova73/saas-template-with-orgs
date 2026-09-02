/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireOrganizationPermission } from "@/actions/organizations/organization/permissions";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { prisma } from "@/lib/prisma";
import { OrganizationGeneralSettings } from "./_components/organization-general-settings";
import { OrganizationDangerZoneSettings } from "./_components/organization-settings-danger-zone";
import { OrganizationMembersSettings } from "./_components/organzation-members-settings";
import { OrganizationBillingSettings } from "./_components/billing/organization-billing-settings";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { X } from "lucide-react";

export default async function OrganizationSettingsPage() {
  let hasPermission = false;
  let organization: any;
  let user: any;

  try {
    const result = await requireOrganizationPermission("manageSettings");
    organization = result.organization;
    user = result.user;
    hasPermission = true;
  } catch (error) {
    console.log("aici", error);
    hasPermission = false;
  }

  if (!hasPermission) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <X />
          </EmptyMedia>
          <EmptyTitle>Organization Settings are not available</EmptyTitle>
          <EmptyDescription>
            You do not have permission to view this page. Please contact your
            organization administrator if you believe this is an error.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const [details] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organization.id },
      select: {
        id: true,
        name: true,
        memberships: {
          include: {
            user: {
              select: { email: true, name: true, image: true, id: true },
            },
            role: { select: { id: true, name: true } },
          },
          orderBy: [{ role: { name: "asc" } }, { createdAt: "asc" }],
        },
        invites: {
          where: { revokedAt: null },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            role: { select: { id: true, name: true } },
            expiresAt: true,
            createdAt: true,
            acceptedAt: true,
          },
        },
        roles: {
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
        projects: {
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  return (
    <div className="w-full space-y-6 mx-auto max-w-7xl">
      <DashboardPageHeader
        title="Organization Settings"
        description="Manage your organization's settings and preferences."
      />
      <OrganizationGeneralSettings organization={details!} />
      <OrganizationMembersSettings
        currentUserId={user.id}
        organization={details!}
      />
      <OrganizationBillingSettings />
      <OrganizationDangerZoneSettings />
    </div>
  );
}
