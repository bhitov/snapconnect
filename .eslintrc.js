module.exports = {
  extends: [
    'expo',
    '@react-native-community',
    'plugin:@typescript-eslint/recommended-type-checked',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'react-hooks',
    'prettier',
    'unused-imports',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
    jest: true,
  },
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['off', { argsIgnorePattern: '^_' }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'off',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    // '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/no-shadow': 'off',

    // React specific rules
    'react/prop-types': 'off', // TypeScript handles this
    'react/display-name': 'error',
    'react/jsx-uses-react': 'off', // React 17+ JSX transform
    'react/react-in-jsx-scope': 'off', // React 17+ JSX transform
    'react/no-unstable-nested-components': 'off', // good rule but not sure how to fix it

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // React Native specific rules
    'react-native/no-unused-styles': 'off',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off', // Allow text in components

    // General rules
    'no-console': 'off',
    'no-debugger': 'error',
    'no-alert': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'no-duplicate-imports': 'off',
    'no-void': 'off',
    'no-catch-shadow': 'off',

    // Import/Export rules
    'import/no-default-export': 'off',
    'import/prefer-default-export': 'off',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      //       alias: {
      //         map: [
      //           ['@', './src'],
      //           ['@/features', './src/features'],
      //           ['@/shared', './src/shared'],
      //           ['@/components', './src/shared/components'],
      //           ['@/hooks', './src/shared/hooks'],
      //           ['@/services', './src/shared/services'],
      //           ['@/types', './src/shared/types'],
      //           ['@/utils', './src/shared/utils'],
      //           ['@/theme', './src/shared/theme'],
      //           ['@/assets', './assets'],
      //         ],
      //         extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      //       },
    },
  },
  ignorePatterns: [
    '.eslintrc.js',
    'functions/lib/',
    'functions/',
    'node_modules/',
    '.expo/',
    'dist/',
    'web-build/',
    'datagen/',
    'e2e/',
    '*.config.js',
    '*.config.ts',
    'tmp/',
  ],
};
