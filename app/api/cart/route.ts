import { NextRequest, NextResponse } from "next/server";
import { priceCart, type CartLine } from "@/lib/cart";
import { trevoServer } from "@/lib/trevo-server";

function parseLines(body: unknown): CartLine[] | null {
  if (typeof body !== "object" || body === null) return null;
  const lines = (body as { lines?: unknown }).lines;
  if (!Array.isArray(lines)) return null;
  const parsed: CartLine[] = [];
  for (const entry of lines) {
    if (typeof entry !== "object" || entry === null) return null;
    const { slug, qty } = entry as { slug?: unknown; qty?: unknown };
    if (typeof slug !== "string" || !Number.isFinite(qty)) return null;
    parsed.push({ slug, qty: Number(qty) });
  }
  return parsed;
}

// Prices the cart server-side: bundle discount and the free-shipping decision
// are commerce rules the client only ever displays.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const lines = parseLines(body);
  if (!lines) {
    return NextResponse.json(
      { error: "Send { lines: [{ slug, qty }] } to price a cart." },
      { status: 400 },
    );
  }

  const cart = priceCart(lines);

  const trevo = trevoServer();
  const anonymousId = req.cookies.get("trevo_id")?.value;
  if (trevo && anonymousId && cart.itemCount > 0) {
    trevo.track("cart_priced", { anonymousId }, {
      items: cart.itemCount,
      value: cart.totalCents / 100,
      freeShipping: cart.shippingCents === 0,
    });
    await trevo.flush().catch(() => {});
  }

  return NextResponse.json(cart);
}
