import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  site: 'https://finanzas.ericksaravia.com',
  output: 'static',
  integrations: [react(), tailwind({ applyBaseStyles: false }), sitemap()],
  server: {
    port: 3000,
    open: true,
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});
