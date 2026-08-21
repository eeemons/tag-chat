"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type FormEvent } from "react";
import { Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendMessage } from "@/features/chat/chatSlice";
import { emitChatTyping } from "@/lib/socket";

interface MessageInputProps {
  conversationId: string;
  disabled?: boolean;
}

export function MessageInput({ conversationId, disabled }: MessageInputProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { actionStatus, actionError } = useAppSelector((state) => state.chat);
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSending = actionStatus === "loading";
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const stopTyping = useCallback(() => {
    if (isTypingRef.current && currentUser) {
      isTypingRef.current = false;
      emitChatTyping(conversationId, currentUser._id, currentUser.name, false);
    }
  }, [conversationId, currentUser]);

  const handleTextChange = (value: string) => {
    setText(value);

    if (currentUser) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        emitChatTyping(conversationId, currentUser._id, currentUser.name, true);
      }

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      typingTimerRef.current = setTimeout(() => {
        stopTyping();
      }, 2500);
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

    stopTyping();
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    try {
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      await dispatch(sendMessage({ conversationId, text: trimmed })).unwrap();
    } catch {
      // Re-populate text if sending failed
      setText(trimmed);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="border-t border-black/10 bg-white/95 p-3 backdrop-blur md:p-4 shadow-xs">
      {actionError && (
        <div className="mb-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          {actionError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2.5">
        <div className="relative flex-1 rounded-2xl border border-black/15 bg-[#faf8f5] focus-within:border-[#2f7d68] focus-within:ring-2 focus-within:ring-[#2f7d68]/15 transition-all shadow-2xs">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
            disabled={disabled}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-[#1d211f] placeholder:text-[#9ea49d] outline-none disabled:opacity-50 max-h-32 leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isSending || disabled}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#216d5b] to-[#144f41] text-white shadow-md shadow-[#216d5b]/25 transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
