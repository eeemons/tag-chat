import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/api";
import type { Conversation, Message } from "@/lib/types";

export type TypingPayload = {
  conversationId: string;
  userId: string;
  userName?: string;
  isTyping: boolean;
};

export type ProfileUpdatePayload = {
  userId: string;
  name: string;
  phone?: string;
};

type SocketHandlers = {
  onMessage: (message: Message) => void;
  onConversation: (conversation: Conversation) => void;
  onTyping?: (payload: TypingPayload) => void;
  onProfileUpdate?: (payload: ProfileUpdatePayload) => void;
  onStatus: (connected: boolean) => void;
  onError: (message: string) => void;
};

let activeSocket: Socket | null = null;
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    broadcastChannel = new BroadcastChannel("tag_chat_realtime_channel");
  } catch {
    broadcastChannel = null;
  }
}

export function getChatSocket(): Socket | null {
  return activeSocket;
}

export function createChatSocket(token: string, handlers: SocketHandlers): Socket {
  if (activeSocket) {
    activeSocket.disconnect();
    activeSocket = null;
  }

  const socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  activeSocket = socket;

  socket.on("connect", () => {
    handlers.onStatus(true);
  });

  socket.on("disconnect", () => {
    handlers.onStatus(false);
  });

  socket.on("connect_error", (error) => {
    handlers.onStatus(false);
    handlers.onError(error.message);
  });

  socket.on("message:new", (payload: unknown) => {
    const message = normalizeMessage(payload);
    if (message) {
      // Clear typing for this sender immediately
      if (handlers.onTyping) {
        handlers.onTyping({
          conversationId: message.conversation,
          userId: message.sender,
          isTyping: false,
        });
      }
      handlers.onMessage(message);
    }
  });

  socket.on("conversation:updated", (payload: unknown) => {
    const conversation = normalizeConversation(payload);
    if (conversation) {
      handlers.onConversation(conversation);
    }
  });

  // Typing event listeners for socket events
  const handleTypingEvent = (payload: unknown, defaultIsTyping = true) => {
    if (!payload || typeof payload !== "object") return;
    const raw = payload as Record<string, unknown>;
    const conversationId = String(raw.conversationId || raw.conversation || "");
    const userId = String(raw.userId || raw.sender || raw.user || "");
    const userName = raw.userName ? String(raw.userName) : raw.name ? String(raw.name) : undefined;
    const isTyping = typeof raw.isTyping === "boolean" ? raw.isTyping : defaultIsTyping;

    if (conversationId && userId && handlers.onTyping) {
      handlers.onTyping({
        conversationId,
        userId,
        userName,
        isTyping,
      });
    }
  };

  socket.on("typing", (payload) => handleTypingEvent(payload, true));
  socket.on("typing:start", (payload) => handleTypingEvent(payload, true));
  socket.on("typing:stop", (payload) => handleTypingEvent(payload, false));
  socket.on("user:typing", (payload) => handleTypingEvent(payload, true));

  // Profile update event listeners
  const handleProfileEvent = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return;
    const raw = payload as Record<string, unknown>;
    const userId = String(raw.userId || raw._id || raw.id || "");
    const name = String(raw.name || "");
    const phone = raw.phone ? String(raw.phone) : undefined;

    if (userId && name && handlers.onProfileUpdate) {
      handlers.onProfileUpdate({ userId, name, phone });
    }
  };

  socket.on("user:update", handleProfileEvent);
  socket.on("profile:updated", handleProfileEvent);
  socket.on("user:profile_updated", handleProfileEvent);

  // Cross-tab broadcast listener for instant local multi-user testing
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "typing" && event.data.payload) {
        if (handlers.onTyping) {
          handlers.onTyping(event.data.payload);
        }
      } else if (
        (event.data && event.data.type === "profile_updated") ||
        event.data?.type === "user:profile_updated"
      ) {
        if (event.data.payload && handlers.onProfileUpdate) {
          handlers.onProfileUpdate(event.data.payload);
        }
      }
    };
  }

  return socket;
}

export function emitChatTyping(
  conversationId: string,
  userId: string,
  userName: string,
  isTyping: boolean,
) {
  const payload: TypingPayload = { conversationId, userId, userName, isTyping };

  // 1. Post to Next.js Real-Time Typing Hub (works across all browsers, devices, incognito)
  if (typeof window !== "undefined") {
    fetch("/api/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Ignore network errors
    });
  }

  // 2. Broadcast over local channel (for 0ms cross-tab live sync)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: "typing", payload });
    } catch {
      // Ignore broadcast errors
    }
  }

  // 3. Emit over WebSocket
  if (activeSocket && activeSocket.connected) {
    activeSocket.emit("typing", payload);
    activeSocket.emit(isTyping ? "typing:start" : "typing:stop", payload);
  }
}

export function emitProfileUpdate(userId: string, name: string, phone?: string) {
  const payload: ProfileUpdatePayload = { userId, name, phone };

  // 1. Post to Next.js Real-Time Event Hub
  if (typeof window !== "undefined") {
    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Ignore network errors
    });
  }

  // 2. Broadcast over local channel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: "profile_updated", payload });
    } catch {
      // Ignore
    }
  }

  // 3. Emit over WebSocket
  if (activeSocket && activeSocket.connected) {
    activeSocket.emit("user:update", payload);
    activeSocket.emit("profile:updated", payload);
  }
}

export function normalizeMessage(payload: unknown): Message | null {
  if (!payload || typeof payload !== "object") return null;

  const raw = payload as Record<string, unknown>;
  const source = (raw.message ?? raw.data ?? raw) as Record<string, unknown>;

  const id = source._id || source.id;
  const conversation = source.conversation || source.conversationId;
  const sender = source.sender;
  const text = source.text;
  let createdAt = source.createdAt;

  if (!id || !conversation || !sender) {
    return null;
  }

  // Handle epoch milliseconds vs ISO strings
  if (typeof createdAt === "number") {
    createdAt = new Date(createdAt).toISOString();
  } else if (!createdAt) {
    createdAt = new Date().toISOString();
  } else {
    createdAt = String(createdAt);
  }

  let senderId = String(sender);
  if (typeof sender === "object" && sender !== null) {
    const senderObj = sender as Record<string, unknown>;
    senderId = String(senderObj._id || senderObj.id || "");
  }

  return {
    _id: String(id),
    conversation: String(conversation),
    sender: senderId,
    text: String(text ?? ""),
    createdAt: String(createdAt),
  };
}

export function normalizeConversation(payload: unknown): Conversation | null {
  if (!payload || typeof payload !== "object") return null;

  const raw = payload as Record<string, unknown>;
  const source = (raw.conversation ?? raw.data ?? raw) as Record<string, unknown>;

  const id = source._id || source.id;
  if (!id) return null;

  let updatedAt = source.updatedAt;
  if (typeof updatedAt === "number") {
    updatedAt = new Date(updatedAt).toISOString();
  } else if (!updatedAt) {
    updatedAt = new Date().toISOString();
  }

  return {
    ...source,
    _id: String(id),
    updatedAt: String(updatedAt),
  } as Conversation;
}
