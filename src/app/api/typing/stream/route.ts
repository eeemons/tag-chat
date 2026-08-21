import { getActiveTypers, subscribeToTyping } from "@/lib/typingHub";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return new Response("Missing conversationId", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial snapshot of active typers
      const initialTypers = getActiveTypers(conversationId);
      const snapshotMessage = `data: ${JSON.stringify({
        type: "snapshot",
        conversationId,
        typers: initialTypers,
      })}\n\n`;
      controller.enqueue(encoder.encode(snapshotMessage));

      // 2. Subscribe to new live typing events
      const unsubscribe = subscribeToTyping(
        conversationId,
        (payload) => {
          try {
            const message = `data: ${JSON.stringify({
              type: "update",
              payload,
            })}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch {
            // Stream might be closed
          }
        },
      );

      // 3. Heartbeat ping every 15 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(pingInterval);
        }
      }, 15000);

      // 4. Handle client abort/disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
