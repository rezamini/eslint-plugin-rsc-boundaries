# Contributing

## Local setup

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm lint
```

Use Node 18+.

## Project layout

- `src/rules/` — ESLint rule implementations
- `src/util/` — shared helpers (e.g. `"use client"` / `"use server"` detection)
- `src/configs/` — flat recommended config
- `tests/fixtures/<rule>/{valid,invalid}/` — example source files
- `tests/rules/*.test.ts` — Vitest + `eslint-vitest-rule-tester`
- `docs/rules/` — user-facing rule docs

## Adding or changing a rule

1. Update the rule in `src/rules/`.
2. Add or adjust fixtures under `tests/fixtures/`.
3. Assert in the matching `tests/rules/*.test.ts` (message ids; autofix `output` when applicable).
4. Keep `docs/rules/<rule>.md` in sync (problem → wrong → right → when not to use).
5. Run `pnpm typecheck && pnpm test && pnpm lint`.

## Scope

v1 stays small: two boundary rules, no Next runtime peer, no deep import-graph resolution. See `DESIGN.md` for what is explicitly out of scope.

## Pull requests

- Keep changes focused.
- Prefer fixtures over long prose in tests.
- Do not publish or push from contributor machines unless maintainers ask.
