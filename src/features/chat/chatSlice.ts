import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { chatApi } from "@/lib/api";
import { sortConversations } from "@/lib/format";
import type { Conversation, Message, User } from "@/lib/types";
import type { RootState } from "@/store/store";

type MessagesBucket = {
  items: Message[];
  status: "idle" | "loading" | "loadingMore" | "succeeded" | "error";
  error: string | null;
  hasMore: boolean;
};

export type TypingUser = {
  userId: string;
  userName: string;
  timestamp: number;
};

export type ReadReceipt = {
  seen: boolean;
  seenAt: string;
};

type ChatState = {
  conversations: Conversation[];
  selectedConversationId: string | null;
  conversationsStatus: "idle" | "loading" | "succeeded" | "error";
  conversationsError: string | null;
  messagesByConversation: Record<string, MessagesBucket>;
  searchResults: User[];
  searchStatus: "idle" | "loading" | "succeeded" | "error";
  searchError: string | null;
  actionStatus: "idle" | "loading" | "error";
  actionError: string | null;
  socketConnected: boolean;
  socketError: string | null;
  typingByConversation: Record<string, TypingUser[]>;
  readReceipts: Record<string, ReadReceipt>;
  unreadByConversation: Record<string, number>;
};

const initialState: ChatState = {
  conversations: [],
  selectedConversationId: null,
  conversationsStatus: "idle",
  conversationsError: null,
  messagesByConversation: {},
  searchResults: [],
  searchStatus: "idle",
  searchError: null,
  actionStatus: "idle",
  actionError: null,
  socketConnected: false,
  socketError: null,
  typingByConversation: {},
  readReceipts: {},
  unreadByConversation: {},
};

function tokenFromState(state: RootState) {
  const token = state.auth.token;
  if (!token) throw new Error("You need to be logged in first.");
  return token;
}

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { getState }) => {
    const token = tokenFromState(getState() as RootState);
    const response = await chatApi.listConversations(token);
    return response.data;
  },
);

export const searchUsers = createAsyncThunk(
  "chat/searchUsers",
  async (query: string, { getState }) => {
    const token = tokenFromState(getState() as RootState);
    return chatApi.searchUsers(token, query.trim());
  },
);

