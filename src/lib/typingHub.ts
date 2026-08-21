export type HubTypingUser = {
  userId: string;
  userName: string;
  updatedAt: number;
};

export type ProfileUpdatePayload = {
  userId: string;
  name: string;
  phone?: string;
};

type StreamListener = (data: {
  type: "typing" | "profile_updated";
  payload: Record<string, unknown>;
}) => void;

// Maintain global state across Next.js dev reloads
declare global {
  var __tagChatStreamSubscribers: Map<string, Set<StreamListener>> | undefined;
  var __tagChatGlobalSubscribers: Set<StreamListener> | undefined;
  var __tagChatActiveTypers: Map<string, Map<string, HubTypingUser>> | undefined;
}

const streamSubscribers =
  globalThis.__tagChatStreamSubscribers ??
  (globalThis.__tagChatStreamSubscribers = new Map<string, Set<StreamListener>>());

const globalSubscribers =
  globalThis.__tagChatGlobalSubscribers ??
  (globalThis.__tagChatGlobalSubscribers = new Set<StreamListener>());

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
  const convSubscribers = streamSubscribers.get(conversationId);
  if (convSubscribers && convSubscribers.size > 0) {
    const data = {
      type: "typing" as const,
      payload: { conversationId, userId, userName, isTyping },
    };
    convSubscribers.forEach((listener) => {
      try {
        listener(data);
      } catch {
        // Listener error ignored
      }
    });
  }
}

export function publishProfileUpdate(userId: string, name: string, phone?: string) {
  const data = {
    type: "profile_updated" as const,
    payload: { userId, name, phone },
  };

  // Broadcast to global subscribers
  globalSubscribers.forEach((listener) => {
    try {
      listener(data);
    } catch {
      // Ignored
    }
  });

  // Also broadcast to all conversation stream subscribers
  streamSubscribers.forEach((subs) => {
    subs.forEach((listener) => {
      try {
        listener(data);
      } catch {
        // Ignored
      }
    });
  });
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

export function subscribeToEvents(
  conversationId: string | null,
  listener: StreamListener,
): () => void {
  if (conversationId) {
    let convSubscribers = streamSubscribers.get(conversationId);
    if (!convSubscribers) {
      convSubscribers = new Set();
      streamSubscribers.set(conversationId, convSubscribers);
    }
    convSubscribers.add(listener);

    return () => {
      convSubscribers?.delete(listener);
      if (convSubscribers && convSubscribers.size === 0) {
        streamSubscribers.delete(conversationId);
      }
    };
  } else {
    globalSubscribers.add(listener);
    return () => {
      globalSubscribers.delete(listener);
    };
  }
}
