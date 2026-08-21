"use client";

import { LogOut, X } from "lucide-react";

interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  open,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-backdrop-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-black/10 bg-white p-6 shadow-2xl animate-modal-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[#7c837c] hover:bg-black/5 hover:text-[#1a1f1c] transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600 shadow-inner">
            <LogOut className="h-7 w-7" />
          </div>

          <h3 className="text-lg font-bold text-[#181d1a]">Log out of Tag Chat?</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#6c746d]">
            You will need to sign in again with your phone number to access your chats and messages.
          </p>

          <div className="mt-6 flex w-full gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-black/10 bg-[#faf8f5] py-2.5 text-xs font-semibold text-[#404842] hover:bg-black/5 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-[#c53929] py-2.5 text-xs font-semibold text-white shadow-md shadow-red-500/20 hover:bg-[#a82d1f] transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
