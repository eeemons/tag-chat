"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Users, MessageSquarePlus, MessageSquare, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectConversation } from "@/features/chat/chatSlice";
import {
  conversationTitle,
  conversationTimestamp,
  formatDateTime,
  initials,
  lastMessageText,
} from "@/lib/format";
import { getAvatarGradient } from "@/lib/colors";
import type { Conversation } from "@/lib/types";

interface ConversationSidebarProps {
  compact?: boolean;
  onCreateGroup: () => void;
  onStartChat: () => void;
  onSelectConversation?: () => void;
}

export function ConversationSidebar({
  compact = false,
  onCreateGroup,
  onStartChat,
  onSelectConversation,
}: ConversationSidebarProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversationId, conversationsStatus } =
    useAppSelector((state) => state.chat);
  const [filterQuery, setFilterQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce filter query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filterQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [filterQuery]);

  const filteredConversations = useMemo(() => {
    if (!debouncedQuery.trim()) return conversations;
    const query = debouncedQuery.toLowerCase();
    return conversations.filter((c) => {
      const title = conversationTitle(c, currentUser).toLowerCase();
      const lastMsg = lastMessageText(c.lastMessage).toLowerCase();
      return title.includes(query) || lastMsg.includes(query);
    });
  }, [conversations, debouncedQuery, currentUser]);

  const isLoading = conversationsStatus === "loading";

  const handleSelect = (conversationId: string) => {
    dispatch(selectConversation(conversationId));
    if (onSelectConversation) {
      onSelectConversation();
    }
  };

  return (
    <div className={`flex h-full flex-col overflow-hidden bg-[#fbfaf6] ${compact ? "w-full" : ""}`}>
      {/* Sidebar Header */}
      <div className="border-b border-black/10 p-4 bg-white/40">
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#216d5b] to-[#124d3f] text-white shadow-sm shadow-[#216d5b]/30">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#181d1a]">Messages</h1>
              <p className="text-[10px] text-[#717871]">Real-time discussions</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onStartChat}
              className="flex h-8 items-center gap-1 rounded-xl border border-black/10 bg-white px-2.5 text-xs font-semibold text-[#2d342f] shadow-2xs hover:border-[#2f7d68]/40 hover:text-[#2f7d68] transition"
              title="Start 1-on-1 chat"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>Direct</span>
            </button>
            <button
              onClick={onCreateGroup}
              className="flex h-8 items-center gap-1 rounded-xl border border-black/10 bg-white px-2.5 text-xs font-semibold text-[#2d342f] shadow-2xs hover:border-[#2f7d68]/40 hover:text-[#2f7d68] transition"
              title="Create new group"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Group</span>
            </button>
          </div>
        </div>

        {/* Search input with debounce & clear */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-[#889087]" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-8 text-xs text-[#1e2320] placeholder:text-[#9fa69e] outline-none focus:border-[#2f7d68] focus:ring-2 focus:ring-[#2f7d68]/15 transition"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#889087] hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && conversations.length === 0 && (
          <div className="p-6 text-center text-xs text-[#7d847c]">
            Loading conversations...
          </div>
        )}

        {!isLoading && filteredConversations.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-xs font-semibold text-[#485049]">
              {filterQuery ? "No matching conversations" : "No conversations yet"}
            </p>
            <p className="mt-1 text-[11px] text-[#7d847c] leading-relaxed">
              {filterQuery
                ? "Try searching for a different name or message."
                : "Start a direct chat or create a group to begin."}
            </p>
          </div>
        )}

        {filteredConversations.map((conv: Conversation) => {
          const isSelected = conv._id === selectedConversationId;
          const isGroup = conv.type === "group";
          const title = conversationTitle(conv, currentUser);
          const lastMsg = lastMessageText(conv.lastMessage);
          const time = formatDateTime(conversationTimestamp(conv));

          return (
            <button
              key={conv._id}
              onClick={() => handleSelect(conv._id)}
              className={`w-full text-left rounded-2xl p-3 transition-all flex items-start gap-3 border ${
                isSelected
                  ? "bg-gradient-to-r from-[#216d5b] to-[#155345] text-white shadow-sm shadow-[#216d5b]/25 border-transparent"
                  : "bg-white/60 hover:bg-white border-black/5 hover:border-black/10 text-[#1c221e]"
              }`}
            >
              {/* Avatar with colorful gradient */}
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold shadow-xs ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : `bg-gradient-to-br ${getAvatarGradient(title)}`
                }`}
              >
                {isGroup ? <Users className="h-4 w-4" /> : initials(title)}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`truncate text-xs font-bold ${
                      isSelected ? "text-white" : "text-[#1d231f]"
                    }`}
                  >
                    {title}
                  </span>
                  <span
                    className={`shrink-0 text-[10px] font-medium ${
                      isSelected ? "text-white/80" : "text-[#889087]"
                    }`}
                  >
                    {time}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`truncate text-[11px] ${
                      isSelected ? "text-white/85 font-normal" : "text-[#6c746d]"
                    }`}
                  >
                    {lastMsg}
                  </p>
                  {isGroup && (
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-gradient-to-r from-emerald-100 to-teal-100 text-[#175244] border border-[#2f7d68]/20"
                      }`}
                    >
                      Group
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
