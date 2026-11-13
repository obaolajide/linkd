"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaState {
  status: "checking" | "ready" | "error";
  error: string;
  installed: boolean;
  canInstall: boolean;
  install: () => Promise<void>;
}

const PwaContext = createContext<PwaState | null>(null);

export function usePwa() {
  const value = useContext(PwaContext);
  if (!value) throw new Error("PWA setup must be inside PwaRegistration.");
  return value;
}

export default function PwaRegistration({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<PwaState["status"]>("checking");
  const [error, setError] = useState("");
  const [installed, setInstalled] = useState(false);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);

  useEffect(() => {
    let cancelled = false;
    const display = window.matchMedia("(display-mode: standalone)");
    const updateInstalled = () => setInstalled(display.matches);
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const afterInstall = () => {
      setInstalled(true);
      setPrompt(null);
    };
    const register = async () => {
      try {
        if (!window.isSecureContext) throw new Error("Open Linked over HTTPS to enable installation and Android sharing.");
        if (!("serviceWorker" in navigator)) throw new Error("Open Linked in Chrome on Android to set up sharing.");
        await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
        await navigator.serviceWorker.ready;
        if (!cancelled) {
          setStatus("ready");
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(err instanceof Error ? err.message : "Could not prepare Android sharing. Reconnect and reload.");
        }
      }
    };
    updateInstalled();
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", afterInstall);
    window.addEventListener("online", register);
    display.addEventListener("change", updateInstalled);
    void register();
    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", afterInstall);
      window.removeEventListener("online", register);
      display.removeEventListener("change", updateInstalled);
    };
  }, []);

  async function install() {
    if (!prompt) return;
    try {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    } catch {
      setError("Installation could not start. Use Chrome’s menu → Add to Home screen → Install.");
      setPrompt(null);
    }
  }

  return (
    <PwaContext.Provider value={{ status, error, installed, canInstall: prompt !== null, install }}>
      {children}
    </PwaContext.Provider>
  );
}
