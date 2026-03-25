# Design Brief: byafi Phase 2A — Commerce Screens

**Purpose:** This brief is written as a prompt for a generative UI tool (Google Stitch or similar). It describes 4 new or updated screens for the byafi storefront, grounded in the existing design system.

**How to use:** Copy the relevant section into the tool as your prompt. Each screen section is self-contained and includes the visual constraints, layout requirements, and brand context needed to generate a useful starting point.

---

## Brand Context (include with every prompt)

byafi is a modest womenswear brand from Indonesia. The site is an editorial-meets-commerce storefront — it should feel like a fashion magazine that you can shop from, not like a generic e-commerce template.

### Visual identity

- **Palette:** Cream background (#f9f3ed), dusty rose accent (#c4939b → #9e7279 gradient), warm muted text (#7a6e6c), dark ink (#1c1719). Supporting accents: olive (#8b9678), sand (#e2d5c8), lavender (#b5a5c6).
- **Typography:** Cormorant Garamond (serif) for headings and display text. Sora (sans-serif) for body, UI, and labels. Headings are large, tight line-height (0.96), and use font-weight 600. Labels are small (0.78rem), uppercase, letter-spacing 0.18em.
- **Surfaces:** Cards use semi-transparent white backgrounds (rgba(255, 251, 247, 0.84)) with 1px borders (rgba(50, 28, 35, 0.10)), backdrop blur (10px), and soft shadows (0 28px 80px rgba(40, 20, 28, 0.10)). This gives a frosted glass (glassmorphism) feel.
- **Shapes:** Everything is heavily rounded. Buttons and chips are pill-shaped (border-radius 999px). Cards use 22-32px radius. No sharp corners anywhere.
- **Interactions:** Buttons lift 2px on hover with a soft shadow. Scroll reveals fade in + slide up (24px, 500ms). Cards stagger their entrance by 80ms each. All animations respect prefers-reduced-motion.
- **Spacing:** Generous whitespace. 28px gaps between major sections. Padding on panels: 22-40px. Max content width: 1180px.

### Tone of voice

Soft, poetic, unhurried. The copy reads like a handwritten note, not a sales pitch. Examples:
- "whimsical charms in every little thing."
- "Born from a love of gentle details and the women who notice them."
- "Pieces designed to carry charm from morning errands to afternoon gatherings and quiet evenings."

Avoid: urgency language ("BUY NOW", "LIMITED TIME"), corporate tone, tech jargon, all-caps shouting. The brand whispers — it never yells.

### Target customer

Indonesian women, 25-40, who wear hijab. Style-conscious but not trend-chasing. They notice small details — a gathered cuff, a polka-dot lining, the way a sleeve moves. They shop on mobile (Instagram → website → purchase). Price range IDR 429,000-849,000 per piece.

---

## Screen 1: Product Detail Page — Size Selector

### What exists today

A two-column layout (image left, details right) inside a rounded card. The left column is currently a gradient placeholder with a large serif initial letter — not a real photo. The right column has: category tag, product name (large serif heading), price, description paragraph, detail tags (badge, color, fit as pills), a 2x2 spec grid (Fabric, Sizes, Silhouette, Styling note), and two action buttons (Add to inquiry bag, Open inquiry bag).

The "Sizes" field currently just displays "S, M, L, XL" as plain text inside a spec card. There is no interactive size selection.

### What to design

Replace the passive size display with an interactive size selector and update the action area:

**Size selector strip** — A horizontal row of pill-shaped chips (same visual pattern as the category filter chips on collection pages). Each chip shows one size (S, M, L, XL). Behavior:
- Default: no size selected, all chips in default state (translucent white background, muted border)
- Selected: chip turns dark (background: #1c1719, text: #fff9f4) — same as the active filter chip pattern
- Out of stock: chip shows with strikethrough text and reduced opacity (0.4), not clickable
- Low stock (1-3 remaining): small text below or beside the chip — "Only 2 left" in the muted color

**Updated action area:**
- Primary button changes text from "Add to inquiry bag" to "Add to bag" (shorter, more direct)
- Button is disabled (opacity 0.55) until a size is selected
- When disabled, show a subtle hint below: "Select a size" in muted text
- On mobile (below 620px), the action area should become sticky at the bottom of the viewport — a frosted bar with the price, selected size, and the add-to-bag button

**Spec grid update:**
- The "Sizes" card in the 2x2 grid is replaced with a "Size guide" card that shows a brief fit note (e.g., "Fits true to size. Model wears M, height 165cm.") and optionally a "View size guide" link for a future modal
- The size selector lives above the spec grid, between the detail tags and the grid

### Layout constraints

- The size selector strip should fit within the right column's width without horizontal scroll
- On mobile (single column), the visual stacks above the copy and the sticky add-to-bag bar stays anchored to the bottom
- Keep the same padding, border-radius, and surface treatment as the existing detail panel

### Reference elements (from the existing design)

- Filter chips: `.filter-chip` — pill-shaped, translucent white inactive, dark active
- Product tags: `.product-tag` / `.detail-tag` — small uppercase pills
- Primary button: gradient from #c4939b to #9e7279, white text, pill shape
- Spec cards: `.detail-section` — 18px radius, translucent white, subtle border

---

## Screen 2: Shopping Bag Drawer (updated)

### What exists today

A slide-in drawer (420px wide, full viewport height minus 20px margins, right-aligned) with three sections:
- **Header:** "Inquiry bag" label + "Direct order summary" heading + close button
- **Body:** Scrollable list of bag items, each showing category pill, product name, color + fit meta, per-line price, quantity controls (+/-), and a remove link
- **Footer:** Estimated total, a note about WhatsApp, and a "Send order via WhatsApp" button

### What to design

Update the drawer to reflect the shift from inquiry to actual shopping:

**Header:**
- Change label from "Inquiry bag" to "Shopping bag"
- Change heading from "Direct order summary" to "Your selections" or "Your bag"
- Keep the close (x) button

**Bag items — add size display:**
- Each item currently shows: `[Category pill] Product Name / Color . Fit / Price / Qty controls / Remove`
- Add the selected size to the meta line: "Dusty blush · Relaxed tailoring · **Size M**"
- The size should be visually distinct — either bold or shown as a small pill tag

**Footer — checkout action:**
- Change the primary button text from "Send order via WhatsApp" to "Checkout"
- Change the note from "This sends a pre-filled order inquiry..." to "You'll review your order and choose a payment method."
- Add a secondary line below the checkout button: "Have questions? [Chat on WhatsApp]" — styled as a subtle text link in the muted color, not a full button

**Empty state:**
- Update heading: "Your bag is empty."
- Update copy: "Browse the collection and add pieces you love."
- Add a "Browse collection" text link below

### Layout constraints

- Same drawer dimensions and animation (slide from right, 220ms ease)
- Same frosted glass surface treatment
- The footer sticks to the bottom; body scrolls if items overflow
- On mobile (below 620px), drawer becomes full-width with 10px margins all around

---

## Screen 3: Checkout Page

### What exists today

This page does not exist yet. It is entirely new.

### What to design

A full page at `/checkout` with three sections stacked vertically inside the same rounded panel style used by the product detail page.

**Section 1: Order summary**
- Heading: section-label "Checkout" + section-title "Review your order."
- List of items from the bag, each showing:
  - Product name (bold)
  - Size, color, fit (muted meta line, same as drawer)
  - Quantity x Price = Line total (right-aligned)
- Below the item list: a divider line, then "Total" row (label left, amount right, bold)
- An "Edit bag" text link that opens the bag drawer

**Section 2: Your details**
- A simple form with:
  - Name (text input, required) — label "Full name"
  - Phone (tel input, required) — label "WhatsApp number" (since the brand communicates via WhatsApp)
  - Email (email input, optional) — label "Email (optional)" with a helper: "For your order receipt"
- Form inputs should match the design system: pill-shaped or large-radius rounded inputs, 1px border using --line color, generous padding (14-16px), focus state with accent color border

**Section 3: Payment**
- Not a form — just a call to action
- Brief copy: "You'll choose your payment method in the next step. We accept bank transfer, GoPay, QRIS, and other options."
- Payment method icons/badges in a horizontal row (small, muted, pill-shaped tags showing: "QRIS", "GoPay", "Bank Transfer", "ShopeePay", "DANA", "Cards")
- Primary button: "Continue to payment" (full-width)
- The button triggers the Midtrans Snap payment popup (not a page navigation), so visually this is the final action on the page

**Overall layout:**
- Single column, centered, max-width ~640px (narrower than the 1180px page shell — checkout should feel focused and intimate, not spread wide)
- Each section separated by generous whitespace (40-48px)
- The page sits inside a rounded panel (same surface/border/shadow treatment as other panels)
- Breadcrumb at top: "Collection / Checkout" or just "Shopping bag → Checkout"

### Mobile considerations

- On mobile, the form should be comfortable to fill with one thumb
- Inputs should be large touch targets (min-height 48px)
- The "Continue to payment" button should be prominent and reachable without scrolling past content (consider sticky footer on mobile if the form is long)

### Tone

This page should feel calm and reassuring, not like a high-pressure checkout funnel. The brand's audience is not used to aggressive conversion tactics. Think: "You're almost there, and we'll take care of the rest."

---

## Screen 4: Order Confirmation Page

### What exists today

This page does not exist yet. It is entirely new.

### What to design

A page at `/order/[id]` shown after payment, with two possible states: **paid** and **failed/expired**.

**Paid state:**

- A large heading area with a subtle success indicator — not a green checkmark (too generic). Consider: the brand's dusty rose accent as the positive signal, or a soft illustration-style element. The heading: "Thank you, [name]." in the large Cormorant Garamond serif. Below: "Your order has been placed." in muted body text.
- **Order details card** (same surface treatment as other panels):
  - Order ID (e.g., "BYAFI-20260323-A1B2") — displayed in the small uppercase label style
  - Payment method used (e.g., "Paid via GoPay")
  - Item list — compact version (product name, size, qty)
  - Total paid
- **What happens next** — a brief note: "We'll reach out on WhatsApp to confirm sizing and arrange delivery." This ties the digital payment back to the brand's personal touch.
- **Actions:**
  - "Continue shopping" — secondary button linking to /collection
  - "Chat with us on WhatsApp" — text link, for post-order questions

**Failed / expired state:**

- Heading: "Something went wrong." or "Your payment didn't go through."
- Brief explanation: "This can happen if the payment session expired or was cancelled. Your bag is still saved."
- Actions:
  - "Try again" — primary button linking back to /checkout
  - "Chat with us on WhatsApp" — text link for help

**Overall layout:**
- Centered, single column, max-width ~580px (even narrower than checkout — this is a moment of completion, not information density)
- Generous vertical padding — let the page breathe
- No navigation distractions — the header is still there, but the page itself is focused on the confirmation

### Tone

This is the emotional peak of the customer journey. The paid state should feel warm and personal — like receiving a handwritten thank-you note, not a transaction receipt. Avoid: order numbers in giant bold text, excessive detail tables, or corporate "Your order #12345 has been received" energy. The failed state should be gentle and reassuring, not alarming.

---

## Design system tokens reference (for tool configuration)

```
Colors:
  Background:       #f9f3ed
  Background soft:  #f2ebe3
  Surface:          rgba(255, 251, 247, 0.84)
  Surface strong:   #fffaf6
  Ink (text):       #1c1719
  Muted (secondary):#7a6e6c
  Border:           rgba(50, 28, 35, 0.10)
  Accent:           #c4939b
  Accent deep:      #9e7279
  Accent soft:      #e4cbcf
  Olive:            #8b9678
  Sand:             #e2d5c8
  Lavender:         #b5a5c6

Typography:
  Heading:          Cormorant Garamond, serif — weight 600, line-height 0.96
  Body:             Sora, sans-serif — weight 400, line-height 1.65
  Label:            Sora — 0.78rem, uppercase, letter-spacing 0.18em
  Price:            Sora — 0.95rem, muted color

Radii:
  Pill:             999px (buttons, chips, inputs)
  Card XL:          32px
  Card LG:          22px
  Card MD:          16px
  Card SM:          12px
  Inner elements:   18px

Shadows:
  Card:             0 28px 80px rgba(40, 20, 28, 0.10)
  Hover:            0 12px 28px rgba(31, 23, 19, 0.12)

Spacing:
  Section gap:      28px
  Card padding:     22-40px (responsive via clamp)
  Button height:    48px min
  Max width:        1180px (page), 640px (checkout), 580px (confirmation)
```
