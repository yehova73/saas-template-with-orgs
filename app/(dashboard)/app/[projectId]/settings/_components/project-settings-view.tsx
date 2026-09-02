"use client";

import {
  updateProjectAction,
  deleteProjectAction,
  addProjectMemberAction,
  removeProjectMemberAction,
  updateProjectMemberRoleAction,
} from "@/actions/organizations/projects/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, UserMinus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectRole } from "@/lib/generated/prisma/enums";
import { getOrganizationMembers } from "@/actions/organizations/projects/project";
import useServerAction from "@/hooks/use-server-action";

type ProjectUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type ProjectMembership = {
  id: string;
  userId: string;
  role: ProjectRole;
  user: ProjectUser;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  memberships: ProjectMembership[];
};

type ProjectSettingsViewProps = {
  project: Project;
  availableMembers?: Awaited<ReturnType<typeof getOrganizationMembers>>;
};

export function ProjectSettingsView({
  project,
  availableMembers,
}: ProjectSettingsViewProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const router = useRouter();

  const { call: updateProject, loading: updatingProject } =
    useServerAction(updateProjectAction);
  const { call: deleteProject, loading: deletingProject } =
    useServerAction(deleteProjectAction);
  const { call: addMember, loading: addingMember } = useServerAction(
    addProjectMemberAction,
  );
  const { call: removeMember, loading: removingMember } = useServerAction(
    removeProjectMemberAction,
  );
  const { call: updateMemberRole } = useServerAction(
    updateProjectMemberRoleAction,
  );

  async function handleUpdateProject() {
    await updateProject({ projectId: project.id, name, description });
  }

  async function handleDeleteProject() {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    ) {
      return;
    }

    const data = await deleteProject(project.id);
    if (data !== null) {
      router.push("/app/projects");
    }
  }

  async function handleAddMember() {
    if (!selectedMemberId) return;

    const data = await addMember({
      projectId: project.id,
      userId: selectedMemberId,
      role: "USER",
    });
    if (data !== null) {
      setSelectedMemberId("");
    }
  }

  async function handleRemoveMember(memberId: string) {
    await removeMember({ projectId: project.id, memberId });
  }

  async function handleUpdateMemberRole(
    memberId: string,
    role: "ADMIN" | "USER",
  ) {
    await updateMemberRole({ projectId: project.id, memberId, role });
  }

  // Members already in the project
  const projectMemberIds = new Set(project.memberships.map((m) => m.userId));

  // Available members not yet in the project
  const nonProjectMembers = (availableMembers || [])
    .map((m) => ({
      id: m.userId || m.id,
      user: m.user,
    }))
    .filter((m) => !projectMemberIds.has(m.id));

  return (
    <div className="space-y-6">
      {/* Project Details */}
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
            <Input
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

      {/* Members Management */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage project members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Member Form */}
          <div className="space-y-2 pb-4 border-b">
            <Label>Add Member</Label>
            <div className="flex gap-2">
              <Select
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
                disabled={addingMember || nonProjectMembers.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a member to add" />
                </SelectTrigger>
                <SelectContent>
                  {nonProjectMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.user.name || member.user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={addingMember || !selectedMemberId}
              >
                {addingMember ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                Add
              </Button>
            </div>
          </div>

          {/* Members List */}
          {project.memberships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No members yet. Add a member to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {project.memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {membership.user.name || membership.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {membership.user.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={membership.role}
                      onValueChange={(role) =>
                        handleUpdateMemberRole(
                          membership.id,
                          role as "ADMIN" | "USER",
                        )
                      }
                      disabled={removingMember}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(membership.id)}
                      disabled={removingMember}
                    >
                      {removingMember ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UserMinus className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteProject}
            disabled={deletingProject}
          >
            {deletingProject && <Loader2 className="size-4 animate-spin" />}
            <Trash2 className="size-4" />
            Delete Project
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
