# RFC: Phase 2A — Minimum Viable Commerce

**Status:** Draft
**Date:** 2026-03-23
**Author:** storefront team
**Depends on:** [storefront-phase2-plan.md](./storefront-phase2-plan.md)

---

## 1. Summary

Evolve byafi-storefront from a static editorial site with WhatsApp checkout into a commerce-capable storefront that can accept real payments — without breaking the brand experience or over-engineering the platform.

This RFC covers the technical architecture for Phase 2A only: the minimum set of changes needed to support `browse → select variant → add to bag → pay → order confirmed`.

---

## 2. Motivation

The current site does its job as a brand introduction, but the purchase funnel breaks at the critical moment: the customer leaves byafi.com, opens WhatsApp, and has to manually coordinate payment and order details in a chat thread. This creates:

- **Drop-off friction.** Every context switch loses customers, especially on mobile.
- **No order tracking.** The brand has no structured record of what was ordered, paid, or fulfilled.
- **No stock validation.** A customer can "order" a sold-out item and only find out in the WhatsApp conversation.
- **No payment confirmation.** There is no machine-readable proof of payment tied to an order.

Phase 2A closes the loop: the customer stays on byafi.com from discovery through payment.

---

## 3. Current state

### 3.1 Build mode

Astro 6.0.8, fully static (`output` not set — defaults to `'static'`). No adapter. No server-side rendering. Deployed as flat HTML/CSS/JS files.

```js
// astro.config.mjs (today)
export default defineConfig({
  site: 'https://www.byafi.com',
  integrations: [sitemap()]
});
```

### 3.2 Product data model

All products are defined in `src/lib/content/catalog.ts` as a typed TypeScript array. 8 products across 4 categories. Price range: IDR 429,000–849,000.

```typescript
// current Product type
interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  badge: string;
  description: string;
  subtitle: string;
  fit: string;
  fabric: string;
  color: string;       // single color name, not a variant axis
  sizes: string[];     // display-only list, not purchasable variants
  note: string;
  palette: [string, string];
}
```

**Key limitation:** `color` and `sizes` are flat metadata. There is no concept of a purchasable variant (SKU), no stock count, and no way to distinguish "M in Dusty blush" from "L in Dusty blush" when adding to the bag.

### 3.3 Bag state

The inquiry bag stores items in `localStorage` under key `byafi-inquiry-bag-v1`:

```typescript
// current BagItem type
interface BagItem {
  productId: string;
  quantity: number;
}
```

Operations (`addToBag`, `updateQuantity`, `removeFromBag`) are in `src/scripts/storefront.ts`. The bag has no concept of selected size or color — it tracks only which product and how many.

### 3.4 Checkout

`buildWhatsappOrderMessage()` in `src/lib/storefront.ts` constructs a pre-filled WhatsApp message. The checkout button opens `wa.me/{number}?text={message}`. There is no payment processing, no order persistence, and no confirmation page.

### 3.5 What works well (and should not change)

- Editorial homepage and brand storytelling
- Collection browsing with category filters
- Product detail pages with JSON-LD structured data
- Responsive design with motion preferences
- Event delegation pattern via `data-*` attributes
- Type safety throughout (strict TypeScript)
- CSS custom property design system
- Existing page routes (`/`, `/collection`, `/collection/[category]`, `/product/[slug]`)

---

## 4. Proposed architecture

### 4.1 Rendering model: hybrid static + server

Stay on Astro's default `static` output mode. Opt specific pages/endpoints into server rendering with `export const prerender = false`. This requires adding an adapter.

```js
// astro.config.mjs (proposed)
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://www.byafi.com',
  integrations: [sitemap()],
  adapter: cloudflare(),
  session: {
    // Cloudflare KV driver auto-configured by adapter
  },
});
```

**Page rendering map:**

