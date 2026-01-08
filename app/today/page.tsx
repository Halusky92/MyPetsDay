"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/** ---------- TYPES ---------- */
type Pet = {
  id: string;
  name: string;
  type: string;
  birthday: string | null;
  breed: string | null;
};

type Task = {
  id: string;
  pet_id: string;
  title: string;
  category: string;
  repeat_type: "none" | "daily" | "weekly";
  start_date: string; // YYYY-MM-DD
  weekdays: number[] | null; // 1..7
  is_archived?: boolean;
};

/** ---------- DATE HELPERS ---------- */
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function addDaysISO(baseISO: string, days: number) {
  const [y, m, d] = baseISO.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  base.setDate(base.getDate() + days);
  const yyyy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, "0");
  const dd = String(base.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function weekday1to7(d = new Date()) {
  const js = d.getDay(); // 0=Sun..6=Sat
  return js === 0 ? 7 : js; // 1=Mon..7=Sun
}
function weekday1to7FromISO(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return weekday1to7(dt);
}
function startOfWeekMondayISO(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const w = weekday1to7(dt);
  dt.setDate(dt.getDate() - (w - 1));
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** ---------- UI HELPERS ---------- */
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function progressColor(p01: number) {
  const t = clamp01(p01);
  const hue = lerp(0, 120, t); // 0 red -> 120 green
  return `hsl(${hue} 85% 42%)`;
}

/** ---------- LOGO + BACKGROUND ---------- */
function BoneLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className={className} aria-label="MyPetsDay logo">
      <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-sm">
        <defs>
          <linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#60A5FA" />
            <stop offset="1" stopColor="#A7F3D0" />
          </linearGradient>
          <linearGradient id="bone3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF7ED" />
            <stop offset="1" stopColor="#FFE4C7" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#bg3)" />
        <circle cx="18" cy="18" r="2" fill="white" opacity="0.9" />
        <circle cx="48" cy="14" r="1.6" fill="white" opacity="0.9" />
        <path
          d="M20 28c-2.8-2.3-7.2-.8-7.9 2.7-.6 3 1.6 5.6 4.4 5.7-.5 3.2 2.1 6.1 5.4 6.1h20.2c3.3 0 5.9-2.9 5.4-6.1 2.8-.1 5-2.7 4.4-5.7-.7-3.5-5.1-5-7.9-2.7-1.3-1.2-3.2-1.9-5.1-1.9H30.2c-1.9 0-3.8.7-5.2 1.9z"
          fill="url(#bone3)"
          stroke="#1F2937"
          strokeOpacity="0.25"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function TodayBackground() {
  // “bližšia krajinka”: obloha + obláčiky + domčeky + tráva + psík
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />

      {/* slnko */}
      <div className="absolute right-10 top-10 h-28 w-28 rounded-full bg-yellow-200 shadow-[0_0_90px_rgba(253,224,71,0.65)]" />

      {/* obláčiky */}
      <svg className="absolute left-[-80px] top-10 h-44 w-[560px] opacity-90" viewBox="0 0 560 180">
        <path
          d="M170 130c-45 0-82-25-82-56 0-25 25-47 62-52 11-33 51-56 102-56 59 0 107 35 107 78 0 3 0 6-.4 9 46 6 83 31 83 61 0 33-42 60-94 60H170z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <svg className="absolute right-[-120px] top-28 h-40 w-[520px] opacity-80" viewBox="0 0 560 180">
        <path
          d="M170 130c-45 0-82-25-82-56 0-25 25-47 62-52 11-33 51-56 102-56 59 0 107 35 107 78 0 3 0 6-.4 9 46 6 83 31 83 61 0 33-42 60-94 60H170z"
          fill="white"
          opacity="0.95"
        />
      </svg>

      {/* jemné bodky */}
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)] [background-size:18px_18px]" />

      {/* “budovy”/domčeky */}
      <svg className="absolute bottom-28 left-0 right-0 h-44 w-full opacity-70" viewBox="0 0 1200 220" preserveAspectRatio="none">
        <path d="M0 170 C 200 140, 380 190, 600 160 C 820 130, 980 180, 1200 150 L1200 220 L0 220 Z" fill="rgba(0,0,0,0.06)" />
        <g fill="rgba(0,0,0,0.10)">
          <rect x="160" y="110" width="70" height="70" rx="10" />
          <rect x="260" y="90" width="90" height="90" rx="12" />
          <rect x="390" y="105" width="60" height="75" rx="10" />
          <rect x="840" y="95" width="110" height="100" rx="14" />
          <rect x="980" y="115" width="70" height="80" rx="12" />
        </g>
        <g fill="rgba(255,255,255,0.7)">
          <rect x="185" y="130" width="12" height="14" rx="3" />
          <rect x="205" y="130" width="12" height="14" rx="3" />
          <rect x="288" y="120" width="14" height="16" rx="3" />
          <rect x="312" y="120" width="14" height="16" rx="3" />
          <rect x="870" y="125" width="14" height="16" rx="3" />
          <rect x="896" y="125" width="14" height="16" rx="3" />
        </g>
      </svg>

      {/* tráva */}
      <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-emerald-200 via-emerald-100 to-transparent" />

      {/* psík v rohu */}
      <div className="absolute bottom-6 left-6 grid h-24 w-24 place-items-center rounded-[2rem] bg-white/70 shadow-sm backdrop-blur">
        <span className="text-5xl">🐶</span>
      </div>
    </div>
  );
}

