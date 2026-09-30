import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { scrollableTables } from './src/plugins/satteri-scrollable-tables.mjs';
import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Astro hanya membuat /sitemap-index.xml. Alamat /sitemap.xml paling sering dimasukkan ke Search Console,
// jadi setiap build disalin agar kedua alamat berfungsi (isinya identik).
const sitemapAlias = () => ({
  name: 'sitemap-alias',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await copyFile(fileURLToPath(new URL('sitemap-index.xml', dir)), fileURLToPath(new URL('sitemap.xml', dir)));
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
