import playwright from 'eslint-plugin-playwright';
import baseConfig from '../../eslint.config.mjs';

export default [
  playwright.configs['flat/recommended'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {},
  },
  {
    files: ['src/steps/**/*.ts', 'src/support/**/*.ts'],
    rules: {
      'playwright/no-standalone-expect': 'off',
    },
  },
];
