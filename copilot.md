# Copilot Instructions

## General

- Framework: **Next.js 16 App Router** with TypeScript.
- Styling: **Tailwind CSS** + shadcn/ui components from `@/components/ui/`.
- ORM: **Prisma** (client at `@/lib/prisma`).
- Auth: **NextAuth** (`@/lib/auth`). Session user is accessed via `getServerSession` on the server or `useSession` on the client.
- All user-facing strings, toasts, and messages should be in English.

---

## Server Actions

All server actions live under `actions/` and **must** return `ServerActionResponse<TData>` from `@/hooks/use-server-action`:

```ts
import { ServerActionResponse } from "@/hooks/use-server-action";

export const myAction = async (
  input: MyInput,
): Promise<ServerActionResponse<MyData>> => {
  // ...
  return {
    status: "ok", // "ok" | "error" | "require_subscription_upgrade"
    requireRefresh: true, // optional — triggers router.refresh() on the client
    message: { title: "Done", description: "Optional detail" },
    data: result,
  };
};
```

- Use `status: "error"` with a `message` for expected failures.
- Use `status: "require_subscription_upgrade"` to open the upgrade modal instead of showing an error.
- **Never** return `data: null` on a successful action — omit `data` or return a real object. Returning `null` is indistinguishable from an error return on the client.
- For internal helpers that throw (e.g. `sendChangeEmailRequest`), wrap them in a public action that catches and returns `ServerActionResponse`.

---

## `useServerAction` Hook

Use `useServerAction` in every client component that calls a server action. It handles loading state, error toasts, success toasts, `router.refresh()`, and the upgrade modal automatically.

```ts
import useServerAction from "@/hooks/use-server-action";

const { call: updateName, loading } = useServerAction(
  updateOrganizationNameAction,
);

async function handleSave() {
  const data = await updateName({ name });
  // data is null on error/upgrade (hook already showed a toast)
  // data is undefined when action returned no data field — still means success
  if (data !== null) {
    // post-success side-effects only (close modal, reset form, navigate, etc.)
  }
}
```

Key rules:

- **Never** manually call `toast.error` / `toast.success` after a `useServerAction` call — the hook does it.
- **Never** wrap `call(...)` in try/catch — the hook handles it.
- Check `data !== null` (not `!!data`) to detect success when the action returns no data.
- Use the `loading` boolean from the hook for button `disabled` and spinner states.

---

## Modal Pattern

Modals use a **global listener store** so any component can open them without prop drilling.

### 1. The hook (`use-<name>-modal.tsx`)

```ts
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

export function useMyModal() {
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
```

Add extra fields to `State` / `Action` when the modal needs parameters (e.g. a `category` string).

### 2. The dialog component (`<name>-dialog.tsx`)

```tsx
"use client";
export function MyDialog() {
  const { open, closeDialog } = useMyModal();
  // ... form state, useServerAction calls
  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeDialog()}>
      ...
    </Dialog>
  );
}
```

### 3. Mount once

Register the dialog component in the appropriate layout (not in every consumer):

```tsx
// app/(dashboard)/app/layout.tsx  or  components/providers.tsx
<MyDialog />
```

### 4. Open from anywhere

```ts
const { openDialog } = useMyModal();
<Button onClick={openDialog}>Open</Button>
```

### 5. Confirmation Modal (`use-confirmation.ts`)

For destructive or irreversible actions, use the **promise-based confirmation modal** instead of building a one-off dialog. It is implemented in `components/modals/confirmation-modal/use-confirmation.ts` and already mounted globally in the dashboard layout.

```ts
import { requireConfirmation } from "@/components/modals/confirmation-modal/use-confirmation";

const { promise } = requireConfirmation({
  title: "Delete project?",
  subtitle: "This cannot be undone.",
  buttons: { confirm: "Delete", cancel: "Cancel" },
});

const confirmed = await promise; // true = confirmed, false = cancelled, null = dismissed
if (confirmed) {
  await deleteProject();
}
```

- `requireConfirmation` is a plain function — **not** a hook. Call it inside event handlers, not at render time.
- `buttons.isSuccess` makes the confirm button render as a primary/green variant; omit it for destructive (red) actions.
- The modal resolves the promise automatically via `closeCb` when the user clicks confirm or cancel.
- Subscribe to state via `useCofirmationModal()` only inside the dialog renderer — not in consumers.

---

## Cross-Component State via Custom Events

When a client component needs to react to a change triggered elsewhere (e.g. the active-project dropdown refreshing after a project switch from a card), use a typed `CustomEvent` on `window`:

```ts
// hooks/use-change-active-project.ts
export const ACTIVE_PROJECT_CHANGED_EVENT = "activeProjectChanged";
export type ActiveProjectChangedDetail = { activeProjectId: string | null };

window.dispatchEvent(
  new CustomEvent<ActiveProjectChangedDetail>(ACTIVE_PROJECT_CHANGED_EVENT, {
    detail: { activeProjectId: id },
  }),
);
```

```ts
// consumer
useEffect(() => {
  function handle(e: Event) {
    const { activeProjectId } = (e as CustomEvent<ActiveProjectChangedDetail>)
      .detail;
    setLocalActiveProjectId(activeProjectId ?? undefined);
  }
  window.addEventListener(ACTIVE_PROJECT_CHANGED_EVENT, handle);
  return () => window.removeEventListener(ACTIVE_PROJECT_CHANGED_EVENT, handle);
}, []);
```

---

## File Conventions

| Path                                            | Purpose                                                        |
| ----------------------------------------------- | -------------------------------------------------------------- |
| `actions/<domain>/<action>.ts`                  | Server actions — `"use server"`, return `ServerActionResponse` |
| `hooks/use-*.ts`                                | Client hooks                                                   |
| `components/modals/<name>/use-<name>-modal.tsx` | Modal store hook                                               |
| `components/modals/<name>/<name>-dialog.tsx`    | Modal dialog component                                         |
| `components/ui/`                                | shadcn/ui primitives — do not edit                             |
| `lib/`                                          | Shared utilities, auth config, Prisma client                   |
