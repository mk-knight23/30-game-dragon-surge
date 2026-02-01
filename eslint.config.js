export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.github/**'],
  },
  {
    files: ['**/*.ts', '**/*.vue', '**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
    },
  },
]
