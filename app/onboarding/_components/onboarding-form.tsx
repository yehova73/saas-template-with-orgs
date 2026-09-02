"use client";

import { createOrganizationAction } from "@/actions/organizations/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function OnboardingForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await createOrganizationAction({ name });

      if (result.status === "error") {
        toast.error(result.message?.title || "Unable to create organization", {
          description: result.message?.description,
        });
        return;
      }

      if (!result.data?.organizationId) {
        toast.error("Unable to create organization");
        return;
      }

      await update({ activeOrgId: result.data.organizationId });
      router.push("/app");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="w-full rounded-lg border bg-card p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Building2 className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Create organization</h1>
          <p className="text-sm text-muted-foreground">
            Set up the organization that will own billing and members.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization-name">Organization name</Label>
        <Input
          id="organization-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Acme Inc."
          disabled={loading}
        />
      </div>

      <Button className="mt-6 w-full" disabled={loading} type="submit">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Creating
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  );
}
