import { getActiveTypers, getOnlineUserIds, subscribeToEvents } from "@/lib/typingHub";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial presence snapshot
      const onlineUsers = getOnlineUserIds();
      const presenceSyncMessage = `data: ${JSON.stringify({
        type: "presence_sync",
        onlineUsers,
      })}\n\n`;
      controller.enqueue(encoder.encode(presenceSyncMessage));

      // 2. Send initial snapshot of active typers if in a conversation
      if (conversationId) {
        const initialTypers = getActiveTypers(conversationId);
        const snapshotMessage = `data: ${JSON.stringify({
          type: "snapshot",
          conversationId,
          typers: initialTypers,
        })}\n\n`;
        controller.enqueue(encoder.encode(snapshotMessage));
      }

      // 3. Subscribe to live events (typing + profile updates + presence)
      const unsubscribe = subscribeToEvents(conversationId, (data) => {
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch {
          // Stream might be closed
        }
      });

      // 4. Heartbeat ping every 15 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(pingInterval);
        }
      }, 15000);

      // 5. Handle client abort/disconnect
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
