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
  const [status, setStatus] = useState<"saving" | "saved" | "error">("saving");
  const [error, setError] = useState("");

  const save = useCallback(async () => {
    setStatus("saving");
    try {
      sharedUrl(JSON.parse(payload));
      const response = await fetch("/api/messages", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: payload,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this link.");
      setStatus("saved");
      // Remove shared content from the current history entry after a successful save.
      window.history.replaceState(null, "", "/share");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Check your connection and retry.");
      setStatus("error");
    }
  }, [payload]);

  useEffect(() => {
    if (started.current !== null) return;
    started.current = payload;
    void save();
  }, [payload, save]);

  return (
    <main style={{ maxWidth: 560, margin: "48px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Save to Linked</h1>
      <div role="status" aria-live="polite">
        {status === "saving" && <p>Saving your link…</p>}
        {status === "saved" && <p>Link saved. It is available in your inbox on every device.</p>}
        {status === "error" && <><p>{error}</p><button onClick={save}>Retry</button></>}
      </div>
      <p><Link href="/">Open inbox</Link></p>
    </main>
  );
}
