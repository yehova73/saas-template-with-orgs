import { getUserFromSession } from "@/actions/account/account";
import { prisma } from "@/lib/prisma";
import { InvitesView } from "./_components/invites-view";

export default async function InvitesPage() {
  const user = await getUserFromSession();
  const invites = await prisma.organizationInvite.findMany({
    where: {
      email: { equals: user.email || "never", mode: "insensitive" },
      acceptedAt: null,
      revokedAt: null,
      organization: { deletedAt: null },
    },
    include: {
      role: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      organization: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <InvitesView invites={invites} />;
}
