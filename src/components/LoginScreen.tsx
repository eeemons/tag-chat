"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Phone, Sparkles, UserRound } from "lucide-react";
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
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-6 text-[#1d211f] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2f7d68]/20 bg-white/70 px-4 py-2 text-sm font-medium text-[#2f7d68] shadow-sm">
            <Sparkles className="h-4 w-4" />
            Real-time chat workspace
          </div>
          <div className="space-y-5">
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-normal text-[#171a18] sm:text-6xl">
              Conversations that feel quick, clear, and composed.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[#5f665f]">
              Sign in with a phone number and name, then start direct chats,
              create groups, and watch messages arrive without refreshing.
            </p>
          </div>
          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            {["Direct chats", "Groups", "Live updates"].map((label) => (
              <div
                className="rounded-lg border border-black/10 bg-white/70 p-4 shadow-sm"
                key={label}
              >
                <p className="text-sm font-semibold text-[#1f2421]">{label}</p>
                <p className="mt-1 text-xs leading-5 text-[#767d75]">
                  Built into the first usable screen.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(31,36,33,0.14)]">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#2f7d68] text-white">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Enter chat</h2>
              <p className="text-sm text-[#737970]">New numbers register automatically.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#3d443f]">
                Phone number
              </span>
              <span className="flex items-center gap-3 rounded-lg border border-black/10 bg-[#faf9f6] px-4 py-3 focus-within:border-[#2f7d68] focus-within:ring-4 focus-within:ring-[#2f7d68]/10">
                <Phone className="h-4 w-4 text-[#788079]" />
                <input
                  className="w-full bg-transparent text-base outline-none placeholder:text-[#a1a79f]"
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
              <span className="mb-2 block text-sm font-medium text-[#3d443f]">
                Display name
              </span>
              <span className="flex items-center gap-3 rounded-lg border border-black/10 bg-[#faf9f6] px-4 py-3 focus-within:border-[#2f7d68] focus-within:ring-4 focus-within:ring-[#2f7d68]/10">
                <UserRound className="h-4 w-4 text-[#788079]" />
                <input
                  className="w-full bg-transparent text-base outline-none placeholder:text-[#a1a79f]"
                  onChange={(event) => {
                    dispatch(clearAuthError());
                    setName(event.target.value);
                  }}
                  placeholder="Ada Lovelace"
                  value={name}
                />
              </span>
            </label>

            {error ? (
              <p className="rounded-lg border border-[#b44a3c]/20 bg-[#fff0ed] px-3 py-2 text-sm text-[#9d392b]">
                {error}
              </p>
            ) : null}

            <button
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#1f5f51] px-4 font-semibold text-white shadow-lg shadow-[#1f5f51]/20 transition duration-200 hover:bg-[#194e43] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!phone.trim() || !name.trim() || status === "loading"}
              type="submit"
            >
              {status === "loading" ? "Signing in..." : "Continue"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

