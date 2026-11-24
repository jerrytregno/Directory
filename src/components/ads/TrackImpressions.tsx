"use client";

import { useEffect } from "react";

export function TrackImpressions({ ids }: { ids: string[] }) {
  const key = ids.join(",");

  useEffect(() => {
    if (!key) return;
    const storageKey = `blazly-ad:${key}`;
    if (window.sessionStorage.getItem(storageKey) === "1") return;
    window.sessionStorage.setItem(storageKey, "1");
    void fetch("/api/ads/impression", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: key.split(",") }),
    }).catch(() => undefined);
  }, [key]);

  return null;
}
