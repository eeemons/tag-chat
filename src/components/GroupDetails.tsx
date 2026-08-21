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
  AlertTriangle,
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
import { getAvatarGradient } from "@/lib/colors";
import type { GroupConversation, User } from "@/lib/types";

interface GroupDetailsProps {
  conversation: GroupConversation;
  onClose: () => void;
}

type ConfirmState =
  | { type: "promote"; user: User }
  | { type: "remove"; user: User }
  | { type: "leave" }
  | null;

type ProcessingState =
  | { type: "promote" | "remove"; userId: string }
  | { type: "leave" }
  | { type: "rename" }
  | { type: "add" }
  | null;

export function GroupDetails({ conversation, onClose }: GroupDetailsProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { actionStatus, actionError, searchResults, searchStatus, onlineUsers } =
    useAppSelector((state) => state.chat);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(conversation.name);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<User[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmState>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>(null);
  const isInitialMount = useRef(true);

  const isAdmin = Boolean(
    currentUser && conversation.admins?.includes(currentUser._id),
  );
  const isActionLoading = actionStatus === "loading" || processingState !== null;

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
      const sanitized = trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;
      dispatch(searchUsers(sanitized || trimmed));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, showAddMembers, dispatch]);

  const handleStartRename = () => {
    if (isActionLoading) return;
    setNameInput(conversation.name);
    setIsEditingName(true);
  };

  const handleRename = async (e: FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || nameInput === conversation.name || isActionLoading) {
      setIsEditingName(false);
      return;
    }

    try {
      setProcessingState({ type: "rename" });
      await dispatch(
        renameGroup({ conversationId: conversation._id, name: nameInput.trim() }),
      ).unwrap();
      setIsEditingName(false);
    } catch {
      // Handled in state
    } finally {
      setProcessingState(null);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal || isActionLoading) return;

    if (confirmModal.type === "promote") {
      const userId = confirmModal.user._id;
      setProcessingState({ type: "promote", userId });
      setConfirmModal(null);
      try {
        await dispatch(promoteAdmin({ conversationId: conversation._id, userId })).unwrap();
      } catch {
        // Handled in state
      } finally {
        setProcessingState(null);
      }
    } else if (confirmModal.type === "remove") {
      const userId = confirmModal.user._id;
      setProcessingState({ type: "remove", userId });
      setConfirmModal(null);
      try {
        await dispatch(removeParticipant({ conversationId: conversation._id, userId })).unwrap();
      } catch {
        // Handled in state
      } finally {
        setProcessingState(null);
      }
    } else if (confirmModal.type === "leave") {
      if (!currentUser) return;
      setProcessingState({ type: "leave" });
      setConfirmModal(null);
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
      } finally {
        setProcessingState(null);
      }
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
      setProcessingState({ type: "add" });
      await dispatch(
        addParticipants({
          conversationId: conversation._id,
          userIds: selectedToAdd.map((u) => u._id),
        }),
      ).unwrap();
      handleCloseAddMembers();
    } catch {
      // Handled in state
    } finally {
      setProcessingState(null);
    }
  };

  const content = (
    <div className="flex h-full flex-col overflow-hidden bg-[#fbfaf6]">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-black/10 p-4 bg-white/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#2f7d68]" />
          <h3 className="text-sm font-bold text-[#181d1a]">Group Information</h3>
        </div>
        <button
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-xl text-[#7c837c] hover:bg-black/5 hover:text-[#181d1a] transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {actionError && (
          <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {actionError}
          </div>
        )}

        {/* Group Avatar & Name Section */}
        <div className="text-center pb-4 border-b border-black/10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#2f7d68]/20 to-teal-100 text-[#2f7d68] mb-3 shadow-inner">
            <Users className="h-8 w-8" />
          </div>

          {isEditingName ? (
            <form onSubmit={handleRename} className="flex items-center gap-1.5 mt-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                disabled={isActionLoading}
                className="w-full rounded-xl border border-black/15 bg-white px-3 py-1.5 text-sm font-semibold text-[#1c221e] outline-none focus:border-[#2f7d68]"
              />
              <button
                type="submit"
                disabled={isActionLoading}
                className="grid h-8 w-8 place-items-center rounded-xl bg-[#1f5f51] text-white shadow-xs disabled:opacity-50"
              >
                {processingState?.type === "rename" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => setIsEditingName(false)}
                className="grid h-8 w-8 place-items-center rounded-xl bg-black/5 text-[#5e665e]"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-base font-bold text-[#181d1a]">{conversation.name}</h2>
              {isAdmin && (
                <button
                  onClick={handleStartRename}
                  disabled={isActionLoading}
                  className="grid h-6 w-6 place-items-center rounded-md text-[#788078] hover:bg-black/5 hover:text-[#181d1a] transition disabled:opacity-40"
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
            <h4 className="text-xs font-bold text-[#485049] uppercase tracking-wider">
              Members
            </h4>
            {isAdmin && !showAddMembers && (
              <button
                onClick={() => setShowAddMembers(true)}
                disabled={isActionLoading}
                className="flex items-center gap-1 text-xs font-semibold text-[#2f7d68] hover:underline disabled:opacity-40"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>

          {/* Add Members Inline Panel */}
          {showAddMembers && (
            <div className="mb-4 rounded-2xl border border-black/10 bg-white p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2f7d68]">Add new members</span>
                <button
                  onClick={handleCloseAddMembers}
                  disabled={isActionLoading}
                  className="text-xs text-[#788078] hover:text-black font-medium"
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
                  placeholder="Search user by name..."
                  className="w-full rounded-xl border border-black/10 bg-[#faf8f5] py-2 pl-8 pr-3 text-xs outline-none focus:border-[#2f7d68]"
                />
              </div>

              {/* Search results */}
              <div className="max-h-36 overflow-y-auto space-y-1">
                {searchStatus === "loading" && (
                  <div className="py-2 text-center text-xs text-[#788078]">
                    <Loader2 className="inline h-3 w-3 animate-spin mr-1 text-[#2f7d68]" />
                    Searching...
                  </div>
                )}

                {searchResults.map((u) => {
                  const isAlreadyMember = conversation.participants?.some((p) => p._id === u._id);
                  const isSelected = selectedToAdd.some((sel) => sel._id === u._id);

                  return (
                    <button
                      key={u._id}
                      type="button"
                      disabled={isAlreadyMember || isActionLoading}
                      onClick={() => {
                        if (isAlreadyMember) return;
                        if (isSelected) {
                          setSelectedToAdd(selectedToAdd.filter((sel) => sel._id !== u._id));
                        } else {
                          setSelectedToAdd([...selectedToAdd, u]);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition ${
                        isAlreadyMember
                          ? "bg-black/[0.02] opacity-60 cursor-default"
                          : isSelected
                          ? "bg-[#2f7d68]/15 border border-[#2f7d68]/30"
                          : "hover:bg-black/5"
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-[#1c221e]">{u.name}</span>
                        <p className="text-[10px] text-[#788078]">{u.phone}</p>
                      </div>

                      {isAlreadyMember ? (
                        <span className="text-[10px] text-[#788078] bg-black/5 px-1.5 py-0.5 rounded-md">
                          In group
                        </span>
                      ) : (
                        <div
                          className={`grid h-4 w-4 place-items-center rounded-md border ${
                            isSelected
                              ? "bg-[#2f7d68] border-[#2f7d68] text-white"
                              : "border-black/20"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedToAdd.length > 0 && (
                <button
                  onClick={handleAddSelectedParticipants}
                  disabled={isActionLoading}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#216d5b] to-[#144f41] py-2 text-xs font-bold text-white shadow-xs hover:scale-101 active:scale-99 transition disabled:opacity-50"
                >
                  {processingState?.type === "add" && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>
                    {processingState?.type === "add"
                      ? "Adding members..."
                      : `Add ${selectedToAdd.length} user(s)`}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2">
            {conversation.participants?.map((participant: User) => {
              const isMemberAdmin = conversation.admins?.includes(participant._id);
              const isMe = participant._id === currentUser?._id;
              const isUserOnline = isMe || Boolean(onlineUsers[participant._id]);
              const isPromotingThis =
                processingState?.type === "promote" &&
                processingState.userId === participant._id;
              const isRemovingThis =
                processingState?.type === "remove" &&
                processingState.userId === participant._id;

              return (
                <div
                  key={participant._id}
                  className="flex items-center justify-between rounded-2xl p-2.5 bg-white/80 border border-black/5 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-bold shadow-xs bg-gradient-to-br ${getAvatarGradient(
                          participant.name,
                        )}`}
                      >
                        {initials(participant.name)}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                          isUserOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                        }`}
                        title={isUserOnline ? "Online" : "Offline"}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-bold text-[#181d1a]">
                          {participant.name} {isMe && "(You)"}{" "}
                          <span
                            className={`font-semibold ${
                              isUserOnline ? "text-emerald-600" : "text-[#788078]"
                            }`}
                          >
                            ({isUserOnline ? "Online" : "Offline"})
                          </span>
                        </p>
                      </div>
                      <p className="truncate text-[10px] text-[#788078]">{participant.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isMemberAdmin && (
                      <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[#2f7d68]/15 to-emerald-100 px-2 py-0.5 text-[9px] font-bold text-[#1f5f51]">
                        <Shield className="h-2.5 w-2.5" />
                        Admin
                      </span>
                    )}

                    {isAdmin && !isMemberAdmin && !isMe && (
                      <button
                        onClick={() => setConfirmModal({ type: "promote", user: participant })}
                        disabled={isActionLoading}
                        title="Promote to Admin"
                        className="grid h-7 w-7 place-items-center rounded-lg text-[#788078] hover:bg-black/5 hover:text-[#2f7d68] transition disabled:opacity-40"
                      >
                        {isPromotingThis ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2f7d68]" />
                        ) : (
                          <Shield className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}

                    {isAdmin && !isMe && (
                      <button
                        onClick={() => setConfirmModal({ type: "remove", user: participant })}
                        disabled={isActionLoading}
                        title="Remove member"
                        className="grid h-7 w-7 place-items-center rounded-lg text-[#788078] hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
                      >
                        {isRemovingThis ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                        ) : (
                          <UserMinus className="h-3.5 w-3.5" />
                        )}
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
            onClick={() => setConfirmModal({ type: "leave" })}
            disabled={isActionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/60 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-50"
          >
            {processingState?.type === "leave" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            <span>{processingState?.type === "leave" ? "Leaving..." : "Leave Group"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop & Sliding Modal */}
      <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs animate-backdrop-in cursor-pointer"
        />
        <aside className="relative z-10 w-[85%] max-w-sm h-full border-l border-black/10 bg-[#fbfaf6] shadow-2xl animate-drawer-right">
          {content}
        </aside>
      </div>

      {/* Desktop Inline Sidebar (Docked) */}
      <aside className="hidden lg:flex w-80 shrink-0 border-l border-black/10 bg-[#fbfaf6] flex-col h-full overflow-hidden animate-drawer-right">
        {content}
      </aside>

      {/* Confirmation Modal for Group Actions */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-backdrop-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-black/10 bg-white p-6 shadow-2xl animate-modal-in">
            <button
              onClick={() => setConfirmModal(null)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl text-[#7c837c] hover:bg-black/5 hover:text-[#1a1f1c] transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              {confirmModal.type === "promote" && (
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-[#1f5f51] shadow-inner">
                  <Shield className="h-7 w-7" />
                </div>
              )}
              {confirmModal.type === "remove" && (
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600 shadow-inner">
                  <UserMinus className="h-7 w-7" />
                </div>
              )}
              {confirmModal.type === "leave" && (
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700 shadow-inner">
                  <AlertTriangle className="h-7 w-7" />
                </div>
              )}

              <h3 className="text-lg font-bold text-[#181d1a]">
                {confirmModal.type === "promote" && "Promote to Admin?"}
                {confirmModal.type === "remove" && "Remove from Group?"}
                {confirmModal.type === "leave" && "Leave this Group?"}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-[#6c746d]">
                {confirmModal.type === "promote" && (
                  <>
                    Are you sure you want to promote{" "}
                    <span className="font-bold text-[#181d1a]">{confirmModal.user.name}</span> to a
                    group admin? They will be able to add/remove participants and manage settings.
                  </>
                )}
                {confirmModal.type === "remove" && (
                  <>
                    Are you sure you want to remove{" "}
                    <span className="font-bold text-[#181d1a]">{confirmModal.user.name}</span> from
                    this group? They will no longer have access to group messages.
                  </>
                )}
                {confirmModal.type === "leave" && (
                  <>
                    Are you sure you want to leave{" "}
                    <span className="font-bold text-[#181d1a]">{conversation.name}</span>? You will no
                    longer receive updates from this conversation.
                  </>
                )}
              </p>

              <div className="mt-6 flex w-full gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  disabled={isActionLoading}
                  className="flex-1 rounded-2xl border border-black/10 bg-[#faf8f5] py-2.5 text-xs font-semibold text-[#404842] hover:bg-black/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isActionLoading}
                  className={`flex-1 rounded-2xl py-2.5 text-xs font-bold text-white shadow-md transition ${
                    confirmModal.type === "promote"
                      ? "bg-[#1f5f51] hover:bg-[#184c41] shadow-emerald-600/20"
                      : "bg-[#c53929] hover:bg-[#a82d1f] shadow-red-500/20"
                  }`}
                >
                  {confirmModal.type === "promote" && "Promote to Admin"}
                  {confirmModal.type === "remove" && "Remove Member"}
                  {confirmModal.type === "leave" && "Leave Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
