import config from '@faktion-com/eslint-config/base';

export default [
  ...config,
  {
    ignores: ['node_modules/*', 'dist/*', 'build/*'],
  },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./test/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
