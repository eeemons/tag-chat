"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, Search, Loader2, UserPlus, Phone, AlertCircle, MessageSquare } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSearch, searchUsers, startDirectConversation } from "@/features/chat/chatSlice";
import { initials } from "@/lib/format";
import type { User, Conversation } from "@/lib/types";

interface StartChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export function StartChatDialog({ open, onClose }: StartChatDialogProps) {
  const dispatch = useAppDispatch();
  const { searchResults, searchStatus, searchError, actionStatus, conversations } = useAppSelector(
    (state) => state.chat,
  );
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const isInitialMount = useRef(true);

  // Suggested contacts from existing conversations
  const suggestedContacts = useMemo(() => {
    const map = new Map<string, User>();
    conversations.forEach((c: Conversation) => {
      if (c.type === "direct" && c.participant && c.participant._id !== currentUser?._id) {
        map.set(c.participant._id, c.participant);
      } else if (c.type === "group" && c.participants) {
        c.participants.forEach((p: User) => {
          if (p._id !== currentUser?._id) {
            map.set(p._id, p);
          }
        });
      }
    });
    return Array.from(map.values());
  }, [conversations, currentUser?._id]);

  // Combined list of users to display based on query
  const displayUsers = useMemo(() => {
    if (!query.trim()) {
      return suggestedContacts;
    }
    return searchResults;
  }, [query, suggestedContacts, searchResults]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68]">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1a1f1c]">Start Direct Chat</h2>
              <p className="text-xs text-[#717871]">Find people by name</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#7c837c] hover:bg-black/5 hover:text-[#1a1f1c] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9189]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by user name..."
            autoFocus
            className="w-full rounded-xl border border-black/10 bg-[#faf8f5] py-2.5 pl-10 pr-9 text-sm text-[#1b201d] placeholder:text-[#9ea49d] outline-none focus:border-[#2f7d68] focus:ring-2 focus:ring-[#2f7d68]/15 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9189] hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results / Status */}
        <div className="max-h-72 overflow-y-auto space-y-1 rounded-xl border border-black/10 p-1.5 bg-[#faf8f5]">
          {isSearching && (
            <div className="flex items-center justify-center py-8 text-xs text-[#7e857e] gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#2f7d68]" />
              <span>Searching for users...</span>
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

          {!isSearching && !searchError && displayUsers.map((u) => {
            const isMe = u._id === currentUser?._id;

            return (
              <button
                key={u._id}
                onClick={() => !isMe && handleSelectUser(u)}
                disabled={isStarting || isMe}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                  isMe
                    ? "bg-black/[0.02] border-black/5 opacity-75 cursor-default"
                    : "bg-white hover:border-[#2f7d68]/40 border-black/5 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-bold ${
                      isMe ? "bg-black/10 text-black/60" : "bg-[#e6e2da] text-[#3d453f]"
                    }`}
                  >
                    {initials(u.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-[#1a1f1c]">{u.name}</p>
                      {isMe && <span className="text-xs text-[#7a8179]">(You)</span>}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-[#737a73]">
                      <Phone className="h-3 w-3" />
                      {u.phone}
                    </p>
                  </div>
                </div>

                {isMe ? (
                  <span className="rounded-lg bg-black/5 px-2.5 py-1 text-xs font-medium text-[#7a8179]">
                    Current user
                  </span>
                ) : (
                  <span className="rounded-lg bg-[#2f7d68]/10 px-2.5 py-1 text-xs font-medium text-[#2f7d68] hover:bg-[#2f7d68] hover:text-white transition">
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
