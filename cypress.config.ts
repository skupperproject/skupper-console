import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    chromeWebSecurity: false,
    defaultCommandTimeout: 8000,
    screenshotOnRunFailure: false,
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    video: false,
    viewportHeight: 1080,
    viewportWidth: 1920
  }
});
