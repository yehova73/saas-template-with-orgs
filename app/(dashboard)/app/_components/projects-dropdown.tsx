"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Code, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  useChangeActiveProject,
  ACTIVE_PROJECT_CHANGED_EVENT,
  type ActiveProjectChangedDetail,
} from "@/hooks/use-change-active-project";
import { useNewProjectModal } from "@/components/modals/new-project-modal/use-new-project-modal";

export const ProjectsDropdown: React.FC<{
  projects: Array<{
    id: string;
    name: string;
  }>;
  activeProjectId?: string;
  permissions: {
    createProject: boolean;
  };
}> = ({ projects, activeProjectId, permissions }) => {
  const [localActiveProjectId, setLocalActiveProjectId] =
    useState(activeProjectId);
  const { changeProject } = useChangeActiveProject();
  const { openDialog: openNewProject } = useNewProjectModal();

  useEffect(() => {
    function handleChange(e: Event) {
      const detail = (e as CustomEvent<ActiveProjectChangedDetail>).detail;
      setLocalActiveProjectId(detail.activeProjectId ?? undefined);
    }
    window.addEventListener(ACTIVE_PROJECT_CHANGED_EVENT, handleChange);
    return () =>
      window.removeEventListener(ACTIVE_PROJECT_CHANGED_EVENT, handleChange);
  }, []);

  const activeProject = useMemo(() => {
    return projects.find((project) => project.id === localActiveProjectId);
  }, [projects, localActiveProjectId]);

  async function handleProjectChange(projectId: string | null) {
    if (projectId === localActiveProjectId) return;
    await changeProject(
      projectId,
      projectId === null ? { navigate: "/app" } : {},
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant={"outline"}>
          <Code className="mt-0.5" />
          {activeProject?.name || "Select Project"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => handleProjectChange(project.id)}
          >
            <Code className="mt-0.5" />
            {project.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          key="all-projects"
          onClick={() => handleProjectChange(null)}
        >
          <Code className="mt-0.5" />
          All Projects
        </DropdownMenuItem>
        {permissions.createProject && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openNewProject}>
              <Plus />
              Add Project
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
