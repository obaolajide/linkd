"use client";

import { useEffect } from "react";

export default function PwaRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        console.warn("Linked could not register its service worker.");
      });
    }
  }, []);
  return null;
}
