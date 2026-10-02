# rsc-boundaries/require-use-client

Require a `"use client"` directive when a file uses client-only APIs.

## Problem

In the App Router / RSC model, modules are Server Components by default. Using React client hooks, browser globals, or JSX event handlers without `"use client"` breaks the client boundary and produces build or runtime errors.

## Wrong

```tsx
import { useState } from "react";

export function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

```tsx
export function Width() {
  return <span>{window.innerWidth}</span>;
}
```

## Right

```tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

Autofix inserts `"use client";` at the top of the file when the rule fires.

## What counts as client-only (v1)

- Browser globals: `window`, `document`, `localStorage`, `sessionStorage`, `navigator`
- React hooks (from `react` or `React.*`): `useState`, `useEffect`, `useLayoutEffect`, `useReducer`, `useRef`, `useCallback`, `useMemo`
- JSX event handler props: any `on[A-Z]*` attribute (e.g. `onClick`, `onChange`)

## When not to use / skips

- File already has `"use client"` or `"use server"`
- Paths under `node_modules`
- Server Components that only render props/JSX with no client APIs
- Parameters / locals named like browser globals (e.g. `function f(document: Doc)`)
- TypeScript type positions and `import type` / `import { type … }` (e.g. `type T = typeof document`)
