import { NextRequest, NextResponse } from "next/server";
import { priceCart, type CartLine } from "@/lib/cart";
import { trevoServer } from "@/lib/trevo-server";

// Completes a demo order. Totals are re-priced server-side — the client's
// numbers are never trusted — and the conversion is tracked authoritatively
// with an idempotent insertId so a retry can't double-count revenue.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const lines = Array.isArray((body as { lines?: unknown } | null)?.lines)
    ? ((body as { lines: CartLine[] }).lines ?? [])
    : null;
  if (!lines || lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const cart = priceCart(lines);
  if (cart.itemCount === 0) {
    return NextResponse.json(
      { error: "None of those products exist any more. Refresh the shop and try again." },
      { status: 400 },
    );
  }

  const orderId = `SB-${Date.now().toString(36).toUpperCase()}`;

  const trevo = trevoServer();
  const anonymousId = req.cookies.get("trevo_id")?.value;
  if (trevo && anonymousId) {
    trevo.track(
      "order_completed",
      { anonymousId },
      {
        orderId,
        value: cart.totalCents / 100,
        items: cart.itemCount,
        bundleDiscount: cart.bundleDiscountCents / 100,
        freeShipping: cart.shippingCents === 0,
      },
      { insertId: orderId },
    );
    await trevo.flush().catch(() => {});
  }

  return NextResponse.json({ orderId, totalCents: cart.totalCents });
}
