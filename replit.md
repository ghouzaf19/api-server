# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (`@workspace/integrations-openai-ai-server`)

## Artifacts

### Meat Lovers Hub (`/`)
- BBQ/grilling recipe blog
- React + Vite frontend at `artifacts/meat-lovers-hub`
- Pages: Home, About, Recipes, Category, Recipe detail, Contact, Newsletter, Follow, Privacy Policy, Terms of Service, Author (`/author/juicy-joe`), Editorial Policy (`/editorial-policy`), Carnivore Meal Plan Generator (`/carnivore-meal-plan`)
- SEO/E-E-A-T features: Author page with Person JSON-LD schema, Editorial Policy page, bylines linked to author page, "Last Updated" badge on recipes, Sources & References section with external citations on every recipe, Article OG tags (published_time, modified_time, author), enhanced Organization + Person schema in SiteJsonLd, improved sitemap.xml with correct lastmod dates
- Categories: Beef, Chicken, Game Meat (venison/wild game — replaces Pork), BBQ, Quick Meals
- Recipe data: `updatedAt`, `citations`, and `faq` fields added to all recipes
- FAQ sections: All 9 recipe pages have collapsible FAQ sections (5 Q&As each) with FAQPage JSON-LD schema for "People Also Ask" rich results
- Common Mistakes sections: All 9 recipes have 3 specific, factual mistakes with red numbered callout UI (Google Dec 2025 "Information Gain" signal)
- Performance: `loading="lazy"` + `decoding="async"` on all secondary images; `fetchPriority="high"` + `decoding="async"` on hero/LCP images; Unsplash CDN preconnect + dns-prefetch in index.html
- Meta improvements: `max-image-preview:large` robots meta for Discover; `og:image:type`; dynamic `article:tag` meta from recipe tags (up to 6); dynamic canonical URL per page; OG image now uses landscape image (1200×630) instead of portrait for Discover compatibility
- Pillar + Cluster SEO architecture: 5 category pages transformed into full pillar pages (Complete Guide section, subtopics sidebar, pillar-level FAQ accordion, CollectionPage + ItemList JSON-LD); each recipe page has a "Part of [Category] collection" cluster→pillar widget for bidirectional internal linking; CATEGORY_SEO expanded with `targetKeyword`, `pillarIntro`, `pillarSubtopics[]`, `pillarFaq[]`
- Linkable asset pages: `/guides/meat-temperatures` — comprehensive meat cooking temperature guide (5 meat types, USDA-cited, doneness tables, thermometer FAQ, carry-over cooking explained); `/resources` — hub page linking to all guides + 5 pillar category guides + trusted external resources (USDA, Serious Eats, AmazingRibs); both pages added to main nav ("📖 Guides"), footer column, and sitemap; temperature guide contextually linked from every recipe page via a dark callout banner
- Carnivore Meal Plan monetization system (`/carnivore-meal-plan`): dedicated SEO landing page (WebApplication JSON-LD, FAQ section for "People Also Ask", hero with green gradient); email capture gate (Days 1–2 free, Days 3–7 blurred + unlock overlay with email form, stored to `localStorage`); PDF export via `window.print()` with `@media print` CSS (hides chrome, formats day cards cleanly, injects header/footer); "Save Plan" to `localStorage`; HIGH PROTEIN badge on dinner cards; embedded generator with Regenerate / Save / Download actions; same email gate + actions also added inline to RecipePage carnivore section
- **Lighthouse accessibility audit complete**: all 10 manual ARIA/focus checklist items fixed (viewport meta, social hrefs/aria-labels, hamburger aria-expanded/aria-controls, mobile nav id, CollectionsDrawer dialog ARIA, newsletter label, focus-visible ring, sr-only class); all contrast failures resolved — red CTA/badge backgrounds `#ff4d4d`→`#CC2222` (5.3:1 on white), red text on light `#ff4d4d`→`#B91C1C` (6:1), gray labels `#aaa`/`#bbb`/`#888`/`#777`→`#555`–`#666`, green `#16a34a`→`#166534`, amber `#d97706`→`#B45309`, RSS orange `#f26522`→`#b85000`, footer opacity boosts (0.2–0.35→0.5–0.7) in SiteFooter.tsx

### SEO Blog Studio (`/seo-studio/`)
- AI-powered SEO content tool for bloggers and content marketers
- React + Vite frontend at `artifacts/seo-blog-studio`
- Backend routes at `artifacts/api-server/src/routes/seo/`
- Database table: `blog_posts` (PostgreSQL via Drizzle ORM)
- Pages: Dashboard, Blog Generator, Topical Authority, Information Gain, E-E-A-T Enhance, Quality Check, Image SEO Helper
- AI model: `gpt-4o` via Replit OpenAI AI Integration

## Database Schema

### blog_posts
- `id` (uuid, PK)
- `topic` (text)
- `niche` (text)
- `title` (text)
- `outline` (text)
- `content` (text)
- `seo_score` (numeric)
- `word_count` (integer)
- `created_at` / `updated_at` (timestamp)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
