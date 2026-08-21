"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, UserPlus, Phone } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSearch, searchUsers, startDirectConversation } from "@/features/chat/chatSlice";
import { initials } from "@/lib/format";
import type { User } from "@/lib/types";

interface StartChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export function StartChatDialog({ open, onClose }: StartChatDialogProps) {
  const dispatch = useAppDispatch();
  const { searchResults, searchStatus, searchError, actionStatus } = useAppSelector(
    (state) => state.chat,
  );
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const isInitialMount = useRef(true);

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
      dispatch(searchUsers(trimmed));
    }, 300);

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
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#2f7d68]/10 text-[#2f7d68]">
              <UserPlus className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-[#1a1f1c]">Start Direct Chat</h2>
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
            placeholder="Search by name or phone number..."
            autoFocus
            className="w-full rounded-xl border border-black/10 bg-[#faf8f5] py-2.5 pl-10 pr-4 text-sm text-[#1b201d] placeholder:text-[#9ea49d] outline-none focus:border-[#2f7d68] focus:ring-2 focus:ring-[#2f7d68]/15 transition"
          />
        </div>

        {/* Results / Status */}
        <div className="max-h-72 overflow-y-auto space-y-1">
          {isSearching && (
            <div className="flex items-center justify-center py-8 text-xs text-[#7e857e] gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#2f7d68]" />
              Searching for users...
            </div>
          )}

          {searchError && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 text-center">
              {searchError}
            </div>
          )}

          {!isSearching && query.trim() && searchResults.length === 0 && (
            <div className="py-8 text-center text-xs text-[#7a8179]">
              No users found matching &ldquo;{query}&rdquo;
            </div>
          )}

          {!isSearching && !query.trim() && (
            <div className="py-8 text-center text-xs text-[#8a918a]">
              Type a name or phone number to find people on the network.
            </div>
          )}

          {searchResults
            .filter((u) => u._id !== currentUser?._id)
            .map((u) => (
              <button
                key={u._id}
                onClick={() => handleSelectUser(u)}
                disabled={isStarting}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#faf8f5] border border-transparent hover:border-black/5 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e6e2da] text-xs font-bold text-[#3d453f]">
                    {initials(u.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1f1c] group-hover:text-[#2f7d68] transition">
                      {u.name}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-[#737a73]">
                      <Phone className="h-3 w-3" />
                      {u.phone}
                    </p>
                  </div>
                </div>

                <span className="rounded-lg bg-[#2f7d68]/10 px-2.5 py-1 text-xs font-medium text-[#2f7d68] group-hover:bg-[#2f7d68] group-hover:text-white transition">
                  Chat
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
