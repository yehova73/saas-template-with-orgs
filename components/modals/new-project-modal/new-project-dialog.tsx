"use client";

import { createProjectAction } from "@/actions/organizations/projects/settings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useServerAction from "@/hooks/use-server-action";
import { useChangeActiveProject } from "@/hooks/use-change-active-project";
import { useNewProjectModal } from "./use-new-project-modal";

export function NewProjectDialog() {
  const { open, closeDialog } = useNewProjectModal();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { changeProject } = useChangeActiveProject();
  const { call: createProject, loading: isCreating } =
    useServerAction(createProjectAction);

  function handleOpenChange(val: boolean) {
    if (!val) {
      closeDialog();
      setName("");
      setDescription("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    const data = await createProject({ name, description });
    if (data !== null && data?.project) {
      const project = data.project;
      closeDialog();
      setName("");
      setDescription("");
      await changeProject(project.id, { navigate: `/app/${project.id}` });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Create a new project within your organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="new-project-name">Project Name</Label>
            <Input
              id="new-project-name"
              placeholder="My Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-project-description">
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="new-project-description"
              placeholder="Describe the project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
