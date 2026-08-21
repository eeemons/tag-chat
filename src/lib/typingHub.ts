export type HubTypingUser = {
  userId: string;
  userName: string;
  updatedAt: number;
};

type TypingListener = (payload: {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}) => void;

// Maintain global state across Next.js dev reloads
declare global {
  var __tagChatTypingSubscribers: Map<string, Set<TypingListener>> | undefined;
  var __tagChatActiveTypers: Map<string, Map<string, HubTypingUser>> | undefined;
}

const subscribers =
  globalThis.__tagChatTypingSubscribers ??
  (globalThis.__tagChatTypingSubscribers = new Map<string, Set<TypingListener>>());

const activeTypers =
  globalThis.__tagChatActiveTypers ??
  (globalThis.__tagChatActiveTypers = new Map<string, Map<string, HubTypingUser>>());

export function publishTyping(
  conversationId: string,
  userId: string,
  userName: string,
  isTyping: boolean,
) {
  let convMap = activeTypers.get(conversationId);
  if (!convMap) {
    convMap = new Map();
    activeTypers.set(conversationId, convMap);
  }

  if (isTyping) {
    convMap.set(userId, {
      userId,
      userName,
      updatedAt: Date.now(),
    });
  } else {
    convMap.delete(userId);
  }

  // Notify active stream subscribers for this conversation
  const convSubscribers = subscribers.get(conversationId);
  if (convSubscribers && convSubscribers.size > 0) {
    const payload = { conversationId, userId, userName, isTyping };
    convSubscribers.forEach((listener) => {
      try {
        listener(payload);
      } catch {
        // Listener error ignored
      }
    });
  }
}

export function getActiveTypers(conversationId: string): HubTypingUser[] {
  const convMap = activeTypers.get(conversationId);
  if (!convMap) return [];

  const now = Date.now();
  const valid: HubTypingUser[] = [];
  convMap.forEach((user, key) => {
    // Expire older than 4 seconds
    if (now - user.updatedAt < 4000) {
      valid.push(user);
    } else {
      convMap.delete(key);
    }
  });

  return valid;
}

export function subscribeToTyping(
  conversationId: string,
  listener: TypingListener,
): () => void {
  let convSubscribers = subscribers.get(conversationId);
  if (!convSubscribers) {
    convSubscribers = new Set();
    subscribers.set(conversationId, convSubscribers);
  }

  convSubscribers.add(listener);

  return () => {
    convSubscribers?.delete(listener);
    if (convSubscribers && convSubscribers.size === 0) {
      subscribers.delete(conversationId);
    }
  };
}
