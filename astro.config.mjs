// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// Absolute base URL, needed for link-preview images (og:image).
// On Vercel this resolves to the production domain automatically.
/** @type {string | undefined} */
const vercelDomain = /** @type {any} */ (globalThis).process?.env?.VERCEL_PROJECT_PRODUCTION_URL;
const site = vercelDomain ? `https://${vercelDomain}` : 'http://localhost:4321';

export default defineConfig({
  site,
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});