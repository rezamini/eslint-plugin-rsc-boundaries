import type { SourceCode } from "eslint";
import type { Directive, Statement, ModuleDeclaration, Program } from "estree";

function getBody(sourceCode: SourceCode): Array<Directive | Statement | ModuleDeclaration> {
  const program = sourceCode.ast as Program;
  return program.body;
}

function isDirectiveLiteral(
  node: Directive | Statement | ModuleDeclaration,
  value: "use client" | "use server",
): boolean {
  if (node.type !== "ExpressionStatement") {
    return false;
  }
  const expression = node.expression;
  if (expression.type !== "Literal" || typeof expression.value !== "string") {
    return false;
  }
  return expression.value === value;
}

/**
 * True if the file has a top-level `"use client"` / `'use client'` directive.
 * Only looks at leading string-literal expression statements (ES module directives).
 */
export function hasUseClientDirective(sourceCode: SourceCode): boolean {
  for (const node of getBody(sourceCode)) {
    if (isDirectiveLiteral(node, "use client")) {
      return true;
    }
    // Directives must be at the start; stop at the first non-directive statement.
    if (node.type !== "ExpressionStatement") {
      break;
    }
    const expression = node.expression;
    if (expression.type !== "Literal" || typeof expression.value !== "string") {
      break;
    }
  }
  return false;
}

/**
 * True if the file has a top-level `"use server"` / `'use server'` directive.
 */
export function hasUseServerDirective(sourceCode: SourceCode): boolean {
  for (const node of getBody(sourceCode)) {
    if (isDirectiveLiteral(node, "use server")) {
      return true;
    }
    if (node.type !== "ExpressionStatement") {
      break;
    }
    const expression = node.expression;
    if (expression.type !== "Literal" || typeof expression.value !== "string") {
      break;
    }
  }
  return false;
}
