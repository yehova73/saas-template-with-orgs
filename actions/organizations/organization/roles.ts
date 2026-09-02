"use server";

import { requireOrganizationPermission } from "./permissions";
import { prisma } from "@/lib/prisma";
import { ServerActionResponse } from "@/hooks/use-server-action";

export type OrganizationRolePermissions = {
  name: string;
  manageSettings: boolean;
  manageBilling: boolean;
  manageMembers: boolean;
  createProject: boolean;
};

export async function getOrganizationRoles() {
  const { organization } =
    await requireOrganizationPermission("manageSettings");
  return prisma.organizationUserRole.findMany({
    where: { organizationId: organization.id },
    orderBy: { name: "asc" },
  });
}

export async function createOrganizationRoleAction(
  data: OrganizationRolePermissions,
): Promise<ServerActionResponse<{ id: string }>> {
  const { organization } =
    await requireOrganizationPermission("manageSettings");
  const name = data.name.trim();
  if (!name)
    return { status: "error", message: { title: "Role name is required" } };

  const role = await prisma.organizationUserRole.create({
    data: { ...data, name, organizationId: organization.id },
    select: { id: true },
  });
  return { status: "ok", data: role, message: { title: "Role created" } };
}

export async function updateOrganizationRoleAction(
  roleId: string,
  data: OrganizationRolePermissions,
): Promise<ServerActionResponse<null>> {
  const { organization } =
    await requireOrganizationPermission("manageSettings");
  const name = data.name.trim();
  if (!name)
    return { status: "error", message: { title: "Role name is required" } };

  await prisma.organizationUserRole.updateMany({
    where: { id: roleId, organizationId: organization.id },
    data: { ...data, name },
  });
  return { status: "ok", data: null, message: { title: "Role updated" } };
}

export async function deleteOrganizationRoleAction(
  roleId: string,
): Promise<ServerActionResponse<null>> {
  const { organization } =
    await requireOrganizationPermission("manageSettings");
  const membershipCount = await prisma.organizationMembership.count({
    where: { roleId, organizationId: organization.id },
  });
  const inviteCount = await prisma.organizationInvite.count({
    where: { roleId, organizationId: organization.id },
  });
  if (membershipCount || inviteCount) {
    return {
      status: "error",
      message: {
        title: "Reassign members and invites before deleting this role",
      },
    };
  }
  await prisma.organizationUserRole.deleteMany({
    where: { id: roleId, organizationId: organization.id },
  });
  return { status: "ok", data: null, message: { title: "Role deleted" } };
}
