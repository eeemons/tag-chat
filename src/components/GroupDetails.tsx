"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  X,
  Shield,
  UserMinus,
  UserPlus,
  Edit2,
  Check,
  LogOut,
  Loader2,
  Users,
  Search,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addParticipants,
  promoteAdmin,
  removeParticipant,
  renameGroup,
  searchUsers,
  clearSearch,
  selectConversation,
} from "@/features/chat/chatSlice";
import { initials } from "@/lib/format";
import type { GroupConversation, User } from "@/lib/types";

interface GroupDetailsProps {
  conversation: GroupConversation;
  onClose: () => void;
}

export function GroupDetails({ conversation, onClose }: GroupDetailsProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { actionStatus, actionError, searchResults, searchStatus } = useAppSelector(
    (state) => state.chat,
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(conversation.name);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<User[]>([]);
  const isInitialMount = useRef(true);

  const isAdmin = Boolean(
    currentUser && conversation.admins?.includes(currentUser._id),
  );
  const isActionLoading = actionStatus === "loading";

  // Debounced search for adding new participants
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!showAddMembers) return;

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      dispatch(clearSearch());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(searchUsers(trimmed));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showAddMembers, dispatch]);

  const handleStartRename = () => {
    setNameInput(conversation.name);
    setIsEditingName(true);
  };

  const handleRename = async (e: FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || nameInput === conversation.name) {
      setIsEditingName(false);
      return;
    }

    try {
      await dispatch(
        renameGroup({ conversationId: conversation._id, name: nameInput.trim() }),
      ).unwrap();
      setIsEditingName(false);
    } catch {
      // Handled in state
    }
  };

  const handlePromote = async (userId: string) => {
    if (!isAdmin || isActionLoading) return;
    try {
      await dispatch(
        promoteAdmin({ conversationId: conversation._id, userId }),
      ).unwrap();
    } catch {
      // Handled in state
    }
  };

  const handleRemove = async (userId: string) => {
    if (!isAdmin || isActionLoading) return;
    try {
      await dispatch(
        removeParticipant({ conversationId: conversation._id, userId }),
      ).unwrap();
    } catch {
      // Handled in state
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser || isActionLoading) return;
    try {
      await dispatch(
        removeParticipant({
          conversationId: conversation._id,
          userId: currentUser._id,
        }),
      ).unwrap();
      dispatch(selectConversation(null));
      onClose();
    } catch {
      // Handled in state
    }
  };

  const handleCloseAddMembers = () => {
    setShowAddMembers(false);
    setSearchQuery("");
    setSelectedToAdd([]);
    dispatch(clearSearch());
  };

  const handleAddSelectedParticipants = async () => {
    if (selectedToAdd.length === 0 || isActionLoading) return;
    try {
      await dispatch(
        addParticipants({
          conversationId: conversation._id,
          userIds: selectedToAdd.map((u) => u._id),
        }),
      ).unwrap();
      handleCloseAddMembers();
    } catch {
      // Handled in state
    }
  };

  return (
    <aside className="w-80 shrink-0 border-l border-black/10 bg-[#fbfaf6] flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-black/10 p-4 bg-white/50">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#2f7d68]" />
          <h3 className="text-sm font-semibold text-[#181d1a]">Group Information</h3>
        </div>
        <button
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-lg text-[#7c837c] hover:bg-black/5 hover:text-[#181d1a] transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {actionError && (
          <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
            {actionError}
          </div>
        )}

        {/* Group Name Section */}
        <div className="text-center pb-4 border-b border-black/10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#2f7d68]/15 text-[#2f7d68] mb-3">
            <Users className="h-8 w-8" />
          </div>

          {isEditingName ? (
            <form onSubmit={handleRename} className="flex items-center gap-1.5 mt-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-black/15 bg-white px-2.5 py-1 text-sm font-semibold text-[#1c221e] outline-none focus:border-[#2f7d68]"
              />
              <button
                type="submit"
                className="grid h-7 w-7 place-items-center rounded-lg bg-[#1f5f51] text-white"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="grid h-7 w-7 place-items-center rounded-lg bg-black/5 text-[#5e665e]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-base font-bold text-[#181d1a]">{conversation.name}</h2>
              {isAdmin && (
                <button
                  onClick={handleStartRename}
                  className="grid h-6 w-6 place-items-center rounded-md text-[#788078] hover:bg-black/5 hover:text-[#181d1a]"
                  title="Rename group"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          <p className="mt-1 text-xs text-[#788078]">
            {conversation.participants?.length || 0} participants
          </p>
        </div>

        {/* Participants Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-[#485049] uppercase tracking-wider">
              Members
            </h4>
            {isAdmin && !showAddMembers && (
              <button
                onClick={() => setShowAddMembers(true)}
                className="flex items-center gap-1 text-xs font-medium text-[#2f7d68] hover:underline"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>

          {/* Add Members Inline Panel */}
          {showAddMembers && (
            <div className="mb-4 rounded-xl border border-black/10 bg-white p-3 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#2f7d68]">Add new members</span>
                <button
                  onClick={handleCloseAddMembers}
                  className="text-xs text-[#788078] hover:text-black"
                >
                  Cancel
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a9189]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user..."
                  className="w-full rounded-lg border border-black/10 bg-[#faf8f5] py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#2f7d68]"
                />
              </div>

              {/* Search results */}
              <div className="max-h-32 overflow-y-auto space-y-1">
                {searchStatus === "loading" && (
                  <div className="py-2 text-center text-xs text-[#788078]">
                    <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                    Searching...
                  </div>
                )}

                {searchResults
                  .filter(
                    (u) =>
                      !conversation.participants.some((p) => p._id === u._id),
                  )
                  .map((u) => {
                    const isSelected = selectedToAdd.some((sel) => sel._id === u._id);
                    return (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedToAdd(selectedToAdd.filter((sel) => sel._id !== u._id));
                          } else {
                            setSelectedToAdd([...selectedToAdd, u]);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-1.5 rounded-md text-xs text-left ${
                          isSelected ? "bg-[#2f7d68]/15" : "hover:bg-black/5"
                        }`}
                      >
                        <span className="font-medium text-[#1c221e]">{u.name}</span>
                        <div
                          className={`grid h-4 w-4 place-items-center rounded border ${
                            isSelected
                              ? "bg-[#2f7d68] border-[#2f7d68] text-white"
                              : "border-black/20"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {selectedToAdd.length > 0 && (
                <button
                  onClick={handleAddSelectedParticipants}
                  disabled={isActionLoading}
                  className="w-full rounded-lg bg-[#1f5f51] py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#184c41] transition"
                >
                  {isActionLoading ? "Adding..." : `Add ${selectedToAdd.length} user(s)`}
                </button>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="space-y-1.5">
            {conversation.participants?.map((participant: User) => {
              const isMemberAdmin = conversation.admins?.includes(participant._id);
              const isMe = participant._id === currentUser?._id;

              return (
                <div
                  key={participant._id}
                  className="flex items-center justify-between rounded-xl p-2 bg-white/70 border border-black/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e8e4dc] text-xs font-bold text-[#3e453f]">
                      {initials(participant.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-semibold text-[#181d1a]">
                          {participant.name} {isMe && "(You)"}
                        </p>
                      </div>
                      <p className="truncate text-[10px] text-[#788078]">{participant.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isMemberAdmin && (
                      <span className="flex items-center gap-0.5 rounded bg-[#2f7d68]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#2f7d68]">
                        <Shield className="h-2.5 w-2.5" />
                        Admin
                      </span>
                    )}

                    {isAdmin && !isMemberAdmin && !isMe && (
                      <button
                        onClick={() => handlePromote(participant._id)}
                        disabled={isActionLoading}
                        title="Promote to Admin"
                        className="grid h-6 w-6 place-items-center rounded text-[#788078] hover:bg-black/5 hover:text-[#2f7d68] transition"
                      >
                        <Shield className="h-3 w-3" />
                      </button>
                    )}

                    {isAdmin && !isMe && (
                      <button
                        onClick={() => handleRemove(participant._id)}
                        disabled={isActionLoading}
                        title="Remove member"
                        className="grid h-6 w-6 place-items-center rounded text-[#788078] hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <UserMinus className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Group Action */}
        <div className="pt-4 border-t border-black/10">
          <button
            onClick={handleLeaveGroup}
            disabled={isActionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Leave Group</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