export const startDirectConversation = createAsyncThunk(
  "chat/startDirectConversation",
  async (userId: string, { dispatch, getState }) => {
    const token = tokenFromState(getState() as RootState);
    const response = await chatApi.startDirectConversation(token, userId);
    await dispatch(fetchConversations());
    return response._id;
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (
    payload: { conversationId: string; before?: string; limit?: number },
    { getState },
  ) => {
    const token = tokenFromState(getState() as RootState);
    const response = await chatApi.getMessages(
      token,
      payload.conversationId,
      payload.limit ?? 30,
      payload.before,
    );
    return { conversationId: payload.conversationId, before: payload.before, ...response };
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (payload: { conversationId: string; text: string }, { getState }) => {
    const token = tokenFromState(getState() as RootState);
    const text = payload.text.trim();
    if (!text) throw new Error("Write a message first.");
    return chatApi.sendMessage(token, payload.conversationId, text);
  },
);

export const createGroup = createAsyncThunk(
  "chat/createGroup",
  async (
    payload: { name: string; participantIds: string[] },
    { dispatch, getState },
  ) => {
    const token = tokenFromState(getState() as RootState);
    const name = payload.name.trim();
    if (!name) throw new Error("Group name is required.");
    if (payload.participantIds.length < 2) {
      throw new Error("Choose at least two people for a group.");
    }
    const group = await chatApi.createGroup(token, name, payload.participantIds);
    await dispatch(fetchConversations());
    return group;
  },
);

export const addParticipants = createAsyncThunk(
  "chat/addParticipants",
  async (
    payload: { conversationId: string; userIds: string[] },
    { getState },
  ) => {
    const token = tokenFromState(getState() as RootState);
    return chatApi.addParticipants(token, payload.conversationId, payload.userIds);
  },
);

export const removeParticipant = createAsyncThunk(
  "chat/removeParticipant",
  async (
    payload: { conversationId: string; userId: string },
    { getState },
  ) => {
    const token = tokenFromState(getState() as RootState);
    return chatApi.removeParticipant(token, payload.conversationId, payload.userId);
  },
);

export const promoteAdmin = createAsyncThunk(
  "chat/promoteAdmin",
  async (
    payload: { conversationId: string; userId: string },
    { getState },
  ) => {
    const token = tokenFromState(getState() as RootState);
    return chatApi.promoteAdmin(token, payload.conversationId, payload.userId);
  },
);

export const renameGroup = createAsyncThunk(
  "chat/renameGroup",
  async (
    payload: { conversationId: string; name: string },
    { getState },
  ) => {
    const token = tokenFromState(getState() as RootState);
    const name = payload.name.trim();
    if (!name) throw new Error("Group name is required.");
    return chatApi.renameGroup(token, payload.conversationId, name);
  },
);

function emptyBucket(): MessagesBucket {
  return {
    items: [],
    status: "idle",
    error: null,
    hasMore: false,
  };
}

function mergeMessages(existing: Message[], incoming: Message[]) {
  const byId = new Map<string, Message>();
  [...existing, ...incoming].forEach((message) => {
    if (message && message._id) {
      byId.set(message._id, message);
    }
  });
  return [...byId.values()].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
  );
}

function upsertConversation(state: ChatState, conversation: Conversation) {
  const index = state.conversations.findIndex((item) => item._id === conversation._id);
  if (index >= 0) {
    state.conversations[index] = {
      ...state.conversations[index],
      ...conversation,
    } as Conversation;
  } else {
    state.conversations.unshift(conversation);
  }
  state.conversations.sort(sortConversations);
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    selectConversation(state, action: PayloadAction<string | null>) {
      state.selectedConversationId = action.payload;
      if (action.payload) {
        state.unreadByConversation[action.payload] = 0;
      }
    },
    clearUnread(state, action: PayloadAction<string>) {
      state.unreadByConversation[action.payload] = 0;
    },
    clearSearch(state) {
      state.searchResults = [];
      state.searchStatus = "idle";
      state.searchError = null;
    },
    clearActionError(state) {
      state.actionError = null;
      state.actionStatus = "idle";
    },
    setSocketConnected(state, action: PayloadAction<boolean>) {
      state.socketConnected = action.payload;
      if (action.payload) state.socketError = null;
    },
    setSocketError(state, action: PayloadAction<string | null>) {
      state.socketError = action.payload;
    },
    setTypingUser(
      state,
      action: PayloadAction<{
        conversationId: string;
        userId: string;
        userName?: string;
        isTyping: boolean;
      }>,
    ) {
      const { conversationId, userId, userName = "Someone", isTyping } = action.payload;
      const currentList = state.typingByConversation[conversationId] || [];
      const filtered = currentList.filter((item) => item.userId !== userId);

      if (isTyping) {
        state.typingByConversation[conversationId] = [
          ...filtered,
          { userId, userName, timestamp: Date.now() },
        ];
      } else {
        state.typingByConversation[conversationId] = filtered;
      }
    },
    markMessageSeen(
      state,
      action: PayloadAction<{ messageId: string; seenAt?: string }>,
    ) {
      const { messageId, seenAt = new Date().toISOString() } = action.payload;
      state.readReceipts[messageId] = {
        seen: true,
        seenAt,
      };
    },
    messageReceived(state, action: PayloadAction<Message>) {
      const message = action.payload;
      const bucket =
        state.messagesByConversation[message.conversation] ?? emptyBucket();
      bucket.items = mergeMessages(bucket.items, [message]);
      bucket.status = "succeeded";
      state.messagesByConversation[message.conversation] = bucket;

      // Increment unread count if user is not currently focused on this conversation
      if (state.selectedConversationId !== message.conversation) {
        state.unreadByConversation[message.conversation] =
          (state.unreadByConversation[message.conversation] || 0) + 1;
      }

      const conversation = state.conversations.find(
        (item) => item._id === message.conversation,
      );
      if (conversation) {
        conversation.lastMessage = {
          text: message.text,
          sender: message.sender,
          createdAt: message.createdAt,
        };
        conversation.updatedAt = message.createdAt;
        state.conversations.sort(sortConversations);
      }
    },
    conversationUpdated(state, action: PayloadAction<Conversation>) {
      upsertConversation(state, action.payload);
    },
    resetChat() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = "loading";
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.sort(sortConversations);
        state.conversationsStatus = "succeeded";
        if (
          state.selectedConversationId &&
          !state.conversations.some((item) => item._id === state.selectedConversationId)
        ) {
          state.selectedConversationId = null;
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsStatus = "error";
        state.conversationsError =
          action.error.message ?? "Unable to load conversations.";
      })
      .addCase(searchUsers.pending, (state) => {
        state.searchStatus = "loading";
        state.searchError = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.searchStatus = "succeeded";
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchStatus = "error";
        state.searchError =
          action.error.message ?? "Unable to search users right now.";
      })
      .addCase(startDirectConversation.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(startDirectConversation.fulfilled, (state, action) => {
        state.actionStatus = "idle";
        state.selectedConversationId = action.payload;
        state.unreadByConversation[action.payload] = 0;
      })
      .addCase(startDirectConversation.rejected, (state, action) => {
        state.actionStatus = "error";
        state.actionError = action.error.message ?? "Unable to start conversation.";
      })
      .addCase(fetchMessages.pending, (state, action) => {
        const id = action.meta.arg.conversationId;
        const bucket = state.messagesByConversation[id] ?? emptyBucket();
        bucket.status = action.meta.arg.before ? "loadingMore" : "loading";
        bucket.error = null;
        state.messagesByConversation[id] = bucket;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const bucket =
          state.messagesByConversation[action.payload.conversationId] ?? emptyBucket();
        bucket.items = action.payload.before
          ? mergeMessages(action.payload.messages, bucket.items)
          : mergeMessages(bucket.items, action.payload.messages);
        bucket.hasMore = action.payload.hasMore;
        bucket.status = "succeeded";
        bucket.error = null;
        state.messagesByConversation[action.payload.conversationId] = bucket;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const id = action.meta.arg.conversationId;
        const bucket = state.messagesByConversation[id] ?? emptyBucket();
        bucket.status = "error";
        bucket.error = action.error.message ?? "Unable to load messages.";
        state.messagesByConversation[id] = bucket;
      })
      .addCase(sendMessage.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.actionStatus = "idle";
        chatSlice.caseReducers.messageReceived(state, {
          type: "chat/messageReceived",
          payload: action.payload,
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.actionStatus = "error";
        state.actionError = action.error.message ?? "Unable to send message.";
      })
      .addCase(createGroup.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.actionStatus = "idle";
        upsertConversation(state, action.payload);
        state.selectedConversationId = action.payload._id;
        state.unreadByConversation[action.payload._id] = 0;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.actionStatus = "error";
        state.actionError = action.error.message ?? "Unable to create group.";
      })
      .addMatcher(
        (action) =>
          [
            addParticipants.pending.type,
            removeParticipant.pending.type,
            promoteAdmin.pending.type,
            renameGroup.pending.type,
          ].includes(action.type),
        (state) => {
          state.actionStatus = "loading";
          state.actionError = null;
        },
      )
      .addMatcher(
        (action): action is PayloadAction<Conversation> =>
          [
            addParticipants.fulfilled.type,
            removeParticipant.fulfilled.type,
            promoteAdmin.fulfilled.type,
            renameGroup.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.actionStatus = "idle";
          upsertConversation(state, action.payload);
        },
      )
      .addMatcher(
        (action) =>
          [
            addParticipants.rejected.type,
            removeParticipant.rejected.type,
            promoteAdmin.rejected.type,
            renameGroup.rejected.type,
          ].includes(action.type),
        (state, action: { error?: { message?: string } }) => {
          state.actionStatus = "error";
          state.actionError =
            action.error?.message ?? "Unable to update the group.";
        },
      );
  },
});

export const {
  selectConversation,
  clearUnread,
  clearSearch,
  clearActionError,
  setSocketConnected,
  setSocketError,
  setTypingUser,
  markMessageSeen,
  messageReceived,
  conversationUpdated,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
