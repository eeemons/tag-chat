import { NextResponse } from "next/server";
import { publishProfileUpdate } from "@/lib/typingHub";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, phone } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: "userId and name are required" },
        { status: 400 },
      );
    }

    publishProfileUpdate(String(userId), String(name), phone ? String(phone) : undefined);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to publish profile update" },
      { status: 500 },
    );
  }
}