/** ---------- PROGRESS RING ---------- */
function ProgressRing({
  percent,
  label,
  sublabel,
  onClick,
}: {
  percent: number; // 0..100
  label?: string;
  sublabel?: string;
  onClick?: () => void;
}) {
  const p01 = clamp01(percent / 100);
  const r = 56;
  const c = 2 * Math.PI * r;
  const dash = c * p01;
  const gap = c - dash;
  const col = progressColor(p01);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative grid place-items-center rounded-[2.5rem] border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:bg-white"
      title="Klikni pre detail týždňa"
    >
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} stroke="rgba(0,0,0,0.10)" strokeWidth="14" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={r}
          stroke={col}
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          transform="rotate(-90 70 70)"
        />
      </svg>

      {/* PRESNE V STREDE */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-3xl font-semibold">{Math.round(percent)}%</div>
          <div className="mt-1 text-xs font-medium text-black/55">{label ?? "spokojnosť"}</div>
          {sublabel && <div className="mt-1 text-[11px] text-black/45">{sublabel}</div>}
        </div>
      </div>
    </button>
  );
}

/** ---------- BREEDS (basic starter list) ---------- */
const DOG_BREEDS = [
  "Mix / Neviem",
  "Dalmatín",
  "Labrador retriever",
  "Zlatý retriever",
  "Nemecký ovčiak",
  "Border kólia",
  "Jazvečík",
  "Pudel",
  "Francúzsky buldoček",
  "Jack Russell teriér",
  "Husky",
  "Chihuahua",
];

