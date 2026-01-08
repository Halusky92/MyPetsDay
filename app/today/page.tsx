"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AppLogo from "../components/AppLogo";
import { HealthCard, RecordsCard, CostsCard } from "./extraCards";

// --- TYPY ---
type Pet = { id: string; name: string; type: string; birthday: string | null; breed: string | null; };
type Task = { id: string; pet_id: string; title: string; category: string; repeat_type: "none" | "daily" | "weekly"; start_date: string; weekdays: number[] | null; is_archived?: boolean; };

// --- KOMPONENTY POZADIA ---
function EnhancedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-white to-emerald-50" />
      
      {/* Ilustrácia: Búda vpravo */}
      <svg className="absolute bottom-10 right-[-20px] h-64 w-64 opacity-20 md:opacity-40" viewBox="0 0 200 200">
        <path d="M40 180V90L100 40L160 90V180H40Z" fill="#8B4513" />
        <path d="M100 40L30 95V105L100 50L170 105V95L100 40Z" fill="#5D2E0A" />
        <path d="M80 180V140C80 128.954 88.9543 120 100 120C111.046 120 120 128.954 120 140V180H80Z" fill="#3E1F07" />
      </svg>

      {/* Ilustrácia: Miska vľavo */}
      <svg className="absolute bottom-20 left-10 h-32 w-32 opacity-20 md:opacity-40" viewBox="0 0 100 100">
        <path d="M10 80C10 70 30 65 50 65C70 65 90 70 90 80H10Z" fill="#94A3B8" />
        <path d="M30 65L40 50H60L70 65H30Z" fill="#64748B" />
        <circle cx="50" cy="55" r="8" fill="#F1F5F9" /> {/* Kosť v miske */}
        <rect x="42" y="52" width="16" height="6" rx="3" fill="#F1F5F9" />
      </svg>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-emerald-100/50 blur-3xl" />
    </div>
  );
}

function Accordion({ title, children, icon }: { title: string, children: React.ReactNode, icon?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 overflow-hidden rounded-[2rem] border border-black/5 bg-white/70 backdrop-blur-md shadow-sm transition-all hover:shadow-md">
      <button 
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left font-bold text-black"
      >
        <span className="flex items-center gap-3 text-lg">{icon} {title}</span>
        <span className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && <div className="p-6 border-t border-black/5 bg-white/40">{children}</div>}
    </div>
  );
}

export default function TodayPage() {
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setEmail(user.email ?? null);
      
      const [p, t] = await Promise.all([
        supabase.from("pets").select("*").order("created_at", { ascending: false }),
        supabase.from("care_tasks").select("*").eq("is_archived", false)
      ]);
      setPets(p.data ?? []);
      setTasks(t.data ?? []);
      setLoading(false);
    }
    init();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center font-bold">Labky na ceste... 🐾</div>;

  return (
    <main className="relative min-h-screen pb-20 overflow-x-hidden">
      <EnhancedBackground />
      
      <div className="mx-auto max-w-4xl px-5 py-8">
        
        {/* TOP NAV: Vycentrované Logo a Odhlásiť */}
        <div className="flex flex-col items-center mb-10 text-center">
            <div className="relative group mb-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <AppLogo size={140} className="relative drop-shadow-2xl" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-1">MyPetsDay</h1>
            <p className="text-gray-500 font-medium">Vitaj späť, {email?.split('@')[0]}! ✨</p>
            
            <button 
              onClick={() => supabase.auth.signOut().then(() => window.location.href="/login")}
              className="mt-4 flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-xs font-bold text-gray-600 shadow-sm border border-black/5 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              Odhlásiť sa
            </button>
        </div>

        {/* SEKCE: TVOJI MILÁČIKOVIA (Tabuľky/Karty hneď na očiach) */}
        <section className="mb-8">
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-xl font-extrabold text-gray-800">Tvoja svorka 🐾</h2>
            <button 
                onClick={() => setShowManage(!showManage)}
                className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full hover:bg-blue-100"
            >
                {showManage ? "Hotovo" : "Upraviť"}
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x">
            {pets.map(p => (
              <div key={p.id} className="min-w-[240px] snap-center rounded-[2.5rem] bg-white border border-black/5 p-6 shadow-xl shadow-black/5 relative overflow-hidden group">
                {/* Dekoračný kruh v pozadí karty */}
                <div className="absolute -right-4 -top-4 h-20 w-20 bg-yellow-100 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                
                <div className="relative">
                    <span className="text-3xl mb-2 block">{p.type === 'dog' ? '🐶' : p.type === 'cat' ? '🐱' : '🐾'}</span>
                    <h3 className="text-2xl font-black text-gray-800 leading-none mb-1">{p.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{p.breed || 'Miláčik'}</p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Dnešné úlohy</p>
                        <p className="text-lg font-bold text-gray-700">
                            {tasks.filter(t => t.pet_id === p.id).length} aktívnych
                        </p>
                    </div>

                    {showManage && (
                        <button 
                            onClick={async () => {
                                if(confirm(`Zmazať miláčika ${p.name}?`)) {
                                    await supabase.from("pets").delete().eq("id", p.id);
                                    window.location.reload();
                                }
                            }}
                            className="absolute top-0 right-0 p-2 bg-red-100 text-red-600 rounded-full"
                        >
                            🗑️
                        </button>
                    )}
                </div>
              </div>
            ))}
            {pets.length === 0 && (
                <div className="w-full text-center p-10 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-gray-300">
                    <p className="font-bold text-gray-400">Ešte tu nemáš nikoho. Pridaj si prvého miláčika!</p>
                </div>
            )}
          </div>
        </section>

        {/* DNEŠNÝ PLÁN */}
        <div className="bg-black/5 rounded-[2.5rem] p-2 mb-8">
            <div className="bg-white rounded-[2.2rem] p-6 shadow-sm">
                <h2 className="text-xl font-extrabold mb-4">Dnešné povinnosti 📅</h2>
                <div className="space-y-3">
                    {tasks.length > 0 ? tasks.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-green-500 transition-colors" />
                            <span className="font-bold text-gray-700">{t.title}</span>
                            <span className="ml-auto text-xs font-bold px-2 py-1 bg-white rounded-lg text-gray-400">
                                {pets.find(p => p.id === t.pet_id)?.name}
                            </span>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 py-4 font-medium">Dnes máš veget. Žiadne úlohy! 🏖️</p>
                    )}
                </div>
            </div>
        </div>

        {/* ACCORDIONY - Čistý a scrollovateľný zoznam */}
        <div className="space-y-4">
            <Accordion title="Pridať novú úlohu" icon="✨">
                {/* Tu by šiel tvoj formulár na pridanie úlohy */}
                <p className="text-sm text-gray-500">Formulár na pridávanie úloh...</p>
            </Accordion>
            
            <Accordion title="Zdravotný pas" icon="💉">
                <HealthCard pets={pets} />
            </Accordion>

            <Accordion title="Náklady a výdavky" icon="💰">
                <CostsCard pets={pets} />
            </Accordion>

            <Accordion title="Záznamy a denník" icon="📝">
                <RecordsCard pets={pets} />
            </Accordion>
        </div>

      </div>
    </main>
  );
}