module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  rules: {
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
    "max-len": ["error", { code: 120 }],
    "indent": ["error", 2],
    "comma-dangle": ["error", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "never",
      "exports": "never",
      "functions": "only-multiline"
  }]
  },
  root: true
};