"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  Radio,
  Palette,
  Check,
  CheckCheck,
  Smile,
  Bell,
  Smartphone,
  Flame,
  Crown,
} from "lucide-react";
import { CHAT_BACKGROUNDS } from "@/lib/backgrounds";

export default function LandingPage() {
  const [selectedBgId, setSelectedBgId] = useState("dots");
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);
  const [simulatedTyping, setSimulatedTyping] = useState(true);

  // Toggle simulated typing indicator periodically for playful feel
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedTyping((prev) => !prev);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const activeBg = CHAT_BACKGROUNDS.find((b) => b.id === selectedBgId) || CHAT_BACKGROUNDS[0];

  const triggerReaction = (emoji: string) => {
    setFloatingReaction(emoji);
    setTimeout(() => setFloatingReaction(null), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f4] via-[#f5f1e8] to-[#ebe4d5] text-[#1d211f] selection:bg-[#2f7d68]/20 selection:text-[#1d211f]">
      {/* ================= TOP NAVIGATION ================= */}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#216d5b] to-[#124d3f] text-white shadow-md shadow-[#216d5b]/25">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#161a18]">Tag Chat</span>
              <span className="ml-2 hidden sm:inline-block rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-extrabold text-[#1f5f51]">
                v2.0 Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-bold text-[#2c332e] shadow-2xs hover:border-[#2f7d68]/40 hover:text-[#2f7d68] transition"
            >
              Sign In
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#216d5b] to-[#144f41] px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-[#216d5b]/25 transition hover:scale-102 active:scale-98"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <main className="space-y-24 py-12 sm:py-20">
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header Copy */}
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-white px-4 py-1.5 text-xs font-bold text-[#1f5f51] shadow-2xs">
              <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span>Real-Time Messaging Platform</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#121614] sm:text-6xl sm:leading-[1.1]">
              Conversations crafted with{" "}
              <span className="bg-gradient-to-r from-[#1f5f51] via-[#2f7d68] to-emerald-600 bg-clip-text text-transparent">
                speed, style & clarity.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#555d56]">
              Experience fluid 1-on-1 chats, rich group collaboration with admin tools, customizable textured wallpapers, and instantaneous live updates.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                href="/chat"
                className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#216d5b] to-[#144f41] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#216d5b]/30 transition hover:scale-103 active:scale-98"
              >
                <span>Start Chatting Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#interactive-demo"
                className="rounded-2xl border border-black/15 bg-white px-6 py-3.5 text-sm font-bold text-[#2b322d] shadow-2xs hover:bg-[#faf8f4] hover:border-[#2f7d68]/40 transition"
              >
                Explore Live Demo ↓
              </a>
            </div>
          </div>

          {/* ================= INTERACTIVE UI SNAPSHOT / LIVE MOCKUP ================= */}
          <div id="interactive-demo" className="mt-16 scroll-mt-24">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-black/15 bg-white shadow-[0_30px_90px_rgba(25,35,30,0.18)]">
              {/* Window Top Titlebar */}
              <div className="flex items-center justify-between border-b border-black/10 bg-[#f7f5f0] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-xs font-bold text-[#626a63]">Tag Chat — Live Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-[#1f5f51]">
                    <Radio className="h-3 w-3 animate-pulse" />
                    WebSocket Connected
                  </span>
                </div>
              </div>

              {/* Wallpaper Switcher Ribbon (Re-imagined for Mobile & Desktop) */}
              <div className="flex items-center gap-2 border-b border-black/10 bg-white/95 px-3 py-2 text-xs sm:justify-between sm:px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center gap-1.5 shrink-0 rounded-full bg-emerald-50/90 px-2.5 py-1 text-[11px] font-bold text-[#1f5f51] border border-emerald-600/15 whitespace-nowrap">
                  <Palette className="h-3.5 w-3.5 text-[#2f7d68]" />
                  <span>Themes:</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0 sm:shrink">
                  {CHAT_BACKGROUNDS.slice(0, 5).map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBgId(bg.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap shrink-0 transition ${
                        selectedBgId === bg.id
                          ? "bg-[#1f5f51] text-white shadow-2xs scale-102"
                          : "bg-black/5 text-[#48504a] hover:bg-black/10"
                      }`}
                    >
                      <span>{bg.name}</span>
                      {selectedBgId === bg.id && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Simulation Viewport */}
              <div className="grid h-[420px] sm:grid-cols-[280px_1fr]">
                {/* Left Mini Sidebar */}
                <div className="hidden sm:flex flex-col border-r border-black/10 bg-[#fcfbf8]">
                  <div className="p-3 border-b border-black/10">
                    <span className="text-xs font-bold text-[#161a18]">Active Chats</span>
                  </div>
                  <div className="flex-1 space-y-1 p-2 overflow-y-auto">
                    {/* Active Conversation */}
                    <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-[#2f7d68]/30 p-2.5 shadow-2xs">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#2f7d68] to-[#124d3f] text-white text-xs font-bold shrink-0">
                        FB
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#1a1f1c] truncate">Footballers</p>
                          <span className="text-[10px] text-[#717871]">Just now</span>
                        </div>
                        <p className="text-[11px] text-[#2f7d68] font-semibold truncate animate-pulse">
                          {simulatedTyping ? "Julian is typing..." : "See you at the field!"}
                        </p>
                      </div>
                    </div>

                    {/* Other Conversations */}
                    <div className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-black/5 transition">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#e07a5f] to-[#b85b43] text-white text-xs font-bold shrink-0">
                        RL
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#1a1f1c] truncate">Romelu Lukaku</p>
                          <span className="text-[10px] text-[#717871]">2m</span>
                        </div>
                        <p className="text-[11px] text-[#717871] truncate">How are you doing?</p>
                      </div>
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#1f5f51] text-[9px] font-bold text-white">
                        2
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-black/5 transition">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#3d5a80] to-[#293241] text-white text-xs font-bold shrink-0">
                        AL
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#1a1f1c] truncate">Ada Lovelace</p>
                          <span className="text-[10px] text-[#717871]">1h</span>
                        </div>
                        <p className="text-[11px] text-[#717871] truncate">The code is pushed.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Chat Area with Dynamic Wallpaper */}
                <div className="relative flex flex-col justify-between overflow-hidden bg-[#faf8f5]">
                  {/* Dynamic Wallpaper Layer */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-300"
                    style={{
                      backgroundColor: activeBg.previewBg,
                      backgroundImage: activeBg.cssPattern.match(/background-image:\s*([^;]+);/)?.[1] || "",
                      backgroundSize: activeBg.cssPattern.match(/background-size:\s*([^;]+);/)?.[1] || "",
                      backgroundPosition: activeBg.cssPattern.match(/background-position:\s*([^;]+);/)?.[1] || "",
                      backgroundRepeat: activeBg.cssPattern.match(/background-repeat:\s*([^;]+);/)?.[1] || "repeat",
                    }}
                  />

                  {/* Top Bar of Active Chat */}
                  <div className="relative z-10 flex items-center justify-between border-b border-black/10 bg-white/90 px-4 py-2.5 backdrop-blur-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#2f7d68] to-[#124d3f] text-white text-xs font-bold">
                        FB
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#181d1a]">Footballers</p>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-[#1f5f51]">
                            Group (3)
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6d756d]">Romelu, Julian, You</p>
                      </div>
                    </div>

                    {/* Reaction Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => triggerReaction("🔥")}
                        className="rounded-lg p-1.5 text-xs hover:bg-black/5 transition hover:scale-115"
                        title="React Fire"
                      >
                        🔥
                      </button>
                      <button
                        onClick={() => triggerReaction("❤️")}
                        className="rounded-lg p-1.5 text-xs hover:bg-black/5 transition hover:scale-115"
                        title="React Heart"
                      >
                        ❤️
                      </button>
                      <button
                        onClick={() => triggerReaction("🚀")}
                        className="rounded-lg p-1.5 text-xs hover:bg-black/5 transition hover:scale-115"
                        title="React Rocket"
                      >
                        🚀
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="relative z-10 flex-1 space-y-3 p-4 overflow-y-auto">
                    {/* Incoming Message */}
                    <div className="flex items-end gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#e07a5f] to-[#b85b43] text-white text-[10px] font-bold shrink-0">
                        RL
                      </div>
                      <div className="max-w-[75%] rounded-2xl rounded-bl-xs border border-black/10 bg-white p-3 shadow-xs">
                        <p className="text-[10px] font-bold text-[#e07a5f] mb-0.5">Romelu Lukaku</p>
                        <p className="text-xs text-[#1a1f1c]">Are we playing today evening at 6 PM?</p>
                        <span className="mt-1 block text-right text-[9px] text-[#868e87]">6:40 PM</span>
                      </div>
                    </div>

                    {/* Outgoing Message (You) */}
                    <div className="flex items-end justify-end gap-2">
                      <div className="max-w-[75%] rounded-2xl rounded-br-xs bg-gradient-to-br from-[#1f5f51] to-[#124d3f] p-3 text-white shadow-md shadow-[#1f5f51]/20">
                        <p className="text-xs font-medium">Yes! Julian and I are already geared up.</p>
                        <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-emerald-100/90">
                          <span>6:41 PM</span>
                          <CheckCheck className="h-3 w-3 text-emerald-300" />
                        </div>
                      </div>
                    </div>

                    {/* Live Typing Simulation */}
                    {simulatedTyping && (
                      <div className="flex items-center gap-2 animate-fade-in">
                        <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#e76f51] to-[#f4a261] text-white text-[10px] font-bold shrink-0">
                          JA
                        </div>
                        <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-black/10 bg-white/90 px-3 py-2 shadow-xs">
                          <span className="text-[10px] font-semibold text-[#6e756e]">Julian is typing</span>
                          <span className="flex gap-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#2f7d68] animate-bounce [animation-delay:0ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-[#2f7d68] animate-bounce [animation-delay:150ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-[#2f7d68] animate-bounce [animation-delay:300ms]" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Input Preview */}
                  <div className="relative z-10 border-t border-black/10 bg-white/95 p-3 backdrop-blur-xs flex items-center gap-2">
                    <div className="flex-1 rounded-xl border border-black/15 bg-[#faf8f5] px-3.5 py-2 text-xs text-[#7e857f] flex items-center justify-between">
                      <span>Type here...</span>
                      <Smile className="h-3.5 w-3.5 text-[#9ea49e]" />
                    </div>
                    <button className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#216d5b] to-[#144f41] text-white shadow-xs">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Playful Floating Reaction Animation */}
                  {floatingReaction && (
                    <div className="pointer-events-none absolute bottom-16 right-8 text-3xl animate-bounce">
                      {floatingReaction}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= USER-FRIENDLY & PLAYFUL FEATURE CARDS ================= */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-white px-3.5 py-1 text-xs font-bold text-[#1f5f51] shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
              <span>Why You&apos;ll Love Tag Chat</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#141816] sm:text-4xl">
              Chatting made delightfully simple & lively.
            </h2>
            <p className="text-sm sm:text-base text-[#5c645e] leading-relaxed">
              Packed with fun features, instant messaging, and customizable styles made for everyday conversations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Lightning Fast 1-on-1 */}
            <div className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white p-7 shadow-xs hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-600/25 group-hover:rotate-6 transition duration-300">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#1f5f51]">
                    Instant Delivery
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#181d1a] group-hover:text-[#1f5f51] transition">
                  Lightning Fast 1-on-1 Chats
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#687069]">
                  Send and receive messages the moment you press Enter. No waiting, no delays — just fluid, continuous conversations.
                </p>
              </div>

              {/* Playful Interactive Mini-Widget */}
              <div className="mt-5 rounded-2xl bg-[#faf8f5] p-3 border border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[11px] font-semibold text-[#3a423c]">Message Sent</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#1f5f51]">
                  <span>Delivered</span>
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Card 2: Group Hangouts */}
            <div className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white p-7 shadow-xs hover:shadow-2xl hover:border-teal-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-700 text-white shadow-md shadow-teal-600/25 group-hover:rotate-6 transition duration-300">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
                    Squads & Teams
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#181d1a] group-hover:text-teal-800 transition">
                  Supercharged Group Hangouts
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#687069]">
                  Bring your friends, family, or teammates together. Assign group admins, add new members, and keep everyone connected.
                </p>
              </div>

              {/* Playful Avatar Stack Widget */}
              <div className="mt-5 rounded-2xl bg-[#faf8f5] p-3 border border-black/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#e07a5f] text-white text-[10px] font-bold ring-2 ring-white">
                    RL
                  </div>
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#f4a261] text-white text-[10px] font-bold ring-2 ring-white">
                    JA
                  </div>
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#2a9d8f] text-white text-[10px] font-bold ring-2 ring-white">
                    AL
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  <Crown className="h-3 w-3 text-amber-600" />
                  Admin Tools
                </span>
              </div>
            </div>

            {/* Card 3: 10 Custom Wallpapers */}
            <div className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white p-7 shadow-xs hover:shadow-2xl hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-600/25 group-hover:rotate-6 transition duration-300">
                    <Palette className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                    10 Textures
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#181d1a] group-hover:text-amber-800 transition">
                  Dress Up Your Chat Background
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#687069]">
                  Bored of plain backgrounds? Choose from 10 textured themes — from warm parchment paper to starry midnight constellations.
                </p>
              </div>

              {/* Playful Wallpaper Swatch Widget */}
              <div className="mt-5 rounded-2xl bg-[#faf8f5] p-3 border border-black/5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#444c45]">Styles:</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-[#faf8f5] border-2 border-[#1f5f51] shadow-2xs" />
                  <span className="h-5 w-5 rounded-full bg-[#f2f7f4] border border-black/10" />
                  <span className="h-5 w-5 rounded-full bg-[#f6f7fa] border border-black/10" />
                  <span className="h-5 w-5 rounded-full bg-[#121614] border border-black/10" />
                </div>
              </div>
            </div>

            {/* Card 4: Live Typing Waves */}
            <div className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white p-7 shadow-xs hover:shadow-2xl hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-600/25 group-hover:rotate-6 transition duration-300">
                    <Radio className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-800">
                    Live Presence
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#181d1a] group-hover:text-indigo-800 transition">
                  Real-Time Typing Waves
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#687069]">
                  Never talk over someone again. See animated typing indicators the moment your friends start composing a thought.
                </p>
              </div>

              {/* Playful Typing Dots Widget */}
              <div className="mt-5 rounded-2xl bg-[#faf8f5] p-3 border border-black/5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#5c645e]">Someone is typing</span>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>

            {/* Card 5: Pocket Sized & Full Screen */}
            <div className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white p-7 shadow-xs hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-700/25 group-hover:rotate-6 transition duration-300">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
                    Any Screen
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#181d1a] group-hover:text-emerald-900 transition">
                  Pocket-Sized & Edge-to-Edge
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#687069]">
                  Whether you&apos;re on a wide desktop display or a mobile phone, the smooth slide drawer and full-screen layout feel just right.
                </p>
              </div>

              {/* Playful Device Badge Widget */}
              <div className="mt-5 rounded-2xl bg-[#faf8f5] p-3 border border-black/5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#444c45]">Mobile Slide Drawer</span>
                <span className="rounded-md bg-emerald-100/90 px-2 py-0.5 text-[10px] font-extrabold text-[#1f5f51]">
                  Smooth 60FPS
                </span>
              </div>
            </div>

            {/* Card 6: Smart Unread Alerts */}
            <div className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white p-7 shadow-xs hover:shadow-2xl hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-600/25 group-hover:rotate-6 transition duration-300">
                    <Bell className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                    Never Miss Out
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#181d1a] group-hover:text-rose-800 transition">
                  Smart Unread Badges & Alerts
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#687069]">
                  Glowing badge counters and live browser tab indicators keep you aware of incoming messages without overwhelming you.
                </p>
              </div>

              {/* Playful Badge Counter Widget */}
              <div className="mt-5 rounded-2xl bg-[#faf8f5] p-3 border border-black/5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#444c45]">Unread Messages</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1f5f51] px-1.5 text-[10px] font-extrabold text-white animate-pulse">
                  3 New
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CALL TO ACTION SECTION ================= */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b4d42] via-[#216d5b] to-[#123e35] p-8 sm:p-14 text-white shadow-2xl text-center space-y-6">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-teal-300/20 blur-3xl" />

            <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-emerald-100 backdrop-blur-xs mb-2">
                <Flame className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
                <span>Jump straight in — No setup required</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to experience Tag Chat?
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                Sign in with your phone number and name to begin direct messaging and group collaboration in seconds.
              </p>
            </div>

            <div className="relative z-10 pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-[#1f5f51] shadow-xl transition hover:scale-104 active:scale-98 hover:bg-[#faf8f5]"
              >
                <span>Launch Tag Chat Application</span>
                <ArrowRight className="h-4 w-4 text-[#1f5f51]" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-black/10 bg-white/60 py-8 text-center text-xs text-[#717871]">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-lg bg-[#2f7d68] text-white text-[10px] font-bold">
              TC
            </div>
            <span className="font-bold text-[#181d1a]">Tag Chat</span>
            <span>— Real-Time Messaging Platform</span>
          </div>

          <div className="flex items-center gap-5 font-semibold text-[#4e5550]">
            <Link href="/chat" className="hover:text-[#2f7d68] transition">
              Open App
            </Link>
            <Link href="/chat" className="hover:text-[#2f7d68] transition">
              Direct Sign-In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
