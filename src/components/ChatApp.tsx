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
} from "@/features/chat/chatSlice";
import { logout, restoreSession } from "@/features/auth/authSlice";
import { createChatSocket } from "@/lib/socket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ChatShell } from "@/components/ChatShell";
import { LoginScreen } from "@/components/LoginScreen";

export function ChatApp() {
  const dispatch = useAppDispatch();
  const { token, user, restoring, status } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversationId } = useAppSelector(
    (state) => state.chat,
  );
  const socketRef = useRef<Socket | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    dispatch(restoreSession()).finally(() => setBooted(true));
  }, [dispatch]);

  useEffect(() => {
    if (!token || !user) return;
    dispatch(fetchConversations());
  }, [dispatch, token, user]);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      dispatch(setSocketConnected(false));
      return;
    }

    socketRef.current?.disconnect();
    socketRef.current = createChatSocket(token, {
      onMessage: (message) => dispatch(messageReceived(message)),
      onConversation: (conversation) => dispatch(conversationUpdated(conversation)),
      onStatus: (connected) => dispatch(setSocketConnected(connected)),
      onError: (message) => dispatch(setSocketError(message)),
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [dispatch, token]);

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
        socketRef.current?.disconnect();
        dispatch(resetChat());
        dispatch(logout());
      }}
    />
  );
}

