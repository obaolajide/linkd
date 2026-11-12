// Network only: never cache inbox data, shared URLs, or API responses.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => new Response(
      '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Linked is offline</title><body><h1>You are offline</h1><p>Reconnect, then reload this page to retry your share.</p></body></html>',
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 }
    )));
  }
});
