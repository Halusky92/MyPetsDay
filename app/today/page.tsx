"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AppLogo from "../components/AppLogo";
import { HealthCard, RecordsCard, CostsCard } from "./extraCards";

// --- TYPY A POMOCNÉ FUNKCIE ---
type Pet = { id: string; name: string; type: string; birthday: string | null; breed: string | null; };
type Task = { id: string; pet_id: string; title: string; category: string; repeat_type: "none" | "daily" | "weekly"; start_date: string; weekdays: number[] | null; is_archived?: boolean; };

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDaysISO(baseISO: string, days: number) {
  const [y, m, d] = baseISO.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  base.setDate(base.getDate() + days);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
}
function weekday1to7(d = new Date()) { const js = d.getDay(); return js === 0 ? 7 : js; }
function weekday1to7FromISO(dateISO: string) { const [y, m, d] = dateISO.split("-").map(Number); return weekday1to7(new Date(y, m - 1, d)); }
function startOfWeekMondayISO(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - (weekday1to7(dt) - 1));
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
function progressColor(p01: number) { return `hsl(${p01 * 120} 80% 40%)`; }

// --- KOMPONENTY ---
function TodayBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute right-8 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_90px_rgba(253,224,71,0.55)]" />
      <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-emerald-200 via-emerald-100 to-transparent" />
    </div>
  );
}

function Accordion({ title, children, icon }: { title: string, children: React.ReactNode, icon?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/80 backdrop-blur shadow-sm">
      <button 
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left font-semibold text-black hover:bg-black/5 transition-colors"
      >
        <span className="flex items-center gap-2">{icon} {title}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="p-4 border-t border-black/5 bg-white/50">{children}</div>}
    </div>
  );
}

