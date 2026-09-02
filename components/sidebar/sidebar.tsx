"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ClipboardList,
  LayoutDashboard,
  Settings,
  Building2,
  KeyRound,
  ChevronRight,
  Settings2,
  Users2,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Logo } from "../logo";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

export const AppSidebar: React.FC = ({}) => {
  const path = usePathname();
  const { open } = useSidebar();
  const { data: session } = useSession();
  const projectId = session?.user?.activeProjectId;

  const navItems = projectId
    ? [
        {
          title: "Overview",
          url: `/app/${projectId}`,
          icon: <LayoutDashboard />,
        },
        {
          title: "Requests",
          url: `/app/${projectId}/requests`,
          icon: <ClipboardList />,
        },
        {
          title: "Api Keys",
          url: `/app/${projectId}/api-keys`,
          icon: <KeyRound />,
        },
        {
          title: "Settings",
          url: `/app/${projectId}/settings`,
          icon: <Settings />,
        },
      ]
    : [
        { title: "Overview", url: "/app", icon: <LayoutDashboard /> },
        {
          title: "Organization Settings",
          url: "#",
          icon: <Settings />,
          items: [
            {
              title: "General",
              url: "/app/organsation-settings",
              icon: <Building2 />,
            },
            {
              title: "Members",
              url: "/app/organsation-settings/members",
              icon: <Users2 />,
            },
            {
              title: "Billing",
              url: "/app/organsation-settings/billing",
              icon: <CreditCard />,
            },
          ],
        },
      ];

  return (
    <Sidebar id="onborda-sidebar" collapsible="icon">
      <SidebarHeader>
        <Logo variant="white" iconOnly={!open} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) =>
              item.items?.length ? (
                <Collapsible
                  key={item.title}
                  title={item.title}
                  defaultOpen
                  className="group/collapsible"
                >
                  <SidebarGroupLabel
                    asChild
                    className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <CollapsibleTrigger
                      asChild
                      className="w-full cursor-pointer"
                    >
                      <SidebarMenuItem key={item.title}>
                        {item.icon}
                        <div className="ml-2">{item.title}</div>
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuItem>
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarMenuSub className={"pr-0 mr-0"}>
                      {item.items?.map((item) => (
                        <SidebarMenuSubItem key={item?.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={path === item?.url}
                          >
                            <Link href={item!.url}>
                              {item.icon}
                              {item?.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <Link href={item.url} className="font-medium">
                      {item.icon}
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>

        {open && (
          <SidebarFooter className="mt-auto pb-0">
            {/* {subscription.isTrial && (
              <>
                <Card className="w-full bg-blue-200 border-blue-300/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Free Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => router.push(`/app/billing`)}
                      className="mt-2 w-full"
                    >
                      Upgrade Now
                    </Button>
                  </CardContent>
                </Card>
                <Separator />
              </>
            )} */}
          </SidebarFooter>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
