module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
	ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
	'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
	'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
	"browser": true,
	"es2021": true
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
	'@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
	'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
	'curly': ['error', 'all'],
  },
};
