"use server";

import { requireActiveOrganization } from "./context";

export type OrganizationPermission =
  | "manageSettings"
  | "manageBilling"
  | "manageMembers"
  | "createProject";

export const requireOrganizationPermission = async (
  permission: OrganizationPermission,
) => {
  const context = await requireActiveOrganization();
  if (!context.membership.role[permission]) {
    throw new Error("You do not have permission to perform this action");
  }
  return context;
};