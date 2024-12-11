// This module is used as a transformer to mock or override certain modules during testing.
// It is typically used for mocking static file imports or non-JavaScript assets, such as CSS or images.

module.exports = {
  // The `process` function is invoked by Jest when the file is imported or required.
  process() {
    return { code: 'module.exports = {};' }; // This effectively mocks the imported file/module as an empty object.
  },

  // `getCacheKey` returns a cache key that helps Jest in caching and invalidating transformed files.
  getCacheKey() {
    return ''; // By returning an empty string, it ensures that Jest always processes this transformation during tests.
  }
};
