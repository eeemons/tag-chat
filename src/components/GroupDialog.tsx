"use client";

import { FormEvent, useEffect, useMemo, useState, useRef } from "react";
import { Users, X, Search, Check, Loader2 } from "lucide-react";
import {
  clearSearch,
  createGroup,
  searchUsers,
} from "@/features/chat/chatSlice";
import { initials } from "@/lib/format";
import { getAvatarGradient } from "@/lib/colors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { User } from "@/lib/types";

interface GroupDialogProps {
  open: boolean;
  onClose: () => void;
}

export function GroupDialog({ open, onClose }: GroupDialogProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { searchResults, searchStatus, searchError, actionStatus, actionError, conversations } =
    useAppSelector((state) => state.chat);

  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const isInitialMount = useRef(true);

  // Suggested contacts from existing direct and group conversations
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
  const isCreating = actionStatus === "loading";
  const hasMinimumMembers = selectedUsers.length >= 2;

  // Decide which list to display: search results or suggested contacts
  const displayList = query.trim().length > 0 ? searchResults : suggestedContacts;

  const handleToggleUser = (targetUser: User) => {
    // If the user clicked is the logged in user themselves, ignore as they are the creator
    if (currentUser && targetUser._id === currentUser._id) {
      return;
    }

    const exists = selectedUsers.some((u) => u._id === targetUser._id);
    if (exists) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== targetUser._id));
    } else {
      setSelectedUsers([...selectedUsers, targetUser]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleClose = () => {
    setName("");
    setQuery("");
    setSelectedUsers([]);
    dispatch(clearSearch());
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hasMinimumMembers) return;

    try {
      await dispatch(
        createGroup({
          name: name.trim(),
          participantIds: selectedUsers.map((u) => u._id),
        }),
      ).unwrap();
      handleClose();
    } catch {
      // Handled in state
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4 backdrop-blur-xs animate-backdrop-in">
      <div className="relative w-full max-w-md rounded-3xl border border-black/10 bg-white p-5 sm:p-6 shadow-2xl animate-modal-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68] shrink-0">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#181d1a] truncate">Create New Group</h2>
              <p className="text-xs text-[#717871] truncate">Choose a name and add members</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#7c837c] hover:bg-black/5 hover:text-[#1a1f1c] transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 flex flex-col flex-1 overflow-hidden">
          {/* Group Name Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d453f] mb-1">
              Group Name <span className="text-[#2f7d68]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product Engineering, Marketing..."
              className="w-full rounded-xl border border-black/10 bg-[#faf8f5] py-2 px-3 text-xs text-[#1b201d] placeholder:text-[#9ea49d] outline-none focus:border-[#2f7d68] focus:ring-1 focus:ring-[#2f7d68]/20 transition"
              required
            />
          </div>

          {/* Selected Members Section Header */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d453f] shrink-0">
                Members
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  hasMinimumMembers
                    ? "bg-emerald-100 text-[#175244]"
                    : "bg-amber-50 text-amber-800 border border-amber-200/70"
                }`}
              >
                {hasMinimumMembers
                  ? `${selectedUsers.length} selected ✓`
                  : `${selectedUsers.length}/2 selected (min 2)`}
              </span>
            </div>

            {/* Selected Chips */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#faf8f5] border border-black/10 max-h-20 overflow-y-auto mb-2">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#2f7d68]/30 py-0.5 pl-2 pr-1 text-[11px] font-medium text-[#1c221e] shadow-2xs"
                  >
                    <span
                      className={`grid h-4 w-4 place-items-center rounded text-[9px] font-bold text-white bg-gradient-to-br ${getAvatarGradient(
                        u.name,
                      )}`}
                    >
                      {initials(u.name)}
                    </span>
                    <span className="truncate max-w-[110px]">{u.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(u._id)}
                      className="grid h-4 w-4 place-items-center rounded-full hover:bg-black/10 text-[#7a8179] hover:text-black transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a9189]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people by name..."
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
          </div>

          {/* Search Results / Member Selection Area */}
          <div className="flex-1 min-h-36 max-h-48 overflow-y-auto space-y-1 rounded-xl border border-black/10 p-1.5 bg-[#faf8f5]">
            {isSearching && (
              <div className="flex items-center justify-center py-6 text-xs text-[#7e857e] gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#2f7d68]" />
                <span>Searching contacts...</span>
              </div>
            )}

            {searchError && (
              <div className="py-4 text-center text-xs text-red-600">
                {searchError}
              </div>
            )}

            {!isSearching && !searchError && displayList.length === 0 && (
              <div className="py-6 text-center text-xs text-[#7d847d]">
                {query.trim()
                  ? "No matching users found"
                  : "No recent contacts. Type a name to search."}
              </div>
            )}

            {!isSearching &&
              displayList.map((u) => {
                const isSelected = selectedUsers.some((sel) => sel._id === u._id);
                const isMe = currentUser?._id === u._id;

                return (
                  <button
                    key={u._id}
                    type="button"
                    disabled={isMe}
                    onClick={() => handleToggleUser(u)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition ${
                      isMe
                        ? "bg-black/[0.03] opacity-60 cursor-default"
                        : isSelected
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-[#2f7d68]/30 shadow-2xs"
                        : "hover:bg-white bg-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-bold shadow-xs text-white bg-gradient-to-br ${getAvatarGradient(
                          u.name,
                        )}`}
                      >
                        {initials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#181d1a] truncate">{u.name}</span>
                          {isMe && (
                            <span className="rounded bg-[#2f7d68]/15 px-1 py-0.2 text-[9px] font-bold text-[#1f5f51]">
                              You (Creator)
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#717871] truncate">{u.phone}</p>
                      </div>
                    </div>

                    {!isMe && (
                      <div
                        className={`grid h-5 w-5 place-items-center rounded-lg border transition ${
                          isSelected
                            ? "bg-[#1f5f51] border-[#1f5f51] text-white shadow-2xs"
                            : "border-black/20 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>

          {actionError && (
            <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
              {actionError}
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-black/10 bg-[#faf8f5] px-4 py-2 text-xs font-semibold text-[#48504a] hover:bg-black/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !hasMinimumMembers || isCreating}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#216d5b] to-[#144f41] px-5 py-2 text-xs font-bold text-white shadow-xs hover:scale-101 active:scale-99 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCreating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isCreating ? "Creating..." : "Create Group"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
