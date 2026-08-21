import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/api";
import type { Conversation, Message } from "@/lib/types";

export type TypingPayload = {
  conversationId: string;
  userId: string;
  userName?: string;
  isTyping: boolean;
};

type SocketHandlers = {
  onMessage: (message: Message) => void;
  onConversation: (conversation: Conversation) => void;
  onTyping?: (payload: TypingPayload) => void;
  onStatus: (connected: boolean) => void;
  onError: (message: string) => void;
};

let activeSocket: Socket | null = null;

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
      handlers.onMessage(message);
    }
  });

  socket.on("conversation:updated", (payload: unknown) => {
    const conversation = normalizeConversation(payload);
    if (conversation) {
      handlers.onConversation(conversation);
    }
  });

  // Typing event listeners
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

  return socket;
}

export function emitChatTyping(
  conversationId: string,
  userId: string,
  userName: string,
  isTyping: boolean,
) {
  if (!activeSocket || !activeSocket.connected) return;

  const payload = { conversationId, userId, userName, isTyping };
  activeSocket.emit("typing", payload);
  activeSocket.emit(isTyping ? "typing:start" : "typing:stop", payload);
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
