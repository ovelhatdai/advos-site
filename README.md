# advos.ai — site (MVP)

Site de marketing do **Advogando OS (ADVOS)** — "o sistema operacional do seu escritório".
Feito em **Astro** com **saída estática** (`output: 'static'`): HTML completo no build, então
o Google e as IAs (ChatGPT, Gemini, Claude, Perplexity) leem tudo — sem o problema de SPA do
Base44. É **portátil**: roda em Cloudflare Pages, Netlify, Vercel ou na sua VPS, sem reescrever.

## Rodar localmente

```bash
cd ~/advos-site
npm install
npm run dev        # http://localhost:4321
npm run build      # gera dist/ (HTML estático)
npm run preview    # serve o dist/ pra conferir
```

> Precisa de Node 18+ (`node -v`).

## Estrutura

```
src/layouts/Base.astro     → <head> com SEO/OG/Twitter + slots de JSON-LD
src/pages/index.astro       → landing (hero, recursos, planos, FAQ, form) + JSON-LD
                              (Organization + SoftwareApplication + FAQPage)
src/styles/global.css       → tema escuro (cyan), responsivo
functions/api/lead.js       → endpoint do formulário (Cloudflare Pages Function)
public/                     → favicon.svg, og.png (ADICIONAR), robots.txt, etc.
```

## Deploy no Cloudflare Pages

1. Suba este repo no GitHub.
2. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build command: `npm run build` · Output directory: `dist`.
4. **Environment variables** (aba Settings) — ver `.env.example`:
   `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `LEAD_NOTIFY_EMAIL`, `MAUTIC_FORM_URL` (opcional),
   `BASE44_APP_ID`/`BASE44_API_KEY` (opcional).
5. **Domínio:** Pages → Custom domains → adicionar `advos.ai` e `www.advos.ai`.
   ⚠️ **NÃO** mexa no registro `app.advos.ai` — ele aponta pro app e é independente. Só adicione
   a raiz (`advos.ai`) e o `www`. Se o DNS ainda não estiver na Cloudflare, primeiro replique o
   registro atual do `app.advos.ai` lá pra ele continuar funcionando.

A `functions/api/lead.js` vira automaticamente a rota `POST /api/lead` no Pages (sem config).

## Fluxo do lead

`formulário → POST /api/lead → Resend (e-mail de aviso) + Mautic (automação) [+ Base44 opcional]`

Pra mover o site pra outro host, basta reescrever **só** a `functions/api/lead.js` como um
endpoint equivalente (Node/PHP na VPS, etc.). O resto é HTML estático.

## Status — pronto, testado e validado

5 páginas estáticas, build limpo, SEO/AEO completo, design refinado.

- [x] **Páginas:** home, `/previdenciario`, `/comparativos/{advos-vs-astrea, advos-vs-projuris, advos-vs-advbox}`
- [x] **SEO/AEO:** `lang=pt-BR`, title/meta/canonical por página, JSON-LD (`SoftwareApplication`, `FAQPage`×5, `Organization`, `BreadcrumbList`), `sitemap-index.xml`, `robots.txt`
- [x] **og.png** 1200×630 branded (em `public/og.png`)
- [x] **Demos reais** integrados (mockups com moldura de browser)
- [x] **Copy** com os diferenciais: IA que peticiona, WhatsApp oficial (sem ban), boletos & conciliação, integrações nativas (MCPs, Cloudflare), multi-área
- [x] **Design refinado:** Inter, gradientes, brilho no mockup, hover, tira de capacidades, tabela comparativa
- [x] **0 `[CONFIRMAR]`** — preço/trial confirmados (R$500–2000/mês, 7 dias grátis)

### Falta só (opcional / fora do código)
- [ ] **Deploy** na Cloudflare Pages (ver seção acima) — precisa do seu login/token CF.
- [ ] (Opcional) Detalhar o que cada plano inclui (hoje mostra as 4 faixas de preço, honesto e genérico).
- [ ] (Opcional) Revisar 1× os textos de recurso contra o produto real (baseados nos vídeos da tela).
