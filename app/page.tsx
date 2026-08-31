import Link from "next/link";
import { PRODUCTS, isLowStock } from "@/lib/catalog";
import PageView from "@/components/page-view";
import TrackedCta from "@/components/tracked-cta";

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function Home() {
  const featured = PRODUCTS.slice(0, 4);

  return (
    <div>
      <PageView event="home_view" />

      <section className="bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-5 px-4 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
            Small-batch housewares
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
            Things for the home that earn their shelf space.
          </h1>
          <p className="max-w-lg text-stone-600">
            Kitchen, bath and pantry goods from workshops we visit ourselves. Free shipping over
            $60 — and buy any three pieces to unlock the bundle discount.
          </p>
          <div className="flex gap-3">
            <TrackedCta href="/shop" event="hero_shop_click" placement="hero">
              Shop the collection
            </TrackedCta>
            <TrackedCta href="/cart" event="hero_cart_click" placement="hero" variant="light">
              View cart
            </TrackedCta>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Featured this week</h2>
          <Link href="/shop" className="text-sm text-amber-700 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {featured.map((product) => (
            <Link
              key={product.slug}
              href={`/cart?add=${product.slug}`}
              className="group flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-4 hover:border-stone-300"
            >
              <div className="flex h-24 items-center justify-center rounded-lg bg-stone-100 text-3xl">
                {product.category === "kitchen" ? "🥣" : product.category === "bath" ? "🧼" : "🫒"}
              </div>
              <span className="text-sm font-medium text-stone-900 group-hover:underline">
                {product.name}
              </span>
              <span className="flex items-center gap-2 text-sm text-stone-600">
                {dollars(product.priceCents)}
                {isLowStock(product) && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                    only {product.stock} left
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
