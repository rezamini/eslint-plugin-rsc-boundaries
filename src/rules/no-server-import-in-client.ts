import type { Rule } from "eslint";
import type { Literal } from "estree";
import { hasUseClientDirective } from "../util/directives.js";

/** Basename is `*.server` or `*.server.{js,jsx,ts,tsx,mjs,cjs}` */
const SERVER_MODULE_BASENAME =
  /^.+\.server(?:\.(?:js|jsx|ts|tsx|mjs|cjs))?$/;

function basenameOfSpecifier(specifier: string): string {
  const pathPart = specifier.split(/[?#]/, 1)[0] ?? specifier;
  const segments = pathPart.split("/");
  return segments[segments.length - 1] ?? pathPart;
}

function isServerOnlySpecifier(name: string): boolean {
  if (name === "server-only") {
    return true;
  }
  return SERVER_MODULE_BASENAME.test(basenameOfSpecifier(name));
}

function reportIfServerSource(
  context: Rule.RuleContext,
  source: Literal | null | undefined,
): void {
  if (!source || typeof source.value !== "string") {
    return;
  }
  const name = source.value;
  if (isServerOnlySpecifier(name)) {
    context.report({
      node: source,
      messageId: "serverImport",
      data: { name },
    });
  }
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow importing server-only modules from Client Components.",
    },
    schema: [],
    messages: {
      serverImport:
        "Do not import server-only module '{{name}}' from a Client Component.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    if (!hasUseClientDirective(sourceCode)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        reportIfServerSource(context, node.source);
      },
      ExportNamedDeclaration(node) {
        reportIfServerSource(context, node.source ?? undefined);
      },
      ExportAllDeclaration(node) {
        reportIfServerSource(context, node.source);
      },
    };
  },
};

export default rule;
