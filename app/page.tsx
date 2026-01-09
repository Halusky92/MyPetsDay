"use client";

import Link from "next/link";
import AppLogo from "./components/AppLogo";

function SkyMeadowBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_90px_rgba(253,224,71,0.55)] animate-pulse" />
      {/* clouds */}
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

      {/* meadow */}
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-emerald-200 via-emerald-100 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-300/60 to-transparent" />
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
    <div className="rounded-[1.6rem] border border-black/10 bg-white/80 p-4 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-white/90">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black/[0.04] text-xl transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-black">{title}</div>
          <div className="mt-1 text-sm text-black/65 leading-relaxed">{text}</div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <SkyMeadowBg />

      <div className="relative mx-auto max-w-4xl px-5 py-10 md:py-14">
        {/* top bar - logo vpravo hore */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex-1">
            <div className="text-5xl md:text-6xl font-semibold tracking-tight text-black">
              MyPetsDay
            </div>
            <p className="mt-3 max-w-xl text-base md:text-lg text-black/70 leading-relaxed">
              Nezabudni na svojho šťastného miláčika. Úlohy, zdravie, výdavky – všetko na jednom mieste.
            </p>
          </div>

          <div className="shrink-0 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <AppLogo size={120} className="drop-shadow-md" />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 md:mt-12 rounded-[2rem] border border-black/10 bg-white/85 p-6 md:p-8 shadow-sm backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link
            href="/login"
            className="block w-full rounded-2xl bg-black px-6 py-4 text-center text-sm font-semibold text-white shadow-sm hover:opacity-90 hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Pokračovať cez login
          </Link>
          <div className="mt-3 text-center text-xs text-black/55">
            Prihlásenie cez email link • bez hesla
          </div>

          {/* "viac zvierat" – highlight */}
          <div className="mt-6 rounded-[1.6rem] border border-black/10 bg-black/[0.03] p-4 transition-all duration-300 hover:bg-black/[0.05]">
            <div className="text-sm font-semibold text-black">🐾 Viac zvierat = lepší poriadok</div>
            <div className="mt-1 text-sm text-black/65 leading-relaxed">
              Každé zvieratko má svoje úlohy, zdravie, záznamy aj náklady. Prehľadné aj keď ich máš veľa.
            </div>
          </div>

          {/* features */}
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <FeatureCard
              icon="✅"
              title="Denné úlohy a týždenný progres"
              text="Jedným klikom označíš hotovo a vidíš, ako sa darí počas týždňa."
            />
            <FeatureCard
              icon="🔔"
              title="Smart pripomienky + zdravotný pas"
              text="Očkovanie, odčervenie, antiparazitiká, lieky, kontroly – všetko s termínmi."
            />
            <FeatureCard
              icon="📄"
              title="Záznamy + export pre veterinára/poisťovňu"
              text="Udalosti, návštevy, diagnózy – export CSV/JSON jedným klikom."
            />
            <FeatureCard
              icon="💸"
              title="Mesačný prehľad nákladov"
              text="Jedlo, vet, lieky, hračky… jasne vidíš, kam idú peniaze."
            />
          </div>
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
