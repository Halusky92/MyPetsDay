"use client";

import Link from "next/link";
import AppLogo from "./components/AppLogo";

function SkyHeroBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute right-8 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_90px_rgba(253,224,71,0.55)]" />
      <svg className="absolute left-[-90px] top-10 h-40 w-[560px] opacity-95" viewBox="0 0 520 180">
        <path
          d="M150 130c-40 0-72-22-72-49 0-22 22-41 54-46 10-29 45-49 88-49 51 0 92 30 92 66 0 3 0 5-.4 8 39 5 70 26 70 52 0 29-36 52-80 52H150z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-100 via-emerald-50 to-transparent" />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <SkyHeroBg />

      <div className="relative mx-auto max-w-3xl px-5 py-10 md:py-14">
        <div className="flex flex-col items-center text-center">
          {/* výraznejšie logo */}
          <AppLogo size={140} className="drop-shadow-md" />
          <div className="mt-2 text-5xl md:text-6xl font-semibold tracking-tight text-black">
            MyPetsDay
          </div>
          <p className="mt-3 max-w-xl text-base md:text-lg text-black/70">
            Nezabudni na svojho šťastného miláčika. Jednoduché úlohy, prehľadný týždeň a pokoj v hlave.
          </p>
        </div>

        <div className="mt-8 rounded-[2rem] border border-black/10 bg-white/85 p-6 md:p-8 shadow-sm backdrop-blur">
          <Link
            href="/login"
            className="block w-full rounded-2xl bg-black px-6 py-4 text-center text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            Pokračovať cez login
          </Link>
          <div className="mt-3 text-center text-xs text-black/55">
            Prihlásenie cez email link • bez hesla
          </div>

          <div className="mt-6 grid gap-3 text-sm text-black/70 md:grid-cols-2">
            <div className="rounded-2xl bg-black/[0.03] p-4">✅ Dnešné úlohy na 1 klik</div>
            <div className="rounded-2xl bg-black/[0.03] p-4">📅 Týždenný prehľad</div>
            <div className="rounded-2xl bg-black/[0.03] p-4">📧 Ranné pripomenutie</div>
            <div className="rounded-2xl bg-black/[0.03] p-4">🐶 Viac miláčikov + organizácia</div>
          </div>
        </div>
      </div>
    </main>
  );
}
