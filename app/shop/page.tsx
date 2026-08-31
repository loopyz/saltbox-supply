import Link from "next/link";
import { PRODUCTS, isLowStock } from "@/lib/catalog";
import PageView from "@/components/page-view";

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Shop() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <PageView event="shop_view" />
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">The collection</h1>
      <p className="mb-8 text-sm text-stone-600">
        Buy any three pieces for 10% off the lot. Free shipping over $60.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {PRODUCTS.map((product) => (
          <div
            key={product.slug}
            className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-4"
          >
            <div className="flex h-28 items-center justify-center rounded-lg bg-stone-100 text-4xl">
              {product.category === "kitchen" ? "🥣" : product.category === "bath" ? "🧼" : "🫒"}
            </div>
            <span className="text-sm font-medium text-stone-900">{product.name}</span>
            <span className="text-xs leading-relaxed text-stone-500">{product.blurb}</span>
            <div className="mt-auto flex items-center justify-between pt-2">
              <span className="flex items-center gap-2 text-sm text-stone-700">
                {dollars(product.priceCents)}
                {isLowStock(product) && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                    only {product.stock} left
                  </span>
                )}
              </span>
              <Link
                href={`/cart?add=${product.slug}`}
                className="rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white hover:bg-stone-700"
              >
                Add
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
