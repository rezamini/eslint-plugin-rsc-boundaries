import type { ESLint, Linter } from "eslint";

/**
 * Build the recommended flat config. Takes the plugin instance so
 * `plugins["rsc-boundaries"]` points at the same object exported from index.
 */
export function createRecommendedConfig(plugin: ESLint.Plugin): Linter.Config[] {
  return [
    {
      name: "rsc-boundaries/recommended",
      plugins: { "rsc-boundaries": plugin },
      rules: {
        "rsc-boundaries/no-server-import-in-client": "error",
        "rsc-boundaries/require-use-client": "error",
      },
    },
  ];
}

export default createRecommendedConfig;
