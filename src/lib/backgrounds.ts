export type ChatBackground = {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  cssPattern: string;
  isDark?: boolean;
};

export const CHAT_BACKGROUNDS: ChatBackground[] = [
  {
    id: "default-warm",
    name: "Warm Canvas",
    description: "Classic clean cream background",
    previewBg: "#faf8f5",
    cssPattern: `background-color: #faf8f5; background-image: radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 0); background-size: 24px 24px;`,
  },
  {
    id: "dot-grid",
    name: "Emerald Micro-Dots",
    description: "Clean minimalist dot matrix",
    previewBg: "#f4f7f4",
    cssPattern: `background-color: #f2f7f4; background-image: radial-gradient(#2f7d68 0.85px, transparent 0.85px); background-size: 16px 16px;`,
  },
  {
    id: "blueprint-grid",
    name: "Blueprint Grid",
    description: "Architectural quad-ruled drafting grid",
    previewBg: "#f5f6f8",
    cssPattern: `background-color: #f6f7fa; background-image: linear-gradient(to right, rgba(47, 125, 104, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(47, 125, 104, 0.08) 1px, transparent 1px); background-size: 20px 20px;`,
  },
  {
    id: "topography",
    name: "Topography",
    description: "Smooth contour elevation lines",
    previewBg: "#f7f5ef",
    cssPattern: `background-color: #f8f6f0; background-image: radial-gradient(circle at 50% 50%, transparent 15px, rgba(47, 125, 104, 0.06) 16px, transparent 17px), radial-gradient(circle at 0% 100%, transparent 25px, rgba(0, 0, 0, 0.04) 26px, transparent 27px); background-size: 48px 48px;`,
  },
  {
    id: "geometric-diamonds",
    name: "Diamond Lattice",
    description: "Modern diamond pattern",
    previewBg: "#f8f5f0",
    cssPattern: `background-color: #faf7f2; background-image: linear-gradient(135deg, rgba(0,0,0,0.03) 25%, transparent 25%), linear-gradient(225deg, rgba(0,0,0,0.03) 25%, transparent 25%), linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%), linear-gradient(315deg, rgba(0,0,0,0.03) 25%, #faf7f2 25%); background-position: 14px 0, 14px 0, 0 0, 0 0; background-size: 28px 28px; background-repeat: repeat;`,
  },
  {
    id: "diagonal-stripes",
    name: "Slanted Pinstripes",
    description: "Subtle diagonal architectural texture",
    previewBg: "#f5f3ec",
    cssPattern: `background-color: #f7f5ee; background-image: repeating-linear-gradient(45deg, rgba(47, 125, 104, 0.04) 0, rgba(47, 125, 104, 0.04) 1px, transparent 0, transparent 50%); background-size: 14px 14px;`,
  },
  {
    id: "linen-weave",
    name: "Linen Weave",
    description: "Organic textured fabric crosshatch",
    previewBg: "#f6f3eb",
    cssPattern: `background-color: #f5f2e9; background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.03) 50%, transparent 50%), linear-gradient(rgba(0, 0, 0, 0.03) 50%, transparent 50%); background-size: 6px 6px;`,
  },
  {
    id: "moroccan-stars",
    name: "Geometric Stars",
    description: "Intricate mosaic star polygons",
    previewBg: "#f3f6f4",
    cssPattern: `background-color: #f4f8f6; background-image: radial-gradient(circle, rgba(47, 125, 104, 0.1) 1.5px, transparent 1.5px), radial-gradient(circle, rgba(47, 125, 104, 0.07) 1px, transparent 1px); background-size: 28px 28px; background-position: 0 0, 14px 14px;`,
  },
  {
    id: "midnight-slate",
    name: "Midnight Slate",
    description: "Dark carbon velvet with glowing micro-mesh",
    previewBg: "#161b18",
    cssPattern: `background-color: #121614; background-image: radial-gradient(rgba(47, 125, 104, 0.25) 1px, transparent 0); background-size: 20px 20px;`,
    isDark: true,
  },
  {
    id: "constellation-night",
    name: "Constellation Night",
    description: "Deep cosmic slate with celestial star dust",
    previewBg: "#0f171d",
    cssPattern: `background-color: #0b1116; background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px), radial-gradient(rgba(47, 125, 104, 0.3) 1.5px, transparent 1.5px); background-size: 32px 32px; background-position: 0 0, 16px 16px;`,
    isDark: true,
  },
];

export const DEFAULT_BACKGROUND_ID = "default-warm";
const STORAGE_KEY = "tag_chat_wallpaper_id";

export function getSavedBackgroundId(): string {
  if (typeof window === "undefined") return DEFAULT_BACKGROUND_ID;
  return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_BACKGROUND_ID;
}

export function saveBackgroundId(id: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent("tag_chat_wallpaper_changed", { detail: id }));
  }
}
