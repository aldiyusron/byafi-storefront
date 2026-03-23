# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

byafi storefront — the public-facing Astro site for a direct-order clothing brand. This is Phase 1 of a multi-phase build (see `../docs/project-checkpoint.md` for full roadmap). The site is static, has no backend, and hands off orders via WhatsApp. A Next.js admin app and shared backend are planned for later phases.

## Commands

```bash
npm run dev          # Dev server at localhost:4321
npm run build        # Production build to dist/
npm run preview      # Serve the built site locally
npm run astro -- check  # TypeScript + Astro validation (use as lint)
```

No test runner exists yet. Before any PR, run `astro check` and `build` to validate.

Node >= 22.12.0 required.

## Architecture

### Data layer (no database, no CMS)

All content lives in typed TypeScript modules under `src/lib/content/`:

- **`site.ts`** — brand copy, navigation, config constants (currency, WhatsApp number, social links). Exports `siteConfig` and content arrays consumed by section components.
- **`catalog.ts`** — product and collection definitions (`Product[]`, `CollectionCategory[]`), plus lookup helpers (`getProductById`, `getProductBySlug`, `getProducts`). This is the single source of truth for the catalogue.

Adding/editing products or site copy means editing these files directly.

### Routing

File-based routing via `src/pages/`:

- `/` — `index.astro` (editorial landing: hero, story, editorial, collection preview, order steps, founder note)
- `/collection` — `collection/index.astro` (full catalogue, category "all")
- `/collection/[category]` — `collection/[category].astro` (filtered by category; uses `getStaticPaths` over `browseCollections`)
- `/product/[slug]` — `product/[slug].astro` (product detail; uses `getStaticPaths` over `products`; includes JSON-LD structured data)

### Component organization

- **`src/components/sections/`** — page-level sections (HeroSection, StorySection, EditorialSection, CollectionSection, OrderSection, FounderSection). Each is self-contained and composed by page files.
- **`src/components/catalog/`** — product display: ProductCard, ProductGrid, CollectionFilters.
- **`src/components/site/`** — shell pieces: SiteHeader, SiteFooter, InquiryBag (the drawer).

### Client-side logic

`src/scripts/storefront.ts` is the single client-side entry point (loaded via `Layout.astro`). It manages:

- Inquiry bag state (localStorage under key `byafi-inquiry-bag-v1`)
- Add/remove/quantity UI via `data-*` attribute delegation
- WhatsApp checkout message construction
- Scroll-reveal animations via IntersectionObserver

Pure utility functions (currency formatting, bag normalization, WhatsApp message building) live in `src/lib/storefront.ts` and are shared between server-rendered pages and the client script.

### Styling

Single global stylesheet at `src/styles/global.css`. Uses CSS custom properties (`:root` variables) for the design system — colors, radii, shadows, max-width. No Tailwind despite AGENTS.md mention; the actual CSS is hand-written. Typography uses Google Fonts (Cormorant Garamond + Manrope).

Responsive breakpoints: 1080px, 820px, 620px. Respects `prefers-reduced-motion`.

### Layout

`src/layouts/Layout.astro` is the single shell. It handles `<head>` (SEO meta, canonical URLs, Open Graph, fonts), wraps content in SiteHeader + SiteFooter, renders the InquiryBag drawer, and loads the client script. Pages pass `title`, `description`, and `pathname` as props.

## Conventions

- Tabs for indentation, scoped `<style>` only when component-specific (currently all styles are global)
- PascalCase for `.astro` components and layouts; lowercase for route files in `pages/`
- TypeScript strict mode (`astro/tsconfigs/strict`); avoid `any`
- Product visual placeholders use gradient backgrounds with `palette` colors and a single initial letter — real images are not yet integrated
- Interactive elements use `data-*` attributes (`data-add-product`, `data-open-bag`, `data-qty-change`, etc.) for event delegation in the client script
- Commit style: short imperative subjects, Conventional Commits (e.g. `feat: add hero section`)
