"use client";

import { useAppSelector } from "@/store/hooks";
import { conversationTitle, conversationSubtitle, initials } from "@/lib/format";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { MessageSquare, Users, Shield } from "lucide-react";

interface ChatPanelProps {
  onOpenDetails?: () => void;
}

export function ChatPanel({ onOpenDetails }: ChatPanelProps) {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversationId } = useAppSelector(
    (state) => state.chat,
  );

  const selected = conversations.find((c) => c._id === selectedConversationId);

  if (!selected) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#faf8f5] p-6 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-[#2f7d68]/10 text-[#2f7d68]">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-[#1e2320]">Select a conversation</h3>
        <p className="mt-1.5 max-w-sm text-sm text-[#70776f]">
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
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 bg-white/80 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold shadow-sm ${
              isGroup
                ? "bg-[#2f7d68]/15 text-[#2f7d68]"
                : "bg-[#e8e4db] text-[#3d453f]"
            }`}
          >
            {isGroup ? <Users className="h-5 w-5" /> : initials(title)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold text-[#1c221e]">
                {title}
              </h2>
              {isAdmin && (
                <span className="flex items-center gap-1 rounded-full bg-[#2f7d68]/10 px-2 py-0.5 text-[10px] font-semibold text-[#2f7d68]">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="truncate text-xs text-[#70776f]">{subtitle}</p>
          </div>
        </div>

        {isGroup && onOpenDetails && (
          <button
            onClick={onOpenDetails}
            className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-[#3b433d] shadow-sm hover:bg-[#f5f2eb] transition"
          >
            <Users className="h-3.5 w-3.5 text-[#2f7d68]" />
            <span>Group info</span>
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
