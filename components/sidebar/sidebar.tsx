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
  ChevronRight,
  ClipboardList,
  Code,
  KeyRound,
  LayoutDashboard,
  Plus,
  Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../logo";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useChangeActiveProject } from "@/hooks/use-change-active-project";
import { useNewProjectModal } from "../modals/new-project-modal/use-new-project-modal";

export const AppSidebar: React.FC<{
  projects: { id: string; name: string }[];
  canCreateProject: boolean;
}> = ({ projects, canCreateProject }) => {
  const path = usePathname();
  const { open } = useSidebar();
  const { data: session } = useSession();
  const localActiveProjectId = session?.user?.activeProjectId;
  const { changeProject } = useChangeActiveProject();
  const { openDialog: openNewProject } = useNewProjectModal();

  const navItems: {
    title: string;
    url: string;
    icon: React.ReactNode;
    items?: { title: string; url: string; icon: React.ReactNode }[];
  }[] = localActiveProjectId
    ? [
        {
          title: "Overview",
          url: `/app/${localActiveProjectId}`,
          icon: <LayoutDashboard />,
        },
        {
          title: "Requests",
          url: `/app/${localActiveProjectId}/requests`,
          icon: <ClipboardList />,
        },
        {
          title: "Api Keys",
          url: `/app/${localActiveProjectId}/api-keys`,
          icon: <KeyRound />,
        },
        {
          title: "Settings",
          url: `/app/${localActiveProjectId}/settings`,
          icon: <Settings />,
        },
      ]
    : [{ title: "Overview", url: "/app", icon: <LayoutDashboard /> }];

  async function handleProjectChange(projectId: string) {
    if (projectId === localActiveProjectId) return;
    await changeProject(projectId);
  }

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
        {!localActiveProjectId && (
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    onClick={() => handleProjectChange(project.id)}
                  >
                    <Code />
                    {project.name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {canCreateProject && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={openNewProject}>
                    <Plus />
                    Add Project
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {open && (
          <SidebarFooter className="mt-auto pb-2">
            <SidebarMenu>
              <Link
                href="/app/organization-settings"
                className="flex w-full cursor-pointer"
              >
                <SidebarMenuItem className="w-full cursor-pointer">
                  <SidebarMenuButton
                    isActive={path === "/app/organization-settings"}
                    className="w-full cursor-pointer"
                  >
                    <Settings />
                    Organization Settings
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            </SidebarMenu>
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
