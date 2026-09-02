import { acceptOrganizationInviteAction } from "@/actions/organizations/join";
import { getPotentialUserFromSession } from "@/actions/account/account";
import { redirect } from "next/navigation";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const user = await getPotentialUserFromSession();

  if (!token || !user) {
    redirect(token ? `/join?token=${encodeURIComponent(token)}` : "/join");
  }

  const result = await acceptOrganizationInviteAction(token);
  if (result.status !== "ok" || !result.data?.organizationId) {
    redirect(`/join?token=${encodeURIComponent(token)}`);
  }

  redirect("/app");
}
