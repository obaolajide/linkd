"use client";

import { useEffect } from "react";

export default function PwaRegistration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!window.isSecureContext || !("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
      } catch {
        console.warn("Linked could not register its service worker.");
      }
    };

    void register();
    window.addEventListener("online", register);
    return () => window.removeEventListener("online", register);
  }, []);

  return children;
}
