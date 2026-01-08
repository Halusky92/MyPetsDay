"use client";

import Link from "next/link";

function BoneLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Rozprávková kosť v kruhu */}
      <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-sm">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#60A5FA" />
            <stop offset="1" stopColor="#A7F3D0" />
          </linearGradient>
          <linearGradient id="bone" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF7ED" />
            <stop offset="1" stopColor="#FFE4C7" />
          </linearGradient>
        </defs>

        <circle cx="32" cy="32" r="30" fill="url(#sky)" />
        {/* malé “iskričky” */}
        <circle cx="16" cy="18" r="2" fill="white" opacity="0.9" />
        <circle cx="48" cy="14" r="1.6" fill="white" opacity="0.9" />
        <circle cx="50" cy="40" r="1.8" fill="white" opacity="0.8" />

        {/* kosť */}
        <path
          d="M20 28c-2.8-2.3-7.2-.8-7.9 2.7-.6 3 1.6 5.6 4.4 5.7-.5 3.2 2.1 6.1 5.4 6.1h20.2c3.3 0 5.9-2.9 5.4-6.1 2.8-.1 5-2.7 4.4-5.7-.7-3.5-5.1-5-7.9-2.7-1.3-1.2-3.2-1.9-5.1-1.9H30.2c-1.9 0-3.8.7-5.2 1.9z"
          fill="url(#bone)"
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
      {/* Obloha gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />

      {/* Slnko */}
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-yellow-200 blur-[1px] shadow-[0_0_60px_rgba(253,224,71,0.6)]" />

      {/* Obláčiky (SVG) */}
      <svg className="absolute left-6 top-16 h-24 w-48 opacity-90" viewBox="0 0 200 80">
        <path
          d="M55 60c-16 0-29-9-29-20 0-9 9-17 22-19 4-12 18-20 35-20 20 0 36 12 36 27 0 1 0 2-.2 3 15 2 27 11 27 22 0 12-14 22-31 22H55z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <svg className="absolute right-24 top-40 h-20 w-40 opacity-80" viewBox="0 0 200 80">
        <path
          d="M55 60c-16 0-29-9-29-20 0-9 9-17 22-19 4-12 18-20 35-20 20 0 36 12 36 27 0 1 0 2-.2 3 15 2 27 11 27 22 0 12-14 22-31 22H55z"
          fill="white"
          opacity="0.95"
        />
      </svg>

      {/* Jemné “bodky” */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:18px_18px] opacity-40" />

      {/* Trávnik dole */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-100 to-transparent" />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <SkyBackground />

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BoneLogo className="h-11 w-11" />
            <div>
              <div className="text-lg font-semibold tracking-tight">MyPetsDay</div>
              <div className="text-sm text-black/60">Hravá starostlivosť o psíka (a aj mačku 😄)</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white"
            >
              Prihlásiť sa
            </Link>
            <Link
              href="/today"
              className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
            >
              Otvoriť Today
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 md:items-center">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Úlohy • Týždenný prehľad • Email pripomienky
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              Nezabudni na nič — <span className="text-black/70">a pes bude spokojný</span> 🐶
            </h1>

            <p className="mt-4 text-base leading-relaxed text-black/65 md:text-lg">
              Pridaj psíkov, nastav úlohy (venčenie, lieky, kúpanie) a odklikni hotovo.
              Každé ráno ti príde pripomienka.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm hover:opacity-90"
              >
                Pokračovať emailom
              </Link>
              <Link
                href="/today"
                className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium hover:bg-black/5"
              >
                Pozrieť Today
              </Link>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-black/[0.03] p-4">
                <div className="text-xs text-black/50">1 klik</div>
                <div className="mt-1 font-semibold">Hotovo</div>
              </div>
              <div className="rounded-2xl bg-black/[0.03] p-4">
                <div className="text-xs text-black/50">Email</div>
                <div className="mt-1 font-semibold">07:00</div>
              </div>
              <div className="rounded-2xl bg-black/[0.03] p-4">
                <div className="text-xs text-black/50">Týždeň</div>
                <div className="mt-1 font-semibold">kruh progresu</div>
              </div>
            </div>
          </div>

          {/* Hravý “panel” s dalmatínom */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-white/60 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-black/55">Vzorový psík</div>
                  <div className="mt-1 text-2xl font-semibold">Dalmatín & kosť</div>
                </div>
                <div className="rounded-2xl bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700">
                  hravý režim
                </div>
              </div>

              <div className="mt-6 flex items-center gap-6">
                <div className="grid h-28 w-28 place-items-center rounded-3xl bg-gradient-to-b from-sky-200 to-white shadow-inner">
                  <span className="text-5xl">🐶</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-black/60">
                    „Keď odklikneš úlohy, ja som šťastný.“
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-800">
                      Walk
                    </span>
                    <span className="rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-medium text-yellow-900">
                      Meds
                    </span>
                    <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-800">
                      Groom
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-3xl bg-gradient-to-r from-sky-100 to-emerald-100 p-5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Rýchly štart</div>
                  <BoneLogo className="h-9 w-9" />
                </div>
                <div className="mt-2 text-sm text-black/60">
                  Prihlás sa emailom a choď rovno na Today. Ak si už prihlásený, ostaneš prihlásený v tom istom prehliadači.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 text-center text-xs text-black/45">
          Tip: ak chceš neskôr obrázky generované AI (pozadie, dalmatín, kosť), napíš a spravíme presné “public/ assets”.
        </div>
      </div>
    </main>
  );
}
