"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { X, Users, Search, Loader2, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSearch, createGroup, searchUsers } from "@/features/chat/chatSlice";
import { initials } from "@/lib/format";
import type { User } from "@/lib/types";

interface GroupDialogProps {
  open: boolean;
  onClose: () => void;
}

export function GroupDialog({ open, onClose }: GroupDialogProps) {
  const dispatch = useAppDispatch();
  const { searchResults, searchStatus, actionStatus, actionError } =
    useAppSelector((state) => state.chat);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
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
  const isCreating = actionStatus === "loading";

  const handleClose = () => {
    setName("");
    setQuery("");
    setSelectedUsers([]);
    dispatch(clearSearch());
    onClose();
  };

  const handleToggleUser = (user: User) => {
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
    if (!name.trim() || selectedUsers.length < 2 || isCreating) return;

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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#2f7d68]/10 text-[#2f7d68]">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-[#1a1f1c]">Create Group Chat</h2>
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
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design & Engineering Team"
              className="w-full rounded-xl border border-black/10 bg-[#faf8f5] py-2.5 px-3.5 text-sm text-[#1b201d] placeholder:text-[#9ea49d] outline-none focus:border-[#2f7d68] focus:ring-2 focus:ring-[#2f7d68]/15 transition"
              required
            />
          </div>

          {/* Selected Members Pills */}
          <div>
            <label className="block text-xs font-semibold text-[#3b433d] uppercase tracking-wider mb-1.5">
              Participants ({selectedUsers.length} selected, minimum 2 required)
            </label>

            {selectedUsers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#faf8f5] border border-black/5 max-h-24 overflow-y-auto mb-2">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-black/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-[#1c221e] shadow-xs"
                  >
                    <span>{u.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(u._id)}
                      className="grid h-4 w-4 place-items-center rounded-full hover:bg-black/10 text-[#7a8179] transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9189]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users to add..."
                className="w-full rounded-xl border border-black/10 bg-[#faf8f5] py-2 pl-10 pr-4 text-xs text-[#1b201d] placeholder:text-[#9ea49d] outline-none focus:border-[#2f7d68] focus:ring-2 focus:ring-[#2f7d68]/15 transition"
              />
            </div>
          </div>

          {/* Search Results List */}
          <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-black/5 p-1 bg-[#faf8f5]">
            {isSearching && (
              <div className="flex items-center justify-center py-6 text-xs text-[#7e857e] gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2f7d68]" />
                Searching users...
              </div>
            )}

            {!isSearching && query.trim() && searchResults.length === 0 && (
              <div className="py-6 text-center text-xs text-[#7a8179]">
                No users found
              </div>
            )}

            {!isSearching && !query.trim() && (
              <div className="py-6 text-center text-xs text-[#8a918a]">
                Type to search and select group members
              </div>
            )}

            {searchResults
              .filter((u) => u._id !== currentUser?._id)
              .map((u) => {
                const isSelected = selectedUsers.some((sel) => sel._id === u._id);
                return (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => handleToggleUser(u)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                      isSelected
                        ? "bg-[#2f7d68]/10 border border-[#2f7d68]/20"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#e6e2da] text-xs font-bold text-[#3d453f]">
                        {initials(u.name)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1a1f1c]">{u.name}</p>
                        <p className="text-[10px] text-[#737a73]">{u.phone}</p>
                      </div>
                    </div>

                    <div
                      className={`grid h-5 w-5 place-items-center rounded-md border text-white transition ${
                        isSelected
                          ? "bg-[#2f7d68] border-[#2f7d68]"
                          : "border-black/20 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
          </div>

          {actionError && (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
              {actionError}
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-black/10 px-4 py-2 text-xs font-medium text-[#4b534d] hover:bg-black/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || selectedUsers.length < 2 || isCreating}
              className="flex items-center gap-1.5 rounded-xl bg-[#1f5f51] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#1f5f51]/20 hover:bg-[#184c41] transition disabled:opacity-40 disabled:pointer-events-none"
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
