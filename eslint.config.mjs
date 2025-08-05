import { defineConfig } from "eslint/config";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

// Only bring in globals for the frontend block!
export default defineConfig([
  {
    ignores: ["dist", "build", "node_modules"],
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}", "!src/backend/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { react: pluginReact },
    rules: {
      "react/react-in-jsx-scope": "off",
      // Add your other rules here...
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
    // Backend gets node and browser for flexibility, or just node if desired
    files: ["src/backend/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
]);
