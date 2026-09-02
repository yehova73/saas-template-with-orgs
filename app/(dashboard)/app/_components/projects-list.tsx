"use client";

import { deleteProjectAction } from "@/actions/organizations/projects/settings";
import { useChangeActiveProject } from "@/hooks/use-change-active-project";
import { ConfirmationModal } from "@/components/modals/confirmation-modal/confirmation-modal";
import { requireConfirmation } from "@/components/modals/confirmation-modal/use-confirmation";
import { useNewProjectModal } from "@/components/modals/new-project-modal/use-new-project-modal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Trash2, Eye } from "lucide-react";
import useServerAction from "@/hooks/use-server-action";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  memberships: Array<{
    userId: string;
    role: "ADMIN" | "USER";
    user: { id: string; name: string | null; email: string };
  }>;
};

function ProjectRow({ project }: { project: Project }) {
  const { changeProject, loading: isNavigating } = useChangeActiveProject();
  const { call: deleteProject, loading: isDeleting } =
    useServerAction(deleteProjectAction);

  async function handleViewProject() {
    await changeProject(project.id, { navigate: `/app/${project.id}` });
  }

  async function handleDelete() {
    const { promise } = requireConfirmation({
      title: `Delete "${project.name}"?`,
      subtitle:
        "This action cannot be undone. All project data will be permanently deleted.",
      buttons: { confirm: "Delete", cancel: "Cancel" },
    });

    const confirmed = await promise;
    if (!confirmed) return;

    await deleteProject(project.id);
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{project.name}</TableCell>
      <TableCell>{project.memberships.length}</TableCell>
      <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
      <TableCell className="max-w-xs whitespace-normal">
        {project.memberships
          .filter((membership) => membership.role === "ADMIN")
          .map((membership) => (
            <div key={membership.user.id}>
              {membership.user.name || membership.user.email}
            </div>
          ))}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleViewProject}
            disabled={isNavigating}
            aria-label={`View ${project.name}`}
          >
            {isNavigating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={`Delete ${project.name}`}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProjectsList({
  projects,
  isAdmin,
}: {
  projects: Project[];
  isAdmin: boolean;
}) {
  const { openDialog: openNewProject } = useNewProjectModal();

  return (
    <div className="space-y-4">
      <ConfirmationModal />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Projects</h2>
          <p className="text-sm text-muted-foreground">
            Select a project to get started or create a new one.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openNewProject} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No projects yet. Create your first project to get started.
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Total members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Project admins</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
