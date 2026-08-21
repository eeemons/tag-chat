"use client";

import { useAppSelector } from "@/store/hooks";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { MessageSquare, Menu } from "lucide-react";

interface ChatPanelProps {
  onToggleMobileSidebar?: () => void;
}

export function ChatPanel({ onToggleMobileSidebar }: ChatPanelProps) {
  const { conversations, selectedConversationId } = useAppSelector(
    (state) => state.chat,
  );

  const selected = conversations.find((c) => c._id === selectedConversationId);

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

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#faf8f5]">
      {/* Message List keyed by conversation ID */}
      <MessageList key={selected._id} conversation={selected} />

      {/* Message Input */}
      <MessageInput conversationId={selected._id} />
    </div>
  );
}
