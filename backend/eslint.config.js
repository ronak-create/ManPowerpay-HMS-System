import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

// Backend: Node ESM. `eslint-config-prettier` (last) turns off stylistic rules that
// would conflict with Prettier, so ESLint checks correctness and Prettier owns format.
export default [
  { ignores: ["node_modules/**", "prisma/migrations/**", "coverage/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      // Allow intentionally-unused args (e.g. Express error handlers) via leading _.
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": "off",
    },
  },
  prettier,
];
