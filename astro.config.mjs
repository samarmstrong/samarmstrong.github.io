import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Keep `site` in sync with src/site.config.ts (config files can't share TS imports reliably).
export default defineConfig({
  site: 'https://samarmstrong.github.io',
  output: 'static',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
