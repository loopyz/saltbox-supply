# Saltbox Supply

A small-batch housewares storefront (demo). Kitchen, bath and pantry goods with
real commerce rules enforced server-side:

- **Free shipping threshold** — orders of $60+ ship free (`lib/catalog.ts`,
  `FREE_SHIPPING_THRESHOLD_CENTS`); the cart shows how far you are from it.
- **Bundle discount** — three or more items take 10% off the subtotal
  (`BUNDLE_DISCOUNT_PCT`, applied in `lib/cart.ts#priceCart`).
- **Low-stock badges** — driven by catalog stock counts
  (`LOW_STOCK_BADGE_AT`).
- **Server-priced carts** — the client sends slugs and quantities only;
  `/api/cart` prices them and `/api/checkout` re-prices before recording the
  order, so client numbers are never trusted.

Instrumented with the Trevo SDK: page views, add-to-cart, cart pricing and an
idempotent `order_completed` conversion tracked server-side.

## Run it

```
npm install
cp .env.example .env.local   # add your Trevo keys
npm run dev
```