| Route | Rendering | Reason |
|---|---|---|
| `/` | Static | Editorial content, no dynamic data |
| `/collection` | Static | Product catalog from TS modules |
| `/collection/[category]` | Static | Category-filtered view |
| `/product/[slug]` | Static | PDP with JSON-LD |
| `/checkout` | **Server** | Cart validation, stock check, payment session creation |
| `/order/[id]` | **Server** | Order confirmation with payment status |
| `/api/checkout` | **Server** | POST: create Midtrans payment session |
| `/api/payment/notify` | **Server** | POST: receive Midtrans webhook |

Static pages are the same as today — prerendered at build time, served from CDN edge. The 4 server routes run on Cloudflare Workers only when requested.

### 4.2 Commerce logic location

All commerce logic lives in this repository as Astro server endpoints and actions. No separate backend service for Phase 2A.

```
src/
├── actions/
│   └── index.ts              # type-safe cart validation actions
├── pages/
│   ├── api/
│   │   ├── checkout.ts       # POST: create payment session
│   │   └── payment/
│   │       └── notify.ts     # POST: Midtrans webhook handler
│   ├── checkout.astro        # server-rendered checkout page
│   └── order/
│       └── [id].astro        # server-rendered order confirmation
├── lib/
│   ├── commerce/
│   │   ├── orders.ts         # order creation, lookup, status updates
│   │   ├── payment.ts        # Midtrans API client (Snap)
│   │   └── stock.ts          # stock validation helpers
│   └── content/
│       └── catalog.ts        # extended with variants (see §5)
└── middleware.ts              # shared request context
```

This keeps the architecture flat and contained. If commerce logic needs to move to a separate service later, the `src/lib/commerce/` module boundary makes extraction straightforward.

---

## 5. Data model changes

### 5.1 Product variants

Add a `ProductVariant` type and a `variants` array to `Product`:

```typescript
interface ProductVariant {
  sku: string;          // e.g., 'naira-coord-set-dusty-blush-m'
  size: string;         // 'S' | 'M' | 'L' | 'XL'
  color: string;        // 'Dusty blush'
  colorHex: string;     // '#c4939b' — for swatch rendering
  price: number;        // IDR integer (same as parent initially)
  stock: number;        // available units (0 = sold out)
}

interface Product {
  // ... all existing fields preserved ...
  variants: ProductVariant[];
}
```

**Design decisions:**

- `price` lives on the variant, not just the parent product. Even though all sizes are the same price today, this prevents a schema migration later when pricing diverges.
- `stock` is an integer count, not a boolean. This supports low-stock messaging ("Only 2 left") and prevents overselling.
- `color` and `sizes` remain on the parent `Product` as display-level summary fields for collection pages and filters. The variant array is the source of truth for purchasable options.
- `colorHex` enables future swatch UI without a second lookup.

**Migration:** Existing products gain a `variants` array generated from their current `sizes` and `color` fields. This is a backward-compatible addition — no existing code breaks, and `getProductById` / `getProductBySlug` continue to work.

### 5.2 Bag item

```typescript
// updated BagItem
interface BagItem {
  productId: string;
  sku: string;          // specific variant
  quantity: number;
}
```

The `sku` field is the key change. A customer adding "Naira Coord Set in size M" and "Naira Coord Set in size L" produces two separate bag items with different SKUs.

**localStorage key:** Bump to `byafi-bag-v2` to avoid parsing conflicts with the v1 schema. `normalizeBag()` already handles schema migration defensively — extend it to recognize v1 items (no `sku`) and discard them gracefully.

### 5.3 Order

New type — does not exist today.

```typescript
interface OrderItem {
  productId: string;
  sku: string;
  name: string;         // denormalized for display
  size: string;         // denormalized
  color: string;        // denormalized
  price: number;        // price at time of purchase
  quantity: number;
}

interface Order {
  id: string;                     // generated (e.g., 'BYAFI-20260323-A1B2')
  status: 'pending' | 'paid' | 'expired' | 'failed';
  items: OrderItem[];
  grossAmount: number;            // total in IDR
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod?: string;         // filled after payment (e.g., 'gopay', 'bca_va')
  paymentId?: string;             // Midtrans transaction_id
  paidAt?: string;                // ISO 8601
  createdAt: string;
  updatedAt: string;
  webhookPayload?: unknown;       // raw webhook for audit trail
}
```

