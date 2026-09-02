"use client";

import {
  acceptOrganizationInviteAction,
  createAccountForInviteAction,
} from "@/actions/organizations/join";
import { CreateAccountView } from "@/components/modals/auth-modal/create-account-view";
import { MagicLinkView } from "@/components/modals/auth-modal/magic-link-view";
import { SocialAuthButtons } from "@/components/modals/auth-modal/social-auth-buttons";
import { SignInView } from "@/components/modals/auth-modal/sign-in-view";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type JoinInviteViewProps = {
  token: string;
  signedInEmail?: string;
  accountExists: boolean;
  invite: {
    email: string;
    role: string;
    organization: { id: string; name: string };
  } | null;
};

export function JoinInviteView({
  token,
  invite,
  signedInEmail,
  accountExists,
}: JoinInviteViewProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup" | "magic-link">(
    accountExists ? "signin" : "signup",
  );
  const { update } = useSession();
  const router = useRouter();

  if (!invite) {
    return (
      <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Invite unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This invite is expired, revoked, or has already been used.
        </p>
      </div>
    );
  }

  const returnTo = `/accept-invite?token=${encodeURIComponent(token)}`;
  const signedInWithWrongEmail =
    signedInEmail && signedInEmail.toLowerCase() !== invite.email.toLowerCase();

  async function acceptInvite() {
    setLoading(true);
    try {
      const result = await acceptOrganizationInviteAction(token);
      if (result.status !== "ok" || !result.data?.organizationId) {
        toast.error(result.message?.title || "Unable to accept invite");
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
    <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Building2 className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            Join {invite.organization.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Invited as {invite.role.toLowerCase()} using {invite.email}.
          </p>
        </div>
      </div>

      {signedInEmail ? (
        signedInWithWrongEmail ? (
          <p className="text-sm text-destructive">
            You are signed in as {signedInEmail}. Sign out and use{" "}
            {invite.email}.
          </p>
        ) : (
          <Button className="w-full" disabled={loading} onClick={acceptInvite}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Accept invite
          </Button>
        )
      ) : (
        <>
          <div className="mb-5 grid gap-2">
            <SocialAuthButtons callbackUrl={returnTo} />
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode("magic-link")}
              disabled={loading}
            >
              Continue with magic link
            </Button>
          </div>
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {mode === "signin" ? (
            <SignInView
              setLoading={setLoading}
              loading={loading}
              initialEmail={invite.email}
              emailDisabled
              showCreateAccountLink={false}
              onForgotPasswordClick={() => router.push("/reset-password")}
              onCreateAccountClick={() => undefined}
              onSuccess={() => router.push(returnTo)}
            />
          ) : mode === "signup" ? (
            <CreateAccountView
              setLoading={setLoading}
              loading={loading}
              initialEmail={invite.email}
              emailDisabled
              showSignInLink={false}
              onCreateAccountClick={() => undefined}
              createAccount={({ name, email, password }) =>
                createAccountForInviteAction({ token, name, email, password })
              }
              onSuccess={() => router.push(returnTo)}
            />
          ) : (
            <MagicLinkView
              setLoading={setLoading}
              loading={loading}
              initialEmail={invite.email}
              emailDisabled
              callbackUrl={returnTo}
              onBackClick={() => setMode(accountExists ? "signin" : "signup")}
            />
          )}
        </>
      )}
    </div>
  );
}
