"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { sharedUrl } from "@/lib/share";

export default function ShareReceiver() {
  const params = useSearchParams();
  const payload = JSON.stringify({
    source: "share", url: params.get("url") ?? "",
    title: params.get("title") ?? "", text: params.get("text") ?? "",
  });
  const started = useRef<string | null>(null);
  const hasPayload = Boolean(params.get("url") || params.get("title") || params.get("text"));
  const [status, setStatus] = useState<"saving" | "saved" | "error">("saving");
  const [error, setError] = useState("");

  const save = useCallback(async () => {
    started.current = payload;
    setStatus("saving");
    try {
      sharedUrl(JSON.parse(payload));
      const response = await fetch("/api/messages", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: payload,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not save this link.");
      if (started.current !== payload) return;
      setStatus("saved");
      // Remove shared content from the current history entry after a successful save.
      window.history.replaceState(window.history.state, "", "/share?saved=1");
    } catch (err) {
      if (started.current !== payload) return;
      setError(err instanceof Error ? err.message : "Could not save. Check your connection and retry.");
      setStatus("error");
    }
  }, [payload]);

  useEffect(() => {
    if (!hasPayload || started.current === payload) return;
    started.current = payload;
    void save();
  }, [payload, save, hasPayload]);

  const visibleStatus = hasPayload ? status : params.get("saved") === "1" ? "saved" : "empty";

  return (
    <main style={{ maxWidth: 560, margin: "48px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Save to Linked</h1>
      <div role="status" aria-live="polite">
        {visibleStatus === "saving" && <p>Saving your link…</p>}
        {visibleStatus === "saved" && <p>Link saved. It is available in your inbox on every device.</p>}
        {visibleStatus === "empty" && <p>No link was shared. Open a webpage in Chrome and choose Share → Linked.</p>}
        {visibleStatus === "error" && <><p>{error}</p><button onClick={save}>Retry</button></>}
      </div>
      <p><Link href="/">Open inbox</Link></p>
    </main>
  );
}
