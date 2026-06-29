import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Saída ESTÁTICA: HTML completo no servidor = SEO perfeito (Google e IAs leem tudo,
// sem o problema de SPA que travava o Base44) + portabilidade total (Cloudflare Pages,
// Netlify, VPS — basta servir a pasta dist/). O endpoint de lead fica como Cloudflare
// Pages Function em /functions/api/lead.js (fora do build do Astro), então o site
// continua 100% estático e move-se pra qualquer host.
export default defineConfig({
  site: 'https://advos.ai',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
