import {
  ESLintUtils,
  TSESTree,
  AST_NODE_TYPES
} from "@typescript-eslint/utils";
import * as ts from "typescript";

type Options = [
  {
    allowExpressions?: boolean;
    allowTypedFunctionExpressions?: boolean;
    allowHigherOrderFunctions?: boolean;
    allowDirectConstAssertionInArrowFunctions?: boolean;
  }
];

type MessageIds = "missingReturnType";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

function isTypedFunctionExpression(
  node: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression
): boolean {
  const parent = node.parent;
  if (!parent) return false;

  switch (parent.type) {
    case AST_NODE_TYPES.VariableDeclarator:
      return !!parent.id.typeAnnotation;
    case AST_NODE_TYPES.CallExpression:
    case AST_NODE_TYPES.NewExpression:
    case AST_NODE_TYPES.AssignmentExpression:
    case AST_NODE_TYPES.Property:
    case AST_NODE_TYPES.ArrayExpression:
    case AST_NODE_TYPES.ReturnStatement:
    case AST_NODE_TYPES.ArrowFunctionExpression:
      return true;
    default:
      return false;
  }
}

export default createRule<Options, MessageIds>({
  name: "explicit-function-return-type-except-cleanups",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require explicit return types on functions, except for useEffect cleanup and styled-components.",
      recommended: "error"
    },
    messages: {
      missingReturnType: "Missing explicit return type on function."
    },
    schema: [
      {
        type: "object",
        properties: {
          allowExpressions: {
            type: "boolean"
          },
          allowTypedFunctionExpressions: {
            type: "boolean"
          },
          allowHigherOrderFunctions: {
            type: "boolean"
          },
          allowDirectConstAssertionInArrowFunctions: {
            type: "boolean"
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [{}],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const options = context.options[0] ?? {};

    function isUseEffectCleanup(
      node: TSESTree.ArrowFunctionExpression
    ): boolean {
      const ancestors = context.getAncestors();
      const callExpr = [...ancestors]
        .reverse()
        .find((a) => a.type === AST_NODE_TYPES.CallExpression) as
        | TSESTree.CallExpression
        | undefined;

      return (
        callExpr &&
        callExpr.callee.type === AST_NODE_TYPES.Identifier &&
        callExpr.callee.name === "useEffect"
      );
    }

    function isStyledComponentContext(
      node: TSESTree.ArrowFunctionExpression
    ): boolean {
      const ancestors = context.getAncestors();
      return ancestors.some(
        (a) =>
          a.type === AST_NODE_TYPES.TaggedTemplateExpression &&
          a.tag.type === AST_NODE_TYPES.MemberExpression &&
          a.tag.object.type === AST_NODE_TYPES.Identifier &&
          a.tag.object.name === "styled"
      );
    }

    function checkFunction(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression
        | TSESTree.ArrowFunctionExpression
    ): void {
      if (node.returnType) return;

      // allowTypedFunctionExpressions 옵션이 true이고, 추론 가능한 위치일 경우 패스
      if (
        options.allowTypedFunctionExpressions &&
        (node.type === AST_NODE_TYPES.FunctionExpression ||
          node.type === AST_NODE_TYPES.ArrowFunctionExpression) &&
        isTypedFunctionExpression(node)
      ) {
        return;
      }

      // useEffect cleanup 함수 또는 styled-components 내부 함수는 제외
      if (
        node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        (isUseEffectCleanup(node) || isStyledComponentContext(node))
      ) {
        return;
      }

      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const signature = checker.getSignatureFromDeclaration(
        tsNode as ts.SignatureDeclaration
      );

      if (!signature) return;

      const returnType = checker.getReturnTypeOfSignature(signature);

      // 반환 타입이 any인 경우만 경고 발생
      if (returnType.flags & ts.TypeFlags.Any) {
        context.report({
          node,
          messageId: "missingReturnType"
        });
      }
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction
    };
  }
});
