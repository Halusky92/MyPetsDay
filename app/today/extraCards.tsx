"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function HealthCard({ pets }: { pets: { id: string; name: string }[] }) {
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("vaccine");
  const [dueOn, setDueOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [repeatType, setRepeatType] = useState("none");
  const [msg, setMsg] = useState("");

  async function add() {
    setMsg("");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;

    const { error } = await supabase.from("pet_health").insert({
      user_id: u.user.id,
      pet_id: petId,
      title: title.trim(),
      type,
      due_on: dueOn,
      repeat_type: repeatType,
    });

    if (error) return setMsg(error.message);
    setTitle("");
    setMsg("✅ Uložené");
  }

  return (
    <div className="rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-black">🩺 Zdravotný pas</div>
        <div className="text-xs text-black/55">Smart pripomienky</div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <select className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
          value={petId} onChange={(e) => setPetId(e.target.value)}>
          {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <input className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black md:col-span-2"
          placeholder="Názov (napr. Očkovanie)"
          value={title} onChange={(e) => setTitle(e.target.value)} />

        <select className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
          value={type} onChange={(e) => setType(e.target.value)}>
          <option value="vaccine">Očkovanie</option>
          <option value="deworming">Odčervenie</option>
          <option value="antiparasitic">Antiparazitiká</option>
          <option value="meds">Lieky</option>
          <option value="checkup">Kontrola</option>
          <option value="other">Iné</option>
        </select>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <input className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
          type="date" value={dueOn} onChange={(e) => setDueOn(e.target.value)} />
        <select className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
          value={repeatType} onChange={(e) => setRepeatType(e.target.value)}>
          <option value="none">Bez opakovania</option>
          <option value="monthly">Mesačne</option>
          <option value="yearly">Ročne</option>
        </select>

        <button
          onClick={add}
          disabled={!petId || !title.trim()}
          className="rounded-2xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          Pridať pripomienku
        </button>
      </div>

      {msg && <div className="mt-3 text-sm text-black/70">{msg}</div>}
    </div>
  );
}

export function RecordsCard({ pets }: { pets: { id: string; name: string }[] }) {
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  async function add() {
    setMsg("");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;

    const { error } = await supabase.from("pet_records").insert({
      user_id: u.user.id,
      pet_id: petId,
      title: title.trim(),
      record_date: date,
      notes: notes.trim() || null,
    });

    if (error) return setMsg(error.message);
    setTitle("");
    setNotes("");
    setMsg("✅ Uložené");
  }

  async function exportJSON() {
    setMsg("");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;

    const { data, error } = await supabase
      .from("pet_records")
      .select("title,record_date,notes")
      .eq("pet_id", petId)
      .order("record_date", { ascending: false })
      .limit(500);

    if (error) return setMsg(error.message);

    const blob = new Blob([JSON.stringify(data ?? [], null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mypetsday_records.json";
    a.click();
    URL.revokeObjectURL(url);
    setMsg("⬇️ Export JSON pripravený");
  }

  return (
    <div className="rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-black">📄 Záznamy</div>
        <button onClick={exportJSON} className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5">
          Export JSON
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <select className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
          value={petId} onChange={(e) => setPetId(e.target.value)}>
          {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black md:col-span-2"
          placeholder="Názov (napr. Kontrola u veterinára)"
          value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
          type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <textarea
        className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
        placeholder="Poznámka (voliteľné)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />

      <button
        onClick={add}
        disabled={!petId || !title.trim()}
        className="mt-3 rounded-2xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        Pridať záznam
      </button>

      {msg && <div className="mt-3 text-sm text-black/70">{msg}</div>}
    </div>
  );
}

export function CostsCard({ pets }: { pets: { id: string; name: string }[] }) {
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [category, setCategory] = useState("food");
  const [amount, setAmount] = useState("");
  const [spentOn, setSpentOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  const monthKey = useMemo(() => spentOn.slice(0, 7), [spentOn]); // YYYY-MM

  async function add() {
    setMsg("");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;

    const val = Number(amount);
    if (!isFinite(val) || val <= 0) return setMsg("Zadaj platnú sumu.");

    const { error } = await supabase.from("pet_expenses").insert({
      user_id: u.user.id,
      pet_id: petId,
      category,
      amount: val,
      spent_on: spentOn,
      notes: notes.trim() || null,
    });

    if (error) return setMsg(error.message);
    setAmount("");
    setNotes("");
    setMsg("✅ Uložené");
  }

  return (
    <div className="rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-black">💸 Náklady</div>
        <div className="text-xs text-black/55">Mesiac: {monthKey}</div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <select className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
          value={petId} onChange={(e) => setPetId(e.target.value)}>
          {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
          value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="food">Jedlo</option>
          <option value="vet">Veterinár</option>
          <option value="meds">Lieky</option>
          <option value="toys">Hračky</option>
          <option value="other">Iné</option>
        </select>

        <input className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
          placeholder="Suma (€)" value={amount} onChange={(e) => setAmount(e.target.value)} />

        <input className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
          type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} />

        <button
          onClick={add}
          disabled={!petId || !amount.trim()}
          className="rounded-2xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          Pridať
        </button>
      </div>

      <input
        className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-black"
        placeholder="Poznámka (voliteľné)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {msg && <div className="mt-3 text-sm text-black/70">{msg}</div>}
    </div>
  );
}
