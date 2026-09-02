"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ConfirmModalHeader,
  ConfirmModalShell,
} from "../../settings/_components/modals";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResetDataModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [ack, setAck] = useState(false);
  function submit() {
    if (!ack) return toast.error("Please acknowledge the warning");
    toast.success("All workspace data has been reset");
    setAck(false);
    onOpenChange(false);
  }
  return (
    <ConfirmModalShell open={open} onOpenChange={onOpenChange}>
      <ConfirmModalHeader
        tone="warn"
        icon={<RotateCcw className="h-4 w-4" />}
        title="Reset all workspace data"
        desc="This will delete all workspaces, snapshots, and notes."
      />
      <div className="p-5 space-y-3 text-sm">
        <div
          className="rounded-md border p-3 text-xs"
          style={{
            borderColor: "var(--amber)",
            backgroundColor:
              "color-mix(in oklab, var(--amber) 10%, transparent)",
          }}
        >
          Your account will stay active. Billing, email, and password are
          unaffected.
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border border-border text-foreground"
          />
          <span>
            I understand this permanently deletes my workspace data and cannot
            be undone.
          </span>
        </label>
      </div>
      <div
        className="p-4 border-t flex justify-end gap-2"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="secondary" size="sm" onClick={submit}>
          Reset data
        </Button>
      </div>
    </ConfirmModalShell>
  );
}
