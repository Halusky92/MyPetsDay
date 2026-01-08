"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AppLogo from "../components/AppLogo";

// --- KONZISTENTNÉ POZADIE (Rovnaké ako na Home a Today) ---
function EnhancedLoginBg() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-white to-emerald-50" />
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_90px_rgba(253,224,71,0.55)] opacity-60" />
      
      {/* Ilustrácia: Búda */}
      <svg className="absolute bottom-10 right-[-20px] h-64 w-64 opacity-20 md:opacity-30" viewBox="0 0 200 200">
        <path d="M40 180V90L100 40L160 90V180H40Z" fill="#8B4513" />
        <path d="M100 40L30 95V105L100 50L170 105V95L100 40Z" fill="#5D2E0A" />
        <path d="M80 180V140C80 128.954 88.9543 120 100 120C111.046 120 120 128.954 120 140V180H80Z" fill="#3E1F07" />
      </svg>

      {/* Ilustrácia: Miska */}
      <svg className="absolute bottom-20 left-10 h-32 w-32 opacity-20 md:opacity-30" viewBox="0 0 100 100">
        <path d="M10 80C10 70 30 65 50 65C70 65 90 70 90 80H10Z" fill="#94A3B8" />
        <path d="M30 65L40 50H60L70 65H30Z" fill="#64748B" />
      </svg>
      
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-100/50 to-transparent" />
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
    return () => { cancelled = true; };
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
    <main className="relative min-h-screen flex flex-col items-center justify-center px-5">
      <EnhancedLoginBg />

      <div className="w-full max-w-md">
        {/* LOGO A NÁVRAT SPÄŤ */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="group transition-transform hover:scale-110">
            <AppLogo size={100} className="drop-shadow-xl" />
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900">MyPetsDay</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Bezpečný prístup</p>
        </div>

        {/* LOGIN KARTA */}
        <div className="rounded-[2.5rem] border border-black/5 bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-gray-800">Vitaj späť! ✨</h2>
            <p className="text-gray-500 mt-2 font-medium">Pošleme ti magic link do schránky.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 ml-4 mb-2">
                Tvoj Email
              </label>
              <input
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-gray-800 font-medium"
                type="email"
                placeholder="napr. tvoj@email.sk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && emailOk && status !== "sending") sendLink();
                }}
              />
            </div>

            <button
              onClick={sendLink}
              disabled={!emailOk || status === "sending"}
              className="group relative w-full overflow-hidden rounded-2xl bg-gray-900 px-6 py-4 font-black text-white shadow-xl transition-all hover:bg-black disabled:opacity-30 active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {status === "sending" ? "Posielam..." : "Poslať Magic Link"}
                {status !== "sending" && <span className="group-hover:translate-x-1 transition-transform">→</span>}
              </span>
            </button>
          </div>

          {/* STAVY PO ODOSLANÍ */}
          {status === "sent" && (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="text-xl">📩</span>
              <div>
                <p className="text-sm font-bold text-emerald-800">Link je na ceste!</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Skontroluj si prosím aj priečinok Spam.</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 text-red-700">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-bold leading-tight">{error}</p>
            </div>
          )}
        </div>

        {/* SPÄŤ NA DOMOVSKÚ STRÁNKU */}
        <div className="mt-8 text-center">
            <Link 
                href="/" 
                className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
            >
                ← Späť na hlavnú stránku
            </Link>
        </div>
      </div>
    </main>
  );
}