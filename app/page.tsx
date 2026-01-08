"use client";

import Link from "next/link";
import AppLogo from "./components/AppLogo";

function SkyHeroBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_80px_rgba(253,224,71,0.55)]" />

      <svg className="absolute left-[-90px] top-12 h-40 w-[560px] opacity-95" viewBox="0 0 520 180">
        <path
          d="M150 130c-40 0-72-22-72-49 0-22 22-41 54-46 10-29 45-49 88-49 51 0 92 30 92 66 0 3 0 5-.4 8 39 5 70 26 70 52 0 29-36 52-80 52H150z"
          fill="white"
          opacity="0.95"
        />
      </svg>

      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-100 via-emerald-50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-44 opacity-25 [background:radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.45),transparent_55%),radial-gradient(circle_at_90%_60%,rgba(16,185,129,0.35),transparent_55%)]" />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <SkyHeroBg />

      <div className="relative mx-auto max-w-3xl px-5 py-10 md:py-14">
        <div className="flex items-center justify-center gap-3">
          <AppLogo size={54} />
          <div className="text-4xl md:text-5xl font-semibold tracking-tight text-black">
            MyPetsDay
          </div>
        </div>

        <p className="mt-4 text-center text-base md:text-lg text-black/70">
          Nezabudni na svojho šťastného miláčika.  
          Jednoduché úlohy, krásny prehľad, pokoj v hlave. 🐾
        </p>

        <div className="mt-9 rounded-[2rem] border border-black/10 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur">
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 w-full md:w-auto"
            >
              Pokračovať cez login
            </Link>
            <div className="mt-3 text-xs text-black/50">
              Prihlásenie cez email link • bez hesla
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-black/70 md:grid-cols-2">
            <div className="rounded-2xl bg-black/[0.03] p-4">✅ Týždenné úlohy a pripomienky</div>
            <div className="rounded-2xl bg-black/[0.03] p-4">📧 Denný email prehľad (ráno)</div>
            <div className="rounded-2xl bg-black/[0.03] p-4">🐶 Viac miláčikov, kategórie</div>
            <div className="rounded-2xl bg-black/[0.03] p-4">🟢 Progres kruh podľa úloh</div>
          </div>
        </div>
      </div>
    </main>
  );
}
