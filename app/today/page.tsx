"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import AppLogo from "../components/AppLogo";
import { 
  Stethoscope, 
  FileText, 
  Banknote, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Archive, 
  Search, 
  Calendar 
} from "lucide-react";

// --- 1. KOMPONENT PRE NOVÉ KARTY (ZDRAVIE A NÁKLADY) ---
function PetCareSection({ pets }: { pets: any[] }) {
  const [health, setHealth] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [hTitle, setHTitle] = useState("");
  const [hDate, setHDate] = useState("");
  const [eAmount, setEAmount] = useState("");

  const petId = pets[0]?.id;

  const loadPetData = async () => {
    if (!petId) return;
    const { data: h } = await supabase.from("pet_health").select("*").eq("pet_id", petId).order("due_on");
    const { data: e } = await supabase.from("pet_expenses").select("*").eq("pet_id", petId);
    setHealth(h || []);
    setExpenses(e || []);
  };

  useEffect(() => { loadPetData(); }, [petId]);

  const addHealth = async () => {
    if (!hTitle || !hDate) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("pet_health").insert([{ pet_id: petId, title: hTitle, due_on: hDate, user_id: user?.id }]);
    setHTitle(""); setHDate(""); loadPetData();
  };

  const addExpense = async () => {
    if (!eAmount) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("pet_expenses").insert([{ pet_id: petId, amount: Number(eAmount), category: 'Ostatné', spent_on: new Date(), user_id: user?.id }]);
    setEAmount(""); loadPetData();
  };

  if (!petId) return null;

  return (
    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Zdravotný pas */}
      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-black/5 transition-all hover:shadow-md">
        <div className="mb-6 flex items-center gap-3 text-blue-600 font-bold text-[10px] tracking-[0.2em] uppercase">
          <div className="bg-blue-50 p-2 rounded-xl"><Stethoscope size={20}/></div>
          Zdravotný pas
        </div>
        <div className="flex gap-2 mb-6">
          <input className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Názov očkovania..." value={hTitle} onChange={e => setHTitle(e.target.value)} />
          <input type="date" className="rounded-2xl border border-gray-100 bg-gray-50/50 px-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100" value={hDate} onChange={e => setHDate(e.target.value)} />
          <button onClick={addHealth} className="bg-black text-white px-5 rounded-2xl hover:bg-zinc-800 transition-all active:scale-95"><Plus size={20}/></button>
        </div>
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
          {health.length === 0 && <p className="text-center text-gray-300 text-sm italic py-4">Žiadne záznamy</p>}
          {health.map(h => (
            <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] border border-black/[0.02]">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-800">{h.title}</span>
                <span className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">{h.due_on}</span>
              </div>
              <Calendar size={14} className="text-black/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Náklady */}
      <div className="rounded-[2.5rem] bg-zinc-900 p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Banknote size={120} />
        </div>
        <div className="mb-4 flex items-center gap-3 text-emerald-400 font-bold text-[10px] tracking-[0.2em] uppercase">
          <Banknote size={20}/> Investované do lásky
        </div>
        <div className="mb-8">
          <div className="text-5xl font-black tracking-tighter">
            {expenses.reduce((a, b) => a + Number(b.amount), 0).toFixed(2)} <span className="text-2xl text-emerald-400">€</span>
          </div>
          <p className="text-white/40 text-xs mt-1 font-medium italic">Celková suma za všetky obdobia</p>
        </div>
        <div className="flex gap-2 relative z-10">
          <input type="number" className="w-full rounded-2xl bg-white/10 border-none px-5 py-4 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Pridať sumu v €" value={eAmount} onChange={e => setEAmount(e.target.value)} />
          <button onClick={addExpense} className="bg-emerald-500 text-black px-6 rounded-2xl font-bold hover:bg-emerald-400 transition-all active:scale-95">Uložiť</button>
        </div>
      </div>
    </div>
  );
}

// --- 2. HLAVNÝ KOMPONENT STRÁNKY ---
export default function TodayPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: p } = await supabase.from("pets").select("*");
      const { data: t } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      setPets(p || []);
      setTasks(t || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleTask = async (id: string, currentStatus: boolean) => {
    await supabase.from("tasks").update({ is_completed: !currentStatus }).eq("id", id);
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
  };

  const activeTasks = tasks.filter(t => !t.is_completed && t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const archivedTasks = tasks.filter(t => t.is_completed);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#FDFDFD]">
       <div className="h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
       <p className="font-bold italic text-black/20 animate-pulse">Pripravujem tvoj deň...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FDFDFD] p-6 lg:p-12 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        
        {/* Hlavička */}
        <header className="mb-12 flex items-end justify-between">
          <div>
            <AppLogo />
            <p className="mt-2 text-sm font-medium text-black/30">Dnes je {new Date().toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="text-right">
             <h1 className="text-4xl font-black italic tracking-tighter text-black/90">Môj Deň</h1>
          </div>
        </header>

        {/* Vyhľadávanie */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
          <input 
            type="text" 
            placeholder="Hľadať v úlohách..." 
            className="w-full rounded-[2rem] border border-black/5 bg-white py-4 pl-12 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Zoznam úloh */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-6 px-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black/20 italic">Aktuálne potreby</h2>
            <span className="rounded-full bg-black px-3 py-1 text-[10px] font-bold text-white">{activeTasks.length} Úloh</span>
          </div>

          <div className="grid gap-3">
            {activeTasks.length === 0 ? (
              <div className="rounded-[2.5rem] border-2 border-dashed border-black/5 p-12 text-center">
                <p className="text-sm font-medium italic text-black/20">Všetko je hotové, môžeš si oddýchnuť 🦴</p>
              </div>
            ) : (
              activeTasks.map(task => (
                <div key={task.id} onClick={() => toggleTask(task.id, task.is_completed)} className="group flex cursor-pointer items-center justify-between rounded-[2rem] bg-white border border-black/[0.03] p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <Circle className="text-black/10 transition-colors group-hover:text-black/30" />
                    <span className="font-bold text-zinc-700">{task.title}</span>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/10">Klikni pre splnenie</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* --- NOVÉ PET KARTY --- */}
        <PetCareSection pets={pets} />

        {/* Archív (Zjednodušený) */}
        <footer className="mt-20">
          <button 
            onClick={() => setShowArchive(!showArchive)}
            className="mx-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-black/20 hover:text-black/40 transition-colors"
          >
            <Archive size={14} /> {showArchive ? "Skryť históriu" : "Zobraziť históriu dňa"}
          </button>
          
          {showArchive && (
            <div className="mt-8 space-y-2 animate-in fade-in slide-in-from-top-4">
              {archivedTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-6 py-2 opacity-30 italic line-through text-sm">
                  <CheckCircle2 size={14} /> {t.title}
                </div>
              ))}
            </div>
          )}

          <div className="mt-20 border-t border-black/5 pt-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/10">MyPetsDay • Všetko pre nich</p>
          </div>
        </footer>

      </div>
    </main>
  );
}