module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  rules: {
    "prettier/prettier": "error",
    // "no-this-alias": false,
    "@typescript-eslint/no-this-alias": "off",
    '@typescript-eslint/member-delimiter-style': ['off', { // Prevents us from using any delimiter for interface properties.
      'multiline': {
        'delimiter': 'comma',
        'requireLast': false
      },
      'singleline': {
        'delimiter': 'comma',
        'requireLast': false
      }
    }],
  },
  root: true
};