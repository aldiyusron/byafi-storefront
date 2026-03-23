# Storefront Phase 2 Plan

## Why this document exists

The current site works well as Phase 1: a public-facing editorial storefront that introduces the brand and routes orders through WhatsApp.

After reviewing comparable fashion brands and reflecting on the intended customer journey, the product direction is changing:

- This project should no longer be treated as only a landing page.
- The next phase should evolve this site into the actual storefront experience.
- The core user journey should stay on one surface from discovery to product intent to checkout handoff.

This is a shift away from a SaaS-style split (`landing page -> separate app`) and toward a fashion e-commerce funnel (`homepage -> collection -> product -> checkout`).

## Product decision

### Do not split the experience into two separate apps

Avoid this flow:

1. user lands on the brand site
2. user clicks into a separate transaction app
3. user reorients to a different experience before buying

That adds unnecessary friction for an impulse-driven fashion purchase.

### Recommended direction

Keep building `byafi-storefront` as the primary storefront.

That means this repository should eventually own:

- homepage / landing experience
- collection browsing
- product detail pages
- bag / cart state
- checkout handoff
- post-payment success / failure states

The visual/editorial identity should stay strong, but the funnel should become commerce-capable.

## Current state

Today this repo is:

- Astro-based
- static
- no backend
- no CMS
- WhatsApp-order driven
- strong for first impression / storytelling

This is still useful. Nothing built so far is wasted.

Phase 1 becomes the top of the funnel for Phase 2.

## Target architecture

### Frontend

This repo remains the customer-facing storefront.

Primary pages:

- `/`
- `/collection`
- `/collection/[category]`
- `/product/[slug]`
- `/bag` or drawer-based bag experience
- `/checkout/success`
- `/checkout/failed`

### Commerce layer

Instead of building a heavy custom commerce platform immediately, introduce a thin commerce layer:

- product and variant modeling
- bag/cart state
- stock validation before checkout
- checkout session creation
- payment status updates
- order persistence

### Payments

Use a payment provider for the checkout handoff instead of building a full custom checkout engine from scratch.

Candidate direction for Indonesia-first operations:

- Midtrans
- Xendit

### Content/admin

Phase 1 edits are code-driven. That is acceptable for now.

Later, non-developer-friendly controls should be added for:

- hero banners
- featured products
- collection ordering
- lookbook/editorial sections
- size guide content
- inventory / availability

## Phase 2 scope

### Phase 2A — minimum viable storefront

Goal: make the current site capable of supporting real purchase intent.

Build:

- richer product detail pages
- explicit variants (size, color when relevant)
- bag/cart experience
- checkout handoff
- payment result pages
- order capture flow

UX priorities:

- sticky add-to-bag on mobile
- size guide
- trust and shipping info
- stronger collection browsing
- related products

### Phase 2B — conversion and merchandising

Goal: make the experience feel like a polished fashion store instead of only a brochure site.

Build:

- hover image swap on product cards
- quick view
- filters and sorting
- best seller / new arrival sections
- complete-the-look merchandising
- stronger editorial merchandising on homepage

### Phase 2C — operations

Goal: reduce dependence on code edits for everyday brand operations.

Build:

- lightweight internal admin tools or CMS integration
- order status visibility
- product/content updates
- stock updates

## What not to build yet

Do not overbuild the platform in the next phase.

Avoid for now:

- loyalty systems
- advanced recommendation engines
- full customer accounts as a requirement
- complicated promo logic
- large admin surface area
- overly abstract commerce architecture

## Guiding principles

1. Keep the customer journey on one surface.
2. Optimize for fashion conversion, not SaaS-style app separation.
3. Preserve the editorial feel of the brand.
4. Add only the minimum backend needed to complete the funnel.
5. Keep future migration options open.

## Migration flexibility

The storefront should be built so that the commerce backend can change later.

Near term:

- code-managed content
- simple commerce layer
- payment handoff

Possible future direction:

- headless commerce backend
- Shopify-backed operations while preserving a custom frontend

The key is to avoid locking the product strategy too early.

## Immediate next implementation priorities

1. Confirm product data model can support variants.
2. Design the bag/cart state and UI.
3. Define the checkout handoff flow.
4. Add success / failure pages.
5. Improve product pages for purchase confidence.
6. Improve collection pages for browsing and discovery.

## Working decision for this repository

For now, `byafi-storefront` should be treated as:

> the main brand-facing storefront that will gradually absorb the commerce flow

not as:

> a temporary landing page that later redirects users into a separate transactional app
