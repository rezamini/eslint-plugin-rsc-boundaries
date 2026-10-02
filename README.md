# eslint-plugin-rsc-boundaries

ESLint plugin for **React Server Components** and the **Next.js App Router**.

It catches common client/server boundary mistakes:

1. Importing server-only modules into a `"use client"` file
2. Using client-only APIs (hooks, `window`, event handlers) without `"use client"`

**Who it’s for:** teams on Next.js App Router / RSC who want lint errors before a broken build.

## Install

```bash
pnpm add -D eslint-plugin-rsc-boundaries
# or: npm i -D eslint-plugin-rsc-boundaries
```

Requires **ESLint 9** (flat config) and **Node 18+**.

## Setup (`eslint.config.js`)

```js
import rscBoundaries from "eslint-plugin-rsc-boundaries";

export default [
  ...rscBoundaries.configs.recommended,
];
```

Or enable rules yourself:

```js
import rscBoundaries from "eslint-plugin-rsc-boundaries";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "rsc-boundaries": rscBoundaries,
    },
    rules: {
      "rsc-boundaries/no-server-import-in-client": "error",
      "rsc-boundaries/require-use-client": "error",
    },
  },
];
```

## Rules

| Rule | What it does |
| --- | --- |
| [no-server-import-in-client](docs/rules/no-server-import-in-client.md) | In `"use client"` files, ban imports of `*.server.*` modules and the `server-only` package |
| [require-use-client](docs/rules/require-use-client.md) | Require `"use client"` when the file uses browser APIs, React client hooks, or JSX `on*` handlers (autofix available) |

## Why these rules

In the App Router, files are Server Components by default. Forgetting `"use client"` or pulling a server module into the client bundle is a frequent source of cryptic errors. This plugin flags those patterns from the AST—no Next.js build required.

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm lint
```

## License

MIT
