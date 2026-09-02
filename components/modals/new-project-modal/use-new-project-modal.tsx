"use client";

import * as React from "react";

type State = { open: boolean };
type Action = { type: "OPEN" } | { type: "CLOSE" };

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { open: false };

function dispatch(action: Action) {
  memoryState =
    action.type === "OPEN" ? { open: true } : { ...memoryState, open: false };
  listeners.forEach((l) => l(memoryState));
}

export function useNewProjectModal() {
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
    openDialog: () => dispatch({ type: "OPEN" }),
    closeDialog: () => dispatch({ type: "CLOSE" }),
  };
}
