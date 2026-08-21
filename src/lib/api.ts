import type {
  Conversation,
  LoginResponse,
  Message,
  MessagesResponse,
  User,
} from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://frontend-task-chatapp.onrender.com/api";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  "https://frontend-task-chatapp.onrender.com";

type RequestOptions = {
  token?: string | null;
  body?: unknown;
  method?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string | number;

  constructor(message: string, status: number, code?: string | number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const payload = text ? safeJson(text) : null;

  if (!response.ok) {
    const message =
      payload?.error?.message ??
      payload?.message ??
      `Request failed with ${response.status}`;
    throw new ApiError(message, response.status, payload?.error?.code);
  }

  return payload as T;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export const chatApi = {
  login(phone: string, name: string) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: { phone, name },
    });
  },

  me(token: string) {
    return request<User>("/auth/me", { token });
  },

  searchUsers(token: string, q: string) {
    return request<User[]>(`/users/search?q=${encodeURIComponent(q)}`, {
      token,
    });
  },

  listConversations(token: string) {
    return request<{ data: Conversation[] }>("/conversations", { token });
  },

  startDirectConversation(token: string, userId: string) {
    return request<{ _id: string; participants: string[]; createdAt: string }>(
      "/conversations",
      {
        method: "POST",
        token,
        body: { userId },
      },
    );
  },

  getMessages(token: string, conversationId: string, limit = 30, before?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", before);

    return request<MessagesResponse>(
      `/conversations/${conversationId}/messages?${params.toString()}`,
      { token },
    );
  },

  sendMessage(token: string, conversationId: string, text: string) {
    return request<Message>("/messages", {
      method: "POST",
      token,
      body: { conversationId, text },
    });
  },

  createGroup(token: string, name: string, participantIds: string[]) {
    return request<Conversation>("/conversations/group", {
      method: "POST",
      token,
      body: { name, participantIds },
    });
  },

  addParticipants(token: string, conversationId: string, userIds: string[]) {
    return request<Conversation>(`/conversations/${conversationId}/participants`, {
      method: "POST",
      token,
      body: { userIds },
    });
  },

  removeParticipant(token: string, conversationId: string, userId: string) {
    return request<Conversation>(
      `/conversations/${conversationId}/participants/${userId}`,
      {
        method: "DELETE",
        token,
      },
    );
  },

  promoteAdmin(token: string, conversationId: string, userId: string) {
    return request<Conversation>(`/conversations/${conversationId}/admins`, {
      method: "POST",
      token,
      body: { userId },
    });
  },

  renameGroup(token: string, conversationId: string, name: string) {
    return request<Conversation>(`/conversations/${conversationId}`, {
      method: "PATCH",
      token,
      body: { name },
    });
  },
};

