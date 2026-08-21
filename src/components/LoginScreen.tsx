"use client";

import { FormEvent, useState } from "react";
import {
  MessageCircle,
  Phone,
  Sparkles,
  UserRound,
  Zap,
  Shield,
  Users,
  AlertCircle,
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
      return "Phone number is required.";
    }
    // Only numbers and optional leading '+'
    if (!/^\+?[0-9]+$/.test(trimmed)) {
      return "Only numbers and a leading '+' are allowed (e.g. +8801700000000).";
    }
    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length < 6) {
      return "Phone number must have at least 6 digits.";
    }
    if (digitsOnly.length > 16) {
      return "Phone number is too long (max 16 digits).";
    }
    return null;
  }

  // Validate display name: disallow special symbols (< > $ % ^ * @ ! # & ~ _ = + { } [ ] / \ | ; : ?)
  function validateName(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Display name is required.";
    }
    if (trimmed.length < 2) {
      return "Display name must be at least 2 characters.";
    }
    if (trimmed.length > 50) {
      return "Display name cannot exceed 50 characters.";
    }
    // Disallow special characters and symbols, allow letters, numbers, spaces, hyphens, dots, apostrophes
    if (/[<>$%^*@!#&~_=+{}\[\]/\\|;:?`"()]/g.test(trimmed)) {
      return "Special characters and symbols are not allowed in the name.";
    }
    return null;
  }

  const handlePhoneChange = (rawValue: string) => {
    dispatch(clearAuthError());
    // Restrict input on typing: only allow leading '+' and digits 0-9
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
    // Filter out forbidden special symbols on typing
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

    // Block submission and DO NOT call API if any field is invalid
    if (pErr || nErr) {
      return;
    }

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

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Phone Number Field */}
            <div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3d453f]">
                  Phone number
                </span>
                <span
                  className={`flex items-center gap-3 rounded-2xl border bg-[#faf8f5] px-4 py-3 transition ${
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
                    placeholder="+8801700000000"
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
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3d453f]">
                  Display name
                </span>
                <span
                  className={`flex items-center gap-3 rounded-2xl border bg-[#faf8f5] px-4 py-3 transition ${
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
                    placeholder="e.g. Romelu Lukaku"
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
