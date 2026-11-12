import { Suspense } from "react";
import ShareReceiver from "@/components/ShareReceiver";

export const metadata = {
  title: "Save to Linked",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};

export default function SharePage() {
  return <Suspense fallback={<p>Receiving shared link…</p>}><ShareReceiver /></Suspense>;
}
