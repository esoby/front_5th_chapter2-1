import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js}'],
    languageOptions: { ...globals.browser },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: ['prettier'],
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'prettier/prettier': 'error',
    },
  },
]);
