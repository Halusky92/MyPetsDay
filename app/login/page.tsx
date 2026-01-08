"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AppLogo from "../components/AppLogo";

function CalmBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_80px_rgba(253,224,71,0.55)]" />
      <svg className="absolute left-[-120px] top-24 h-40 w-[560px] opacity-90" viewBox="0 0 520 180">
        <path
          d="M150 130c-40 0-72-22-72-49 0-22 22-41 54-46 10-29 45-49 88-49 51 0 92 30 92 66 0 3 0 5-.4 8 39 5 70 26 70 52 0 29-36 52-80 52H150z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-100 to-transparent" />
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

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
      <CalmBg />

      <div className="relative mx-auto max-w-xl px-5 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <AppLogo size={46} />
            <div>
              <div className="text-lg font-semibold text-black">MyPetsDay</div>
              <div className="text-xs text-black/55">Prihlásenie</div>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white"
          >
            Späť
          </Link>
        </div>

        <div className="mt-8 rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
          <div className="text-2xl font-semibold text-black">Pokračuj cez email</div>
          <p className="mt-2 text-sm text-black/65">Pošleme ti magic link. Bez hesla.</p>

          <label className="mt-5 block text-sm font-semibold text-black">Email</label>
          <input
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 text-black"
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
            className="mt-4 w-full rounded-2xl bg-black px-4 py-3 font-semibold text-white shadow-sm disabled:opacity-50 hover:opacity-90"
          >
            {status === "sending" ? "Posielam..." : "Poslať magic link"}
          </button>

          {status === "sent" && (
            <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black">
              ✅ Pozri email a klikni na link.
              <div className="mt-1 text-xs text-black/55">Ak nič neprišlo, skontroluj spam.</div>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              ❌ {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
