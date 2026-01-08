"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  // (Voliteľné UX) Ak je user už prihlásený, pošli ho rovno na /today
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled && data.user) window.location.href = "/today";
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendLink() {
    setStatus("sending");
    setError("");

    const redirectTo = `${window.location.origin}/today`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-black/[0.03]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white shadow-sm">🐾</div>
            <div>
              <div className="text-lg font-semibold leading-tight">MyPetsDay</div>
              <div className="text-sm text-black/50">Login with a magic link</div>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/5"
          >
            Back
          </Link>
        </div>

        {/* Content */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 md:items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/70">
              <span className="h-1.5 w-1.5 rounded-full bg-black/60" />
              Secure sign-in • No password needed
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              Welcome back <span className="text-black/70">👋</span>
            </h1>

            <p className="mt-4 text-base leading-relaxed text-black/60 md:text-lg">
              Enter your email and we’ll send you a sign-in link. It will open your <span className="font-medium">Today</span>{" "}
              page automatically.
            </p>

            <div className="mt-6 space-y-3 text-sm text-black/55">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-black/5">✅</span>
                Works on phone & desktop
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-black/5">🔒</span>
                Session stays signed in (same browser)
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-black/5">📧</span>
                Daily reminders (optional)
              </div>
            </div>
          </div>

          {/* Right: form card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-black/[0.06] to-black/[0.02] blur-2xl" />
            <div className="relative rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-2xl font-semibold">🔐 Login</div>
              <p className="mt-2 text-sm text-black/60">We’ll email you a magic link.</p>

              <label className="mt-6 block text-sm font-medium">Email</label>
              <input
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && emailOk && status !== "sending") sendLink();
                }}
              />

              <button
                onClick={sendLink}
                disabled={!emailOk || status === "sending"}
                className="mt-4 w-full rounded-xl bg-black px-4 py-3 font-medium text-white disabled:opacity-50 hover:opacity-90"
              >
                {status === "sending" ? "Sending..." : "Send magic link"}
              </button>

              {status === "sent" && (
                <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm">
                  ✅ Check your email and click the link.
                  <div className="mt-1 text-xs text-black/50">Didn’t get it? Check spam or try again in a minute.</div>
                </div>
              )}

              {status === "error" && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  ❌ {error}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <Link href="/" className="text-sm font-medium text-black/60 hover:text-black">
                  ← Back to home
                </Link>
                <Link href="/today" className="text-sm font-medium text-black/60 hover:text-black">
                  Open Today →
                </Link>
              </div>
            </div>

            <div className="mt-4 text-xs text-black/40">
              By continuing, you agree to receive a sign-in email. No marketing, just access.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
