"use client";

import { useAppSelector } from "@/store/hooks";
import { conversationTitle, conversationSubtitle, initials } from "@/lib/format";
import { getAvatarGradient } from "@/lib/colors";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { MessageSquare, Users, Shield, Menu } from "lucide-react";

interface ChatPanelProps {
  onOpenDetails?: () => void;
  onToggleMobileSidebar?: () => void;
}

export function ChatPanel({ onOpenDetails, onToggleMobileSidebar }: ChatPanelProps) {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversationId, typingByConversation } = useAppSelector(
    (state) => state.chat,
  );

  const selected = conversations.find((c) => c._id === selectedConversationId);

  // Check if anyone in this conversation is typing
  const activeTypers = selected
    ? (typingByConversation[selected._id] || []).filter(
        (t) => t.userId !== currentUser?._id,
      )
    : [];

  if (!selected) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#faf8f5] p-6 text-center">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="mb-4 flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[#2f7d68] shadow-xs lg:hidden"
          >
            <Menu className="h-4 w-4" />
            <span>Open Conversations</span>
          </button>
        )}
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-[#2f7d68]/20 to-emerald-100 text-[#2f7d68] shadow-inner">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-[#1e2320]">Select a conversation</h3>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#70776f]">
          Choose an existing conversation from the list or start a new 1-on-1 chat or group.
        </p>
      </div>
    );
  }

  const title = conversationTitle(selected, currentUser);
  const subtitle = conversationSubtitle(selected);
  const isGroup = selected.type === "group";
  const isAdmin = isGroup && currentUser && selected.admins?.includes(currentUser._id);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#faf8f5]">
      {/* Active Conversation Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 bg-white/85 px-4 backdrop-blur md:px-6 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white text-[#2f7d68] shadow-2xs lg:hidden hover:bg-black/5 transition"
              title="Open chats drawer"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold shadow-xs bg-gradient-to-br ${getAvatarGradient(
              title,
            )}`}
          >
            {isGroup ? <Users className="h-5 w-5" /> : initials(title)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-bold text-[#1c221e]">
                {title}
              </h2>
              {isAdmin && (
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#2f7d68]/15 to-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#1f5f51]">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
            {activeTypers.length > 0 ? (
              <p className="truncate text-xs font-medium text-[#2f7d68] animate-pulse">
                {activeTypers.length === 1
                  ? `${activeTypers[0].userName} is typing...`
                  : `${activeTypers.length} people are typing...`}
              </p>
            ) : (
              <p className="truncate text-xs text-[#70776f]">{subtitle}</p>
            )}
          </div>
        </div>

        {isGroup && onOpenDetails && (
          <button
            onClick={onOpenDetails}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#3b433d] shadow-2xs hover:bg-[#f5f2eb] transition"
          >
            <Users className="h-3.5 w-3.5 text-[#2f7d68]" />
            <span>Group Info</span>
          </button>
        )}
      </header>

      {/* Message List keyed by conversation ID */}
      <MessageList key={selected._id} conversation={selected} />

      {/* Message Input */}
      <MessageInput conversationId={selected._id} />
    </div>
  );
}