**Storage for Phase 2A:** Cloudflare D1 (SQLite at the edge). A single `orders` table is sufficient. D1 is included in the Cloudflare free tier and requires no external infrastructure.

If D1 proves limiting (unlikely at Phase 2A volume), migration to Turso, PlanetScale, or a standalone Postgres is straightforward since the interface is standard SQL.

---

## 6. Checkout and payment flow

### 6.1 Provider: Midtrans Snap

**Choice rationale:**

| Factor | Midtrans | Xendit |
|---|---|---|
| GoPay | Native integration | Only via QRIS |
| Checkout UX | Popup overlay on byafi.com | Redirect to external page |
| Bank transfer fee (IDR 849K order) | IDR 4,000 flat | ~IDR 7,445 |
| QRIS fee | 0.7% | 0.7% + IDR 3,200 |
| E-wallet fee | 1.5–2% | 2.7% + IDR 6,400 |
| Webhook security | SHA512 per-transaction | Static shared token |

Midtrans is cheaper on every payment method, has native GoPay (dominant e-wallet for the target demographic), and keeps customers on byafi.com via the Snap popup. Xendit's advantage is a typed Node SDK and multi-country support — neither is critical for Phase 2A.

**Payment methods enabled (Snap automatically offers all enabled methods):**

| Method | Why it matters for byafi's audience |
|---|---|
| QRIS | Universal — works with any e-wallet or bank app. Lowest fee (0.7%). |
| GoPay | Most-used e-wallet among Indonesian women 25–40. |
| Bank Transfer (VA) | BCA, BNI, BRI, Mandiri. Flat IDR 4,000 fee. Trust signal for larger orders. |
| ShopeePay | Popular with online shoppers. |
| DANA | Secondary e-wallet, good coverage. |
| Credit/Debit Cards | Visa, Mastercard, JCB. 3DS enabled. |

### 6.2 Flow

```
┌──────────┐     ┌───────────────┐     ┌─────────────┐     ┌──────────┐
│  Browse   │────▶│  /checkout    │────▶│  Snap popup │────▶│ /order/  │
│  (static) │     │  (server)     │     │  (Midtrans) │     │ [id]     │
└──────────┘     └───────────────┘     └─────────────┘     └──────────┘
                   │                     │                    ▲
                   │ validate cart       │ customer pays      │
                   │ check stock         │                    │
                   │ create order        ▼                    │
                   │ get Snap token    ┌─────────────┐       │
                   │                   │  POST       │       │
                   │                   │  /api/      │───────┘
                   │                   │  payment/   │  update order
                   │                   │  notify     │  status
                   │                   └─────────────┘
```

**Step by step:**

1. Customer browses (static pages), adds items with size selection to bag (localStorage).
2. Customer clicks "Checkout" → navigates to `/checkout` (server-rendered).
3. `/checkout` reads bag from localStorage (passed via form/fetch), validates stock server-side, shows order summary with customer detail form.
4. Customer fills name + phone, clicks "Pay".
5. Frontend POSTs to `/api/checkout` → server creates order in D1 (`status: 'pending'`), calls Midtrans Snap API to create a transaction, returns `{ token }`.
6. Frontend calls `window.snap.pay(token)` → Midtrans popup appears on byafi.com.
7. Customer selects payment method and pays inside the popup.
8. Midtrans sends POST to `/api/payment/notify` → server verifies SHA512 signature, updates order status in D1.
9. On popup close/completion, frontend redirects to `/order/[id]` → server-rendered confirmation page showing order details and payment status.

### 6.3 Webhook verification

