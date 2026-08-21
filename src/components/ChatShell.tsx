"use client";

import { useState } from "react";
import {
  LogOut,
  PanelRightOpen,
  Search,
  UsersRound,
  Wifi,
  WifiOff,
  Menu,
  X,
} from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { GroupDialog } from "@/components/GroupDialog";
import { GroupDetails } from "@/components/GroupDetails";
import { StartChatDialog } from "@/components/StartChatDialog";
import { LogoutConfirmModal } from "@/components/LogoutConfirmModal";
import { useAppSelector } from "@/store/hooks";

export function ChatShell({ onLogout }: { onLogout: () => void }) {
  const [startOpen, setStartOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversationId, socketConnected, socketError } =
    useAppSelector((state) => state.chat);
  const selected = conversations.find((item) => item._id === selectedConversationId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ece7dc] via-[#f4efe6] to-[#e8e2d5] p-2 text-[#1d211f] sm:p-4">
      <div className="mx-auto grid h-[calc(100vh-1rem)] max-w-[1500px] overflow-hidden rounded-2xl border border-black/10 bg-[#f9f7f1] shadow-[0_30px_100px_rgba(26,31,28,0.18)] sm:h-[calc(100vh-2rem)] lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Desktop Sidebar (Always visible on desktop) */}
        <aside className="hidden border-r border-black/10 bg-[#fbfaf6] lg:block">
          <ConversationSidebar
            onCreateGroup={() => setGroupOpen(true)}
            onStartChat={() => setStartOpen(true)}
          />
        </aside>

        {/* Main Conversation Area */}
        <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
          {/* Main Top Header */}
          <header className="flex min-h-16 items-center justify-between gap-3 border-b border-black/10 bg-white/85 px-4 backdrop-blur md:px-5 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Sidebar Hamburger Toggle */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white text-[#2f7d68] shadow-2xs lg:hidden hover:bg-black/5 transition"
                title="Open conversations drawer"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                  {socketConnected ? (
                    <span className="flex items-center gap-1 text-[#2f7d68]">
                      <span className="h-2 w-2 rounded-full bg-[#2f7d68] animate-pulse" />
                      <Wifi className="h-3.5 w-3.5" />
                      Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#b26b4c]">
                      <WifiOff className="h-3.5 w-3.5" />
                      {socketError ? "Reconnecting" : "Offline"}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs sm:text-sm text-[#5a625a]">
                  Signed in as <span className="font-bold text-[#1a1f1c]">{user?.name}</span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white text-[#39413b] shadow-2xs transition hover:border-[#2f7d68]/40 hover:text-[#2f7d68] lg:hidden"
                onClick={() => setStartOpen(true)}
                title="Start direct chat"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white text-[#39413b] shadow-2xs transition hover:border-[#2f7d68]/40 hover:text-[#2f7d68] lg:hidden"
                onClick={() => setGroupOpen(true)}
                title="Create group"
              >
                <UsersRound className="h-4 w-4" />
              </button>
              {selected?.type === "group" && (
                <button
                  className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white text-[#39413b] shadow-2xs transition hover:border-[#2f7d68]/40 hover:text-[#2f7d68]"
                  onClick={() => setDetailsOpen((value) => !value)}
                  title="Group details"
                >
                  <PanelRightOpen className="h-4 w-4" />
                </button>
              )}
              <button
                className="grid h-9 w-9 place-items-center rounded-xl border border-red-200/70 bg-white text-[#c53929] shadow-2xs transition hover:border-[#c53929]/40 hover:bg-red-50"
                onClick={() => setLogoutConfirmOpen(true)}
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="grid min-h-0 lg:grid-cols-[minmax(0,1fr)_auto]">
            {/* Conversation View */}
            <div className="min-h-0 flex flex-col">
              <ChatPanel
                onOpenDetails={() => setDetailsOpen((v) => !v)}
                onToggleMobileSidebar={() => setMobileDrawerOpen(true)}
              />
            </div>

            {/* Desktop Group Details Drawer */}
            {selected?.type === "group" && detailsOpen && (
              <GroupDetails conversation={selected} onClose={() => setDetailsOpen(false)} />
            )}
          </div>
        </section>
      </div>

      {/* Mobile Slide-Out Drawer for Conversation Sidebar */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative z-10 flex w-[85%] max-w-sm flex-col bg-[#fbfaf6] shadow-2xl animate-in slide-in-from-left duration-250 border-r border-black/10">
            {/* Drawer top close button */}
            <div className="flex items-center justify-between border-b border-black/10 p-3 bg-white/50">
              <span className="text-xs font-bold text-[#1f5f51] uppercase tracking-wider">
                Conversations
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-[#7c837c] hover:bg-black/5 hover:text-black transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <ConversationSidebar
                onCreateGroup={() => {
                  setMobileDrawerOpen(false);
                  setGroupOpen(true);
                }}
                onStartChat={() => {
                  setMobileDrawerOpen(false);
                  setStartOpen(true);
                }}
                onSelectConversation={() => setMobileDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <StartChatDialog open={startOpen} onClose={() => setStartOpen(false)} />
      <GroupDialog open={groupOpen} onClose={() => setGroupOpen(false)} />
      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          onLogout();
        }}
      />
    </main>
  );
}
