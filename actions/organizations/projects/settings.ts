"use server";

import { requireProjectPermission } from "./project";
import { canCreateProject } from "../check-permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ServerActionResponse } from "@/hooks/use-server-action";
import { requireOrganizationPermission } from "../organization/permissions";

/**
 * Create a new project in the active organization
 */
export async function createProjectAction({
  name,
  description,
}: {
  name: string;
  description?: string;
}): Promise<ServerActionResponse<{ project: { id: string; name: string } }>> {
  try {
    const { organization, user } =
      await requireOrganizationPermission("createProject");

    const permission = await canCreateProject();
    if (!permission.allowed) {
      return {
        status: "require_subscription_upgrade",
        message: {
          title: "Project limit reached",
          description: "Upgrade your plan to create more projects.",
        },
      };
    }

    if (!name.trim()) {
      return {
        status: "error",
        message: {
          title: "Project name is required",
        },
      };
    }

    const project = await prisma.project.create({
      data: {
        organizationId: organization.id,
        name: name.trim(),
        description: description?.trim() || null,
        memberships: {
          create: {
            role: "ADMIN",
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    revalidatePath("/app/projects");
    revalidatePath("/app/organsation-settings");

    return {
      status: "ok",
      requireRefresh: true,
      message: {
        title: "Project created successfully",
      },
      data: { project },
    };
  } catch (error) {
    console.error("[createProjectAction]", error);
    return {
      status: "error",
      message: {
        title: "Unable to create project",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}

/**
 * Update a project's name and description
 */
export async function updateProjectAction({
  projectId,
  name,
  description,
}: {
  projectId: string;
  name: string;
  description?: string;
}): Promise<ServerActionResponse> {
  try {
    // Only project admins can update
    await requireProjectPermission(projectId, "manageSettings");

    if (!name.trim()) {
      return {
        status: "error",
        message: {
          title: "Project name is required",
        },
      };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    revalidatePath("/app/projects");
    revalidatePath(`/app/projects/${projectId}/settings`);

    return {
      status: "ok",
      requireRefresh: true,
      message: {
        title: "Project updated successfully",
      },
    };
  } catch (error) {
    console.error("[updateProjectAction]", error);
    return {
      status: "error",
      message: {
        title: "Unable to update project",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}

/**
 * Delete a project
 */
export async function deleteProjectAction(
  projectId: string,
): Promise<ServerActionResponse> {
  try {
    // Only project admins can delete
    await requireProjectPermission(projectId, "manageSettings");

    await prisma.project.delete({
      where: { id: projectId },
    });

    revalidatePath("/app/projects");

    return {
      status: "ok",
      requireRefresh: true,
      message: {
        title: "Project deleted successfully",
      },
    };
  } catch (error) {
    console.error("[deleteProjectAction]", error);
    return {
      status: "error",
      message: {
        title: "Unable to delete project",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}

/**
 * Add a member to a project
 */
export async function addProjectMemberAction({
  projectId,
  userId,
  role = "USER",
}: {
  projectId: string;
  userId: string;
  role?: "ADMIN" | "USER";
}): Promise<ServerActionResponse> {
  try {
    // Only project admins can add members
    await requireProjectPermission(projectId, "manageMembers");

    // Verify user is an organization member
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return {
        status: "error",
        message: { title: "Project not found" },
      };
    }

    const orgMember = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: project.organizationId,
        },
      },
    });

    if (!orgMember) {
      return {
        status: "error",
        message: {
          title: "User is not a member of this organization",
        },
      };
    }

    // Check if already a member
    const existingMembership = await prisma.projectMembership.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingMembership) {
      return {
        status: "error",
        message: {
          title: "User is already a member of this project",
        },
      };
    }

    await prisma.projectMembership.create({
      data: {
        projectId,
        userId,
        role,
      },
    });

    revalidatePath(`/app/projects/${projectId}/settings`);

    return {
      status: "ok",
      requireRefresh: true,
      message: {
        title: "Member added to project",
      },
    };
  } catch (error) {
    console.error("[addProjectMemberAction]", error);
    return {
      status: "error",
      message: {
        title: "Unable to add member to project",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}

/**
 * Remove a member from a project
 */
export async function removeProjectMemberAction({
  projectId,
  memberId,
}: {
  projectId: string;
  memberId: string;
}): Promise<ServerActionResponse> {
  try {
    // Only project admins can remove members
    await requireProjectPermission(projectId, "manageMembers");

    await prisma.projectMembership.delete({
      where: { id: memberId },
    });

    revalidatePath(`/app/projects/${projectId}/settings`);

    return {
      status: "ok",
      requireRefresh: true,
      message: {
        title: "Member removed from project",
      },
    };
  } catch (error) {
    console.error("[removeProjectMemberAction]", error);
    return {
      status: "error",
      message: {
        title: "Unable to remove member from project",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}

/**
 * Update a project member's role
 */
export async function updateProjectMemberRoleAction({
  projectId,
  memberId,
  role,
}: {
  projectId: string;
  memberId: string;
  role: "ADMIN" | "USER";
}): Promise<ServerActionResponse> {
  try {
    // Only project admins can update roles
    await requireProjectPermission(projectId, "manageMembers");

    await prisma.projectMembership.update({
      where: { id: memberId },
      data: { role },
    });

    revalidatePath(`/app/projects/${projectId}/settings`);

    return {
      status: "ok",
      requireRefresh: true,
      message: {
        title: "Member role updated",
      },
    };
  } catch (error) {
    console.error("[updateProjectMemberRoleAction]", error);
    return {
      status: "error",
      message: {
        title: "Unable to update member role",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}
