import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://astro.build/config
export default defineConfig({
  // Bind to all interfaces so Tailnet hosts can reach `bun run dev` / preview.
  server: {
    host: '0.0.0.0',
  },
  preview: {
    host: '0.0.0.0',
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
    },
  },
  site: 'https://daicompute.ca',
  base: '/',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/pitch'),
    }),
    react(),
  ],
});
