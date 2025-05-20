
import { TSESLint } from "@typescript-eslint/utils";
import rule from "../src/rules/explicit-function-return-type-except-cleanups";

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve("@typescript-eslint/parser")
});

ruleTester.run("explicit-function-return-type-except-cleanups", rule, {
  valid: [
    {
      code: `useEffect(() => { return () => { cleanup(); }; }, []);`
    },
    {
      code: `const valid = (): number => { return 1; }`
    }
  ],
  invalid: [
    {
      code: `const test = () => { return 1; }`,
      errors: [{ messageId: "missing" }]
    }
  ]
});
