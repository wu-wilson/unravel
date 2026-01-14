import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";

export default {
  ignorePatterns: ["dist"],
  files: ["**/*.{ts,tsx}"],
  env: {
    node: true,
    es2021: true,
  },
  plugins: {
    react,
    "react-hooks": reactHooks,
  },
  extends: ["plugin:react/recommended"],
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react/prop-types": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
