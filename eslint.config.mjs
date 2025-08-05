import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

const reactSettings = { react: { version: "detect" } };

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ...pluginJs.configs.recommended,
  },
  {
    files: ["src/backend/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  {
    files: ["src/frontend/**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["src/frontend/**/*.test.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ...pluginReact.configs.flat.recommended,
    ...pluginReact.configs.flat["jsx-runtime"],
    settings: reactSettings,
    rules: {
      "react/react-in-jsx-scope": "off",
      // add other overrides if needed
    },
  },
];
