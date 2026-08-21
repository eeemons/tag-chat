import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/api";
import type { Conversation, Message } from "@/lib/types";

type SocketHandlers = {
  onMessage: (message: Message) => void;
  onConversation: (conversation: Conversation) => void;
  onStatus: (connected: boolean) => void;
  onError: (message: string) => void;
};

export function createChatSocket(token: string, handlers: SocketHandlers): Socket {
  const socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

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

  return socket;
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
