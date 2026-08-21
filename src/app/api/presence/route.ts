import { NextResponse } from "next/server";
import { publishPresence, getOnlineUserIds } from "@/lib/typingHub";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, isOnline = true } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    publishPresence(userId, Boolean(isOnline));

    return NextResponse.json({
      success: true,
      onlineUsers: getOnlineUserIds(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    onlineUsers: getOnlineUserIds(),
  });
}
