"use client";

import { setActiveProjectAction } from "@/actions/organizations/projects/project";
import useServerAction from "./use-server-action";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const ACTIVE_PROJECT_CHANGED_EVENT = "activeProjectChanged";

export type ActiveProjectChangedDetail = { activeProjectId: string | null };

export function useChangeActiveProject() {
  const { update } = useSession();
  const router = useRouter();
  const { call: setActive, loading } = useServerAction(setActiveProjectAction);

  const changeProject = async (
    projectId: string | null,
    options?: { navigate?: string },
  ) => {
    const data = await setActive(projectId);
    if (data) {
      await update({ activeProjectId: data.activeProjectId });
      window.dispatchEvent(
        new CustomEvent<ActiveProjectChangedDetail>(
          ACTIVE_PROJECT_CHANGED_EVENT,
          { detail: { activeProjectId: data.activeProjectId } },
        ),
      );
      if (options?.navigate) {
        router.push(options.navigate);
      } else {
        router.refresh();
      }
    }
    return data;
  };

  return { changeProject, loading };
}
