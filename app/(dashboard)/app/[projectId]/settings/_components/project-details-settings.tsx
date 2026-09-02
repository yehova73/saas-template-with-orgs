"use client";

import { updateProjectAction } from "@/actions/organizations/projects/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useServerAction } from "@/hooks/use-server-action";
import { Project } from "@/lib/generated/prisma/browser";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export const ProjectDetailsSettings: React.FC<{ project: Project }> = ({
  project,
}) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");

  const { call: updateProject, loading: updatingProject } =
    useServerAction(updateProjectAction);

  async function handleUpdateProject() {
    await updateProject({ projectId: project.id, name, description });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
        <CardDescription>
          Update the project name and description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={updatingProject}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-description">Description</Label>
          <Textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={updatingProject}
            placeholder="Brief description of your project"
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleUpdateProject}
            disabled={
              updatingProject ||
              (name === project.name &&
                description === (project.description || ""))
            }
          >
            {updatingProject && <Loader2 className="size-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
