import globals from "globals";
import { defineConfig } from "eslint/config";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default defineConfig([
  {
    ignores: ["dist", "build", "node_modules"],
  },
  {
    // Frontend files
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
    },
    ...pluginReact.configs.flat.recommended,
    ...pluginReact.configs.flat['jsx-runtime'],
    rules: {
      ...pluginJs.configs.recommended.rules,

      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-vars": "error",

      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
        },
      ],

      "no-undef": "error",

      "no-console": ["warn", { allow: ["warn", "error", "info", "log"] }],
    },
    settings: {
      react: {
        version: "detect",
        runtime: "automatic",
        jsxRuntime: "automatic",
      },
    },
  },
  {
    // Backend files
    files: ["src/backend/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
]);
