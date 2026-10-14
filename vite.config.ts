import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const isEmbedMode = process.env.SKUPPER_CONSOLE_EMBED === 'true';

  return {
    plugins: [react()],

    define: {
      'process.env.OBSERVER_URL': JSON.stringify(process.env.OBSERVER_URL || ''),
      'process.env.BRAND_APP_LOGO': JSON.stringify(process.env.BRAND_APP_LOGO || ''),
      'process.env.API_VERSION': JSON.stringify(process.env.API_VERSION || ''),
      'process.env.SKUPPER_CONSOLE_EMBED': JSON.stringify(process.env.SKUPPER_CONSOLE_EMBED || ''),
      'process.env.USE_MOCK_SERVER': JSON.stringify(process.env.USE_MOCK_SERVER),
      'process.env.MOCK_ITEM_COUNT': JSON.stringify(process.env.MOCK_ITEM_COUNT),
      'process.env.MOCK_RESPONSE_DELAY': JSON.stringify(process.env.MOCK_RESPONSE_DELAY)
    },

    // Use relative paths for all assets when in embed mode, otherwise use root path
    base: isEmbedMode ? './' : '/',

    server: {
      port: 3000
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vite.setup.ts'],
      coverage: {
        reporter: ['text', 'lcov'],
        exclude: ['**/src/config/**', 'mocks/**', '**/*.{json,svg,css}']
      }
    }
  };
});
