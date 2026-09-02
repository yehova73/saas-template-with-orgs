"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export const getPotentialUserFromServerSession = async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
};

export const getUserOrganizationMemberships = async () => {
  const user = await getPotentialUserFromServerSession();
  if (!user?.id) return [];

  return prisma.organizationMembership.findMany({
    where: { userId: user.id, organization: { deletedAt: null } },
    include: { organization: true, role: true },
    orderBy: { createdAt: "asc" },
  });
};

export const getActiveOrganizationContext = async () => {
  const user = await getPotentialUserFromServerSession();
  if (!user?.id) return null;

  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId: user.id,
      organization: { deletedAt: null },
      ...(user.activeOrgId ? { organizationId: user.activeOrgId } : {}),
    },
    include: { organization: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  return membership
    ? { user, membership, organization: membership.organization }
    : null;
};

export const requireActiveOrganization = async () => {
  const context = await getActiveOrganizationContext();
  if (!context) throw new Error("No active organization found");
  return context;
};