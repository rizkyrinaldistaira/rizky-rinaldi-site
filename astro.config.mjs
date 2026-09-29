import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rizkyrinaldi.my.id',
  integrations: [sitemap()],
  output: 'static',
  build: {
    assets: 'assets',
  },
});
