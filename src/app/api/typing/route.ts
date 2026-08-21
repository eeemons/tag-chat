import { NextResponse } from "next/server";
import { getActiveTypers, publishTyping } from "@/lib/typingHub";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, userId, userName, isTyping } = body;

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: "conversationId and userId are required" },
        { status: 400 },
      );
    }

    publishTyping(
      String(conversationId),
      String(userId),
      String(userName || "Someone"),
      Boolean(isTyping),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process typing event" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId query parameter is required" },
      { status: 400 },
    );
  }

  const typers = getActiveTypers(conversationId);
  return NextResponse.json({ typers });
}
