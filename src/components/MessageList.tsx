"use client";

import { useEffect, useRef, useState, UIEvent, useLayoutEffect } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMessages } from "@/features/chat/chatSlice";
import { formatTime, initials } from "@/lib/format";
import type { Conversation, Message } from "@/lib/types";

interface MessageListProps {
  conversation: Conversation;
}

export function MessageList({ conversation }: MessageListProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { messagesByConversation } = useAppSelector((state) => state.chat);

  const bucket = messagesByConversation[conversation._id] || {
    items: [],
    status: "idle",
    error: null,
    hasMore: false,
  };

  const messages = bucket.items;
  const isLoading = bucket.status === "loading";
  const isLoadingMore = bucket.status === "loadingMore";
  const hasMore = bucket.hasMore;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isScrolledUpRef = useRef(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMessagesCountRef = useRef(0);

  // Fetch messages on mount
  useEffect(() => {
    dispatch(fetchMessages({ conversationId: conversation._id }));
  }, [conversation._id, dispatch]);

  // Handle auto-scroll on new messages
  useLayoutEffect(() => {
    const prevCount = prevMessagesCountRef.current;
    const currentCount = messages.length;
    prevMessagesCountRef.current = currentCount;

    if (currentCount === 0) return;

    if (prevCount === 0) {
      // Initial load: instantly pin to bottom
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
      return;
    }

    if (currentCount > prevCount) {
      const latestMessage = messages[messages.length - 1];
      const isSentByMe = latestMessage.sender === currentUser?._id;

      if (isSentByMe || !isScrolledUpRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, currentUser?._id]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const scrolledUp = distanceFromBottom > 120;

    isScrolledUpRef.current = scrolledUp;
    setShowScrollButton(scrolledUp);

    if (!scrolledUp) {
      setUnreadCount(0);
    }
  };

  const handleScrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    isScrolledUpRef.current = false;
    setShowScrollButton(false);
    setUnreadCount(0);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore || messages.length === 0) return;
    const oldestMessage = messages[0];
    dispatch(
      fetchMessages({
        conversationId: conversation._id,
        before: oldestMessage.createdAt,
      }),
    );
  };

  // Find sender name for group chats
  const getSenderName = (senderId: string) => {
    if (conversation.type !== "group") return "";
    const member = conversation.participants.find((p) => p._id === senderId);
    return member?.name || "Unknown member";
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#faf8f5]">
      {/* Scrollable message area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 md:px-6"
      >
        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center pb-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-[#4a524c] shadow-sm hover:bg-[#f2efe9] disabled:opacity-50 transition"
            >
              {isLoadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isLoadingMore ? "Loading older messages..." : "Load earlier messages"}
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && messages.length === 0 && (
          <div className="flex h-full min-h-48 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-[#7a8179]">
              <Loader2 className="h-4 w-4 animate-spin text-[#2f7d68]" />
              Loading conversation history...
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2f7d68]/10 text-[#2f7d68] mb-3">
              💬
            </div>
            <p className="font-medium text-[#2d332f]">No messages yet</p>
            <p className="text-xs text-[#767d75] mt-1 max-w-xs">
              Start the conversation by sending a greeting below.
            </p>
          </div>
        )}

        {/* Message Items */}
        {messages.map((message: Message, index: number) => {
          const isMe = message.sender === currentUser?._id;
          const senderName = getSenderName(message.sender);

          return (
            <div
              key={message._id || index}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}
            >
              {/* Sender Name in Group Chats */}
              {!isMe && conversation.type === "group" && (
                <span className="mb-1 text-xs font-semibold text-[#5a625b] ml-1">
                  {senderName}
                </span>
              )}

              <div
                className={`flex max-w-[80%] items-end gap-2 md:max-w-[70%] ${
                  isMe ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!isMe && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8e4db] text-[11px] font-bold text-[#444d47]">
                    {initials(senderName || "U")}
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all ${
                    isMe
                      ? "rounded-br-sm bg-[#1f5f51] text-white"
                      : "rounded-bl-sm border border-black/5 bg-white text-[#1f2421]"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <div
                    className={`mt-1 flex items-center justify-end text-[10px] ${
                      isMe ? "text-white/70" : "text-[#889087]"
                    }`}
                  >
                    <span>{formatTime(message.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} className="h-px" />
      </div>

      {/* Floating Smart Scroll-to-bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-4 right-6 z-10">
          <button
            onClick={handleScrollToBottom}
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white/95 px-3.5 py-2 text-xs font-medium text-[#1f5f51] shadow-lg backdrop-blur hover:bg-white transition-all transform hover:scale-105 active:scale-95"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span>Latest messages</span>
            {unreadCount > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#1f5f51] px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
