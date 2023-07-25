/* eslint-env node */

/**
 * @type {import("eslint").ESLint.ConfigData}
 */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./packages/*/tsconfig.json", "./packages/wsdot-elc/spec/tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  root: true,
};
