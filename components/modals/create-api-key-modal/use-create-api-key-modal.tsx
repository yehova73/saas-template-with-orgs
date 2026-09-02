"use client";

import * as React from "react";

type State = { open: boolean; projectId: string | null };
type Action = { type: "OPEN"; projectId: string } | { type: "CLOSE" };

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { open: false, projectId: null };

function dispatch(action: Action) {
  if (action.type === "OPEN") {
    memoryState = { open: true, projectId: action.projectId };
  } else {
    memoryState = { ...memoryState, open: false };
  }
  listeners.forEach((l) => l(memoryState));
}

export function useCreateApiKeyModal() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    ...state,
    openDialog: (projectId: string) => dispatch({ type: "OPEN", projectId }),
    closeDialog: () => dispatch({ type: "CLOSE" }),
  };
}
