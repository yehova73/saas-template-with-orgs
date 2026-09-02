"use client";

import { createApiKeyAction } from "@/actions/organizations/projects/api-keys";
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
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useServerAction from "@/hooks/use-server-action";
import { useCreateApiKeyModal } from "./use-create-api-key-modal";

type CreatedKey = {
  id: string;
  key: string;
  name: string;
  keyPrefix: string;
  expiresAt: Date | null;
  createdAt: Date;
};

export function CreateApiKeyDialog() {
  const { open, projectId, closeDialog } = useCreateApiKeyModal();
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
  const [copied, setCopied] = useState(false);

  const { call: createKey, loading: isCreating } =
    useServerAction(createApiKeyAction);

  function handleOpenChange(val: boolean) {
    if (!val) {
      closeDialog();
      if (createdKey) {
        // Reset after showing the key
        setCreatedKey(null);
      }
      setName("");
      setExpiresAt("");
      setCopied(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;

    const data = await createKey({
      projectId,
      name,
      expiresAt: expiresAt || null,
    });

    if (data !== null) {
      setCreatedKey(data as CreatedKey);
    }
  }

  async function handleCopy() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDone() {
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Give your API key a name and an optional expiry date.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="api-key-name">Name</Label>
                <Input
                  id="api-key-name"
                  placeholder="e.g. Production Key"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isCreating}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key-expires">
                  Expiration Date{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="api-key-expires"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  disabled={isCreating}
                  min={new Date().toISOString().split("T")[0]}
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
                  {isCreating && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Create
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                API Key Created
              </DialogTitle>
              <DialogDescription>
                Copy your API key now. You won&apos;t be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Your API Key</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={createdKey.key}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Store this key securely — it will not be shown again.
                </p>
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={handleDone}>
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
