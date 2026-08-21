"use client";

import { useEffect, useRef, useState, UIEvent, useLayoutEffect } from "react";
import { ArrowDown, CheckCheck, Check, Loader2, Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMessages,
  markMessageSeen,
  setTypingUser,
  userPresenceChanged,
  batchPresenceSynced,
} from "@/features/chat/chatSlice";
import { formatDateTime, formatTime, initials } from "@/lib/format";
import { getAvatarGradient } from "@/lib/colors";
import { useChatBackground } from "@/hooks/useChatBackground";
import { replaceEmoticonsWithEmoji, isOnlyEmojis } from "@/lib/emojis";
import type { Conversation, Message } from "@/lib/types";

interface MessageListProps {
  conversation: Conversation;
}

export function MessageList({ conversation }: MessageListProps) {
  const { currentBackground } = useChatBackground();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { messagesByConversation, typingByConversation, readReceipts } = useAppSelector(
    (state) => state.chat,
  );

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
  const [tappedMessageId, setTappedMessageId] = useState<string | null>(null);
  const prevMessagesCountRef = useRef(0);

  // Fetch messages on mount
  useEffect(() => {
    dispatch(fetchMessages({ conversationId: conversation._id }));
  }, [conversation._id, dispatch]);

  // Subscribe to real-time SSE typing stream for this conversation
  useEffect(() => {
    if (typeof window === "undefined" || !conversation._id) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(
        `/api/typing/stream?conversationId=${encodeURIComponent(conversation._id)}`,
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "presence_sync" && Array.isArray(data.onlineUsers)) {
            dispatch(batchPresenceSynced(data.onlineUsers));
          } else if (data.type === "presence" && data.payload) {
            dispatch(userPresenceChanged(data.payload));
          } else if (data.type === "snapshot" && Array.isArray(data.typers)) {
            data.typers.forEach((t: { userId: string; userName: string }) => {
              dispatch(
                setTypingUser({
                  conversationId: conversation._id,
                  userId: t.userId,
                  userName: t.userName,
                  isTyping: true,
                }),
              );
            });
          } else if ((data.type === "typing" || data.type === "update") && data.payload) {
            dispatch(setTypingUser(data.payload));
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // EventSource fallback
    }

    return () => {
      eventSource?.close();
    };
  }, [conversation._id, dispatch]);

  // Typing users for this conversation (ignoring current user)
  const activeTypers = (typingByConversation[conversation._id] || []).filter(
    (typer) => typer.userId !== currentUser?._id,
  );

  // Handle auto-scroll on new messages or typing change
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
  }, [messages, currentUser?._id, activeTypers.length]);

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

  const handleToggleMessageDetails = (messageId: string) => {
    if (tappedMessageId === messageId) {
      setTappedMessageId(null);
    } else {
      setTappedMessageId(messageId);
      // Mark seen locally
      dispatch(markMessageSeen({ messageId }));
    }
  };

  // Find sender name for group chats
  const getSenderName = (senderId: string) => {
    if (conversation.type !== "group") return "";
    const member = conversation.participants?.find((p) => p._id === senderId);
    return member?.name || "Unknown member";
  };

  return (
    <div
      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden transition-colors duration-250 ${
        currentBackground.isDark ? "text-white" : "text-[#1c221e]"
      }`}
      style={{
        backgroundColor: currentBackground.previewBg,
        backgroundImage: currentBackground.cssPattern.match(/background-image:\s*([^;]+);/)?.[1] || "",
        backgroundSize: currentBackground.cssPattern.match(/background-size:\s*([^;]+);/)?.[1] || "",
        backgroundPosition: currentBackground.cssPattern.match(/background-position:\s*([^;]+);/)?.[1] || "",
        backgroundRepeat: currentBackground.cssPattern.match(/background-repeat:\s*([^;]+);/)?.[1] || "repeat",
      }}
    >
      {/* Scrollable message area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3.5 md:px-6"
      >
        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center pb-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium shadow-xs disabled:opacity-50 transition ${
                currentBackground.isDark
                  ? "bg-[#1d2420] border-white/10 text-white/90 hover:bg-[#252e29]"
                  : "bg-white border-black/10 text-[#4a524c] hover:bg-[#f2efe9]"
              }`}
            >
              {isLoadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2f7d68]" />}
              {isLoadingMore ? "Loading older history..." : "Load earlier messages"}
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && messages.length === 0 && (
          <div className="flex h-full min-h-48 items-center justify-center">
            <div
              className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border shadow-xs ${
                currentBackground.isDark
                  ? "bg-[#1d2420] text-white/90 border-white/10"
                  : "bg-white text-[#7a8179] border-black/5"
              }`}
            >
              <Loader2 className="h-4 w-4 animate-spin text-[#2f7d68]" />
              Loading conversation history...
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-[#2f7d68]/15 to-emerald-100 text-[#2f7d68] mb-3 shadow-inner">
              💬
            </div>
            <p
              className={`font-semibold text-sm ${
                currentBackground.isDark ? "text-white" : "text-[#2d332f]"
              }`}
            >
              No messages yet
            </p>
            <p
              className={`text-xs mt-1 max-w-xs leading-relaxed ${
                currentBackground.isDark ? "text-white/70" : "text-[#767d75]"
              }`}
            >
              Say hello or send a message below to begin this conversation.
            </p>
          </div>
        )}

        {/* Message Items */}
        {messages.map((message: Message, index: number) => {
          const isMe = message.sender === currentUser?._id;
          const senderName = getSenderName(message.sender);
          const isTapped = tappedMessageId === message._id;
          const receipt = readReceipts[message._id];
          const isSeen = Boolean(receipt?.seen || isTapped);
          const seenTime = receipt?.seenAt ? formatTime(receipt.seenAt) : formatTime(message.createdAt);

          return (
            <div
              key={message._id || index}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} group select-none`}
            >
              {/* Sender Name in Group Chats */}
              {!isMe && conversation.type === "group" && (
                <span className="mb-1 text-[11px] font-bold text-[#454e48] ml-2 flex items-center gap-1.5">
                  <span className={`inline-block h-2 w-2 rounded-full bg-gradient-to-r ${getAvatarGradient(senderName)}`} />
                  {senderName}
                </span>
              )}

              <div
                className={`flex max-w-[85%] items-end gap-2 md:max-w-[75%] ${
                  isMe ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!isMe && (
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${getAvatarGradient(
                      senderName || message.sender,
                    )} text-[11px] font-bold shadow-xs`}
                  >
                    {initials(senderName || "U")}
                  </div>
                )}

                <div className="flex flex-col">
                  {(() => {
                    const parsedText = replaceEmoticonsWithEmoji(message.text);
                    const isBigEmoji = isOnlyEmojis(parsedText);

                    return (
                      <div
                        onClick={() => handleToggleMessageDetails(message._id)}
                        className={`cursor-pointer rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-all shadow-xs ${
                          isMe
                            ? "rounded-br-xs bg-gradient-to-br from-[#1d6b59] to-[#124d3f] text-white hover:brightness-105"
                            : currentBackground.isDark
                            ? "rounded-bl-xs border border-white/10 bg-[#1e2521] text-white hover:bg-[#252e29]"
                            : "rounded-bl-xs border border-black/5 bg-white text-[#1f2421] hover:border-black/15"
                        }`}
                      >
                        <p
                          className={`whitespace-pre-wrap break-words ${
                            isBigEmoji ? "text-2xl sm:text-3xl py-1" : ""
                          }`}
                        >
                          {parsedText}
                        </p>
                        <div
                          className={`mt-1.5 flex items-center justify-end gap-1.5 text-[10px] ${
                            isMe ? "text-white/80" : currentBackground.isDark ? "text-white/60" : "text-[#889087]"
                          }`}
                        >
                          <span>{formatTime(message.createdAt)}</span>
                          {isMe && (
                            <span title={isSeen ? `Seen at ${seenTime}` : "Delivered"}>
                              {isSeen ? (
                                <CheckCheck className="h-3.5 w-3.5 text-emerald-200 stroke-[2.5]" />
                              ) : (
                                <Check className="h-3.5 w-3.5 text-white/70" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Tapped Detail Inspector (Seen / Unseen Status & Timestamp) */}
                  {isTapped && (
                    <div
                      className={`mt-1 animate-in fade-in zoom-in-95 duration-150 rounded-xl px-2.5 py-1 text-[10px] font-medium shadow-2xs border ${
                        isMe
                          ? "bg-emerald-950/80 text-emerald-100 border-emerald-800/40 self-end"
                          : "bg-white/95 text-[#525a54] border-black/10 self-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Info className="h-3 w-3 text-emerald-400 shrink-0" />
                        {isMe ? (
                          <span>
                            {isSeen ? `Status: Seen • ${seenTime}` : `Status: Sent • ${formatTime(message.createdAt)}`}
                          </span>
                        ) : (
                          <span>
                            Received: {formatDateTime(message.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-time Typing Bubble */}
        {activeTypers.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 ml-1 py-1">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white text-[10px] font-bold shadow-xs">
              {initials(activeTypers[0].userName)}
            </div>
            <div
              className={`flex items-center gap-2 rounded-2xl rounded-bl-xs border px-3.5 py-2 shadow-xs ${
                currentBackground.isDark
                  ? "bg-[#1e2521] border-white/10 text-white"
                  : "bg-white border-black/5 text-[#5c645e]"
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#2f7d68] [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#2f7d68] [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#2f7d68]" />
              </div>
              <span
                className={`text-[11px] font-medium ${
                  currentBackground.isDark ? "text-white/80" : "text-[#5c645e]"
                }`}
              >
                {activeTypers.length === 1
                  ? `${activeTypers[0].userName} is typing...`
                  : `${activeTypers.length} people are typing...`}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-px" />
      </div>

      {/* Floating Smart Scroll-to-bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-4 right-6 z-10">
          <button
            onClick={handleScrollToBottom}
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white/95 px-3.5 py-2 text-xs font-semibold text-[#1f5f51] shadow-lg backdrop-blur hover:bg-white transition-all transform hover:scale-105 active:scale-95"
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
