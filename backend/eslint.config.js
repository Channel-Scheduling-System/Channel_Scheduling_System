import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'prisma/generated/**',
            '*.config.*',
        ],
    },
    js.configs.recommended, // Base JS
    ...tseslint.configs.recommended, // Base TS
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
            },
            globals: {
                ...globals.node,
            },
        },
        rules: {
            //TypeScript
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@typescript-eslint/no-shadow': ['warn'],
            '@typescript-eslint/no-empty-function': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-misused-promises': [
                'error',
                { checksVoidReturn: false },
            ],
            '@typescript-eslint/await-thenable': 'error',

            // Generales
            'no-console': 'warn',
            'no-unused-vars': 'off',
        },
    },
    {
        files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            'no-console': 'off',
        },
    },
    prettier,
];
