import { requireOrganizationAdmin } from "@/actions/organizations/organization";
import { prisma } from "@/lib/prisma";
import { OrgansationMembersView } from "./_components/organsation-members-view";

export default async function OrgansationSettingsMembersPage() {
  const { organization, user } = await requireOrganizationAdmin();
  const details = await prisma.organization.findUnique({
    where: { id: organization.id },
    select: {
      memberships: {
        include: {
          user: { select: { email: true, name: true, image: true, id: true } },
        },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      },
      invites: {
        where: { revokedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          expiresAt: true,
          createdAt: true,
          acceptedAt: true,
        },
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
