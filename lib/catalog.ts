// Catalog and commerce rules — the storefront's server-side decisions live here.

export const FREE_SHIPPING_THRESHOLD_CENTS = 6000; // free shipping at $60+
export const FLAT_SHIPPING_CENTS = 595;
export const BUNDLE_DISCOUNT_PCT = 10; // 3+ items unlocks the bundle discount
export const BUNDLE_MIN_ITEMS = 3;
export const LOW_STOCK_BADGE_AT = 5;

export interface Product {
  slug: string;
  name: string;
  blurb: string;
  priceCents: number;
  category: "kitchen" | "bath" | "pantry";
  stock: number;
}

export const PRODUCTS: Product[] = [
  {
    slug: "walnut-serving-board",
    name: "Walnut serving board",
    blurb: "End-grain walnut, oiled and ready. The board guests ask about.",
    priceCents: 5400,
    category: "kitchen",
    stock: 12,
  },
  {
    slug: "stoneware-mixing-bowls",
    name: "Stoneware mixing bowls, set of 3",
    blurb: "Nesting bowls in speckled cream. Heavy enough to stay put.",
    priceCents: 6800,
    category: "kitchen",
    stock: 8,
  },
  {
    slug: "linen-tea-towels",
    name: "Linen tea towels, pair",
    blurb: "Washed European flax that actually dries things.",
    priceCents: 2800,
    category: "kitchen",
    stock: 31,
  },
  {
    slug: "copper-pour-over",
    name: "Copper pour-over kettle",
    blurb: "Gooseneck spout, one-liter, patinas beautifully.",
    priceCents: 8900,
    category: "kitchen",
    stock: 4,
  },
  {
    slug: "waffle-bath-towels",
    name: "Waffle bath towel",
    blurb: "Lightweight waffle weave, line-dries by lunch.",
    priceCents: 3600,
    category: "bath",
    stock: 22,
  },
  {
    slug: "cedar-soap-dish",
    name: "Cedar soap dish",
    blurb: "Slotted cedar keeps the bar dry and the counter clean.",
    priceCents: 1400,
    category: "bath",
    stock: 3,
  },
  {
    slug: "olive-oil-tin",
    name: "Cold-pressed olive oil, 1L tin",
    blurb: "Single-grove Sicilian, pressed this season.",
    priceCents: 3200,
    category: "pantry",
    stock: 17,
  },
  {
    slug: "flaky-salt-jar",
    name: "Flaky sea salt jar",
    blurb: "Pyramid crystals from the Portuguese coast.",
    priceCents: 1200,
    category: "pantry",
    stock: 26,
  },
];

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function isLowStock(product: Product): boolean {
  return product.stock > 0 && product.stock <= LOW_STOCK_BADGE_AT;
}
