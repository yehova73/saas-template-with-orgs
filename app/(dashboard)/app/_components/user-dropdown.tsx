"use client";
import { setActiveOrganizationAction } from "@/actions/organizations/organization";
import { useFeedbackModal } from "@/components/modals/feedback-modal/use-feedback-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  LogOut,
  MessageCircleQuestionMark,
  Moon,
  Plus,
  Settings,
  Sun,
  UserPlus,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { useCreateOrganizationModal } from "../../../../components/modals/create-organization-modal/use-create-organization-modal";

export const UserDropdown: React.FC<{
  user: { name: string; email: string; image?: string };
  organizations: Array<{
    id: string;
    name: string;
    role: { id: string; name: string };
  }>;
  activeOrganizationId?: string;
  permissions: {
    viewOrganizationSettings: boolean;
  };
}> = ({ user, organizations, activeOrganizationId, permissions }) => {
  const router = useRouter();
  const { openDialog: openFeedbackDialog } = useFeedbackModal();
  const { setTheme, theme } = useTheme();
  const { update } = useSession();
  const { openDialog: openCreateOrganizationModal } =
    useCreateOrganizationModal();

  async function handleOrganizationChange(organizationId: string) {
    if (organizationId === activeOrganizationId) return;

    try {
      const result = await setActiveOrganizationAction(organizationId);

      if (result.status === "error" || !result.data?.activeOrgId) {
        toast.error(result.message?.title || "Unable to switch organization");
        return;
      }

      await update({
        activeOrgId: result.data.activeOrgId,
        activeProjectId: null,
      });
      window.location.href = "/app";
      // router.refresh();
      // router.push("/app");
    } finally {
    }
  }

  const activeOrganization = useMemo(
    () => organizations.find((org) => org.id === activeOrganizationId),
    [organizations, activeOrganizationId],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Avatar>
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-none w-56" align="end" forceMount>
        <DropdownMenuItem>
          <Avatar>
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm">{user.name || "Your Profile"}</div>
            <div className="text-[10px] text-muted-foreground truncate max-w-40">
              {user.email}
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organization</DropdownMenuLabel>
          {!!organizations.length && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Building2 />{" "}
                  {activeOrganization?.name || "Select Organization"}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {organizations.map((organization) => (
                      <DropdownMenuItem
                        key={organization.id}
                        onClick={() =>
                          handleOrganizationChange(organization.id)
                        }
                      >
                        <Building2 />
                        {organization.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      key="new-organization"
                      onClick={openCreateOrganizationModal}
                    >
                      <Plus />
                      New Organization
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "light" ? <Moon /> : <Sun />} Switch to{" "}
            {theme === "light" ? "Dark" : "Light"} Mode
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openFeedbackDialog()}>
            <MessageCircleQuestionMark /> Support
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push(`/app/settings`)}>
            <Settings />
            Account Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/app/invites`)}>
            <UserPlus />
            Invites
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* <Select
                    value={activeOrganizationId || organizations[0]?.id}
                    onValueChange={handleOrganizationChange}
                    disabled={!!switchingOrganizationId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((organization) => (
                        <SelectItem
                          key={organization.id}
                          value={organization.id}
                        >
                          {organization.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select> */}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
