"use server";

import { prisma } from "@/lib/prisma";
import { getActiveOrganizationContext } from "../organization";
import { ServerActionResponse } from "@/hooks/use-server-action";

/**
 * Get all projects for the active organization
 */
export async function getOrganizationProjects() {
  const context = await getActiveOrganizationContext();

  if (!context) {
    // throw new Error("No active organization");
    return [];
  }

  const { organization } = context;

  const projects = await prisma.project.findMany({
    where: {
      organizationId: organization.id,
    },
    include: {
      memberships: {
        select: {
          userId: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
}

/**
 * Get a specific project with its members
 */
export async function getProjectWithMemberships(projectId: string) {
  const context = await getActiveOrganizationContext();

  if (!context) {
    throw new Error("No active organization");
  }

  const { organization } = context;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Verify the project belongs to the active organization
  if (project.organizationId !== organization.id) {
    throw new Error("Project does not belong to this organization");
  }

  return project;
}

/**
 * Require that the current user is an admin in the specified project
 * Throws an error if not
 */
export async function requireProjectAdmin(projectId: string) {
  const context = await getActiveOrganizationContext();

  if (!context) {
    throw new Error("No active organization");
  }

  const { user, membership, organization } = context;

  // Org admins are automatically project admins
  if (membership.role === "ADMIN") {
    return { user, membership, organization, projectId };
  }

  // Check if user is a project admin
  const projectMembership = await prisma.projectMembership.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: user.id,
      },
    },
  });

  if (!projectMembership || projectMembership.role !== "ADMIN") {
    throw new Error("You do not have permission to manage this project");
  }

  return { user, membership, organization, projectId };
}

/**
 * Get organization members (for adding to projects)
 */
export async function getOrganizationMembers() {
  const context = await getActiveOrganizationContext();

  if (!context) {
    throw new Error("No active organization");
  }

  const { organization } = context;

  const members = await prisma.organizationMembership.findMany({
    where: {
      organizationId: organization.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return members;
}

/**
 * Set the active project for the current session
 */
export async function setActiveProjectAction(
  projectId: string | null,
): Promise<ServerActionResponse<{ activeProjectId: string | null }>> {
  const context = await getActiveOrganizationContext();

  if (!context) {
    throw new Error("No active organization");
  }

  const { user, organization } = context;

  // If projectId is null, clear the active project
  if (projectId === null) {
    // This will be handled in the JWT callback
    return {
      status: "ok" as const,
      data: { activeProjectId: null },
    };
  }

  // Verify the project belongs to the active organization
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      organizationId: true,
      memberships: {
        where: { userId: user.id },
      },
    },
  });

  if (!project) {
    return {
      status: "error" as const,
      message: {
        title: "Project not found",
      },
    };
  }

  if (project.organizationId !== organization.id) {
    return {
      status: "error" as const,
      message: {
        title: "Project does not belong to this organization",
      },
    };
  }

  // Verify user is a member of the project
  if (project.memberships.length === 0) {
    return {
      status: "error" as const,
      message: {
        title: "You are not a member of this project",
      },
    };
  }

  return {
    status: "ok" as const,
    data: { activeProjectId: projectId },
  };
}
