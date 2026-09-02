"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Overview", href: "/app/organsation-settings" },
  { label: "Billing", href: "/app/organsation-settings/billing" },
  { label: "Members", href: "/app/organsation-settings/members" },
];

export function OrgansationSettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="flex w-fit rounded-md border bg-background p-1 shadow">
      {tabs.map((tab) => (
        <Button
          key={tab.href}
          asChild
          size="sm"
          variant={pathname === tab.href ? "default" : "ghost"}
        >
          <Link href={tab.href}>{tab.label}</Link>
        </Button>
      ))}
    </div>
  );
}
