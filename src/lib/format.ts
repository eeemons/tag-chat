import type { Conversation, LastMessage, User } from "@/lib/types";

export function initials(name = "?") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatTime(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDateTime(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function conversationTitle(conversation: Conversation, currentUser?: User | null) {
  if (conversation.type === "group") return conversation.name;
  return conversation.participant?._id === currentUser?._id
    ? "Direct conversation"
    : conversation.participant?.name ?? "Unknown user";
}

export function conversationSubtitle(conversation: Conversation) {
  if (conversation.type === "group") {
    return `${conversation.participants.length} members`;
  }
  return conversation.participant?.phone ?? "No phone";
}

export function lastMessageText(lastMessage?: LastMessage) {
  if (!lastMessage || !("text" in lastMessage)) return "No messages yet";
  return lastMessage.text || "Attachment";
}

export function sortConversations(a: Conversation, b: Conversation) {
  return (
    new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
  );
}

