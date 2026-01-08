"use client";

import Link from "next/link";
import AppLogo from "./components/AppLogo";

// --- NOVÉ ŠTÝLOVÉ POZADIE ---
function EnhancedSkyMeadowBg() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {/* Obloha a slnko */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_90px_rgba(253,224,71,0.55)]" />
      
      {/* Oblaky */}
      <svg className="absolute left-[-120px] top-10 h-44 w-[620px] opacity-60 md:opacity-90" viewBox="0 0 520 180">
        <path d="M150 130c-40 0-72-22-72-49 0-22 22-41 54-46 10-29 45-49 88-49 51 0 92 30 92 66 0 3 0 5-.4 8 39 5 70 26 70 52 0 29-36 52-80 52H150z" fill="white" />
      </svg>

      {/* Ilustrácia: Búda vpravo dolu */}
      <svg className="absolute bottom-20 right-[-10px] h-48 w-48 opacity-30 md:opacity-60" viewBox="0 0 200 200">
        <path d="M40 180V90L100 40L160 90V180H40Z" fill="#8B4513" />
        <path d="M100 40L30 95V105L100 50L170 105V95L100 40Z" fill="#5D2E0A" />
        <path d="M80 180V140C80 128.954 88.9543 120 100 120C111.046 120 120 128.954 120 140V180H80Z" fill="#3E1F07" />
      </svg>

      {/* Ilustrácia: Miska vľavo dolu */}
      <svg className="absolute bottom-16 left-8 h-28 w-28 opacity-30 md:opacity-60" viewBox="0 0 100 100">
        <path d="M10 80C10 70 30 65 50 65C70 65 90 70 90 80H10Z" fill="#94A3B8" />
        <path d="M30 65L40 50H60L70 65H30Z" fill="#64748B" />
        <rect x="42" y="52" width="16" height="6" rx="3" fill="#F1F5F9" />
      </svg>

      {/* Lúka */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-200 via-emerald-100 to-transparent" />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02]">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm text-2xl">
          {icon}
        </div>
        <div>
          <div className="text-base font-bold text-black">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-black/60">{text}</div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center">
      <EnhancedSkyMeadowBg />

      <div className="relative mx-auto max-w-4xl px-6 py-12 md:py-20 text-center">
        
        {/* VYCENTROVANÉ LOGO A NÁZOV */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative group mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <AppLogo size={160} className="relative drop-shadow-2xl" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-black mb-4">
            MyPetsDay
          </h1>
          
          <p className="max-w-xl text-lg md:text-xl font-medium text-black/70 leading-relaxed">
            Nezabudni na svojho šťastného miláčika. <br className="hidden md:block" />
            <span className="text-emerald-700 font-bold">Úlohy, zdravie, výdavky</span> – všetko na jednom mieste.
          </p>
        </div>

        {/* CTA - AKCIA */}
        <div className="w-full max-w-sm mx-auto mb-16">
          <Link
            href="/login"
            className="block w-full rounded-full bg-black px-8 py-5 text-center text-lg font-black text-white shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all"
          >
            Vstúpiť do aplikácie 🐾
          </Link>
          <div className="mt-4 text-sm font-bold text-black/40">
            Prihlásenie cez email link • Bez hesla
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid gap-4 md:grid-cols-2 text-left">
          <FeatureCard
            icon="✅"
            title="Týždenný progres"
            text="Prehľadné štatistiky úloh pre každého tvojho miláčika."
          />
          <FeatureCard
            icon="🔔"
            title="Zdravotný pas"
            text="Očkovania a lieky pod kontrolou. Už žiadne zabudnuté termíny."
          />
          <FeatureCard
            icon="📄"
            title="Záznamy a denník"
            text="Dôležité udalosti a diagnózy vždy po ruke pre veterinára."
          />
          <FeatureCard
            icon="💸"
            title="Prehľad nákladov"
            text="Sleduj výdavky na jedlo a zdravie v jasných číslach."
          />
        </div>

        {/* HIGHLIGHT PRE VIAC ZVIERAT */}
        <div className="mt-8 rounded-[2rem] border border-black/5 bg-black/5 p-6 backdrop-blur-sm">
          <div className="text-base font-bold text-black flex items-center justify-center gap-2">
            🐕 Viac zvierat = rovnaký poriadok 🐈
          </div>
          <p className="mt-2 text-sm text-black/60 font-medium">
            Aplikácia je navrhnutá tak, aby zostala prehľadná, aj keď máš doma celú svorku.
          </p>
        </div>
        
      </div>

      <footer className="mt-auto pb-8 text-xs font-bold text-black/30 tracking-widest uppercase">
        © 2026 MyPetsDay
      </footer>
    </main>
  );
}