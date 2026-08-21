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

  socket.on("connect", () => handlers.onStatus(true));
  socket.on("disconnect", () => handlers.onStatus(false));
  socket.on("connect_error", (error) => {
    handlers.onStatus(false);
    handlers.onError(error.message);
  });
  socket.on("message:new", (payload) => {
    const message = normalizeMessage(payload);
    if (message) handlers.onMessage(message);
  });
  socket.on("conversation:updated", (payload) => {
    const conversation = normalizeConversation(payload);
    if (conversation) handlers.onConversation(conversation);
  });

  return socket;
}

function normalizeMessage(payload: unknown): Message | null {
  if (!payload || typeof payload !== "object") return null;
  const maybe = payload as Partial<Message> & { message?: Message; data?: Message };
  const source = maybe.message ?? maybe.data ?? maybe;

  if (!source._id || !source.conversation || !source.sender || !source.createdAt) {
    return null;
  }

  return source as Message;
}

function normalizeConversation(payload: unknown): Conversation | null {
  if (!payload || typeof payload !== "object") return null;
  const maybe = payload as Partial<Conversation> & {
    conversation?: Conversation;
    data?: Conversation;
  };
  const source = maybe.conversation ?? maybe.data ?? maybe;

  if (!source._id || !("type" in source)) return null;
  return source as Conversation;
}

