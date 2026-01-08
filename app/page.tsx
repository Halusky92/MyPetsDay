"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// --- KONFIGURÁCIA SUPABASE (Ak máš ENV premenné, použi process.env) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "TVOJE_SUPABASE_URL";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "TVOJ_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- KOMPONENT LOGA (Vložený priamo, aby nehádzal chybu importu) ---
const AppLogo = ({ size = 50, className = "" }: { size?: number; className?: string }) => (
  <div 
    className={`bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg ${className}`}
    style={{ width: size, height: size, fontSize: size * 0.5 }}
  >
    🐾
  </div>
);

// --- POMOCNÉ FUNKCIE (Vek, Narodeniny) ---
function getAge(birthday: string) {
  if (!birthday) return 0;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

function daysToBirthday(birthday: string) {
  if (!birthday) return 0;
  const today = new Date();
  const bday = new Date(birthday);
  bday.setFullYear(today.getFullYear());
  if (bday < today) bday.setFullYear(today.getFullYear() + 1);
  const diff = bday.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// --- KOMPONENT: PROGRES KRUH ---
function ProgressCircle({ current, total }: { current: number; total: number }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = percentage < 30 ? "#ef4444" : percentage < 75 ? "#eab308" : "#22c55e";

  return (
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r={radius} stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
        <circle
          cx="50%" cy="50%" r={radius} stroke={color} strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset, transition: "all 0.8s ease-out" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[16px] font-black leading-none">{percentage}%</span>
        <span className="text-[9px] font-bold text-gray-400 mt-0.5">{current}/{total}</span>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPet, setNewPet] = useState({ name: "", type: "dog", breed: "", birthday: "" });

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const [p, t] = await Promise.all([
        supabase.from("pets").select("*").order("created_at", { ascending: false }),
        supabase.from("care_tasks").select("*").eq("is_archived", false)
      ]);

      setPets(p.data || []);
      setTasks(t.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  async function handleSavePet() {
    if (!newPet.name || !newPet.birthday) return alert("Prosím vyplň meno a dátum narodenia.");
    const { error } = await supabase.from("pets").insert([newPet]);
    if (error) alert(error.message);
    else {
      setShowAddPet(false);
      setNewPet({ name: "", type: "dog", breed: "", birthday: "" });
      loadData();
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 font-black text-gray-400 uppercase tracking-widest">
      Načítavam tvoju svorku... 🐾
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      
      {/* HEADER */}
      <div className="mx-auto max-w-4xl px-5 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <AppLogo size={45} />
            <h1 className="text-xl font-black tracking-tight">MyPetsDay</h1>
        </div>
        <button 
          onClick={() => setShowAddPet(true)}
          className="bg-black text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg active:scale-95 transition-all"
        >
          + Pridať miláčika
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-5 mt-8">
        
        {/* TVOJI MILÁČIKOVIA */}
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Tvoja svorka</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
          {pets.map(p => {
            const petTasks = tasks.filter(t => t.pet_id === p.id);
            const completedCount = 0; // Tu sa neskôr napojí real-time progres

            return (
              <div key={p.id} className="min-w-[290px] snap-center bg-white rounded-[2.5rem] p-5 shadow-xl shadow-black/[0.02] border border-gray-100 flex items-center gap-4">
                <ProgressCircle current={completedCount} total={petTasks.length} />
                <div className="overflow-hidden">
                  <h3 className="text-xl font-black text-gray-800 truncate">{p.name}</h3>
                  <p className="text-xs font-bold text-gray-400 truncate uppercase tracking-tighter">{p.breed || p.type}</p>
                  <div className="mt-2 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg w-fit">
                      🎂 {getAge(p.birthday)} ROKOV
                    </span>
                    <span className="text-[10px] font-black text-blue-600">
                      🎉 NARODENINY ZA {daysToBirthday(p.birthday)} DNÍ
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {pets.length === 0 && (
            <div className="w-full bg-white/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-10 text-center font-bold text-gray-400">
              Ešte tu nikoho nemáš. Začni pridaním miláčika! ☝️
            </div>
          )}
        </div>

        {/* ÚLOHY */}
        <div className="mt-10">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Dnešný plán 📅</h2>
          <div className="grid gap-3">
            {tasks.length > 0 ? (
              tasks.map(t => (
                <div key={t.id} className="bg-white rounded-[1.8rem] p-4 flex items-center gap-4 shadow-sm border border-gray-50 hover:border-black/5 transition-all">
                  <div className="h-6 w-6 rounded-lg border-2 border-gray-200 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 leading-tight">{t.title}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">{pets.find(p => p.id === t.pet_id)?.name}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-100/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                <p className="font-bold text-gray-300 italic">Žiadne úlohy na dnes...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FORMULÁR NOVÉHO MILÁČIKA */}
      {showAddPet && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4">
          <div className="w-full max-w-md bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Nový parťák 🐾</h2>
              <button onClick={() => setShowAddPet(false)} className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full font-bold hover:bg-gray-200">✕</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Meno</label>
                <input className="w-full bg-gray-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-black/5" value={newPet.name} onChange={e => setNewPet({...newPet, name: e.target.value})} placeholder="Dunčo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Druh</label>
                  <select className="w-full bg-gray-50 rounded-2xl p-4 font-bold outline-none" value={newPet.type} onChange={e => setNewPet({...newPet, type: e.target.value})}>
                    <option value="dog">Pes 🐶</option>
                    <option value="cat">Mačka 🐱</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Narodeniny</label>
                  <input type="date" className="w-full bg-gray-50 rounded-2xl p-4 font-bold outline-none" value={newPet.birthday} onChange={e => setNewPet({...newPet, birthday: e.target.value})} />
                </div>
              </div>
              <button onClick={handleSavePet} className="w-full bg-black text-white py-5 rounded-2xl font-black shadow-xl mt-4 active:scale-95 transition-all">
                Uložiť do svorky
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}