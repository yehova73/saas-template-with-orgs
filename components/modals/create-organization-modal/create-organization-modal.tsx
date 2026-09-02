"use client";

import { createOrganizationAction } from "@/actions/organizations/organization";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCreateOrganizationModal } from "./use-create-organization-modal";

export const CreateOrganizationModal: React.FC = () => {
  const { open, closeDialog } = useCreateOrganizationModal();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  async function handleCreateOrganization(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createOrganizationAction({ name: name.trim() });

      if (result.status === "error") {
        toast.error(result.message?.title || "Unable to create organization", {
          description: result.message?.description,
        });
        return;
      }

      toast.success(result.message?.title || "Organization created");

      if (result.data?.organizationId) {
        await update({ activeOrgId: result.data.organizationId });
      }

      setName("");
      closeDialog();
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && closeDialog()}>
      <DialogContent className="!max-w-lg">
        <form onSubmit={handleCreateOrganization} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to organize your projects and team
              members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              placeholder="Acme Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => closeDialog()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Create Organization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