```typescript
import { createHash } from 'node:crypto';

function verifyMidtransSignature(body: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const serverKey = import.meta.env.MIDTRANS_SERVER_KEY;
  const input = body.order_id + body.status_code + body.gross_amount + serverKey;
  const expected = createHash('sha512').update(input).digest('hex');
  return body.signature_key === expected;
}
```

### 6.4 Midtrans status mapping

| Midtrans `transaction_status` | Order status | Action |
|---|---|---|
| `capture` (fraud_status=accept) | `paid` | Record paidAt, paymentMethod |
| `settlement` | `paid` | Record paidAt, paymentMethod |
| `pending` | `pending` | No change |
| `deny`, `cancel`, `failure` | `failed` | Update status |
| `expire` | `expired` | Update status |

---

## 7. Cart state strategy

### 7.1 Dual-state model

The bag operates in two modes depending on where the customer is in the funnel:

**Browsing (static pages):** localStorage is the source of truth. Zero server cost. Existing event delegation pattern continues to work. The only change is that bag items now include `sku`.

**Checkout (server pages):** The localStorage bag is synced to an Astro server session when the customer enters `/checkout`. The server session owns the cart during the payment flow — this prevents price tampering and validates stock.

```typescript
// src/env.d.ts
declare namespace App {
  interface SessionData {
    cart: Array<{ productId: string; sku: string; qty: number }>;
    orderId?: string;
  }
}
```

### 7.2 Why not move the bag entirely to the server?

Server sessions require the Astro adapter to be involved on every page load. This would turn the entire site server-rendered, losing the CDN-edge performance of static pages. The hybrid approach keeps collection browsing and product detail pages fast (static, cached) while securing the cart only when it matters (checkout).

### 7.3 Stock validation timing

Stock is checked **once at checkout entry** and **once at order creation** (before calling Midtrans). It is not checked on every add-to-bag — that would require server calls on static pages. If an item goes out of stock between add-to-bag and checkout, the customer sees a clear message on the checkout page with the option to remove the item and continue.

---

## 8. Hosting and deployment

### 8.1 Platform: Cloudflare Pages + Workers

| Requirement | Cloudflare | Vercel | Netlify |
|---|---|---|---|
| Jakarta edge PoP | Yes | No (Singapore closest) | No (Singapore closest) |
| Free tier bandwidth | Unlimited | 100 GB | 100 GB |
| SSR support | Workers (Astro adapter rebuilt for v6) | Serverless functions | Edge functions |
| Session storage | KV (free tier: 100K reads/day) | External (Redis, etc.) | External |
| Database | D1 (SQLite, free tier: 5M rows read/day) | External | External |
| Payment webhook reliability | Workers stay warm, <1ms cold start | Cold starts possible | Cold starts possible |

Cloudflare is the only option with a Jakarta data center, built-in KV for sessions, and built-in D1 for orders — all on the free tier. For an Indonesia-first brand, the latency difference between Jakarta and Singapore is meaningful on mobile networks.

### 8.2 Environment variables

```
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx      # Midtrans server key (sandbox/production)
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx      # Midtrans client key (for snap.js)
MIDTRANS_IS_PRODUCTION=false               # toggle sandbox/production
```

Set via Cloudflare dashboard or `wrangler secret put`. Never committed to the repository.

