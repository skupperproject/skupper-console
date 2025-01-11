import react from '@vitejs/plugin-react';
import { defineConfig, PluginOption } from 'vite';
import vitePluginFaviconsInject from 'vite-plugin-favicons-inject';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => {
  const outDir = 'build';

  return {
    plugins: [
      react(),
      process.env.BRAND_APP_FAVICON && vitePluginFaviconsInject(process.env.BRAND_APP_FAVICON),
      process.env.BRAND_APP_LOGO &&
        viteStaticCopy({
          targets: [
            {
              src: process.env.BRAND_APP_LOGO,
              dest: ''
            }
          ]
        })
    ].filter(Boolean) as PluginOption[], // remove conditional plugins if undefined

    define: {
      'process.env.BRAND_APP_LOGO': JSON.stringify(process.env.BRAND_APP_LOGO || ''),
      'process.env.COLLECTOR_URL': JSON.stringify(process.env.COLLECTOR_URL || ''),
      'process.env.API_VERSION': JSON.stringify(process.env.API_VERSION || ''),
      'process.env.MOCK_ITEM_COUNT': JSON.stringify(process.env.MOCK_ITEM_COUNT),
      'process.env.MOCK_DELAY_RESPONSE': JSON.stringify(process.env.MOCK_DELAY_RESPONSE),
      'process.env.ENABLE_MOCK_SERVER': JSON.stringify(process.env.ENABLE_MOCK_SERVER || false)
    },

    base: './',

    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 1500
    },

    server: {
      port: 3000
    }
  };
});
