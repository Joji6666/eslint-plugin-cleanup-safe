import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs"],
  dts: true,
  clean: true,
  external: ["@typescript-eslint/eslint-plugin"] // 중요!
});
