import { getUserFromSession } from "@/actions/account/account";
import { prisma } from "@/lib/prisma";
import { InvitesView } from "./_components/invites-view";

export default async function InvitesPage() {
  const user = await getUserFromSession();
  const invites = await prisma.organizationInvite.findMany({
    where: {
      email: { equals: user.email, mode: "insensitive" },
      acceptedAt: null,
      revokedAt: null,
      organization: { deletedAt: null },
    },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      createdAt: true,
      organization: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <InvitesView invites={invites} />;
}
