import { defineConfig } from 'cypress';

const remoteUrl = process.env.CYPRESS_BASE_URL;

export default defineConfig({
  e2e: {
    baseUrl: remoteUrl || 'http://localhost:3000',
    specPattern: remoteUrl ? 'cypress/e2e/**/*.cy.{ts,tsx}' : 'cypress/local/**/*.cy.{ts,tsx}'
  },

  defaultCommandTimeout: 15000,
  screenshotOnRunFailure: false,
  video: false,

  viewportHeight: 1080,
  viewportWidth: 1920
});
