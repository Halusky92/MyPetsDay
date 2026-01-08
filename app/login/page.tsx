"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

function BoneLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-sm">
        <defs>
          <linearGradient id="sky2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#60A5FA" />
            <stop offset="1" stopColor="#A7F3D0" />
          </linearGradient>
          <linearGradient id="bone2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF7ED" />
            <stop offset="1" stopColor="#FFE4C7" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#sky2)" />
        <path
          d="M20 28c-2.8-2.3-7.2-.8-7.9 2.7-.6 3 1.6 5.6 4.4 5.7-.5 3.2 2.1 6.1 5.4 6.1h20.2c3.3 0 5.9-2.9 5.4-6.1 2.8-.1 5-2.7 4.4-5.7-.7-3.5-5.1-5-7.9-2.7-1.3-1.2-3.2-1.9-5.1-1.9H30.2c-1.9 0-3.8.7-5.2 1.9z"
          fill="url(#bone2)"
          stroke="#1F2937"
          strokeOpacity="0.25"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SkyBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_70px_rgba(253,224,71,0.6)]" />
      <svg className="absolute left-8 top-28 h-24 w-56 opacity-90" viewBox="0 0 220 80">
        <path
          d="M55 60c-16 0-29-9-29-20 0-9 9-17 22-19 4-12 18-20 35-20 20 0 36 12 36 27 0 1 0 2-.2 3 15 2 27 11 27 22 0 12-14 22-31 22H55z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <svg className="absolute right-10 top-44 h-20 w-44 opacity-80" viewBox="0 0 220 80">
        <path
          d="M55 60c-16 0-29-9-29-20 0-9 9-17 22-19 4-12 18-20 35-20 20 0 36 12 36 27 0 1 0 2-.2 3 15 2 27 11 27 22 0 12-14 22-31 22H55z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:18px_18px] opacity-40" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-100 to-transparent" />
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  // Ak je už user prihlásený, neotravuj loginom
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
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="relative min-h-screen">
      <SkyBackground />

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoneLogo className="h-11 w-11" />
            <div>
              <div className="text-lg font-semibold tracking-tight">MyPetsDay</div>
              <div className="text-sm text-black/60">Prihlásenie cez magic link</div>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white"
          >
            Späť
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 md:items-center">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/70">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Bez hesla • Bez stresu • Rýchlo
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              Vráťme sa k psíkovi 🐾
            </h1>

            <p className="mt-4 text-base leading-relaxed text-black/65 md:text-lg">
              Zadaj email, pošleme ti link. Po kliknutí sa otvorí <span className="font-semibold">Today</span>.
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-sky-100 to-emerald-100 p-5">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-inner">
                🐶
              </div>
              <div className="text-sm text-black/60">
                Tip: keď si raz prihlásený v tom istom prehliadači, ostávaš prihlásený.
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-white/60 blur-2xl" />
            <div className="relative rounded-[2.5rem] border border-black/10 bg-white/80 p-7 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <BoneLogo className="h-10 w-10" />
                <div>
                  <div className="text-2xl font-semibold">Login</div>
                  <div className="text-sm text-black/60">Pošleme magic link</div>
                </div>
              </div>

              <label className="mt-6 block text-sm font-medium">Email</label>
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                type="email"
                placeholder="ty@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && emailOk && status !== "sending") sendLink();
                }}
              />

              <button
                onClick={sendLink}
                disabled={!emailOk || status === "sending"}
                className="mt-4 w-full rounded-2xl bg-black px-4 py-3 font-medium text-white shadow-sm disabled:opacity-50 hover:opacity-90"
              >
                {status === "sending" ? "Posielam..." : "Poslať magic link"}
              </button>

              {status === "sent" && (
                <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm">
                  ✅ Skontroluj email a klikni na link.
                  <div className="mt-1 text-xs text-black/50">Ak nič neprišlo, pozri spam.</div>
                </div>
              )}
              {status === "error" && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  ❌ {error}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between text-sm">
                <Link href="/" className="font-medium text-black/60 hover:text-black">
                  ← Domov
                </Link>
                <Link href="/today" className="font-medium text-black/60 hover:text-black">
                  Today →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-black/45">
          MyPetsDay • modrá obloha • obláčiky • rozprávková kosť
        </div>
      </div>
    </main>
  );
}
