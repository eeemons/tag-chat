"use client";

import { useState } from "react";
import {
  LogOut,
  PanelRightOpen,
  Search,
  UsersRound,
  Wifi,
  WifiOff,
  ChevronLeft,
} from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { GroupDialog } from "@/components/GroupDialog";
import { GroupDetails } from "@/components/GroupDetails";
import { StartChatDialog } from "@/components/StartChatDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectConversation } from "@/features/chat/chatSlice";

export function ChatShell({ onLogout }: { onLogout: () => void }) {
  const dispatch = useAppDispatch();
  const [startOpen, setStartOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversationId, socketConnected, socketError } =
    useAppSelector((state) => state.chat);
  const selected = conversations.find((item) => item._id === selectedConversationId);

  return (
    <main className="min-h-screen bg-[#ece8df] p-2 text-[#1d211f] sm:p-4">
      <div className="mx-auto grid h-[calc(100vh-1rem)] max-w-[1500px] overflow-hidden rounded-2xl border border-black/10 bg-[#f9f7f1] shadow-[0_30px_100px_rgba(26,31,28,0.18)] sm:h-[calc(100vh-2rem)] lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <aside className="hidden border-r border-black/10 bg-[#fbfaf6] lg:block">
          <ConversationSidebar
            onCreateGroup={() => setGroupOpen(true)}
            onStartChat={() => setStartOpen(true)}
          />
        </aside>

        {/* Main Conversation Area */}
        <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
          {/* Main Top Header */}
          <header className="flex min-h-16 items-center justify-between gap-3 border-b border-black/10 bg-white/80 px-4 backdrop-blur md:px-5">
            <div className="flex items-center gap-3 min-w-0">
              {selectedConversationId && (
                <button
                  onClick={() => dispatch(selectConversation(null))}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white text-[#39413b] shadow-xs lg:hidden hover:bg-black/5"
                  title="Back to conversation list"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7a8179]">
                  {socketConnected ? (
                    <Wifi className="h-3.5 w-3.5 text-[#2f7d68]" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-[#b26b4c]" />
                  )}
                  {socketConnected ? "Live" : socketError ? "Reconnecting" : "Offline"}
                </div>
                <p className="truncate text-xs sm:text-sm text-[#616861]">
                  Signed in as <span className="font-semibold">{user?.name}</span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white text-[#39413b] shadow-xs transition hover:border-[#2f7d68]/40 hover:text-[#2f7d68] lg:hidden"
                onClick={() => setStartOpen(true)}
                title="Start chat"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white text-[#39413b] shadow-xs transition hover:border-[#2f7d68]/40 hover:text-[#2f7d68] lg:hidden"
                onClick={() => setGroupOpen(true)}
                title="Create group"
              >
                <UsersRound className="h-4 w-4" />
              </button>
              {selected?.type === "group" ? (
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white text-[#39413b] shadow-xs transition hover:border-[#2f7d68]/40 hover:text-[#2f7d68]"
                  onClick={() => setDetailsOpen((value) => !value)}
                  title="Group details"
                >
                  <PanelRightOpen className="h-4 w-4" />
                </button>
              ) : null}
              <button
                className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white text-[#8f3d32] shadow-xs transition hover:border-[#8f3d32]/30 hover:bg-[#fff5f2]"
                onClick={onLogout}
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="grid min-h-0 lg:grid-cols-[minmax(0,1fr)_auto]">
            {/* Mobile View: Sidebar when no conversation selected */}
            <div className={`grid min-h-0 grid-cols-1 lg:hidden ${selectedConversationId ? "hidden" : "block"}`}>
              <ConversationSidebar
                compact
                onCreateGroup={() => setGroupOpen(true)}
                onStartChat={() => setStartOpen(true)}
              />
            </div>

            {/* Conversation view (desktop always; mobile only if conversation selected) */}
            <div className={`min-h-0 flex-col ${selectedConversationId ? "flex" : "hidden lg:flex"}`}>
              <ChatPanel onOpenDetails={() => setDetailsOpen((v) => !v)} />
            </div>

            {selected?.type === "group" && detailsOpen ? (
              <GroupDetails conversation={selected} onClose={() => setDetailsOpen(false)} />
            ) : null}
          </div>
        </section>
      </div>

      <StartChatDialog open={startOpen} onClose={() => setStartOpen(false)} />
      <GroupDialog open={groupOpen} onClose={() => setGroupOpen(false)} />
    </main>
  );
}
