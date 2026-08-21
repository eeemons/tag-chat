"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Phone, Sparkles, UserRound, Zap, Shield, Users } from "lucide-react";
import { clearAuthError, login } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phone.trim() || !name.trim()) return;
    await dispatch(login({ phone: phone.trim(), name: name.trim() }));
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-[#faf8f4] to-[#ebe4d5] px-4 py-8 text-[#1d211f] sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Intro Hero */}
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-white/80 px-4 py-1.5 text-xs font-bold text-[#1f5f51] shadow-2xs backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Real-time chat workspace
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight text-[#141816] sm:text-6xl">
              Conversations that feel{" "}
              <span className="bg-gradient-to-r from-[#1f5f51] to-emerald-600 bg-clip-text text-transparent">
                quick, live & composed.
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[#586059]">
              Sign in with your phone number and name. Jump straight into direct messaging, group channels, and real-time updates without refreshing.
            </p>
          </div>

          <div className="grid max-w-xl gap-3.5 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-xs backdrop-blur-xs hover:border-[#2f7d68]/40 transition">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-[#1f5f51] mb-2.5">
                <Zap className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-[#1a1f1c]">Direct Chats</p>
              <p className="mt-0.5 text-xs text-[#737a73]">Instant 1-to-1 conversations.</p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-xs backdrop-blur-xs hover:border-[#2f7d68]/40 transition">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-teal-700 mb-2.5">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-[#1a1f1c]">Group Channels</p>
              <p className="mt-0.5 text-xs text-[#737a73]">Multi-user collaboration & admin tools.</p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-xs backdrop-blur-xs hover:border-[#2f7d68]/40 transition">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-700 mb-2.5">
                <Shield className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-[#1a1f1c]">Live Sync</p>
              <p className="mt-0.5 text-xs text-[#737a73]">WebSocket streaming engine.</p>
            </div>
          </div>
        </section>

        {/* Right Form Card */}
        <section className="rounded-3xl border border-black/10 bg-white p-7 sm:p-9 shadow-[0_24px_80px_rgba(25,35,30,0.12)]">
          <div className="mb-7 flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#216d5b] to-[#124d3f] text-white shadow-md shadow-[#216d5b]/30">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#151917]">Enter chat workspace</h2>
              <p className="text-xs text-[#6e756e]">New numbers register automatically.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3d453f]">
                Phone number
              </span>
              <span className="flex items-center gap-3 rounded-2xl border border-black/15 bg-[#faf8f5] px-4 py-3 focus-within:border-[#2f7d68] focus-within:ring-2 focus-within:ring-[#2f7d68]/15 transition">
                <Phone className="h-4 w-4 text-[#788079]" />
                <input
                  className="w-full bg-transparent text-sm text-[#181c1a] font-medium outline-none placeholder:text-[#a1a79f]"
                  onChange={(event) => {
                    dispatch(clearAuthError());
                    setPhone(event.target.value);
                  }}
                  placeholder="+15551234567"
                  value={phone}
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3d453f]">
                Display name
              </span>
              <span className="flex items-center gap-3 rounded-2xl border border-black/15 bg-[#faf8f5] px-4 py-3 focus-within:border-[#2f7d68] focus-within:ring-2 focus-within:ring-[#2f7d68]/15 transition">
                <UserRound className="h-4 w-4 text-[#788079]" />
                <input
                  className="w-full bg-transparent text-sm text-[#181c1a] font-medium outline-none placeholder:text-[#a1a79f]"
                  onChange={(event) => {
                    dispatch(clearAuthError());
                    setName(event.target.value);
                  }}
                  placeholder="Ada Lovelace"
                  value={name}
                />
              </span>
            </label>

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                {error}
              </p>
            )}

            <button
              className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#216d5b] to-[#144f41] px-4 font-bold text-sm text-white shadow-lg shadow-[#216d5b]/25 transition duration-200 hover:scale-101 active:scale-99 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!phone.trim() || !name.trim() || status === "loading"}
              type="submit"
            >
              {status === "loading" ? "Signing in..." : "Continue into Chat"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
