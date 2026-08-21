import { emoticon } from "emoticon";
import * as emoji from "node-emoji";

// Pre-build compiled regex pattern list from the open-source `emoticon` package
// Sorted from longest to shortest emoticon strings to ensure multi-char emoticons (e.g. `:-D`) match before (`:D`)
type EmoticonMatcher = {
  regex: RegExp;
  emoji: string;
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const compiledEmoticonMatchers: EmoticonMatcher[] = (() => {
  const matchers: EmoticonMatcher[] = [];
  const entries: { text: string; emoji: string }[] = [];

  for (const item of emoticon) {
    if (item.emoticons && item.emoji) {
      for (const emo of item.emoticons) {
        entries.push({ text: emo, emoji: item.emoji });
      }
    }
  }

  // Sort longest string first to avoid partial prefix collisions
  entries.sort((a, b) => b.text.length - a.text.length);

  for (const entry of entries) {
    const escaped = escapeRegex(entry.text);
    // Matches emoticon at start of string or preceded by whitespace, followed by whitespace/punctuation/end
    const regex = new RegExp(`(^|\\s)${escaped}(?=\\s|$|[.,!?])`, "g");
    matchers.push({ regex, emoji: entry.emoji });
  }

  return matchers;
})();

/**
 * Replaces text emoticons (e.g. `:)`, `:-D`, `<3`, `:'(`) and shortcodes (e.g. `:fire:`, `:rocket:`)
 * using open-source `emoticon` & `node-emoji` packages.
 */
export function replaceEmoticonsWithEmoji(text: string): string {
  if (!text) return "";

  // 1. Process standard shortcodes via node-emoji (e.g. `:fire:` -> 🔥, `:rocket:` -> 🚀)
  let result = emoji.emojify(text);

  // 2. Process text emoticons via unified emoticon database (e.g. `:)` -> 🙂, `<3` -> ❤️)
  for (const matcher of compiledEmoticonMatchers) {
    result = result.replace(matcher.regex, `$1${matcher.emoji}`);
  }

  return result;
}

/**
 * Checks if a string consists exclusively of 1 to 3 emojis.
 */
export function isOnlyEmojis(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  const emojiRegex =
    /^(?:(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\u200D(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}))*|\s){1,3}$/u;
  return emojiRegex.test(trimmed) && trimmed.length > 0;
}
