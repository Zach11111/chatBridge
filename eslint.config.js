// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
// eslint-disable-next-line import/no-unresolved
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      js,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      // General Style
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "quotes": ["error", "double", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "no-multiple-empty-lines": ["error", { "max": 1 }],
      "eol-last": ["error", "always"],

      // Variables
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "error",

      // Console usage
      "no-console": "off",

      // Import plugin
      "import/no-unresolved": "error",
      "import/order": ["error", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
      }],
      "import/newline-after-import": "error",
    },
  },
]);
