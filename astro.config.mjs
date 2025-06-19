// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import questionListIntegration from './integrations/question-list.js';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react(), mdx(), questionListIntegration()],
  // Add metadata for better SEO and search indexing
  site: 'https://radio.frasernolet.com',
  markdown: {
    shikiConfig: {
      // Choose the theme for syntax highlighting
      theme: 'github-light'
    }
  },
  // These options will be passed to the Pagefind CLI when it runs after the build
  vite: {
    build: {
      // Ensure that the build includes all necessary files for Pagefind
      assetsInlineLimit: 0
    }
  }
});
