import { requireOrganizationPermission } from "@/actions/organizations/organization";
import { prisma } from "@/lib/prisma";
import { OrgansationMembersView } from "./_components/organsation-members-view";

export default async function OrgansationSettingsMembersPage() {
  const { organization, user } = await requireOrganizationPermission("manageMembers");
  const details = await prisma.organization.findUnique({
    where: { id: organization.id },
    select: {
      memberships: {
        include: {
          user: { select: { email: true, name: true, image: true, id: true } },
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
    },
  });

  if (!details) {
    throw new Error("Organization not found");
  }

  return (
    <OrgansationMembersView
      organization={details}
      currentUserId={user?.id || ""}
    />
  );
}