/** ---------- MAIN PAGE ---------- */
export default function TodayPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // pets
  const [pets, setPets] = useState<Pet[]>([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("dog");
  const [petBreed, setPetBreed] = useState("Mix / Neviem");
  const [petBirthday, setPetBirthday] = useState("");

  // tasks + completions
  const [tasks, setTasks] = useState<Task[]>([]);
  const [doneByDate, setDoneByDate] = useState<Map<string, Set<string>>>(new Map());

  // add task form
  const [taskPetId, setTaskPetId] = useState<string>("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("walk");
  const [repeatType, setRepeatType] = useState<"none" | "daily" | "weekly">("daily");
  const [startDate, setStartDate] = useState(todayISO());
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  const [savingPet, setSavingPet] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [error, setError] = useState<string>("");

  const [manageMode, setManageMode] = useState(false);
  const [showWeekDetail, setShowWeekDetail] = useState(false);

  const today = useMemo(() => todayISO(), []);
  const weekStart = useMemo(() => startOfWeekMondayISO(today), [today]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i)), [weekStart]);

  const upcomingDays = useMemo(() => {
    const days: string[] = [];
    for (let i = 1; i <= 7; i++) days.push(addDaysISO(today, i));
    return days;
  }, [today]);

  // Range for completions: whole week + next 7 days
  const rangeStart = weekStart;
  const rangeEnd = useMemo(() => {
    const weekEnd = addDaysISO(weekStart, 6);
    const upcomingEnd = upcomingDays.length ? upcomingDays[upcomingDays.length - 1] : today;
    return weekEnd > upcomingEnd ? weekEnd : upcomingEnd;
  }, [weekStart, upcomingDays, today]);

  /** ---------- DATA ---------- */
  async function requireUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  }

  async function loadPets() {
    const { data, error } = await supabase
      .from("pets")
      .select("id,name,type,birthday,breed,created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Pet[];
  }

  async function loadTasks() {
    const { data, error } = await supabase
      .from("care_tasks")
      .select("id,pet_id,title,category,repeat_type,start_date,weekdays,is_archived,created_at")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Task[];
  }

  async function loadDoneInRange() {
    const { data, error } = await supabase
      .from("task_completions")
      .select("task_id, completed_on")
      .gte("completed_on", rangeStart)
      .lte("completed_on", rangeEnd);

    if (error) throw error;

    const map = new Map<string, Set<string>>();
    for (const row of data ?? []) {
      const day = row.completed_on as string;
      const taskId = row.task_id as string;
      if (!map.has(day)) map.set(day, new Set());
      map.get(day)!.add(taskId);
    }
    return map;
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      setError("");
      const user = await requireUser();
      if (!mounted) return;

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setEmail(user.email ?? null);

      try {
        const [p, t, doneMap] = await Promise.all([loadPets(), loadTasks(), loadDoneInRange()]);
        if (!mounted) return;

        setPets(p);
        setTasks(t);
        setDoneByDate(doneMap);

        if (p.length > 0) setTaskPetId(p[0].id);
        setShowAddPet(p.length === 0); // ak nemáš pets, otvor add form automaticky
      } catch (e: any) {
        setError(e.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [rangeStart, rangeEnd]);

  /** ---------- LOGIC ---------- */
  function isDueOnDate(t: Task, dateISO: string) {
    if (t.start_date > dateISO) return false;

    if (t.repeat_type === "none") return t.start_date === dateISO;
    if (t.repeat_type === "daily") return true;

    if (t.repeat_type === "weekly") {
      const w = weekday1to7FromISO(dateISO);
      const days = t.weekdays ?? [];
      return days.includes(w);
    }
    return false;
  }

  const tasksToday = useMemo(() => tasks.filter((t) => isDueOnDate(t, today)), [tasks, today]);

  const tasksUpcomingTiny = useMemo(() => {
    // Malý bodový prehľad: zobraziť len počet na deň (nie veľké karty)
    return upcomingDays.map((day) => {
      const due = tasks.filter((t) => isDueOnDate(t, day));
      const doneSet = doneByDate.get(day) ?? new Set<string>();
      const done = due.filter((t) => doneSet.has(t.id)).length;
      return { day, total: due.length, done };
    });
  }, [upcomingDays, tasks, doneByDate]);

  const petNameById = useMemo(() => {
    const m = new Map<string, string>();
    pets.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [pets]);

  function isDone(taskId: string, dateISO: string) {
    return doneByDate.get(dateISO)?.has(taskId) ?? false;
  }

  const weekStats = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const day of weekDays) {
      const due = tasks.filter((t) => isDueOnDate(t, day));
      total += due.length;
      const doneSet = doneByDate.get(day) ?? new Set<string>();
      done += due.filter((t) => doneSet.has(t.id)).length;
    }
    const percent = total === 0 ? 0 : (done / total) * 100;
    return { total, done, percent };
  }, [weekDays, tasks, doneByDate]);

  /** ---------- ACTIONS ---------- */
  async function refreshDone() {
    try {
      const map = await loadDoneInRange();
      setDoneByDate(map);
    } catch (e: any) {
      setError(e.message ?? "Failed to refresh done state");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function addPet() {
    setSavingPet(true);
    setError("");

    const user = await requireUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("pets").insert({
      user_id: user.id,
      name: petName.trim(),
      type: petType,
      breed: petType === "dog" ? petBreed : null,
      birthday: petBirthday ? petBirthday : null,
    });

    if (error) {
      setSavingPet(false);
      setError(error.message);
      return;
    }

    setPetName("");
    setPetBirthday("");
    setPetBreed("Mix / Neviem");
    setSavingPet(false);

    try {
      const p = await loadPets();
      setPets(p);
      if (p.length > 0) setTaskPetId(p[0].id);
      setShowAddPet(false);
    } catch (e: any) {
      setError(e.message ?? "Failed to reload pets");
    }
  }

  async function addTask() {
    setSavingTask(true);
    setError("");

    const user = await requireUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const payload: any = {
      user_id: user.id,
      pet_id: taskPetId,
      title: taskTitle.trim(),
      category: taskCategory,
      repeat_type: repeatType,
      start_date: startDate,
      weekdays: repeatType === "weekly" ? weekdays : null,
      is_archived: false,
    };

    const { error } = await supabase.from("care_tasks").insert(payload);

    if (error) {
      setSavingTask(false);
      setError(error.message);
      return;
    }

    setTaskTitle("");
    setSavingTask(false);

    try {
      const t = await loadTasks();
      setTasks(t);
    } catch (e: any) {
      setError(e.message ?? "Failed to reload tasks");
    }
  }

  async function markDoneOn(taskId: string, dateISO: string) {
    setError("");
    const user = await requireUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("task_completions").insert({
      user_id: user.id,
      task_id: taskId,
      completed_on: dateISO,
    });

    if (error) {
      const msg = String(error.message).toLowerCase();
      if (!msg.includes("duplicate") && !msg.includes("unique")) setError(error.message);
      return;
    }

    setDoneByDate((prev) => {
      const next = new Map(prev);
      if (!next.has(dateISO)) next.set(dateISO, new Set());
      next.get(dateISO)!.add(taskId);
      return next;
    });
  }

  async function unmarkDoneOn(taskId: string, dateISO: string) {
    setError("");
    const user = await requireUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase
      .from("task_completions")
      .delete()
      .eq("task_id", taskId)
      .eq("completed_on", dateISO);

    if (error) {
      setError(error.message);
      return;
    }

    setDoneByDate((prev) => {
      const next = new Map(prev);
      const set = next.get(dateISO);
      if (set) {
        set.delete(taskId);
        if (set.size === 0) next.delete(dateISO);
      }
      return next;
    });
  }

  async function archiveTask(taskId: string) {
    setError("");
    const user = await requireUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("care_tasks").update({ is_archived: true }).eq("id", taskId);
    if (error) {
      setError(error.message);
      return;
    }

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  function toggleWeekday(d: number) {
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  /** ---------- RENDER ---------- */
  if (loading) {
    return (
      <main className="relative min-h-screen">
        <TodayBackground />
        <div className="relative mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-[2rem] border border-black/10 bg-white/75 p-8 shadow-sm backdrop-blur">
            <div className="text-xl font-semibold">Loading…</div>
            <p className="mt-2 text-black/60">Pripravujem tvoj deň.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <TodayBackground />

      <div className="relative mx-auto max-w-4xl px-6 py-10">
        {/* TOP HEADER */}
        <div className="rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <BoneLogo className="h-11 w-11" />
              <div>
                <div className="text-2xl font-semibold tracking-tight">MyPetsDay</div>
                <div className="text-sm text-black/60">
                  Prihlásený ako <span className="font-medium">{email}</span>
                </div>
                <div className="text-xs text-black/45">Dnes: {today}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setManageMode((v) => !v)}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/5"
              >
                {manageMode ? "Manage: ON" : "Manage"}
              </button>
              <button
                onClick={() => setShowWeekDetail(true)}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/5"
              >
                Týždeň detail
              </button>
              <button
                onClick={refreshDone}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/5"
              >
                Refresh
              </button>
              <button
                onClick={signOut}
                className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Sign out
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-700">❌ {error}</p>}
        </div>

        {/* RING + STATS */}
        <div className="mt-6 grid gap-4 md:grid-cols-[160px_1fr]">
          <ProgressRing
            percent={weekStats.percent}
            label="týždeň"
            sublabel={`${weekStats.done}/${weekStats.total} úloh`}
            onClick={() => setShowWeekDetail(true)}
          />

          <div className="rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-sm backdrop-blur">
            <div className="text-sm text-black/60">Kruh spokojnosti</div>
            <div className="mt-1 text-2xl font-semibold">Ako sa ti darí tento týždeň?</div>
            <div className="mt-3 text-sm text-black/65">
              Percento je presne z počtu splnených úloh v týždni. Čím viac úloh si nastavíš, tým jemnejšie sa progres delí.
            </div>
          </div>
        </div>

        {/* PETS - compact, form only when needed */}
        <div className="mt-6 rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">🐾 Miláčikovia</div>
            <button
              onClick={() => setShowAddPet((v) => !v)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
            >
              {showAddPet ? "Zavrieť" : "+ Add new pet"}
            </button>
          </div>

          {pets.length > 0 && !showAddPet && (
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {pets.slice(0, 2).map((p) => (
                <div key={p.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                  <div className="font-semibold">
                    {p.type === "dog" ? "🐶" : p.type === "cat" ? "🐱" : "🐾"} {p.name}
                  </div>
                  <div className="text-sm text-black/60">
                    {p.type === "dog" && p.breed ? `Plemeno: ${p.breed}` : "Plemeno: —"}
                  </div>
                </div>
              ))}
              {pets.length > 2 && (
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/60">
                  + ďalší: {pets.length - 2}
                </div>
              )}
            </div>
          )}

          {showAddPet && (
            <div className="mt-4">
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Meno (napr. Bella)"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                />
                <select
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                >
                  <option value="dog">Dog 🐶</option>
                  <option value="cat">Cat 🐱</option>
                  <option value="other">Other 🐾</option>
                </select>
                <input
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                  type="date"
                  value={petBirthday}
                  onChange={(e) => setPetBirthday(e.target.value)}
                />
              </div>

              {petType === "dog" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium">Plemeno</label>
                  <select
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                  >
                    {DOG_BREEDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={addPet}
                disabled={!petName.trim() || savingPet}
                className="mt-4 rounded-2xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                {savingPet ? "Ukladám..." : "Pridať miláčika"}
              </button>
            </div>
          )}
        </div>

        {/* ADD TASK */}
        <div className="mt-6 rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-sm backdrop-blur">
          <div className="text-lg font-semibold">➕ Pridať úlohu</div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <select
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              value={taskPetId}
              onChange={(e) => setTaskPetId(e.target.value)}
              disabled={pets.length === 0}
            >
              {pets.length === 0 ? (
                <option value="">Najprv pridaj miláčika</option>
              ) : (
                pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>

            <input
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 md:col-span-2"
              placeholder="Názov (napr. Ranné venčenie)"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />

            <select
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value)}
            >
              <option value="walk">Walk</option>
              <option value="meds">Meds</option>
              <option value="vet">Vet</option>
              <option value="grooming">Grooming</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <select
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as any)}
            >
              <option value="none">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>

            <input
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <div className="text-sm text-black/55 flex items-center">
              {repeatType === "weekly" ? "Vyber dni nižšie" : " "}
            </div>
          </div>

          {repeatType === "weekly" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                [1, "Mon"],
                [2, "Tue"],
                [3, "Wed"],
                [4, "Thu"],
                [5, "Fri"],
                [6, "Sat"],
                [7, "Sun"],
              ].map(([n, label]) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleWeekday(n as number)}
                  className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                    weekdays.includes(n as number)
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:bg-black/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={addTask}
            disabled={pets.length === 0 || !taskPetId || !taskTitle.trim() || savingTask}
            className="mt-4 rounded-2xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {savingTask ? "Ukladám..." : "Pridať úlohu"}
          </button>
        </div>

        {/* TODAY - PRIORITY BIG */}
        <div className="mt-6 rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">✅ Dnešné úlohy</div>
            <div className="text-sm text-black/60">
              Hotovo: {tasksToday.filter((t) => isDone(t.id, today)).length}/{tasksToday.length}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {tasksToday.length === 0 ? (
              <div className="rounded-2xl bg-black/[0.03] p-4 text-black/65">
                Dnes nič nemáš. Pridaj úlohu a kruh spokojnosti ožije 🟢
              </div>
            ) : (
              tasksToday.map((t) => {
                const done = isDone(t.id, today);
                return (
                  <div key={t.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">
                          {done ? "✅" : "⬜"} {t.title}{" "}
                          <span className="text-sm text-black/50">
                            • {petNameById.get(t.pet_id) ?? "Pet"} • {t.category}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-black/60">
                          {t.repeat_type === "daily"
                            ? "Opakuje sa: denne"
                            : t.repeat_type === "weekly"
                            ? "Opakuje sa: týždenne"
                            : `Jednorazovo: ${t.start_date}`}
                        </div>

                        {/* Delete riadok len v Manage */}
                        {manageMode && (
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => {
                                const ok = confirm(`Archivovať úlohu "${t.title}"? História splnení zostane.`);
                                if (ok) archiveTask(t.id);
                              }}
                              className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                              🗑️ Archivovať (Delete)
                            </button>
                            <span className="text-xs text-black/45">Nezmaže históriu</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {done ? (
                          <button
                            onClick={() => unmarkDoneOn(t.id, today)}
                            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
                            title="Zruší splnenie len pre dnešok"
                          >
                            Undo (today)
                          </button>
                        ) : (
                          <button
                            onClick={() => markDoneOn(t.id, today)}
                            className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                          >
                            Mark done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {manageMode && (
            <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/60">
              <div className="font-semibold">Manage mode</div>
              <div className="mt-1">
                Delete = archivácia úlohy. Úloha zmizne z Today, ale história splnení zostáva.
              </div>
            </div>
          )}
        </div>

        {/* UPCOMING - SMALL BULLETS */}
        <div className="mt-4 rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="text-lg font-semibold">📌 Najbližších 7 dní</div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {tasksUpcomingTiny.map((d) => (
              <div key={d.day} className="flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3">
                <div className="text-sm font-medium">{d.day}</div>
                <div className="text-sm text-black/60">
                  {d.total === 0 ? "—" : `${d.done}/${d.total}`}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-black/45">
            (Podrobné karty pre každý deň môžeme doplniť neskôr po kliknutí.)
          </div>
        </div>
      </div>

      {/* WEEK DETAIL MODAL */}
      {showWeekDetail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] border border-black/10 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-semibold">📊 Detail týždňa</div>
                <div className="mt-1 text-sm text-black/60">
                  {weekStart} – {addDaysISO(weekStart, 6)}
                </div>
              </div>
              <button
                onClick={() => setShowWeekDetail(false)}
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/5"
              >
                Zavrieť
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 md:items-center">
              <div className="flex justify-center">
                <ProgressRing percent={weekStats.percent} label="týždeň" sublabel={`${weekStats.done}/${weekStats.total}`} />
              </div>
              <div className="rounded-2xl bg-black/[0.03] p-4">
                <div className="text-sm text-black/55">Súhrn</div>
                <div className="mt-1 text-xl font-semibold">
                  {weekStats.done}/{weekStats.total} hotovo
                </div>
                <div className="mt-2 text-sm text-black/60">
                  Percento sa delí presne podľa počtu úloh, ktoré sú “due” v týždni.
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {weekDays.map((day) => {
                const due = tasks.filter((t) => isDueOnDate(t, day));
                const doneSet = doneByDate.get(day) ?? new Set<string>();
                const doneCount = due.filter((t) => doneSet.has(t.id)).length;

                return (
                  <div key={day} className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3">
                    <div className="font-medium">{day}</div>
                    <div className="text-sm text-black/60">
                      {doneCount}/{due.length} hotovo
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
