import { getPotentialUserFromSession } from "@/actions/account/account";
import { redirect } from "next/navigation";
import type React from "react";

export default async function ProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getPotentialUserFromSession();
  if (!user?.activeProjectId) {
    return redirect("/app");
  }

  return children;
}
