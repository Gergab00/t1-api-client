/* eslint-env node */
module.exports = {
  root: true,
  env: { node: true, jest: true, es2021: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  settings: {},
  rules: {
    // Estilo general
    'prettier/prettier': ['error'],

    // Preferencias para CommonJS
    'no-undef': 'off',
  },
  ignorePatterns: ['node_modules/', 'coverage/', 'dist/', '*.config.*', '*.config.cjs'],
};
