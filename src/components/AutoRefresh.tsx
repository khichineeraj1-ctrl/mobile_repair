"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Re-reads the page every few seconds so a status change made elsewhere
// (the technician entering a code) shows up without a manual reload.
export default function AutoRefresh({ seconds = 8 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
