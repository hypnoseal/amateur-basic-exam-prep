// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import questionListIntegration from './integrations/question-list.js';
import statisticsDataIntegration from './integrations/statistics-data.js';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(), 
    react(), 
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex]
    }), 
    questionListIntegration(), 
    statisticsDataIntegration()
  ],
  // Add metadata for better SEO and search indexing
  site: 'https://radio.frasernolet.com',
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
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
