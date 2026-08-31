"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTrevo } from "@trevosdk/react";

const BUNDLE_PROGRESS_KEY = "show-bundle-discount-progress-in-the-cart-priced-by-the-server";

interface PricedLine {
  slug: string;
  name: string;
  qty: number;
  unitCents: number;
  lineCents: number;
}

interface PricedCart {
  lines: PricedLine[];
  itemCount: number;
  subtotalCents: number;
  bundleDiscountCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingGapCents: number;
  bundleItemsRemaining?: number;
  bundleSavingsPreviewCents?: number;
}

const STORAGE_KEY = "sb_cart";

function readStored(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: Record<string, number> = {};
    for (const [slug, qty] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof qty === "number" && qty > 0) out[slug] = Math.floor(qty);
    }
    return out;
  } catch {
    return {};
  }
}

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Treatment arm of the bundle-progress experiment: identical to the control
// cart, plus a server-priced nudge under the free-shipping banner telling the
// shopper what a third piece is worth. The variant is resolved by CartView.
export default function CartViewVariant() {
  const trevo = useTrevo();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Record<string, number> | null>(null);
  const [cart, setCart] = useState<PricedCart | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const priceIt = useCallback(async (next: Record<string, number>): Promise<PricedCart | null> => {
    const lines = Object.entries(next).map(([slug, qty]) => ({ slug, qty }));
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lines }),
    });
    return res.ok ? ((await res.json()) as PricedCart) : null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const stored = readStored();
    const add = searchParams.get("add");
    if (add) {
      stored[add] = (stored[add] ?? 0) + 1;
      trevo?.track("cart_add", { product: add });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    void priceIt(stored).then((priced) => {
      if (cancelled) return;
      setItems(stored);
      if (priced) setCart(priced);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mount; ?add= is consumed on arrival
  }, []);

  function setQty(slug: string, qty: number): void {
    const next = { ...(items ?? {}) };
    if (qty <= 0) delete next[slug];
    else next[slug] = qty;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setItems(next);
    void priceIt(next).then((priced) => {
      if (priced) setCart(priced);
    });
  }

  async function checkout(): Promise<void> {
    if (!items || placing) return;
    setPlacing(true);
    setError(null);
    try {
      const lines = Object.entries(items).map(([slug, qty]) => ({ slug, qty }));
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const data = (await res.json()) as { orderId?: string; error?: string };
      if (!res.ok || !data.orderId) {
        setError(data.error ?? "Checkout failed. Try again.");
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
      setItems({});
      setOrderId(data.orderId);
    } finally {
      setPlacing(false);
    }
  }

  if (orderId) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-stone-200 bg-white p-6">
        <span className="text-lg font-semibold">Order {orderId} placed 🎉</span>
        <p className="text-sm text-stone-600">
          This is a demo checkout — nothing ships, but the conversion was recorded.
        </p>
        <Link href="/shop" className="text-sm font-medium text-amber-700 hover:underline">
          Keep browsing →
        </Link>
      </div>
    );
  }

  if (!items || !cart) {
    return <p className="text-sm text-stone-500">Loading your cart…</p>;
  }

  if (cart.itemCount === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-stone-200 bg-white p-6">
        <span className="text-sm text-stone-600">Your cart is empty.</span>
        <Link href="/shop" className="text-sm font-medium text-amber-700 hover:underline">
          Shop the collection →
        </Link>
      </div>
    );
  }

  const bundleItemsRemaining = cart.bundleItemsRemaining;
  const bundleSavingsPreviewCents = cart.bundleSavingsPreviewCents;

  return (
    <div className="flex flex-col gap-4">
      {cart.freeShippingGapCents > 0 ? (
        <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          You&apos;re {dollars(cart.freeShippingGapCents)} away from free shipping.
        </p>
      ) : (
        <p className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
          Free shipping unlocked.
        </p>
      )}

      {bundleItemsRemaining !== undefined &&
        bundleSavingsPreviewCents !== undefined &&
        (bundleItemsRemaining > 0 ? (
          <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
            Add {bundleItemsRemaining} more {bundleItemsRemaining === 1 ? "piece" : "pieces"} for
            10% off the lot — you&apos;d save {dollars(bundleSavingsPreviewCents)}.
          </p>
        ) : (
          <p className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
            Bundle discount unlocked.
          </p>
        ))}

      <div className="flex flex-col divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
        {cart.lines.map((line) => (
          <div key={line.slug} className="flex items-center gap-3 px-4 py-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{line.name}</span>
              <span className="text-xs text-stone-500">{dollars(line.unitCents)} each</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Remove one ${line.name}`}
                onClick={() => setQty(line.slug, line.qty - 1)}
                className="size-6 rounded-full border border-stone-300 text-sm leading-none hover:bg-stone-100"
              >
                −
              </button>
              <span className="w-5 text-center text-sm">{line.qty}</span>
              <button
                type="button"
                aria-label={`Add one ${line.name}`}
                onClick={() => {
                  trevo?.track("cart_quantity_increased", {
                    experiment: BUNDLE_PROGRESS_KEY,
                    product: line.slug,
                    qty: line.qty + 1,
                  });
                  setQty(line.slug, line.qty + 1);
                }}
                className="size-6 rounded-full border border-stone-300 text-sm leading-none hover:bg-stone-100"
              >
                +
              </button>
            </div>
            <span className="w-16 text-right text-sm">{dollars(line.lineCents)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-white p-4 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal ({cart.itemCount} items)</span>
          <span>{dollars(cart.subtotalCents)}</span>
        </div>
        {cart.bundleDiscountCents > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Bundle discount</span>
            <span>−{dollars(cart.bundleDiscountCents)}</span>
          </div>
        )}
        <div className="flex justify-between text-stone-600">
          <span>Shipping</span>
          <span>{cart.shippingCents === 0 ? "Free" : dollars(cart.shippingCents)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-stone-100 pt-2 font-semibold">
          <span>Total</span>
          <span>{dollars(cart.totalCents)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={() => void checkout()}
        disabled={placing}
        className="rounded-full bg-amber-700 px-6 py-3 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
      >
        {placing ? "Placing order…" : "Place order"}
      </button>
    </div>
  );
}