export default function TodayPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [doneByDate, setDoneByDate] = useState<Map<string, Set<string>>>(new Map());
  const [remind7, setRemind7] = useState(false);
  const [showManagePets, setShowManagePets] = useState(false);

  // Form states
  const [taskPetId, setTaskPetId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("walk");
  const [repeatType, setRepeatType] = useState<"none" | "daily" | "weekly">("daily");
  
  const today = useMemo(() => todayISO(), []);
  const weekStart = useMemo(() => startOfWeekMondayISO(today), [today]);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setEmail(user.email ?? null);

      const [p, t, a, d] = await Promise.all([
        supabase.from("pets").select("*").order("created_at", { ascending: false }),
        supabase.from("care_tasks").select("*").eq("is_archived", false),
        supabase.from("care_tasks").select("*").eq("is_archived", true).limit(20),
        supabase.from("task_completions").select("*").gte("completed_on", weekStart)
      ]);

      setPets(p.data ?? []);
      setTasks(t.data ?? []);
      setArchivedTasks(a.data ?? []);
      if (p.data?.length) setTaskPetId(p.data[0].id);

      const map = new Map();
      d.data?.forEach(row => {
        if (!map.has(row.completed_on)) map.set(row.completed_on, new Set());
        map.get(row.completed_on).add(row.task_id);
      });
      setDoneByDate(map);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  const tasksToday = useMemo(() => {
    return tasks.filter(t => {
      if (t.start_date > today) return false;
      if (t.repeat_type === "none") return t.start_date === today;
      if (t.repeat_type === "daily") return true;
      if (t.repeat_type === "weekly") return (t.weekdays || []).includes(weekday1to7FromISO(today));
      return false;
    });
  }, [tasks, today]);

  async function handleDeletePet(p: Pet) {
    if (!confirm(`Naozaj chcete vymazať miláčika ${p.name}? Táto akcia je nevratná.`)) return;
    const { error } = await supabase.from("pets").delete().eq("id", p.id);
    if (error) alert("Chyba: " + error.message);
    else loadData();
  }

  if (loading) return <div className="p-10 text-center">Načítavam...</div>;

  return (
    <main className="relative min-h-screen pb-20">
      <TodayBackground />
      
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* HEADER - Opravená mobilná responzivita */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-4">
            <AppLogo size={60} />
            <div>
              <h1 className="text-xl font-bold">MyPetsDay</h1>
              <p className="text-sm text-black/60">{email}</p>
            </div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => window.location.href="/login")}
            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition-all"
          >
            Odhlásiť
          </button>
        </div>

        {/* OVLÁDACIE TLAČIDLÁ */}
        <div className="mt-4 flex gap-2">
          <button onClick={loadData} className="flex-1 rounded-2xl bg-white/80 p-3 text-sm font-bold shadow-sm border border-black/5 hover:bg-white">
            🔄 Refresh
          </button>
          <button 
            onClick={() => setShowManagePets(!showManagePets)} 
            className={`flex-1 rounded-2xl p-3 text-sm font-bold shadow-sm border transition-all ${showManagePets ? 'bg-black text-white' : 'bg-white/80 border-black/5'}`}
          >
            ⚙️ Spravovať miláčikov
          </button>
        </div>

        {/* SEKCE: SPRÁVA MILÁČIKOV (Zobrazí sa po kliknutí na Spravovať) */}
        {showManagePets && (
          <div className="mt-4 rounded-[2rem] border-2 border-dashed border-black/10 p-4 bg-white/30">
            <h2 className="mb-3 font-bold px-2">Zoznam miláčikov:</h2>
            <div className="grid gap-2">
              {pets.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                  <span><strong>{p.name}</strong> ({p.type})</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeletePet(p)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">🗑️</button>
                  </div>
                </div>
              ))}
              {pets.length === 0 && <p className="text-sm text-center py-4">Žiadni miláčikovia.</p>}
            </div>
          </div>
        )}

        {/* DNEŠNÉ ÚLOHY */}
        <div className="mt-6">
          <h2 className="text-lg font-bold px-2 mb-4">Dnešný plán 📅</h2>
          <div className="grid gap-3">
            {tasksToday.map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-black/5">
                <div className="flex items-center gap-3">
                   <div className={`h-3 w-3 rounded-full ${t.category === 'walk' ? 'bg-green-400' : 'bg-blue-400'}`} />
                   <div>
                     <p className="font-semibold">{t.title}</p>
                     <p className="text-xs text-black/40">{pets.find(p => p.id === t.pet_id)?.name}</p>
                   </div>
                </div>
                <input type="checkbox" className="h-6 w-6 rounded-lg" />
              </div>
            ))}
            {tasksToday.length === 0 && (
              <div className="text-center py-10 bg-white/40 rounded-[2rem] border border-dashed border-black/10">
                <p>Na dnes žiadne úlohy. Užite si voľno! 🐾</p>
              </div>
            )}
          </div>
        </div>

        {/* ACCORDIONY - Rozbaľovacie okná */}
        <Accordion title="Pridať novú úlohu" icon="➕">
           <div className="space-y-3">
             <input className="w-full rounded-xl border border-black/10 p-3" placeholder="Názov úlohy..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
             <select className="w-full rounded-xl border border-black/10 p-3" value={taskPetId} onChange={e => setTaskPetId(e.target.value)}>
               {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
             <button className="w-full rounded-xl bg-black py-3 font-bold text-white">Uložiť úlohu</button>
           </div>
        </Accordion>

        <Accordion title="Zdravotný pas" icon="💉">
          <HealthCard pets={pets} />
        </Accordion>

        <Accordion title="Záznamy a denník" icon="📖">
          <RecordsCard pets={pets} />
        </Accordion>

        <Accordion title="Náklady a výdavky" icon="💶">
          <CostsCard pets={pets} />
        </Accordion>

        <Accordion title="Archivované úlohy" icon="📁">
          <div className="space-y-2">
            {archivedTasks.map(t => (
              <div key={t.id} className="text-sm p-2 bg-black/5 rounded-lg flex justify-between">
                <span>{t.title}</span>
                <button className="text-xs font-bold text-blue-600">Obnoviť</button>
              </div>
            ))}
          </div>
        </Accordion>

      </div>
    </main>
  );
}