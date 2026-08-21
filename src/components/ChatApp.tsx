"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  conversationUpdated,
  fetchConversations,
  messageReceived,
  resetChat,
  selectConversation,
  setSocketConnected,
  setSocketError,
  setTypingUser,
  userProfileUpdated,
  userPresenceChanged,
  batchPresenceSynced,
} from "@/features/chat/chatSlice";
import { logout, restoreSession } from "@/features/auth/authSlice";
import { createChatSocket, emitProfileUpdate, emitPresence } from "@/lib/socket";
import { initGlobalPresence, subscribeGlobalPresence } from "@/lib/globalPresence";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ChatShell } from "@/components/ChatShell";
import { LoginScreen } from "@/components/LoginScreen";
import type { RootState } from "@/store/store";

export function ChatApp() {
  const dispatch = useAppDispatch();
  const { token, user, restoring, status } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversationId } = useAppSelector(
    (state) => state.chat,
  );
  const socketRef = useRef<Socket | null>(null);
  const typingTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    dispatch(restoreSession()).finally(() => setBooted(true));
  }, [dispatch]);

  // Presence heartbeat & profile broadcast
  useEffect(() => {
    if (!token || !user) return;

    dispatch(fetchConversations());
    // Broadcast updated profile across connected peers
    emitProfileUpdate(user._id, user.name, user.phone);

    // Initial presence broadcast & heartbeat
    emitPresence(user._id, true);
    dispatch(userPresenceChanged({ userId: user._id, isOnline: true }));

    const sendHeartbeat = () => {
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, isOnline: true }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.onlineUsers && Array.isArray(data.onlineUsers)) {
            dispatch(batchPresenceSynced(data.onlineUsers));
          }
        })
        .catch(() => {});
    };

    sendHeartbeat();

    // Periodic heartbeat every 15s
    const heartbeatInterval = setInterval(sendHeartbeat, 15000);

    const handleUnload = () => {
      navigator.sendBeacon?.(
        "/api/presence",
        JSON.stringify({ userId: user._id, isOnline: false }),
      );
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [dispatch, token, user]);

  // Socket.io connection lifecycle
  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      dispatch(setSocketConnected(false));
      return;
    }

    socketRef.current?.disconnect();
    socketRef.current = createChatSocket(token, {
      onMessage: (message) => {
        dispatch(messageReceived(message));
        // If conversation is not in list yet, refresh conversations
        dispatch((_dispatch, getState) => {
          const state = getState() as RootState;
          if (!state.chat.conversations.some((c) => c._id === message.conversation)) {
            _dispatch(fetchConversations());
          }
        });
      },
      onConversation: (conversation) => {
        dispatch(conversationUpdated(conversation));
        dispatch(fetchConversations());
      },
      onTyping: (payload) => {
        dispatch(setTypingUser(payload));
        if (payload.isTyping) {
          // Auto-expire typing indicator after 3.5s if no further typing events arrive
          const timerKey = `${payload.conversationId}_${payload.userId}`;
          if (typingTimersRef.current[timerKey]) {
            clearTimeout(typingTimersRef.current[timerKey]);
          }
          typingTimersRef.current[timerKey] = setTimeout(() => {
            dispatch(setTypingUser({ ...payload, isTyping: false }));
            delete typingTimersRef.current[timerKey];
          }, 3500);
        }
      },
      onProfileUpdate: (payload) => {
        dispatch(userProfileUpdated(payload));
      },
      onPresence: (payload) => {
        dispatch(userPresenceChanged(payload));
      },
      onBatchPresence: (users) => {
        dispatch(batchPresenceSynced(users));
      },
      onStatus: (connected) => dispatch(setSocketConnected(connected)),
      onError: (message) => dispatch(setSocketError(message)),
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [dispatch, token]);

  // Global SSE listener for real-time presence and profile updates
  useEffect(() => {
    if (typeof window === "undefined" || !token) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/typing/stream");
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "presence_sync" && Array.isArray(data.onlineUsers)) {
            dispatch(batchPresenceSynced(data.onlineUsers));
          } else if (data.type === "presence" && data.payload) {
            dispatch(userPresenceChanged(data.payload));
          } else if (data.type === "profile_updated" && data.payload) {
            dispatch(userProfileUpdated(data.payload));
          } else if (data.type === "typing" && data.payload) {
            dispatch(setTypingUser(data.payload));
            if (data.payload.isTyping) {
              const timerKey = `${data.payload.conversationId}_${data.payload.userId}`;
              if (typingTimersRef.current[timerKey]) {
                clearTimeout(typingTimersRef.current[timerKey]);
              }
              typingTimersRef.current[timerKey] = setTimeout(() => {
                dispatch(setTypingUser({ ...data.payload, isTyping: false }));
                delete typingTimersRef.current[timerKey];
              }, 3500);
            }
          }
        } catch {
          // Ignore
        }
      };
    } catch {
      // Fallback
    }

    return () => {
      eventSource?.close();
    };
  }, [token, dispatch]);

  // Global Real-Time Presence & Typing Subscriber (100% reliable across Netlify, Vercel & Local)
  useEffect(() => {
    if (!token || !user) return;

    initGlobalPresence(user._id);

    const unsubscribe = subscribeGlobalPresence({
      onTyping: (payload) => {
        dispatch(setTypingUser(payload));
        if (payload.isTyping) {
          const timerKey = `${payload.conversationId}_${payload.userId}`;
          if (typingTimersRef.current[timerKey]) {
            clearTimeout(typingTimersRef.current[timerKey]);
          }
          typingTimersRef.current[timerKey] = setTimeout(() => {
            dispatch(setTypingUser({ ...payload, isTyping: false }));
            delete typingTimersRef.current[timerKey];
          }, 3500);
        }
      },
      onPresence: (payload) => {
        dispatch(userPresenceChanged(payload));
      },
      onProfileUpdate: (payload) => {
        dispatch(userProfileUpdated(payload));
      },
      onConversationUpdate: (conversation) => {
        dispatch(conversationUpdated(conversation));
      },
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, token, user]);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      dispatch(selectConversation(conversations[0]._id));
    }
  }, [conversations, dispatch, selectedConversationId]);

  const showLoading = useMemo(
    () => restoring || (!booted && status !== "authenticated"),
    [booted, restoring, status],
  );

  if (showLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f4ee] px-6 text-[#1d211f]">
        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#2f7d68]" />
          Restoring your chat session
        </div>
      </main>
    );
  }

  if (!token || !user) return <LoginScreen />;

  return (
    <ChatShell
      onLogout={() => {
        if (user) {
          fetch("/api/presence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id, isOnline: false }),
          }).catch(() => {});
        }
        socketRef.current?.disconnect();
        dispatch(resetChat());
        dispatch(logout());
      }}
    />
  );
}
