"use client";

import { useState } from "react";
import {
  LogOut,
  MessageSquarePlus,
  PanelRightOpen,
  Search,
  UsersRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { GroupDialog } from "@/components/GroupDialog";
import { GroupDetails } from "@/components/GroupDetails";
import { StartChatDialog } from "@/components/StartChatDialog";
import { useAppSelector } from "@/store/hooks";

export function ChatShell({ onLogout }: { onLogout: () => void }) {
  const [startOpen, setStartOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversationId, socketConnected, socketError } =
    useAppSelector((state) => state.chat);
  const selected = conversations.find((item) => item._id === selectedConversationId);

  return (
    <main className="min-h-screen bg-[#ece8df] p-3 text-[#1d211f] sm:p-4">
      <div className="mx-auto grid h-[calc(100vh-1.5rem)] max-w-[1500px] overflow-hidden rounded-xl border border-black/10 bg-[#f9f7f1] shadow-[0_30px_100px_rgba(26,31,28,0.18)] sm:h-[calc(100vh-2rem)] lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="hidden border-r border-black/10 bg-[#fbfaf6] lg:block">
          <ConversationSidebar
            onCreateGroup={() => setGroupOpen(true)}
            onStartChat={() => setStartOpen(true)}
          />
        </aside>

        <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
          <header className="flex min-h-16 items-center justify-between gap-3 border-b border-black/10 bg-white/80 px-4 backdrop-blur md:px-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7a8179]">
                {socketConnected ? (
                  <Wifi className="h-3.5 w-3.5 text-[#2f7d68]" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-[#b26b4c]" />
                )}
                {socketConnected ? "Live" : socketError ? "Reconnecting" : "Offline"}
              </div>
              <p className="truncate text-sm text-[#616861]">
                Signed in as <span className="font-semibold">{user?.name}</span>
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white text-[#39413b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#2f7d68]/40 hover:text-[#2f7d68] lg:hidden"
                onClick={() => setStartOpen(true)}
                title="Start chat"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white text-[#39413b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#2f7d68]/40 hover:text-[#2f7d68] lg:hidden"
                onClick={() => setGroupOpen(true)}
                title="Create group"
              >
                <UsersRound className="h-4 w-4" />
              </button>
              {selected?.type === "group" ? (
                <button
                  className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white text-[#39413b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#2f7d68]/40 hover:text-[#2f7d68]"
                  onClick={() => setDetailsOpen((value) => !value)}
                  title="Group details"
                >
                  <PanelRightOpen className="h-4 w-4" />
                </button>
              ) : null}
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white text-[#8f3d32] shadow-sm transition hover:-translate-y-0.5 hover:border-[#8f3d32]/30 hover:bg-[#fff5f2]"
                onClick={onLogout}
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="grid min-h-0 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid min-h-0 grid-cols-1 lg:hidden">
              <ConversationSidebar
                compact
                onCreateGroup={() => setGroupOpen(true)}
                onStartChat={() => setStartOpen(true)}
              />
            </div>
            <ChatPanel />
            {selected?.type === "group" && detailsOpen ? (
              <GroupDetails conversation={selected} onClose={() => setDetailsOpen(false)} />
            ) : null}
          </div>
        </section>
      </div>

      <StartChatDialog open={startOpen} onClose={() => setStartOpen(false)} />
      <GroupDialog open={groupOpen} onClose={() => setGroupOpen(false)} />

      <button
        className="fixed bottom-5 right-5 hidden h-12 w-12 place-items-center rounded-full bg-[#1f5f51] text-white shadow-xl shadow-[#1f5f51]/20 transition hover:-translate-y-1 lg:grid"
        onClick={() => setStartOpen(true)}
        title="Start new chat"
      >
        <MessageSquarePlus className="h-5 w-5" />
      </button>
    </main>
  );
}

