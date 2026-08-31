"use client";

import Link from "next/link";
import { useTrevo } from "@trevosdk/react";

export default function TrackedCta({
  href,
  event,
  placement,
  variant = "solid",
  className,
  children,
}: {
  href: string;
  event: string;
  placement: string;
  variant?: "solid" | "light";
  className?: string;
  children: React.ReactNode;
}) {
  const trevo = useTrevo();
  const cls =
    className ??
    (variant === "light"
      ? "rounded-full bg-white px-6 py-3 font-medium text-indigo-700 hover:bg-indigo-50"
      : "rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700");
  return (
    <Link href={href} className={cls} onClick={() => trevo?.track(event, { placement })}>
      {children}
    </Link>
  );
}