### 8.3 D1 schema (orders)

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  items TEXT NOT NULL,                      -- JSON array of OrderItem
  gross_amount INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  payment_method TEXT,
  payment_id TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  webhook_payload TEXT                      -- raw JSON for audit
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_id ON orders(payment_id);
```

---

## 9. UX changes

### 9.1 Product detail page

**Add:**
- Size selector (chip-style, consistent with collection filter design)
- "Add to bag" requires size selection — button disabled until a size is picked
- Selected size highlighted with `is-active` class (same pattern as `CollectionFilters`)
- Out-of-stock sizes shown as disabled chips with strikethrough
- Low-stock indicator ("Only 2 left") when `variant.stock <= 3`

**Keep:**
- Visual placeholder (gradient + initial) — real images are a content task, not a code task
- Related products section
- JSON-LD structured data (update `availability` to reflect actual stock)
- Breadcrumb navigation

### 9.2 Inquiry bag → Shopping bag

**Rename:** "Inquiry bag" → "Shopping bag" throughout the UI. "Direct order summary" → "Order summary". The drawer is no longer an inquiry — it is a real cart.

**Add:**
- Size label shown per bag item (e.g., "Dusty blush · Relaxed tailoring · Size M")
- "Checkout" button replaces "Send order via WhatsApp"
- Keep WhatsApp button as secondary option ("Have questions? Chat with us on WhatsApp")

**Keep:**
- Drawer pattern (no separate `/bag` page)
- Quantity controls (+/−/remove)
- Estimated total
- Backdrop + ESC to close

### 9.3 Checkout page (`/checkout`)

New page. Sections:

1. **Order summary** — items with size/color, quantities, line totals, grand total
2. **Customer details form** — name (required), phone (required), email (optional)
3. **Pay button** — triggers Midtrans Snap popup

Minimal styling. No shipping address (direct-order brand, shipping handled in follow-up). No coupon field. No guest account.

### 9.4 Order confirmation (`/order/[id]`)

New page. Shows:

- Order ID
- Payment status (paid / pending / failed / expired)
- Order items summary
- "Continue shopping" link
- WhatsApp link for post-order questions

### 9.5 Navigation update

Update `primaryNav` in `site.ts`:

```typescript
export const primaryNav: PrimaryNavItem[] = [
  { label: 'Story', href: '/#story' },
  { label: 'Lookbook', href: '/#lookbook' },
  { label: 'Collection', href: '/collection' },
  // 'Order' anchor removed — replaced by bag/checkout flow
];
```

The "Order" section on the homepage (explaining the WhatsApp flow) should be updated to reflect the new checkout process, or removed if it no longer adds value.

---

## 10. Implementation plan

### Step 0 — Infrastructure

- Add `@astrojs/cloudflare` adapter
- Deploy current static site to Cloudflare Pages
- Verify all existing pages work identically
- Set up D1 database and run schema migration
- Configure Midtrans sandbox credentials as environment variables

### Step 1 — Data model

- Add `ProductVariant` type to `catalog.ts`
- Extend all 8 products with `variants[]` (generated from existing `sizes` + `color`)
- Add stock counts (set all to a default like 10 for initial testing)
- Add `getVariantBySku()` helper
- Verify `getStaticPaths` and all existing pages still build

### Step 2 — Size selector + bag evolution

- Add size picker component on PDP
- Update `BagItem` to include `sku`
- Bump localStorage key to `byafi-bag-v2`
- Update bag rendering to show size per item
- Update `normalizeBag()` to handle v1 → v2 migration
- Rename "Inquiry bag" → "Shopping bag" in UI
- Replace WhatsApp checkout button with "Checkout" button

### Step 3 — Checkout page

- Create `src/pages/checkout.astro` (`prerender = false`)
- Build order summary + customer detail form
- Server-side stock validation on page load
- Out-of-stock item handling

### Step 4 — Payment integration

- Create `src/lib/commerce/payment.ts` (Midtrans Snap client)
- Create `src/pages/api/checkout.ts` (POST: create order + Snap token)
- Create `src/pages/api/payment/notify.ts` (POST: webhook handler)
- Load `snap.js` on checkout page
- Wire up `snap.pay(token)` on form submit

### Step 5 — Order persistence + confirmation

- Create `src/lib/commerce/orders.ts` (D1 CRUD)
- Create `src/pages/order/[id].astro` (server-rendered confirmation)
- Handle Snap popup callbacks (close, success, error) → redirect to order page

### Step 6 — Polish + edge cases

- Low-stock indicators on PDP
- Out-of-stock variant disabled state
- Update JSON-LD `availability` based on actual stock
- Update homepage "Order" section copy
- Error states (payment failed, network error, expired session)
- Mobile testing across payment methods in sandbox

---

## 11. What this RFC does NOT cover

These are explicitly deferred to later phases:

- **Real product images.** The gradient placeholders remain. Photography is a content/brand task, not a code task. It is the single biggest conversion lever but is outside the scope of this RFC.
- **Admin interface.** Products, stock, and prices are still edited in code. Phase 2C.
- **Customer accounts.** No login, no saved addresses, no order history per user.
- **Shipping address collection.** The brand handles shipping coordination separately (via WhatsApp or follow-up). This may change.
- **Coupon / discount codes.** No promo engine.
- **Email/SMS order confirmation.** Transactional notifications are valuable but not required for launch. The order page is the confirmation.
- **Hover image swap, quick view, filters/sorting.** Phase 2B merchandising features.
- **Multiple colors per product.** The current catalog has one color per product. The variant model supports multiple colors, but the UI for color selection is deferred.
- **Refund flow.** Refunds are handled manually via Midtrans dashboard for Phase 2A.
- **Analytics / conversion tracking.** Valuable but not a blocker.

---

## 12. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Midtrans Snap `snap.js` conflicts with existing client script | Broken checkout UI | Load `snap.js` only on `/checkout` page via conditional script tag. Existing `storefront.ts` uses event delegation, no global conflicts expected. |
| Cloudflare D1 is still technically in open beta | Data loss or API changes | D1 has been stable since late 2024. Order volume at launch is low. Export/backup via `wrangler d1 export`. Migration path to Turso or Postgres exists. |
| Stock goes stale between add-to-bag and checkout | Customer frustration | Validate stock at checkout entry AND at order creation. Show clear messaging and offer to remove out-of-stock items. |
| Webhook delivery failure | Order stuck in 'pending' | Midtrans retries webhooks up to 5x over ~6 hours. Add a manual "check payment status" button on the order page that calls Midtrans GET status API. |
| No server-side cart on static pages | Cart can be tampered with in localStorage | Price and stock are re-validated server-side at checkout. localStorage is only a convenience for browsing. The server session is the authority during payment. |
| Midtrans sandbox ≠ production behavior | Payment bugs in production | Test all payment methods in sandbox. Use Midtrans "pending" simulator for async methods (VA, QRIS). Soft-launch with a small batch of orders before public announcement. |

---

## 13. Open questions

1. **Customer email: required or optional?** Email enables transactional receipts (Phase 2C+). Making it required now reduces friction later but adds a field to the checkout form. Current recommendation: optional.

2. **WhatsApp fallback: keep or remove?** The current WhatsApp checkout works. Should it remain as an alternative for customers who prefer it, or should it be fully replaced? Current recommendation: keep as a secondary "Have questions?" link, not as a checkout path.

3. **Order ID format.** `BYAFI-YYYYMMDD-XXXX` (readable) vs UUID (unique, no date leak). Current recommendation: readable format — the brand is small, collision risk is negligible, and a human-readable ID is easier for WhatsApp follow-up conversations.

4. **Inventory source of truth.** For Phase 2A, stock counts live in `catalog.ts` (code-managed). When does this need to move to D1? Likely when any product has more than ~3 variants or when stock changes more than once per deploy cycle.

---

## 14. Success criteria

Phase 2A is complete when:

- [ ] A customer can browse products, select a size, add to bag, and check out — all on byafi.com
- [ ] Payment is processed via Midtrans (at least QRIS + bank transfer + GoPay working)
- [ ] An order record is persisted in D1 with correct status after payment
- [ ] The order confirmation page shows payment status accurately
- [ ] Out-of-stock variants cannot be purchased
- [ ] The existing editorial experience (homepage, collection browsing) is not degraded
- [ ] Site is deployed on Cloudflare with Jakarta edge latency
