import type { Rule, Scope } from "eslint";
import type { Node } from "estree";
import {
  hasUseClientDirective,
  hasUseServerDirective,
} from "../util/directives.js";

const BROWSER_GLOBALS = new Set([
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "navigator",
]);

const CLIENT_HOOKS = new Set([
  "useState",
  "useEffect",
  "useLayoutEffect",
  "useReducer",
  "useRef",
  "useCallback",
  "useMemo",
]);

const ON_EVENT_ATTR = /^on[A-Z]/;

/** Loose AST node - estree types omit TS/JSX parents that the parser emits. */
interface AstNode {
  type: string;
  parent?: AstNode;
  name?: string;
  id?: AstNode | null;
  key?: AstNode;
  value?: AstNode | unknown;
  object?: AstNode;
  property?: AstNode;
  computed?: boolean;
  shorthand?: boolean;
  params?: AstNode[];
  elements?: Array<AstNode | null>;
  argument?: AstNode;
  left?: AstNode;
  param?: AstNode | null;
  expression?: AstNode;
  typeAnnotation?: AstNode;
  source?: { value?: unknown };
  importKind?: string;
  imported?: AstNode;
}

function asAst(node: Node | AstNode): AstNode {
  return node as AstNode;
}

/** True when the identifier is a binding/declaration name, not a value reference. */
function isBindingIdentifier(node: AstNode): boolean {
  const parent = node.parent;
  if (!parent) {
    return false;
  }

  switch (parent.type) {
    case "VariableDeclarator":
      return parent.id === node;
    case "FunctionDeclaration":
    case "FunctionExpression":
    case "ArrowFunctionExpression":
      if (parent.id === node) {
        return true;
      }
      return Array.isArray(parent.params) && parent.params.includes(node);
    case "CatchClause":
      return parent.param === node;
    case "Property": {
      const gp = parent.parent;
      if (gp?.type !== "ObjectPattern") {
        return false;
      }
      return (
        parent.value === node ||
        (Boolean(parent.shorthand) && parent.key === node)
      );
    }
    case "ArrayPattern":
      return Array.isArray(parent.elements) && parent.elements.includes(node);
    case "RestElement":
      return parent.argument === node;
    case "AssignmentPattern":
      return parent.left === node;
    case "ClassDeclaration":
    case "ClassExpression":
      return parent.id === node;
    default:
      return false;
  }
}

/**
 * True when this identifier resolves to a local/param binding (shadowing the
 * browser global), or is itself that binding's declaration name.
 */
function isLocalName(context: Rule.RuleContext, node: AstNode): boolean {
  if (isBindingIdentifier(node)) {
    return true;
  }
  if (typeof node.name !== "string") {
    return false;
  }

  const sourceCode = context.sourceCode ?? context.getSourceCode();
  let scope: Scope.Scope | null = sourceCode.getScope(node as Node);
  while (scope) {
    const variable = scope.set.get(node.name);
    if (variable) {
      // Any local def (param, var, import, catch, …) shadows the browser global.
      return variable.defs.length > 0;
    }
    scope = scope.upper;
  }
  return false;
}

const TS_TYPE_NODE_TYPES = new Set([
  "TSTypeQuery",
  "TSTypeAnnotation",
  "TSTypeReference",
  "TSTypeAliasDeclaration",
  "TSInterfaceDeclaration",
  "TSMappedType",
  "TSConditionalType",
  "TSUnionType",
  "TSIntersectionType",
  "TSIndexedAccessType",
  "TSImportType",
  "TSArrayType",
  "TSTupleType",
  "TSTypeLiteral",
  "TSTypeOperator",
  "TSTypeParameter",
  "TSTypeParameterDeclaration",
  "TSTypeParameterInstantiation",
  "TSQualifiedName",
  "TSExpressionWithTypeArguments",
  "TSLiteralType",
  "TSNamedTupleMember",
  "TSRestType",
  "TSOptionalType",
  "TSTemplateLiteralType",
]);

/** True when the identifier sits under a TypeScript type AST node. */
function isInTypePosition(node: AstNode): boolean {
  let current: AstNode | undefined = node.parent;
  while (current) {
    if (TS_TYPE_NODE_TYPES.has(current.type)) {
      return true;
    }
    if (
      current.type === "TSAsExpression" ||
      current.type === "TSTypeAssertion" ||
      current.type === "TSSatisfiesExpression"
    ) {
      if (current.typeAnnotation && isAncestorOf(current.typeAnnotation, node)) {
        return true;
      }
      current = current.parent;
      continue;
    }
    current = current.parent;
  }
  return false;
}

function isAncestorOf(ancestor: AstNode, node: AstNode): boolean {
  let current: AstNode | undefined = node;
  while (current) {
    if (current === ancestor) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        'Require a "use client" directive when the file uses client-only APIs.',
    },
    schema: [],
    fixable: "code",
    messages: {
      missingDirective:
        'This file uses client-only APIs and must start with "use client".',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (filename.includes("node_modules")) {
      return {};
    }

    const sourceCode = context.sourceCode ?? context.getSourceCode();

    if (hasUseClientDirective(sourceCode) || hasUseServerDirective(sourceCode)) {
      return {};
    }

    let reported = false;

    function reportMissing(node: Node): void {
      if (reported) {
        return;
      }
      reported = true;
      context.report({
        node,
        messageId: "missingDirective",
        fix(fixer) {
          return fixer.insertTextBeforeRange([0, 0], '"use client";\n');
        },
      });
    }

    return {
      Identifier(node) {
        if (!BROWSER_GLOBALS.has(node.name)) {
          return;
        }
        const ast = asAst(node);
        const parent = ast.parent;
        if (!parent) {
          reportMissing(node);
          return;
        }
        if (isLocalName(context, ast)) {
          return;
        }
        if (isInTypePosition(ast)) {
          return;
        }
        if (
          parent.type === "MemberExpression" &&
          parent.property === ast &&
          !parent.computed
        ) {
          return;
        }
        if (
          parent.type === "Property" &&
          parent.key === ast &&
          !parent.computed &&
          parent.parent?.type !== "ObjectPattern"
        ) {
          return;
        }
        if (
          parent.type === "ImportSpecifier" ||
          parent.type === "ImportDefaultSpecifier" ||
          parent.type === "ImportNamespaceSpecifier" ||
          parent.type === "ExportSpecifier"
        ) {
          return;
        }
        reportMissing(node);
      },

      ImportSpecifier(node) {
        const ast = asAst(node);
        if (ast.importKind === "type") {
          return;
        }
        if (
          node.imported.type === "Identifier" &&
          CLIENT_HOOKS.has(node.imported.name)
        ) {
          const parent = ast.parent;
          if (parent?.importKind === "type") {
            return;
          }
          if (
            parent?.type === "ImportDeclaration" &&
            parent.source?.value === "react"
          ) {
            reportMissing(node);
          }
        }
      },

      MemberExpression(node) {
        if (node.computed) {
          return;
        }
        if (
          node.object.type === "Identifier" &&
          node.object.name === "React" &&
          node.property.type === "Identifier" &&
          CLIENT_HOOKS.has(node.property.name)
        ) {
          reportMissing(node);
        }
      },

      JSXAttribute(node: Node) {
        const ast = asAst(node);
        const attrName = ast.name as unknown;
        const nameNode = attrName as AstNode | undefined;
        if (
          nameNode?.type === "JSXIdentifier" &&
          typeof nameNode.name === "string" &&
          ON_EVENT_ATTR.test(nameNode.name)
        ) {
          reportMissing(node);
        }
      },
    };
  },
};

export default rule;
