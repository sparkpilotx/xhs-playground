import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  {
    name: "eslint/ignores",
    ignores: [
      "**/node_modules/**",
      "**/out/**",
      "**/release/**",
      "**/dist/**",
      "**/build/**",
      "**/references/**",
      "eslint.config.*",
      "prettier.config.*",
    ],
  },
  // Base recommended rules
  tseslint.configs.recommended,
  // Type-checked recommended rules (scoped to TS by the preset)
  tseslint.configs.recommendedTypeChecked,
  // Provide type information for TS files so typed rules have project context
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.web.json", "./tsconfig.json"],
        tsconfigRootDir,
      },
    },
  },
  // Project-specific TS rules
  {
    files: ["src/**/*.{ts,tsx}", "electron.vite.config.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  // Ensure non-TS files do not use TS-typed rules
  {
    files: ["**/*.{js,cjs,mjs,jsx}"],
    rules: {
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
  // Prettier compatibility
  eslintConfigPrettier,
);
