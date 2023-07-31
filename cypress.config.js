import { defineConfig } from 'cypress';

const webpack = require('@cypress/webpack-preprocessor');

const options = {
  webpackOptions: require('./webpack.dev.js'),
  watchOptions: {}
};

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: false,
    screenshotOnRunFailure: false,
    setupNodeEvents(on) {
      on('file:preprocessor', webpack(options));
    }
  }
});
