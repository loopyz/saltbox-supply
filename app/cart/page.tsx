import { Suspense } from "react";
import CartView from "@/components/cart-view";
import PageView from "@/components/page-view";

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <PageView event="cart_viewed" />
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Your cart</h1>
      <Suspense fallback={<p className="text-sm text-stone-500">Loading your cart…</p>}>
        <CartView />
      </Suspense>
    </div>
  );
}
