import { getPotentialUserFromSession } from "@/actions/account/account";
import { getOrganizationInviteByToken } from "@/actions/organizations/join";
import { prisma } from "@/lib/prisma";
import { JoinInviteView } from "./_components/join-invite-view";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const invite = token ? await getOrganizationInviteByToken(token) : null;
  const user = await getPotentialUserFromSession();
  const accountExists =
    !user &&
    !!invite &&
    !!(await prisma.user.findFirst({
      where: { email: { equals: invite.email, mode: "insensitive" } },
      select: { id: true },
    }));

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <JoinInviteView
          token={token || ""}
          invite={invite}
          signedInEmail={user?.email || undefined}
          accountExists={accountExists}
        />
      </div>
    </main>
  );
}
