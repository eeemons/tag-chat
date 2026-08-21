"use client";

import { X, Check, Sparkles } from "lucide-react";
import { CHAT_BACKGROUNDS, type ChatBackground } from "@/lib/backgrounds";

interface BackgroundSelectorModalProps {
  open: boolean;
  onClose: () => void;
  currentBackgroundId: string;
  onSelect: (id: string) => void;
}

export function BackgroundSelectorModal({
  open,
  onClose,
  currentBackgroundId,
  onSelect,
}: BackgroundSelectorModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-backdrop-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-black/10 bg-white p-6 shadow-2xl animate-modal-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#181d1a]">Chat Wallpaper & Texture</h2>
              <p className="text-xs text-[#717871]">Choose from 10 textured backgrounds</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-[#7c837c] hover:bg-black/5 hover:text-[#181d1a] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 10 Textures Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto p-1 flex-1">
          {CHAT_BACKGROUNDS.map((bg: ChatBackground) => {
            const isSelected = bg.id === currentBackgroundId;

            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => onSelect(bg.id)}
                className={`group relative flex flex-col rounded-2xl border p-2 text-left transition-all overflow-hidden ${
                  isSelected
                    ? "border-[#2f7d68] ring-2 ring-[#2f7d68]/20 shadow-md scale-102"
                    : "border-black/10 hover:border-black/20 hover:scale-101 shadow-2xs"
                }`}
              >
                {/* Texture Preview Tile */}
                <div
                  className="h-20 w-full rounded-xl relative border border-black/5 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: bg.previewBg,
                  }}
                >
                  {/* Pattern Layer */}
                  <div
                    className="absolute inset-0 opacity-80"
                    style={{
                      backgroundImage: bg.cssPattern.match(/background-image:\s*([^;]+);/)?.[1] || "",
                      backgroundSize: bg.cssPattern.match(/background-size:\s*([^;]+);/)?.[1] || "",
                      backgroundPosition: bg.cssPattern.match(/background-position:\s*([^;]+);/)?.[1] || "",
                    }}
                  />

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-[#1f5f51] text-white shadow-md animate-modal-in">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Micro simulated chat bubble for realistic preview */}
                  <div className="relative z-10 scale-85 flex flex-col gap-1 w-[80%] opacity-90">
                    <div
                      className={`h-3 w-14 rounded-full ${
                        bg.isDark ? "bg-white/20" : "bg-black/10"
                      }`}
                    />
                    <div className="h-3 w-18 self-end rounded-full bg-[#2f7d68]/60" />
                  </div>
                </div>

                {/* Info */}
                <div className="mt-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#181d1a] truncate">
                      {bg.name}
                    </span>
                    {bg.isDark && (
                      <span className="text-[9px] font-semibold text-gray-500 bg-black/5 px-1 rounded">
                        Dark
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#717871] truncate">{bg.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-black/10 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#1f5f51] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#164a3e] transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
