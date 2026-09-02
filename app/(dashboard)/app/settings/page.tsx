import { getUserFromSession } from "@/actions/account/account";
import { prisma } from "@/lib/prisma";
import { SettingsView } from "./_components/settings-view";

export default async function SettingsPage() {
  const user = await getUserFromSession();

  const details = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      password: true,
    },
  });

  return (
    <SettingsView
      email={details?.email || ""}
      hasPassword={!!details?.password}
    />
  );
}
