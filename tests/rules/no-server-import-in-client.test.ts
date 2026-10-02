import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import tsParser from "@typescript-eslint/parser";
import { run } from "eslint-vitest-rule-tester";
import rule from "../../src/rules/no-server-import-in-client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "../fixtures/no-server-import-in-client");

function load(rel: string): string {
  return readFileSync(join(fixtures, rel), "utf8");
}

await run({
  name: "no-server-import-in-client",
  rule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
  },
  valid: [
    { code: load("valid/client-imports-utils.tsx"), filename: "client-imports-utils.tsx" },
    { code: load("valid/server-file-imports-server.tsx"), filename: "server-file-imports-server.tsx" },
    { code: load("valid/no-directive-plain-import.tsx"), filename: "no-directive-plain-import.tsx" },
    { code: load("valid/client-imports-non-server.tsx"), filename: "client-imports-non-server.tsx" },
    { code: load("valid/server-reexport-ok.tsx"), filename: "server-reexport-ok.tsx" },
  ],
  invalid: [
    {
      code: load("invalid/client-imports-server-ts.tsx"),
      filename: "client-imports-server-ts.tsx",
      errors: [{ messageId: "serverImport" }],
    },
    {
      code: load("invalid/client-imports-server-tsx.tsx"),
      filename: "client-imports-server-tsx.tsx",
      errors: [{ messageId: "serverImport" }],
    },
    {
      code: load("invalid/client-imports-server-only.tsx"),
      filename: "client-imports-server-only.tsx",
      errors: [{ messageId: "serverImport" }],
    },
    {
      code: load("invalid/client-imports-server-js.tsx"),
      filename: "client-imports-server-js.tsx",
      errors: [{ messageId: "serverImport" }],
    },
    {
      code: load("invalid/client-imports-server-extensionless.tsx"),
      filename: "client-imports-server-extensionless.tsx",
      errors: [{ messageId: "serverImport" }],
    },
    {
      code: load("invalid/client-reexport-named-server.tsx"),
      filename: "client-reexport-named-server.tsx",
      errors: [{ messageId: "serverImport" }],
    },
    {
      code: load("invalid/client-reexport-all-server.tsx"),
      filename: "client-reexport-all-server.tsx",
      errors: [{ messageId: "serverImport" }],
    },
  ],
});
