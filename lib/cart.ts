import {
  BUNDLE_DISCOUNT_PCT,
  BUNDLE_MIN_ITEMS,
  FLAT_SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  productBySlug,
} from "./catalog";

export interface CartLine {
  slug: string;
  qty: number;
}

export interface PricedLine {
  slug: string;
  name: string;
  qty: number;
  unitCents: number;
  lineCents: number;
}

export interface PricedCart {
  lines: PricedLine[];
  itemCount: number;
  subtotalCents: number;
  bundleDiscountCents: number;
  shippingCents: number;
  totalCents: number;
  /** Cents still needed to unlock free shipping; 0 when already unlocked. */
  freeShippingGapCents: number;
}

/**
 * Price a cart entirely server-side. The bundle discount and the free-shipping
 * decision are commerce rules — they must never be recomputed (or trusted)
 * from the client.
 */
export function priceCart(lines: CartLine[]): PricedCart {
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = productBySlug(line.slug);
    if (!product) continue;
    const qty = Math.max(1, Math.min(20, Math.floor(line.qty)));
    priced.push({
      slug: product.slug,
      name: product.name,
      qty,
      unitCents: product.priceCents,
      lineCents: product.priceCents * qty,
    });
  }

  const itemCount = priced.reduce((n, l) => n + l.qty, 0);
  const subtotalCents = priced.reduce((n, l) => n + l.lineCents, 0);

  const bundleDiscountCents =
    itemCount >= BUNDLE_MIN_ITEMS
      ? Math.round((subtotalCents * BUNDLE_DISCOUNT_PCT) / 100)
      : 0;

  const discounted = subtotalCents - bundleDiscountCents;
  const shippingCents =
    discounted >= FREE_SHIPPING_THRESHOLD_CENTS || discounted === 0 ? 0 : FLAT_SHIPPING_CENTS;

  return {
    lines: priced,
    itemCount,
    subtotalCents,
    bundleDiscountCents,
    shippingCents,
    totalCents: discounted + shippingCents,
    freeShippingGapCents: Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - discounted),
  };
}
