"use client";

import { useEffect, useRef } from "react";
import { useTrevo } from "@trevosdk/react";

// Fires one named view event per mount — the funnel's page-level steps.
export default function PageView({ event }: { event: string }) {
  const trevo = useTrevo();
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trevo?.track(event);
  }, [trevo, event]);
  return null;
}
