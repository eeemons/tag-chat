"use client";

import { useState, useEffect, useRef, type FormEvent, useMemo } from "react";
import { X, Users, Search, Loader2, Check, UserCheck, AlertCircle, ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSearch, createGroup, searchUsers } from "@/features/chat/chatSlice";
import { initials } from "@/lib/format";
import type { User, Conversation } from "@/lib/types";

interface GroupDialogProps {
  open: boolean;
  onClose: () => void;
}

export function GroupDialog({ open, onClose }: GroupDialogProps) {
  const dispatch = useAppDispatch();
  const { searchResults, searchStatus, searchError, actionStatus, actionError, conversations } =
    useAppSelector((state) => state.chat);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const isInitialMount = useRef(true);

  // Suggested contacts from existing direct and group conversations
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
      // Sanitize query to avoid regex crash on leading +
      const sanitized = trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;
      dispatch(searchUsers(sanitized || trimmed));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open, dispatch]);

  if (!open) return null;

  const isSearching = searchStatus === "loading";
  const isCreating = actionStatus === "loading";
  const hasMinimumMembers = selectedUsers.length >= 2;

  const handleClose = () => {
    setName("");
    setQuery("");
    setSelectedUsers([]);
    dispatch(clearSearch());
    onClose();
  };

  const handleToggleUser = (user: User) => {
    if (user._id === currentUser?._id) return; // Cannot toggle current user

    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hasMinimumMembers || isCreating) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#181d1a]">Create New Group</h2>
              <p className="text-xs text-[#717871]">Add members and choose a group name</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#7c837c] hover:bg-black/5 hover:text-[#1a1f1c] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-xs font-semibold text-[#3b433d] uppercase tracking-wider mb-1.5">
              Group Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product Engineering, Marketing Team..."
              className="w-full rounded-xl border border-black/10 bg-[#faf8f5] py-2.5 px-3.5 text-sm text-[#1b201d] placeholder:text-[#9ea49d] outline-none focus:border-[#2f7d68] focus:ring-2 focus:ring-[#2f7d68]/15 transition"
              required
            />
          </div>

          {/* Selected Members Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#3b433d] uppercase tracking-wider">
                Select Participants
              </label>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  hasMinimumMembers
                    ? "bg-[#2f7d68]/10 text-[#2f7d68]"
                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                }`}
              >
                {selectedUsers.length} selected {hasMinimumMembers ? "✓" : "(minimum 2 required)"}
              </span>
            </div>

            {/* Selected Chips */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#faf8f5] border border-black/10 max-h-24 overflow-y-auto mb-2.5">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#2f7d68]/30 py-1 pl-2 pr-1.5 text-xs font-medium text-[#1c221e] shadow-xs"
                  >
                    <span className="grid h-4 w-4 place-items-center rounded bg-[#2f7d68]/10 text-[9px] font-bold text-[#2f7d68]">
                      {initials(u.name)}
                    </span>
                    <span>{u.name}</span>
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9189]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people by name..."
                className="w-full rounded-xl border border-black/10 bg-[#faf8f5] py-2.5 pl-10 pr-9 text-xs text-[#1b201d] placeholder:text-[#9ea49d] outline-none focus:border-[#2f7d68] focus:ring-2 focus:ring-[#2f7d68]/15 transition"
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
          </div>

          {/* Search Results / Member Selection Area */}
          <div className="max-h-52 overflow-y-auto space-y-1.5 rounded-xl border border-black/10 p-1.5 bg-[#faf8f5]">
            {isSearching && (
              <div className="flex items-center justify-center py-8 text-xs text-[#7e857e] gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#2f7d68]" />
                <span>Searching contacts...</span>
              </div>
            )}

            {searchError && (
              <div className="flex items-center justify-center gap-2 p-4 text-xs text-red-600 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {!isSearching && !searchError && query.trim() && displayUsers.length === 0 && (
              <div className="py-8 text-center text-xs text-[#7a8179]">
                <p className="font-medium text-[#49504a]">No matching users found</p>
                <p className="mt-1 text-[11px] text-[#868d86]">Check the spelling or try searching by user display name.</p>
              </div>
            )}

            {!isSearching && !searchError && !query.trim() && displayUsers.length === 0 && (
              <div className="py-8 text-center text-xs text-[#8a918a]">
                <UserCheck className="mx-auto h-6 w-6 text-[#9fa69e] mb-1.5" />
                <p className="font-medium text-[#49504a]">Search Users</p>
                <p className="mt-0.5 text-[11px] text-[#868d86]">Type a name above to search for people on the platform.</p>
              </div>
            )}

            {!isSearching && !searchError && displayUsers.map((u) => {
              const isMe = u._id === currentUser?._id;
              const isSelected = selectedUsers.some((sel) => sel._id === u._id);

              return (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => !isMe && handleToggleUser(u)}
                  disabled={isMe}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition border ${
                    isMe
                      ? "bg-black/[0.02] border-black/5 opacity-75 cursor-default"
                      : isSelected
                      ? "bg-[#2f7d68]/10 border-[#2f7d68]/30 shadow-xs"
                      : "bg-white border-black/5 hover:border-[#2f7d68]/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-bold ${
                        isMe
                          ? "bg-black/10 text-black/60"
                          : isSelected
                          ? "bg-[#2f7d68] text-white"
                          : "bg-[#e8e4db] text-[#3d453f]"
                      }`}
                    >
                      {initials(u.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-[#1a1f1c]">{u.name}</p>
                        {isMe && (
                          <span className="text-[10px] text-[#7a8179] font-normal">(You)</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#737a73]">{u.phone}</p>
                    </div>
                  </div>

                  {isMe ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#2f7d68] bg-[#2f7d68]/10 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="h-3 w-3" />
                      Creator (Included)
                    </span>
                  ) : (
                    <div
                      className={`grid h-5 w-5 place-items-center rounded-lg border transition ${
                        isSelected
                          ? "bg-[#2f7d68] border-[#2f7d68] text-white"
                          : "border-black/20 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {actionError && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
              {actionError}
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-black/10 px-4 py-2 text-xs font-medium text-[#4b534d] hover:bg-black/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !hasMinimumMembers || isCreating}
              className="flex items-center gap-1.5 rounded-xl bg-[#1f5f51] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#1f5f51]/20 hover:bg-[#184c41] transition disabled:opacity-40 disabled:pointer-events-none"
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
