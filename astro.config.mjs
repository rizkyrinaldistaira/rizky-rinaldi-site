import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { scrollableTables } from './src/plugins/satteri-scrollable-tables.mjs';
import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Astro hanya membuat /sitemap-index.xml (indeks) dan /sitemap-0.xml (daftar URL). Untuk situs sekecil ini
// /sitemap.xml dibuat berisi langsung daftar URL (salinan sitemap-0.xml), tanpa lapisan indeks: itu alamat yang
// paling sering dikirim ke Search Console, dan Search Console langsung melaporkan jumlah halamannya.
const sitemapAlias = () => ({
  name: 'sitemap-alias',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await copyFile(fileURLToPath(new URL('sitemap-0.xml', dir)), fileURLToPath(new URL('sitemap.xml', dir)));
    },
  },
});

export default defineConfig({
  site: 'https://rizkyrinaldi.my.id',
  integrations: [sitemap(), sitemapAlias()],
  output: 'static',
  build: {
    assets: 'assets',
  },
  markdown: {
    processor: satteri({ hastPlugins: [scrollableTables] }),
  },
});
