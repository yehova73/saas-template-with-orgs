import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { OrgansationSettingsTabs } from "./_components/organsation-settings-tabs";

export default function OrgansationSettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Organization Settings" />
      <OrgansationSettingsTabs />
      {children}
    </div>
  );
}
