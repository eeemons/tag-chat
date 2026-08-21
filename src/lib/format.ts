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
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function formatDateTime(value?: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function conversationTitle(conversation: Conversation, currentUser?: User | null) {
  if (conversation.type === "group") return conversation.name || "Group";
  return conversation.participant?._id === currentUser?._id
    ? "Direct conversation"
    : conversation.participant?.name ?? "Unknown user";
}

export function conversationSubtitle(conversation: Conversation) {
  if (conversation.type === "group") {
    return `${conversation.participants?.length || 0} members`;
  }
  return conversation.participant?.phone ?? "No phone";
}

export function lastMessageText(lastMessage?: LastMessage) {
  if (!lastMessage || typeof lastMessage !== "object" || !("text" in lastMessage)) {
    return "No messages yet";
  }
  return lastMessage.text || "No messages yet";
}

export function conversationTimestamp(conversation: Conversation): string {
  if (
    conversation.lastMessage &&
    typeof conversation.lastMessage === "object" &&
    "createdAt" in conversation.lastMessage &&
    conversation.lastMessage.createdAt
  ) {
    return String(conversation.lastMessage.createdAt);
  }
  return (
    conversation.updatedAt ||
    ("createdAt" in conversation && typeof conversation.createdAt === "string"
      ? conversation.createdAt
      : "")
  );
}

export function sortConversations(a: Conversation, b: Conversation) {
  const timeA = new Date(conversationTimestamp(a) || 0).getTime();
  const timeB = new Date(conversationTimestamp(b) || 0).getTime();
  return timeB - timeA;
}
