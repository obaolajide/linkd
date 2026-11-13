"use client";

import { usePwa } from "@/components/PwaRegistration";

export default function AndroidShareSetup() {
  const { status, error, installed, canInstall, install } = usePwa();

  return (
    <section aria-label="Android sharing setup" style={{ padding: "12px 20px", background: "#eff6ff", borderBottom: "1px solid #dbeafe", fontSize: 14 }}>
      <details>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>Set up Android sharing</summary>
        <p>Install Linked from Chrome on your Android phone. Then open a webpage and tap Share → Linked.</p>
        {canInstall && !installed && status === "ready" && (
          <button onClick={install} style={{ padding: "8px 14px", border: 0, borderRadius: 6, color: "white", background: "#2563eb", cursor: "pointer" }}>Install Linked</button>
        )}
        {!installed && !canInstall && <p>In Chrome, open ⋮ → Add to Home screen → Install. Choose Install rather than Create shortcut.</p>}
        {installed && <p>Linked is open as an installed app. Test it from Chrome’s Share menu.</p>}
        <p>If Linked is missing from Share, remove the old Linked installation and install it again from this same address. A previous shortcut may not register for sharing.</p>
        <p role="status">{status === "checking" ? "Preparing app installation…" : status === "ready" ? "App installation files are ready. Android registers sharing when you install Linked." : error}</p>
        {status !== "error" && error && <p role="alert">{error}</p>}
      </details>
    </section>
  );
}
