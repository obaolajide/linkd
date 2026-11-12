export class InvalidMessageError extends Error {}

export function webUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

// Chrome and other Android apps sometimes put the URL in text rather than url.
export function sharedUrl(input: { url?: string; text?: string; title?: string }): string {
  for (const value of [input.url, input.text, input.title]) {
    if (!value) continue;
    const direct = webUrl(value);
    if (direct) return direct;
    for (const match of value.matchAll(/https?:\/\/[^\s<>"\u201c\u201d]+/gi)) {
      const candidate = webUrl(match[0].replace(/[.,;!?)\]]+$/, ""));
      if (candidate) return candidate;
    }
  }
  throw new InvalidMessageError("No valid webpage URL was shared. Share an http or https link.");
}

export function parseMessage(body: unknown) {
  if (!body || typeof body !== "object") throw new InvalidMessageError("Message is required.");
  const data = body as Record<string, unknown>;
  if (data.source === "share") {
    for (const field of ["url", "title", "text"]) {
      if (data[field] !== undefined && (typeof data[field] !== "string" || data[field].length > 16000)) {
        throw new InvalidMessageError("Shared content is invalid or too long.");
      }
    }
    const input = data as { url?: string; title?: string; text?: string };
    return { text: sharedUrl(input), type: "link" as const, title: input.title?.trim(), sharedText: input.text?.trim() };
  }
  if (typeof data.text !== "string" || !data.text.trim() || data.text.length > 16000 || !["link", "text"].includes(String(data.type))) {
    throw new InvalidMessageError("A message and valid type are required (maximum 16000 characters).");
  }
  const text = data.text.trim();
  if (data.type === "link") {
    const url = webUrl(text);
    if (!url) throw new InvalidMessageError("Enter a valid http or https link.");
    return { text: url, type: "link" as const };
  }
  return { text, type: "text" as const };
}
