"use client";

import Link from "next/link";

function SkyHeroBg() {
  // Responsive ilustrácia (SVG) – obloha, obláčiky, trávnik, jemné domčeky
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute right-10 top-10 h-28 w-28 rounded-full bg-yellow-200 shadow-[0_0_90px_rgba(253,224,71,0.65)]" />

      <svg className="absolute left-[-80px] top-12 h-44 w-[520px] opacity-90" viewBox="0 0 520 180">
        <path
          d="M150 130c-40 0-72-22-72-49 0-22 22-41 54-46 10-29 45-49 88-49 51 0 92 30 92 66 0 3 0 5-.4 8 39 5 70 26 70 52 0 29-36 52-80 52H150z"
          fill="white"
          opacity="0.95"
        />
      </svg>

      <svg className="absolute right-[-120px] top-32 h-36 w-[460px] opacity-80" viewBox="0 0 520 180">
        <path
          d="M150 130c-40 0-72-22-72-49 0-22 22-41 54-46 10-29 45-49 88-49 51 0 92 30 92 66 0 3 0 5-.4 8 39 5 70 26 70 52 0 29-36 52-80 52H150z"
          fill="white"
          opacity="0.95"
        />
      </svg>

      {/* Jemná “krajinka” v spodku */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-100 via-emerald-50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 opacity-30 [background:radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.45),transparent_55%),radial-gradient(circle_at_90%_60%,rgba(16,185,129,0.35),transparent_55%)]" />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <SkyHeroBg />

      <div className="relative mx-auto max-w-3xl px-6 py-12">
        <div className="text-center">
          <div className="text-5xl font-semibold tracking-tight md:text-6xl">
            MyPetsDay
          </div>
          <p className="mt-4 text-base text-black/70 md:text-lg">
            Nezabudni na svojho šťastného miláčika — malé úlohy, veľká spokojnosť. 🐾
          </p>
        </div>

        {/* CTA v strede */}
        <div className="mt-10 rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-sm backdrop-blur">
          <div className="text-center">
            <div className="text-sm text-black/60">Začni za 10 sekúnd</div>
            <Link
              href="/login"
              className="mt-3 inline-flex items-center justify-center rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
            >
              Pokračovať cez login
            </Link>
            <div className="mt-3 text-xs text-black/45">
              Prihlásenie cez email link • bez hesla
            </div>
          </div>

          {/* Body */}
          <ul className="mt-6 grid gap-3 text-sm text-black/70 md:grid-cols-2">
            <li className="rounded-2xl bg-black/[0.03] p-4">
              ✅ Pripomienkovač úloh počas týždňa
            </li>
            <li className="rounded-2xl bg-black/[0.03] p-4">
              📧 Denný email prehľad (ráno)
            </li>
            <li className="rounded-2xl bg-black/[0.03] p-4">
              🐶 Viac miláčikov, kategórie úloh
            </li>
            <li className="rounded-2xl bg-black/[0.03] p-4">
              🟢 Kruh spokojnosti: progres za týždeň
            </li>
          </ul>
        </div>

        <div className="mt-10 text-center text-xs text-black/45">
          Tip: keď sa raz prihlásiš, v tom istom prehliadači zostaneš prihlásený.
        </div>
      </div>
    </main>
  );
}
