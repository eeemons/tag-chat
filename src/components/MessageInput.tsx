"use client";

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent } from "react";
import { Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendMessage } from "@/features/chat/chatSlice";

interface MessageInputProps {
  conversationId: string;
  disabled?: boolean;
}

export function MessageInput({ conversationId, disabled }: MessageInputProps) {
  const dispatch = useAppDispatch();
  const [text, setText] = useState("");
  const { actionStatus, actionError } = useAppSelector((state) => state.chat);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSending = actionStatus === "loading";

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

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
    <div className="border-t border-black/10 bg-white/90 p-3 backdrop-blur md:p-4">
      {actionError && (
        <div className="mb-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600">
          {actionError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="relative flex-1 rounded-2xl border border-black/10 bg-[#faf9f6] focus-within:border-[#2f7d68] focus-within:ring-2 focus-within:ring-[#2f7d68]/15 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Press Enter to send, Shift+Enter for newline)"
            disabled={disabled}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-[#1d211f] placeholder:text-[#9ea49d] outline-none disabled:opacity-50 max-h-32"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isSending || disabled}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1f5f51] text-white shadow-md shadow-[#1f5f51]/20 transition-all hover:bg-[#184c41] hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
