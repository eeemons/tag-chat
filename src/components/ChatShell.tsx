"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  UsersRound,
  Wifi,
  WifiOff,
  Menu,
  Users,
  Shield,
} from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { GroupDialog } from "@/components/GroupDialog";
import { GroupDetails } from "@/components/GroupDetails";
import { StartChatDialog } from "@/components/StartChatDialog";
import { LogoutConfirmModal } from "@/components/LogoutConfirmModal";
import { BackgroundSelectorModal } from "@/components/BackgroundSelectorModal";
import { useAppSelector } from "@/store/hooks";
import { conversationTitle, conversationSubtitle, initials } from "@/lib/format";
import { getAvatarGradient } from "@/lib/colors";
import { useChatBackground } from "@/hooks/useChatBackground";

export function ChatShell({ onLogout }: { onLogout: () => void }) {
  const [startOpen, setStartOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false);

  const { backgroundId, selectBackground } = useChatBackground();

  const { user } = useAppSelector((state) => state.auth);
  const {
    conversations,
    selectedConversationId,
    socketConnected,
    socketError,
    unreadByConversation,
    typingByConversation,
    onlineUsers,
  } = useAppSelector((state) => state.chat);

  const selected = conversations.find((item) => item._id === selectedConversationId);

  const isGroup = selected?.type === "group";
  const otherUserId = selected?.type === "direct" && selected.participant ? selected.participant._id : null;
  const isDirectOnline = Boolean(otherUserId && onlineUsers[otherUserId]);
  const onlineGroupMembers = useMemo(() => {
    if (selected?.type !== "group" || !selected.participants) return 0;
    return selected.participants.filter((p) => p._id === user?._id || onlineUsers[p._id]).length;
  }, [selected, onlineUsers, user?._id]);

  const totalUnread = useMemo(() => {
    return Object.values(unreadByConversation || {}).reduce((acc, c) => acc + (c || 0), 0);
  }, [unreadByConversation]);

  // Check if anyone in this active conversation is typing
  const activeTypers = selected
    ? (typingByConversation[selected._id] || []).filter(
        (t) => t.userId !== user?._id,
      )
    : [];

  // Update document title with unread count
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title =
        totalUnread > 0
          ? `(${totalUnread}) Tag Chat | Real-Time Messaging`
          : "Tag Chat | Real-Time Messaging";
    }
  }, [totalUnread]);

  const title = selected ? conversationTitle(selected, user) : "";
  const subtitle = selected ? conversationSubtitle(selected) : "";
  const isAdmin = Boolean(isGroup && user && selected?.admins?.includes(user._id));

  return (
    <main className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-[#faf8f5] text-[#1d211f]">
      <div className="grid h-full w-full min-h-0 overflow-hidden bg-[#faf8f5] lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Desktop Sidebar (Always visible on desktop) */}
        <aside className="hidden border-r border-black/10 bg-[#fbfaf6] lg:block h-full overflow-hidden">
          <ConversationSidebar
            onCreateGroup={() => setGroupOpen(true)}
            onStartChat={() => setStartOpen(true)}
            onOpenSettings={() => setWallpaperModalOpen(true)}
            onLogout={() => setLogoutConfirmOpen(true)}
          />
        </aside>

        {/* Main Conversation Area */}
        <section className="flex flex-col min-h-0 h-full overflow-hidden">
          {/* Main Unified Top Header Bar */}
          <header className="sticky top-0 z-30 shrink-0 flex h-16 min-h-16 items-center justify-between gap-3 border-b border-black/10 bg-white/95 px-4 backdrop-blur md:px-5 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Sidebar Hamburger Toggle */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="relative grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white text-[#2f7d68] shadow-2xs lg:hidden hover:bg-black/5 transition shrink-0"
                title="Open conversations drawer"
              >
                <Menu className="h-4 w-4" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1f5f51] px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </button>

              {selected ? (
                /* Active Conversation Header Info */
                <>
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
                      {!isGroup && (
                        <span
                          className={`text-xs font-semibold ${
                            isDirectOnline ? "text-emerald-600" : "text-[#7b837c]"
                          }`}
                        >
                          ({isDirectOnline ? "Online" : "Offline"})
                        </span>
                      )}
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
                    ) : isGroup ? (
                      <p className="truncate text-xs text-[#70776f]">
                        {selected?.participants?.length || 0} members •{" "}
                        <span className="text-emerald-700 font-semibold">
                          {onlineGroupMembers} online
                        </span>
                      </p>
                    ) : (
                      <p className="truncate text-xs text-[#70776f]">{subtitle}</p>
                    )}
                  </div>
                </>
              ) : (
                /* Fallback State when no conversation is selected */
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
              )}
            </div>

            {/* Right Action Icons */}
            <div className="flex shrink-0 items-center gap-2">
              {isGroup && (
                <button
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-[#3b433d] shadow-2xs transition hover:border-[#2f7d68]/40 hover:text-[#2f7d68]"
                  onClick={() => setDetailsOpen((value) => !value)}
                  title="Group details"
                >
                  <Users className="h-4 w-4 text-[#2f7d68]" />
                  <span className="hidden sm:inline">Group Info</span>
                </button>
              )}

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
            </div>
          </header>

          <div className="flex-1 min-h-0 grid lg:grid-cols-[minmax(0,1fr)_auto] overflow-hidden">
            {/* Conversation View */}
            <div className="min-h-0 h-full flex flex-col flex-1 overflow-hidden">
              <ChatPanel onToggleMobileSidebar={() => setMobileDrawerOpen(true)} />
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
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs animate-backdrop-in cursor-pointer"
          />

          {/* Drawer content */}
          <div className="relative z-10 flex w-[85%] max-w-sm flex-col bg-[#fbfaf6] shadow-2xl animate-drawer-left border-r border-black/10 overflow-hidden">
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
              onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
              onOpenSettings={() => {
                setMobileDrawerOpen(false);
                setWallpaperModalOpen(true);
              }}
              onLogout={() => {
                setMobileDrawerOpen(false);
                setLogoutConfirmOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <StartChatDialog open={startOpen} onClose={() => setStartOpen(false)} />
      <GroupDialog open={groupOpen} onClose={() => setGroupOpen(false)} />
      <BackgroundSelectorModal
        open={wallpaperModalOpen}
        onClose={() => setWallpaperModalOpen(false)}
        currentBackgroundId={backgroundId}
        onSelect={selectBackground}
      />
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
