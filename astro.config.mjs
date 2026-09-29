import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { scrollableTables } from './src/plugins/satteri-scrollable-tables.mjs';

export default defineConfig({
  site: 'https://rizkyrinaldi.my.id',
  integrations: [sitemap()],
  output: 'static',
  build: {
    assets: 'assets',
  },
  markdown: {
  processor: satteri({ hastPlugins: [scrollableTables] }),
},
});
