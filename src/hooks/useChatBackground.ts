"use client";

import { useSyncExternalStore } from "react";
import {
  CHAT_BACKGROUNDS,
  DEFAULT_BACKGROUND_ID,
  getSavedBackgroundId,
  saveBackgroundId,
  type ChatBackground,
} from "@/lib/backgrounds";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("tag_chat_wallpaper_changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("tag_chat_wallpaper_changed", callback);
    window.removeEventListener("storage", callback);
  };
}

export function useChatBackground() {
  const backgroundId = useSyncExternalStore(
    subscribe,
    getSavedBackgroundId,
    () => DEFAULT_BACKGROUND_ID,
  );

  const currentBackground: ChatBackground =
    CHAT_BACKGROUNDS.find((b) => b.id === backgroundId) || CHAT_BACKGROUNDS[0];

  const selectBackground = (id: string) => {
    saveBackgroundId(id);
  };

  return {
    currentBackground,
    backgroundId,
    selectBackground,
    backgrounds: CHAT_BACKGROUNDS,
  };
}
