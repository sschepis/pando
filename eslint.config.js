const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = [
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': typescript,
        },
        rules: {
            ...typescript.configs['recommended'].rules,
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'warn',
            '@typescript-eslint/no-require-imports': 'warn',
            '@typescript-eslint/no-namespace': 'warn',
        },
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
        },
    },
];
