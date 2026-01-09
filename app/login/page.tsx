"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AppLogo from "../components/AppLogo";

function LoginBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_90px_rgba(253,224,71,0.55)] animate-pulse" />
      <svg
        className="absolute left-[-120px] top-10 h-44 w-[620px] opacity-95 animate-[float_20s_ease-in-out_infinite]"
        viewBox="0 0 520 180"
      >
        <path
          d="M150 130c-40 0-72-22-72-49 0-22 22-41 54-46 10-29 45-49 88-49 51 0 92 30 92 66 0 3 0 5-.4 8 39 5 70 26 70 52 0 29-36 52-80 52H150z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <svg
        className="absolute right-[-160px] top-36 h-40 w-[560px] opacity-90 animate-[float_25s_ease-in-out_infinite_reverse]"
        viewBox="0 0 520 180"
      >
        <path
          d="M150 130c-40 0-72-22-72-49 0-22 22-41 54-46 10-29 45-49 88-49 51 0 92 30 92 66 0 3 0 5-.4 8 39 5 70 26 70 52 0 29-36 52-80 52H150z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-emerald-200 via-emerald-100 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-300/60 to-transparent" />
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
    <main className="relative min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <LoginBackground />

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* LOGO A NÁVRAT SPÄŤ */}
        <div className="flex flex-col items-center mb-8">
          <Link
            href="/"
            className="group transition-transform duration-300 hover:scale-110 active:scale-95"
          >
            <AppLogo size={100} className="drop-shadow-md" />
          </Link>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-black">
            MyPetsDay
          </h1>
          <p className="mt-2 text-sm text-black/60">Bezpečné prihlásenie cez email</p>
        </div>

        {/* LOGIN KARTA */}
        <div className="rounded-[2rem] border border-black/10 bg-white/85 p-6 md:p-8 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-black">Vitaj späť! ✨</h2>
            <p className="text-sm text-black/60 mt-2">Pošleme ti magic link do schránky.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black/55 mb-2">
                Tvoj Email
              </label>
              <input
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all text-black placeholder:text-black/40"
                type="email"
                placeholder="napr. tvoj@email.sk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && emailOk && status !== "sending") sendLink();
                }}
                disabled={status === "sending"}
              />
            </div>

            <button
              onClick={sendLink}
              disabled={!emailOk || status === "sending"}
              className="group relative w-full overflow-hidden rounded-2xl bg-black px-6 py-4 font-semibold text-white shadow-sm transition-all duration-300 hover:opacity-90 hover:shadow-md disabled:opacity-50 active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {status === "sending" ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Posielam...
                  </>
                ) : (
                  <>
                    Poslať Magic Link
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* STAVY PO ODOSLANÍ */}
          {status === "sent" && (
            <div className="mt-6 rounded-2xl bg-green-50 p-4 border border-green-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-xl shrink-0">📩</span>
              <div>
                <p className="text-sm font-semibold text-green-800">Link je na ceste!</p>
                <p className="text-xs text-green-700 mt-1">Skontroluj si prosím aj priečinok Spam.</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-xl shrink-0">⚠️</span>
              <p className="text-sm font-semibold text-red-700 leading-tight">{error}</p>
            </div>
          )}
        </div>

        {/* SPÄŤ NA DOMOVSKÚ STRÁNKU */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-black/60 hover:text-black transition-colors duration-300 inline-flex items-center gap-1"
          >
            <span>←</span> Späť na hlavnú stránku
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(20px) translateY(-10px);
          }
        }
      `}</style>
    </main>
  );
}
