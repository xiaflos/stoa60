// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    // /admin-helper is an internal CSV-row generator — it carries a `noindex`
    // meta tag, so keep it out of the sitemap rather than advertising it.
    sitemap({ filter: (page) => !page.includes('/admin-helper') })
  ],
  site: "https://stoa60.net"
});
