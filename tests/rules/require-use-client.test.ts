import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import tsParser from "@typescript-eslint/parser";
import { run } from "eslint-vitest-rule-tester";
import rule from "../../src/rules/require-use-client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "../fixtures/require-use-client");

function load(rel: string): string {
  return readFileSync(join(fixtures, rel), "utf8");
}

function withDirective(code: string): string {
  return `"use client";\n${code}`;
}

await run({
  name: "require-use-client",
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
    { code: load("valid/already-use-client.tsx"), filename: "already-use-client.tsx" },
    { code: load("valid/use-server-file.tsx"), filename: "use-server-file.tsx" },
    { code: load("valid/server-component-no-client-apis.tsx"), filename: "server-component-no-client-apis.tsx" },
    { code: load("valid/non-client-hook-name.tsx"), filename: "non-client-hook-name.tsx" },
    { code: load("valid/param-named-document.tsx"), filename: "param-named-document.tsx" },
    { code: load("valid/const-named-window.tsx"), filename: "const-named-window.tsx" },
    { code: load("valid/destructure-named-navigator.tsx"), filename: "destructure-named-navigator.tsx" },
    { code: load("valid/typeof-document-type.tsx"), filename: "typeof-document-type.tsx" },
    { code: load("valid/import-type-usestate.tsx"), filename: "import-type-usestate.tsx" },
    { code: load("valid/inline-type-import-hook.tsx"), filename: "inline-type-import-hook.tsx" },
  ],
  invalid: [
    {
      code: load("invalid/uses-usestate.tsx"),
      filename: "uses-usestate.tsx",
      errors: [{ messageId: "missingDirective" }],
      output: withDirective(load("invalid/uses-usestate.tsx")),
    },
    {
      code: load("invalid/uses-window.tsx"),
      filename: "uses-window.tsx",
      errors: [{ messageId: "missingDirective" }],
      output: withDirective(load("invalid/uses-window.tsx")),
    },
    {
      code: load("invalid/uses-document.tsx"),
      filename: "uses-document.tsx",
      errors: [{ messageId: "missingDirective" }],
      output: withDirective(load("invalid/uses-document.tsx")),
    },
    {
      code: load("invalid/uses-react-usestate.tsx"),
      filename: "uses-react-usestate.tsx",
      errors: [{ messageId: "missingDirective" }],
      output: withDirective(load("invalid/uses-react-usestate.tsx")),
    },
    {
      code: load("invalid/uses-onclick.tsx"),
      filename: "uses-onclick.tsx",
      errors: [{ messageId: "missingDirective" }],
      output: withDirective(load("invalid/uses-onclick.tsx")),
    },
    {
      code: load("invalid/uses-localstorage.tsx"),
      filename: "uses-localstorage.tsx",
      errors: [{ messageId: "missingDirective" }],
      output: withDirective(load("invalid/uses-localstorage.tsx")),
    },
  ],
});
