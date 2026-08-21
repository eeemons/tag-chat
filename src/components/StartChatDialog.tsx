"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { UserPlus, X, Search, Phone, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import {
  clearSearch,
  searchUsers,
  startDirectConversation,
} from "@/features/chat/chatSlice";
import { initials } from "@/lib/format";
import { getAvatarGradient } from "@/lib/colors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { User } from "@/lib/types";

interface StartChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export function StartChatDialog({ open, onClose }: StartChatDialogProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { searchResults, searchStatus, searchError, actionStatus, conversations } =
    useAppSelector((state) => state.chat);
  const [query, setQuery] = useState("");
  const isInitialMount = useRef(true);

  // Suggested contacts from existing conversations
  const suggestedContacts = useMemo(() => {
    const map = new Map<string, User>();
    conversations.forEach((conv) => {
      if (conv.type === "direct" && conv.participant) {
        if (conv.participant._id !== currentUser?._id) {
          map.set(conv.participant._id, conv.participant);
        }
      } else if (conv.type === "group" && conv.participants) {
        conv.participants.forEach((p) => {
          if (p._id !== currentUser?._id) {
            map.set(p._id, p);
          }
        });
      }
    });
    return Array.from(map.values());
  }, [conversations, currentUser]);

  // Debounced search
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!open) return;

    const trimmed = query.trim();
    if (!trimmed) {
      dispatch(clearSearch());
      return;
    }

    const timer = setTimeout(() => {
      const sanitized = trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;
      dispatch(searchUsers(sanitized || trimmed));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open, dispatch]);

  if (!open) return null;

  const isSearching = searchStatus === "loading";
  const isStarting = actionStatus === "loading";

  const handleClose = () => {
    setQuery("");
    dispatch(clearSearch());
    onClose();
  };

  const handleSelectUser = async (targetUser: User) => {
    try {
      await dispatch(startDirectConversation(targetUser._id)).unwrap();
      handleClose();
    } catch {
      // Handled in state
    }
  };

  const displayUsers = query.trim().length > 0 ? searchResults : suggestedContacts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4 backdrop-blur-xs animate-backdrop-in">
      <div className="relative w-full max-w-md rounded-3xl border border-black/10 bg-white p-5 sm:p-6 shadow-2xl animate-modal-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68] shrink-0">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#1a1f1c] truncate">Start Direct Chat</h2>
              <p className="text-xs text-[#717871] truncate">Find people and start a conversation</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#7c837c] hover:bg-black/5 hover:text-[#1a1f1c] transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a9189]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people by name..."
            autoFocus
            className="w-full rounded-xl border border-black/10 bg-[#faf8f5] py-2 pl-9 pr-8 text-xs text-[#1b201d] placeholder:text-[#9ea49d] outline-none focus:border-[#2f7d68] focus:ring-1 focus:ring-[#2f7d68]/20 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a9189] hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results / Status */}
        <div className="flex-1 min-h-40 max-h-72 overflow-y-auto space-y-1 rounded-xl border border-black/10 p-1.5 bg-[#faf8f5]">
          {isSearching && (
            <div className="flex items-center justify-center py-8 text-xs text-[#7e857e] gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#2f7d68]" />
              <span>Searching users...</span>
            </div>
          )}

          {searchError && (
            <div className="flex items-center justify-center gap-2 p-3 text-xs text-red-600 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {!isSearching && !searchError && query.trim() && displayUsers.length === 0 && (
            <div className="py-8 text-center text-xs text-[#7a8179]">
              <p className="font-medium text-[#49504a]">No users found matching &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-[11px] text-[#868d86]">Check the spelling and try searching by display name.</p>
            </div>
          )}

          {!isSearching && !searchError && !query.trim() && displayUsers.length === 0 && (
            <div className="py-8 text-center text-xs text-[#8a918a]">
              <MessageSquare className="mx-auto h-6 w-6 text-[#9fa69e] mb-1.5" />
              <p className="font-medium text-[#49504a]">Start a New Conversation</p>
              <p className="mt-0.5 text-[11px] text-[#868d86]">Type a name above to search for people.</p>
            </div>
          )}

          {!isSearching &&
            !searchError &&
            displayUsers.map((u) => {
              const isMe = u._id === currentUser?._id;

              return (
                <button
                  key={u._id}
                  onClick={() => !isMe && handleSelectUser(u)}
                  disabled={isStarting || isMe}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition text-left ${
                    isMe
                      ? "bg-black/[0.02] border-black/5 opacity-70 cursor-default"
                      : "bg-white hover:border-[#2f7d68]/40 hover:bg-emerald-50/40 border-black/5 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-bold text-white shadow-xs bg-gradient-to-br ${getAvatarGradient(
                        u.name,
                      )}`}
                    >
                      {initials(u.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-[#1a1f1c] truncate">{u.name}</p>
                        {isMe && (
                          <span className="rounded bg-black/5 px-1 py-0.2 text-[9px] text-[#7a8179]">
                            (You)
                          </span>
                        )}
                      </div>
                      <p className="flex items-center gap-1 text-[10px] text-[#737a73] truncate">
                        <Phone className="h-2.5 w-2.5" />
                        {u.phone}
                      </p>
                    </div>
                  </div>

                  {isMe ? (
                    <span className="rounded-lg bg-black/5 px-2 py-1 text-[10px] font-medium text-[#7a8179]">
                      You
                    </span>
                  ) : (
                    <span className="rounded-lg bg-[#2f7d68]/10 px-2.5 py-1 text-xs font-semibold text-[#2f7d68] hover:bg-[#2f7d68] hover:text-white transition">
                      Chat
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
