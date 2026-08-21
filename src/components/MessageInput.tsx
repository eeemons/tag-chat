"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { Send, Smile, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendMessage } from "@/features/chat/chatSlice";
import { emitChatTyping } from "@/lib/socket";
import { replaceEmoticonsWithEmoji } from "@/lib/emojis";

interface MessageInputProps {
  conversationId: string;
  disabled?: boolean;
}

const EMOJI_CATEGORIES = [
  {
    name: "Popular & Smileys",
    emojis: [
      "😀", "😂", "🤣", "😍", "🥰", "😎", "🤩", "🥳",
      "😊", "😉", "😋", "🤔", "🤫", "😏", "😭", "😡",
      "🤯", "🥺", "😴", "😇", "🙃", "🤐", "😬", "🙄",
    ],
  },
  {
    name: "Hands & Gestures",
    emojis: [
      "👍", "👎", "👏", "🙌", "🙏", "✌️", "🤞", "🤙",
      "👋", "👌", "🤝", "💪", "👊", "✊", "👈", "👉",
    ],
  },
  {
    name: "Hearts & Celebration",
    emojis: [
      "❤️", "🔥", "✨", "🎉", "🚀", "💯", "💖", "💕",
      "🌟", "⚡", "🎁", "🏆", "👑", "🎯", "🎈", "🍻",
    ],
  },
  {
    name: "Food & Fun",
    emojis: [
      "☕", "🍕", "🍔", "🍟", "🍿", "🍩", "🍦", "🍪",
      "⚽", "🏀", "🎮", "🎧", "🎵", "📱", "💻", "💡",
    ],
  },
];

export function MessageInput({ conversationId, disabled }: MessageInputProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { actionStatus, actionError } = useAppSelector((state) => state.chat);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const isSending = actionStatus === "loading";
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [text]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

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

  const handleInsertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? text.length;
      const end = textarea.selectionEnd ?? text.length;
      const nextText = text.substring(0, start) + emoji + text.substring(end);
      handleTextChange(nextText);
      // Move cursor after inserted emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 10);
    } else {
      handleTextChange(text + emoji);
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

    stopTyping();
    setShowEmojiPicker(false);
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    const parsed = replaceEmoticonsWithEmoji(trimmed);

    try {
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      await dispatch(sendMessage({ conversationId, text: parsed })).unwrap();
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
    <div className="shrink-0 relative border-t border-black/10 bg-white/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur sm:px-4 sm:py-2.5 shadow-xs">
      {actionError && (
        <div className="mb-1.5 rounded-xl bg-red-50 border border-red-200 px-3 py-1 text-xs text-red-600">
          {actionError}
        </div>
      )}

      {/* Emoji Picker Popup Overlay */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-[calc(100%+8px)] right-3 sm:right-4 z-50 w-[300px] sm:w-[330px] rounded-2xl border border-black/15 bg-white p-3 shadow-2xl animate-modal-in"
        >
          {/* Header & Tabs */}
          <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-2">
            <div className="flex items-center gap-1">
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                    activeTab === idx
                      ? "bg-[#1f5f51] text-white"
                      : "bg-black/5 text-[#5e665e] hover:bg-black/10"
                  }`}
                >
                  {cat.emojis[0]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(false)}
              className="grid h-6 w-6 place-items-center rounded-lg text-[#7c847c] hover:bg-black/5 hover:text-black transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-[11px] font-bold text-[#5c645e] mb-1.5">
            {EMOJI_CATEGORIES[activeTab].name}
          </div>

          {/* Grid of emojis */}
          <div className="grid grid-cols-8 gap-1 max-h-44 overflow-y-auto p-0.5">
            {EMOJI_CATEGORIES[activeTab].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                className="grid h-8 w-8 place-items-center rounded-lg text-lg hover:bg-black/5 hover:scale-120 active:scale-95 transition cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex flex-1 items-center rounded-2xl border border-black/15 bg-[#faf8f5] focus-within:border-[#2f7d68] focus-within:ring-2 focus-within:ring-[#2f7d68]/15 transition-all shadow-2xs">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type here..."
            disabled={disabled}
            className="w-full resize-none bg-transparent pl-3.5 pr-10 py-2 text-xs sm:text-sm text-[#1d211f] placeholder:text-[#9ea49d] outline-none disabled:opacity-50 max-h-28 leading-snug"
          />

          {/* Emoji Toggle Button inside input bar */}
          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={disabled}
            className={`absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-lg transition ${
              showEmojiPicker
                ? "bg-[#1f5f51]/15 text-[#1f5f51]"
                : "text-[#7b837c] hover:bg-black/5 hover:text-[#181d1a]"
            }`}
            title="Choose an emoji"
          >
            <Smile className="h-4 w-4" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || isSending || disabled}
          className="flex h-9 w-9 sm:h-9.5 sm:w-9.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#216d5b] to-[#144f41] text-white shadow-xs transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          title="Send message"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
