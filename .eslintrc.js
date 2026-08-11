module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'next/core-web-vitals',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    // Disable rules that are causing false positives in this codebase
    'no-use-before-define': 'off',
    'react/no-unescaped-entities': 'off',
  },
};