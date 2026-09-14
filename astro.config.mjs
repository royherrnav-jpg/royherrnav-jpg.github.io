// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  // Change this if you move to a custom domain.
  site: 'https://royherrnav-jpg.github.io',
  integrations: [sitemap()],
  markdown: {
    // remark/rehype pipeline so posts can use $math$ (rendered with KaTeX)
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
