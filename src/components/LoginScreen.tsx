"use client";

import { FormEvent, useState } from "react";
import {
  MessageCircle,
  Phone,
  UserRound,
  Zap,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { clearAuthError, login } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const { status, error: serverError } = useAppSelector((state) => state.auth);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ phone: false, name: false });

  // Validate phone format: only digits and optional leading '+'
  function validatePhone(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Please enter your phone number.";
    }
    if (!/^\+?[0-9]+$/.test(trimmed)) {
      return "Phone number should only contain numbers and a leading + sign.";
    }
    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length < 6) {
      return "Please enter a valid phone number (at least 6 digits).";
    }
    if (digitsOnly.length > 16) {
      return "Phone number is too long (maximum 16 digits).";
    }
    return null;
  }

  // Validate display name: letters, numbers, spaces, hyphens, dots, apostrophes
  function validateName(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Please enter your name.";
    }
    if (trimmed.length < 2) {
      return "Name must be at least 2 characters.";
    }
    if (trimmed.length > 50) {
      return "Name is too long (maximum 50 characters).";
    }
    if (/[<>$%^*@!#&~_=+{}\[\]/\\|;:?`"()]/g.test(trimmed)) {
      return "Please use regular letters and numbers for your name.";
    }
    return null;
  }

  const handlePhoneChange = (rawValue: string) => {
    dispatch(clearAuthError());
    let sanitized = rawValue.replace(/[^0-9+]/g, "");
    if (sanitized.includes("+")) {
      const hasLeadingPlus = sanitized.startsWith("+");
      sanitized = (hasLeadingPlus ? "+" : "") + sanitized.replace(/\+/g, "");
    }
    setPhone(sanitized);
    if (touched.phone) {
      setPhoneError(validatePhone(sanitized));
    }
  };

  const handleNameChange = (rawValue: string) => {
    dispatch(clearAuthError());
    const sanitized = rawValue.replace(/[<>$%^*@!#&~_=+{}\[\]/\\|;:?`"()]/g, "");
    setName(sanitized);
    if (touched.name) {
      setNameError(validateName(sanitized));
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ phone: true, name: true });

    const pErr = validatePhone(phone);
    const nErr = validateName(name);

    setPhoneError(pErr);
    setNameError(nErr);

    if (pErr || nErr) {
      return;
    }

    await dispatch(login({ phone: phone.trim(), name: name.trim() }));
  }

  const formContent = (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {/* Phone Number Field */}
      <div>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-[#3d453f]">
            Phone Number
          </span>
          <span
            className={`flex items-center gap-2.5 rounded-2xl border bg-[#faf8f5] px-3.5 py-2.5 transition ${
              phoneError
                ? "border-red-400 ring-2 ring-red-400/15"
                : "border-black/15 focus-within:border-[#2f7d68] focus-within:ring-2 focus-within:ring-[#2f7d68]/15"
            }`}
          >
            <Phone className={`h-4 w-4 ${phoneError ? "text-red-500" : "text-[#788079]"}`} />
            <input
              type="tel"
              className="w-full bg-transparent text-sm text-[#181c1a] font-medium outline-none placeholder:text-[#a1a79f]"
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, phone: true }));
                setPhoneError(validatePhone(phone));
              }}
              placeholder="e.g. +8801700000000"
              value={phone}
            />
          </span>
        </label>
        {phoneError && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600 animate-modal-in">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{phoneError}</span>
          </p>
        )}
      </div>

      {/* Display Name Field */}
      <div>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-[#3d453f]">
            Your Name
          </span>
          <span
            className={`flex items-center gap-2.5 rounded-2xl border bg-[#faf8f5] px-3.5 py-2.5 transition ${
              nameError
                ? "border-red-400 ring-2 ring-red-400/15"
                : "border-black/15 focus-within:border-[#2f7d68] focus-within:ring-2 focus-within:ring-[#2f7d68]/15"
            }`}
          >
            <UserRound className={`h-4 w-4 ${nameError ? "text-red-500" : "text-[#788079]"}`} />
            <input
              type="text"
              className="w-full bg-transparent text-sm text-[#181c1a] font-medium outline-none placeholder:text-[#a1a79f]"
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, name: true }));
                setNameError(validateName(name));
              }}
              placeholder="e.g. Alex Morgan"
              value={name}
            />
          </span>
        </label>
        {nameError && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600 animate-modal-in">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{nameError}</span>
          </p>
        )}
      </div>

      {/* Server Error Banner */}
      {serverError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
          {serverError}
        </p>
      )}

      {/* Submit Button */}
      <button
        className="mt-1 flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#216d5b] to-[#144f41] px-4 font-bold text-sm text-white shadow-md shadow-[#216d5b]/20 transition duration-200 hover:scale-101 active:scale-99 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!phone.trim() || !name.trim() || status === "loading"}
        type="submit"
      >
        {status === "loading" ? "Signing in..." : "Start Chatting"}
      </button>

      <p className="text-center text-[11px] text-[#788079] pt-1">
        New here? Your account is created automatically when you sign in.
      </p>
    </form>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-[#faf8f4] to-[#ebe4d5] px-4 py-8 sm:px-6 lg:px-8 text-[#1d211f] flex items-center justify-center">
      <div className="mx-auto w-full max-w-5xl">
        {/* ================= DESKTOP VIEW (Classic Side-by-Side) ================= */}
        <div className="hidden lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
          {/* Left Column: Intro & Features */}
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#1f5f51] shadow-2xs backdrop-blur-xs">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              Simple & Fast Messaging
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#141816] leading-tight">
                Connect and chat with{" "}
                <span className="bg-gradient-to-r from-[#1f5f51] to-emerald-600 bg-clip-text text-transparent">
                  anyone, anywhere.
                </span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-[#555d56]">
                Stay in touch with your friends, family, and colleagues. No complicated setup — just enter your phone number and name to start chatting right away.
              </p>
            </div>

            {/* Desktop Feature Cards */}
            <div className="grid gap-3 grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white/85 p-3.5 shadow-2xs backdrop-blur-xs">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-[#1f5f51] mb-2">
                  <Zap className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-[#1a1f1c]">Direct Chats</p>
                <p className="mt-0.5 text-[11px] text-[#717871] leading-normal">
                  Quick 1-on-1 conversations with contacts.
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/85 p-3.5 shadow-2xs backdrop-blur-xs">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-50 text-teal-700 mb-2">
                  <Users className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-[#1a1f1c]">Group Chats</p>
                <p className="mt-0.5 text-[11px] text-[#717871] leading-normal">
                  Stay connected with groups and friends.
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/85 p-3.5 shadow-2xs backdrop-blur-xs">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-[#1f5f51] mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-[#1a1f1c]">Live Updates</p>
                <p className="mt-0.5 text-[11px] text-[#717871] leading-normal">
                  Instant delivery and typing status.
                </p>
              </div>
            </div>
          </section>

          {/* Right Column: Sign In Card */}
          <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_70px_rgba(25,35,30,0.1)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#216d5b] to-[#124d3f] text-white shadow-md shadow-[#216d5b]/25">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#151917]">Welcome to Tag Chat</h2>
                <p className="text-xs text-[#6e756e]">Sign in to access your conversations</p>
              </div>
            </div>
            {formContent}
          </section>
        </div>

        {/* ================= MOBILE VIEW (Top Intro -> Middle Form -> Bottom Features) ================= */}
        <div className="flex flex-col items-center gap-5 lg:hidden max-w-md mx-auto">
          {/* 1. Mobile Top: Intro portion */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#1f5f51] shadow-2xs backdrop-blur-xs">
              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
              Tag Chat
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#141816] leading-tight">
              Connect and chat with{" "}
              <span className="bg-gradient-to-r from-[#1f5f51] to-emerald-600 bg-clip-text text-transparent">
                anyone, anywhere.
              </span>
            </h1>
            <p className="text-xs text-[#555d56] leading-relaxed px-2">
              Stay in touch with your friends, family, and colleagues. Enter your phone number to start chatting immediately.
            </p>
          </div>

          {/* 2. Mobile Middle: Login Form Card */}
          <div className="w-full rounded-3xl border border-black/10 bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#151917]">Sign In</h2>
              <p className="text-xs text-[#6e756e]">Enter your details to get started</p>
            </div>
            {formContent}
          </div>

          {/* 3. Mobile Bottom: Feature Highlights */}
          <div className="w-full grid gap-2 grid-cols-1">
            <div className="rounded-2xl border border-black/10 bg-white/85 p-3 shadow-2xs backdrop-blur-xs flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-[#1f5f51] shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1a1f1c]">Direct Chats</p>
                <p className="text-[11px] text-[#717871]">Instant 1-on-1 messaging.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/85 p-3 shadow-2xs backdrop-blur-xs flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-50 text-teal-700 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1a1f1c]">Group Chats</p>
                <p className="text-[11px] text-[#717871]">Connect with multiple members.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/85 p-3 shadow-2xs backdrop-blur-xs flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-[#1f5f51] shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1a1f1c]">Live Updates</p>
                <p className="text-[11px] text-[#717871]">Real-time typing & status.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
