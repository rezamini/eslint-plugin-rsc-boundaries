# rsc-boundaries/no-server-import-in-client

Disallow importing (or re-exporting) server-only modules from Client Components (`"use client"` files).

## Problem

Client Components run in the browser. Importing a module that is server-only (Next `*.server` convention, or the `server-only` package) pulls server code into the client boundary and usually fails at build or runtime. The same applies to `export … from` re-exports.

## Wrong

```tsx
"use client";

import { getUser } from "./db.server";
import { x } from "./db.server.ts";
import "server-only";

export { getUser } from "./db.server";
export * from "./data.server.ts";
```

## Right

Keep server data access on the server. Pass results into the client component as props, or call a Server Action / route handler instead of importing the server module:

```tsx
"use client";

export function Profile({ name }: { name: string }) {
  return <div>{name}</div>;
}
```

```tsx
// Server Component (no "use client")
import { getUser } from "./db.server";
import { Profile } from "./profile";

export default async function Page() {
  const user = await getUser();
  return <Profile name={user.name} />;
}
```

## When not to use / when this rule stays quiet

- Files **without** `"use client"` — Server Components may import or re-export `*.server` modules and `server-only`.
- Specifiers whose basename is not `*.server` / `*.server.{js,jsx,ts,tsx,mjs,cjs}` and is not exactly `server-only` (e.g. `./db.serverish`). Deep graph resolution is out of scope.

No autofix: moving the import is a design change, not a text rewrite.
