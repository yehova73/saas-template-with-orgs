import { getUserFromSession } from "@/actions/account/account";
import { prisma } from "@/lib/prisma";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { AccountSettings } from "./_components/account-settings";
import { AccountSettingsDangerZone } from "./_components/account-settings-danger-zone";

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
    <div className="max-w-7xl mx-auto w-full space-y-6">
      <DashboardPageHeader
        title="Account Settings"
        description="Manage your account and preferences"
      />
      <AccountSettings
        email={details?.email || ""}
        hasPassword={!!details?.password}
      />
      <AccountSettingsDangerZone />
    </div>
  );
}
