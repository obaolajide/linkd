import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { saveMessage } from "@/lib/messages";
import { InvalidMessageError } from "@/lib/share";

export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find().sort({ createdAt: -1 });
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const message = await saveMessage(await req.json());
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidMessageError || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
