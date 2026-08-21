import Link from "next/link";
import {
  MessageSquare,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Phone,
  Radio,
  Clock,
} from "lucide-react";

export default function LandingPlaceholderPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1d211f] flex flex-col justify-between selection:bg-[#2f7d68]/20 selection:text-[#1d211f]">
      {/* Navigation Header */}
      <header className="border-b border-black/10 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#2f7d68] text-white shadow-sm shadow-[#2f7d68]/30">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#161a18]">
              Tag Chat
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[#2c332e] shadow-xs hover:border-[#2f7d68]/40 hover:text-[#2f7d68] transition"
            >
              Sign In
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-1.5 rounded-xl bg-[#1f5f51] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#1f5f51]/25 hover:bg-[#194e43] transition"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2f7d68]/20 bg-white px-4 py-1.5 text-xs font-semibold text-[#2f7d68] shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Messaging Workspace</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#121614] sm:text-6xl sm:leading-[1.1]">
              Conversations that move at the speed of thought.
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#5c645e] max-w-2xl mx-auto">
              Direct messages, collaborative group channels, instant member management,
              and live WebSocket updates with smart auto-scroll.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/chat"
                className="flex items-center gap-2 rounded-2xl bg-[#1f5f51] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#1f5f51]/25 transition hover:bg-[#184b40] hover:scale-102 active:scale-98"
              >
                <span>Enter Chat Application</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-[#2b322d] shadow-sm hover:bg-[#faf8f4] transition"
              >
                Direct Phone Login
              </Link>
            </div>
          </div>

          {/* Interactive Feature Highlights Grid */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68] mb-4">
                <Radio className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#1a1f1c]">Live WebSocket Engine</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6a726b]">
                Real-time message streaming powered by Socket.io, with automatic reconnection and fallback handling.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68] mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#1a1f1c]">Group Channels & Admin Controls</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6a726b]">
                Create named groups with 2+ members, promote admins, rename channels, and manage participant membership seamlessly.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68] mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#1a1f1c]">Smart Auto-Scroll</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6a726b]">
                Intelligently locks scroll to bottom on new messages, while preserving your viewport position if you scroll up to inspect history.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68] mb-4">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#1a1f1c]">Frictionless Authentication</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6a726b]">
                Auto-registration on new phone numbers with JWT session preservation across page reloads.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68] mb-4">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#1a1f1c]">Message Pagination</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6a726b]">
                Effortlessly browse older conversation history with cursor-based pagination and load-more controls.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2f7d68]/10 text-[#2f7d68] mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#1a1f1c]">Redux Toolkit Architecture</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6a726b]">
                Structured Redux slices and asynchronous thunks for state determinism, optimistic dispatch, and cache consistency.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white/50 py-6 text-center text-xs text-[#7d857d]">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Tag Chat. Built with Next.js, Redux Toolkit & Socket.io.</p>
          <div className="flex items-center gap-4">
            <Link href="/chat" className="hover:text-[#2f7d68] transition">
              Chat App
            </Link>
            <Link href="/login" className="hover:text-[#2f7d68] transition">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
