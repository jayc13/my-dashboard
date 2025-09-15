/**
 * Shared ESLint configuration for all projects in the monorepo
 * This ensures consistent formatting across client, server, cron, and scripts
 */

const sharedRules = {
  // General formatting rules - 2 spaces, always semicolons
  'prefer-const': 'error',
  'no-var': 'error',
  'eqeqeq': ['error', 'always'],
  'curly': ['error', 'all'],
  'brace-style': ['error', '1tbs'],
  'indent': ['error', 2],
  'quotes': ['error', 'single'],
  'semi': ['error', 'always'],
  'comma-dangle': ['error', 'always-multiline'],
  'object-curly-spacing': ['error', 'always'],
  'array-bracket-spacing': ['error', 'never'],
};

const sharedTypeScriptRules = {
  // TypeScript specific rules
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-inferrable-types': 'off',
};

const sharedTestRules = {
  // Relaxed rules for test files
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
};

module.exports = {
  sharedRules,
  sharedTypeScriptRules,
  sharedTestRules,
};
