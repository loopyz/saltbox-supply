import type { Metadata } from "next";
import Link from "next/link";
import { getTrevoBootstrap } from "@trevosdk/nextjs";
import { TrevoProvider } from "@trevosdk/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saltbox Supply — housewares that earn their shelf space",
  description:
    "Small-batch kitchen, bath and pantry goods. Free shipping over $60, and a bundle discount when you buy three or more.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const bootstrap = await getTrevoBootstrap();

  return (
    <html lang="en">
      <body className="antialiased bg-stone-50 text-stone-900 min-h-screen flex flex-col">
        <TrevoProvider
          apiKey={process.env.NEXT_PUBLIC_TREVO_API_KEY}
          bootstrap={bootstrap}
        >
          <header className="border-b border-stone-200 bg-white">
            <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-4">
              <Link href="/" className="font-semibold tracking-tight text-stone-900">
                Saltbox<span className="text-amber-700">Supply</span>
              </Link>
              <nav className="flex gap-5 text-sm text-stone-600">
                <Link href="/shop" className="hover:text-stone-900">Shop</Link>
                <Link href="/cart" className="hover:text-stone-900">Cart</Link>
              </nav>
              <Link
                href="/shop"
                className="ml-auto rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-800"
              >
                Shop the collection
              </Link>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-stone-200 bg-white">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 text-xs text-stone-500">
              <span>© 2026 Saltbox Supply</span>
              <span>Free shipping over $60 · 30-day returns</span>
            </div>
          </footer>
        </TrevoProvider>
      </body>
    </html>
  );
}
