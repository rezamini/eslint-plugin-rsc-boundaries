import type { ESLint, Linter } from "eslint";
import noServerImportInClient from "./rules/no-server-import-in-client.js";
import requireUseClient from "./rules/require-use-client.js";
import { createRecommendedConfig } from "./configs/recommended.js";

const plugin: ESLint.Plugin = {
  meta: {
    name: "eslint-plugin-rsc-boundaries",
    version: "0.1.0",
  },
  rules: {
    "no-server-import-in-client": noServerImportInClient,
    "require-use-client": requireUseClient,
  },
  configs: {},
};

const recommendedFlat: Linter.Config[] = createRecommendedConfig(plugin);

plugin.configs = {
  recommended: recommendedFlat,
};

export default plugin;
