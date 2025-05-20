import { ESLintUtils } from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/your-org/eslint-plugin-cleanup-safe/docs/rules/\${name}.md`
);

//
