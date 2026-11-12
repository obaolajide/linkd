import { createHash } from "node:crypto";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { parseMessage } from "@/lib/share";

export async function saveMessage(body: unknown) {
  const data = parseMessage(body);
  await connectDB();
  if (data.type === "text") return Message.create(data);

  // Reuse links saved before share support was introduced, too.
  const existing = await Message.findOne({ type: "link", text: data.text });
  if (existing) return existing;
  await Message.init(); // The unique sparse index makes concurrent retries safe.
  const linkKey = createHash("sha256").update(data.text).digest("hex");
  try {
    return await Message.findOneAndUpdate(
      { linkKey },
      { $setOnInsert: { ...data, linkKey } },
      { upsert: true, returnDocument: "after", runValidators: true }
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return Message.findOne({ linkKey });
    throw error;
  }
}
