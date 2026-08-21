"use client";

import { useState, useMemo } from "react";
import { Search, Users, MessageSquarePlus, MessageSquare } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectConversation } from "@/features/chat/chatSlice";
import { conversationTitle, formatDateTime, initials, lastMessageText } from "@/lib/format";
import type { Conversation } from "@/lib/types";

interface ConversationSidebarProps {
  compact?: boolean;
  onCreateGroup: () => void;
  onStartChat: () => void;
}

export function ConversationSidebar({
  compact = false,
  onCreateGroup,
  onStartChat,
}: ConversationSidebarProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversationId, conversationsStatus } =
    useAppSelector((state) => state.chat);
  const [filterQuery, setFilterQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!filterQuery.trim()) return conversations;
    const query = filterQuery.toLowerCase();
    return conversations.filter((c) => {
      const title = conversationTitle(c, currentUser).toLowerCase();
      const lastMsg = lastMessageText(c.lastMessage).toLowerCase();
      return title.includes(query) || lastMsg.includes(query);
    });
  }, [conversations, filterQuery, currentUser]);

  const isLoading = conversationsStatus === "loading";

  return (
    <div className={`flex h-full flex-col overflow-hidden bg-[#fbfaf6] ${compact ? "w-full" : ""}`}>
      {/* Sidebar Header */}
      <div className="border-b border-black/10 p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#2f7d68] text-white shadow-sm">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h1 className="text-base font-semibold text-[#181d1a]">Chats</h1>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onStartChat}
              className="flex h-8 items-center gap-1 rounded-lg border border-black/10 bg-white px-2.5 text-xs font-medium text-[#2d342f] shadow-sm hover:border-[#2f7d68]/40 hover:text-[#2f7d68] transition"
              title="Start 1-on-1 chat"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>Direct</span>
            </button>
            <button
              onClick={onCreateGroup}
              className="flex h-8 items-center gap-1 rounded-lg border border-black/10 bg-white px-2.5 text-xs font-medium text-[#2d342f] shadow-sm hover:border-[#2f7d68]/40 hover:text-[#2f7d68] transition"
              title="Create new group"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Group</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-[#889087]" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-3 text-xs text-[#1e2320] placeholder:text-[#9fa69e] outline-none focus:border-[#2f7d68] focus:ring-2 focus:ring-[#2f7d68]/15 transition"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && conversations.length === 0 && (
          <div className="p-4 text-center text-xs text-[#7d847c]">
            Loading conversations...
          </div>
        )}

        {!isLoading && filteredConversations.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-xs font-medium text-[#485049]">
              {filterQuery ? "No matching conversations" : "No conversations yet"}
            </p>
            <p className="mt-1 text-[11px] text-[#7d847c]">
              {filterQuery
                ? "Try searching for a different term."
                : "Start a new direct chat or create a group to begin."}
            </p>
          </div>
        )}

        {filteredConversations.map((conv: Conversation) => {
          const isSelected = conv._id === selectedConversationId;
          const isGroup = conv.type === "group";
          const title = conversationTitle(conv, currentUser);
          const lastMsg = lastMessageText(conv.lastMessage);
          const time = formatDateTime(conv.updatedAt || conv.lastMessage && "createdAt" in conv.lastMessage ? (conv.lastMessage as { createdAt?: string }).createdAt : undefined);

          return (
            <button
              key={conv._id}
              onClick={() => dispatch(selectConversation(conv._id))}
              className={`w-full text-left rounded-xl p-3 transition-all flex items-start gap-3 ${
                isSelected
                  ? "bg-[#2f7d68] text-white shadow-sm shadow-[#2f7d68]/20"
                  : "hover:bg-black/[0.04] text-[#1c221e]"
              }`}
            >
              {/* Avatar */}
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : isGroup
                    ? "bg-[#2f7d68]/10 text-[#2f7d68]"
                    : "bg-[#e8e4dc] text-[#3e453f]"
                }`}
              >
                {isGroup ? <Users className="h-4 w-4" /> : initials(title)}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`truncate text-xs font-semibold ${
                      isSelected ? "text-white" : "text-[#1d231f]"
                    }`}
                  >
                    {title}
                  </span>
                  <span
                    className={`shrink-0 text-[10px] ${
                      isSelected ? "text-white/70" : "text-[#889087]"
                    }`}
                  >
                    {time}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`truncate text-[11px] ${
                      isSelected ? "text-white/80" : "text-[#6c746d]"
                    }`}
                  >
                    {lastMsg}
                  </p>
                  {isGroup && (
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-black/5 text-[#5e665f]"
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
