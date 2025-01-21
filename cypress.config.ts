import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    chromeWebSecurity: false,
    defaultCommandTimeout: 15000,
    screenshotOnRunFailure: false,
    video: false,
    viewportHeight: 1080,
    viewportWidth: 1920,
    specPattern: (() => {
      switch (process.env.TEST_TYPE) {
        case 'e2e':
          return 'cypress/e2e/**/*.cy.{ts,tsx}';
        case 'local':
          return 'cypress/local/**/*.cy.{ts,tsx}';
        default:
          return ['cypress/local/**/*.cy.{ts,tsx}', 'cypress/e2e/**/*.cy.{ts,tsx}'];
      }
    })()
  }
});
