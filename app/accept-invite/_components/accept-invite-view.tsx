"use client";

import { acceptOrganizationInviteAction } from "@/actions/organizations/join";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function AcceptInviteView({ token }: { token: string }) {
  const { update } = useSession();
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let cancelled = false;

    async function acceptInvite() {
      const result = await acceptOrganizationInviteAction(token);
      if (cancelled) return;

      if (result.status !== "ok" || !result.data?.organizationId) {
        toast.error(result.message?.title || "Unable to accept invite");
        router.replace(`/join?token=${encodeURIComponent(token)}`);
        return;
      }

      await update({ activeOrgId: result.data.organizationId });
      router.replace("/app");
      router.refresh();
    }

    void acceptInvite();
    return () => {
      cancelled = true;
    };
  }, [router, token, update]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Accepting your invitation...
    </div>
  );
}
