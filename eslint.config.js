import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
// Bundles the react, react-hooks, and next plugins. Do not extend
// eslint-plugin-react-hooks separately — ESLint rejects redefining a plugin.
import next from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    ".next",
    "out",
    "next-env.d.ts",
    // Skill templates are authoring references, not compiled source. They
    // deliberately import modules that only exist once a pattern is scaffolded.
    ".claude",
    ".agents",
  ]),
  ...next,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
  {
    // The audit script is Node, and is not part of the app build.
    files: ["**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
]);
