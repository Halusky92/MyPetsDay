"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Pet = {
  id: string;
  name: string;
  type: string;
  birthday: string | null;
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
  const js = d.getDay();
  return js === 0 ? 7 : js; // Sun->7, Mon->1...
}
function weekday1to7FromISO(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return weekday1to7(dt);
}
function startOfWeekMondayISO(dateISO: string) {
  // Monday as 1.. Sunday 7
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const w = weekday1to7(dt);
  const diff = w - 1; // days since Monday
  dt.setDate(dt.getDate() - diff);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function SkyBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_70px_rgba(253,224,71,0.6)]" />
      <svg className="absolute left-8 top-20 h-24 w-56 opacity-90" viewBox="0 0 220 80">
        <path
          d="M55 60c-16 0-29-9-29-20 0-9 9-17 22-19 4-12 18-20 35-20 20 0 36 12 36 27 0 1 0 2-.2 3 15 2 27 11 27 22 0 12-14 22-31 22H55z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <svg className="absolute right-10 top-40 h-20 w-44 opacity-80" viewBox="0 0 220 80">
        <path
          d="M55 60c-16 0-29-9-29-20 0-9 9-17 22-19 4-12 18-20 35-20 20 0 36 12 36 27 0 1 0 2-.2 3 15 2 27 11 27 22 0 12-14 22-31 22H55z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:18px_18px] opacity-35" />
      <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-emerald-100 to-transparent" />
    </div>
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function progressColor(pct01: number) {
  // red -> yellow -> green in HSL-ish: use hue 0..120
  const t = clamp01(pct01);
  const hue = lerp(0, 120, t); // 0 red, 120 green
  return `hsl(${hue} 80% 45%)`;
}

function ProgressRing({
  percent,
  onClick,
}: {
  percent: number; // 0..100
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
      className="group relative grid place-items-center rounded-[2.5rem] border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:bg-white"
      title="Klikni pre detail týždňa"
    >
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-white/40 to-white/0 opacity-0 blur-xl transition group-hover:opacity-100" />
      <svg width="140" height="140" viewBox="0 0 140 140" className="relative">
        <circle cx="70" cy="70" r={r} stroke="rgba(0,0,0,0.08)" strokeWidth="14" fill="none" />
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
      <div className="pointer-events-none absolute text-center">
        <div className="text-3xl font-semibold">{Math.round(percent)}%</div>
        <div className="mt-1 text-xs font-medium text-black/55">týždeň hotovo</div>
      </div>
    </button>
  );
}

export default function TodayPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // pets
  const [pets, setPets] = useState<Pet[]>([]);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("dog");
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

  // UI extras
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

  // for completions range (cover week + upcoming)
  const rangeStart = weekStart;
  const rangeEnd = useMemo(() => {
    const weekEnd = addDaysISO(weekStart, 6);
    const upcomingEnd = upcomingDays.length ? upcomingDays[upcomingDays.length - 1] : today;
    return weekEnd > upcomingEnd ? weekEnd : upcomingEnd;
  }, [weekStart, upcomingDays, today]);

  async function requireUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  }

  async function loadPets() {
    const { data, error } = await supabase
      .from("pets")
      .select("id,name,type,birthday,created_at")
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
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const day of upcomingDays) map.set(day, tasks.filter((t) => isDueOnDate(t, day)));
    return map;
  }, [tasks, upcomingDays]);

  const petNameById = useMemo(() => {
    const m = new Map<string, string>();
    pets.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [pets]);

  function isDone(taskId: string, dateISO: string) {
    return doneByDate.get(dateISO)?.has(taskId) ?? false;
  }

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
      birthday: petBirthday ? petBirthday : null,
    });

    if (error) {
      setSavingPet(false);
      setError(error.message);
      return;
    }

    setPetName("");
    setPetBirthday("");
    setSavingPet(false);

    try {
      const p = await loadPets();
      setPets(p);
      if (p.length > 0) setTaskPetId(p[0].id);
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

    // Soft delete: nech história ostane
    const { error } = await supabase.from("care_tasks").update({ is_archived: true }).eq("id", taskId);

    if (error) {
      setError(error.message);
      return;
    }

    // odstráň z UI
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  function toggleWeekday(d: number) {
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  const weekStats = useMemo(() => {
    let total = 0;
    let done = 0;

    for (const day of weekDays) {
      const due = tasks.filter((t) => isDueOnDate(t, day));
      total += due.length;
      const doneSet = doneByDate.get(day) ?? new Set<string>();
      // count done instances for due tasks only
      done += due.filter((t) => doneSet.has(t.id)).length;
    }

    const percent = total === 0 ? 0 : (done / total) * 100;
    return { total, done, percent };
  }, [weekDays, tasks, doneByDate]);

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <SkyBackground />
        <div className="relative mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm backdrop-blur">
            <div className="text-xl font-semibold">Loading…</div>
            <p className="mt-2 text-black/60">Kontrolujem session.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <SkyBackground />

      <div className="relative mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-[2.5rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-3xl font-semibold tracking-tight">🐾 Today</div>
            <p className="mt-1 text-sm text-black/60">
              Prihlásený ako <span className="font-medium">{email}</span>
            </p>
            <p className="mt-1 text-xs text-black/45">Dátum: {today}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setManageMode((v) => !v)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/5"
            >
              {manageMode ? "Hotovo (Manage)" : "Manage"}
            </button>
            <button
              onClick={() => setShowWeekDetail(true)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/5"
            >
              Detail týždňa
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

        {/* Weekly ring + quick stats */}
        <div className="mt-6 grid gap-4 md:grid-cols-[160px_1fr] md:items-stretch">
          <ProgressRing percent={weekStats.percent} onClick={() => setShowWeekDetail(true)} />
          <div className="rounded-[2.5rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-black/55">Týždeň (Po–Ne)</div>
                <div className="mt-1 text-2xl font-semibold">
                  {weekStats.done}/{weekStats.total} hotovo
                </div>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-b from-sky-200 to-white shadow-inner">
                🐶
              </div>
            </div>
            <div className="mt-4 text-sm text-black/60">
              Klikni na kruh pre detail. Farba ide od červenej po zelenú podľa úspešnosti.
            </div>
          </div>
        </div>

        {/* PETS */}
        <div className="mt-8 rounded-[2.5rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="text-xl font-semibold">🐾 Tvoji miláčikovia</div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
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

          <button
            onClick={addPet}
            disabled={!petName.trim() || savingPet}
            className="mt-3 rounded-2xl bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {savingPet ? "Ukladám..." : "Pridať miláčika"}
          </button>

          <div className="mt-6 space-y-2">
            {pets.length === 0 ? (
              <p className="text-black/60">Zatiaľ žiadny miláčik. Pridaj prvého psíka 🐶</p>
            ) : (
              pets.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-3xl border border-black/10 bg-white px-4 py-3"
                >
                  <div>
                    <div className="font-semibold">
                      {p.type === "dog" ? "🐶" : p.type === "cat" ? "🐱" : "🐾"} {p.name}
                    </div>
                    <div className="text-sm text-black/60">
                      {p.birthday ? `Narodeniny: ${p.birthday}` : "Narodeniny: —"}
                    </div>
                  </div>
                  <div className="text-sm text-black/50">{p.type}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ADD TASK */}
        <div className="mt-6 rounded-[2.5rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="text-xl font-semibold">➕ Pridať úlohu</div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <select
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              value={taskPetId}
              onChange={(e) => setTaskPetId(e.target.value)}
              disabled={pets.length === 0}
            >
              {pets.length === 0 ? <option value="">Najprv pridaj miláčika</option> : pets.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
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

            <div className="text-sm text-black/50 flex items-center">
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
                  className={`rounded-2xl border px-3 py-2 text-sm font-medium ${
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
            className="mt-3 rounded-2xl bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {savingTask ? "Ukladám..." : "Pridať úlohu"}
          </button>
        </div>

        {/* TODAY TASKS */}
        <div className="mt-6 rounded-[2.5rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">✅ Dnešné úlohy</div>
            <div className="text-sm text-black/55">
              Hotovo: {tasksToday.filter((t) => isDone(t.id, today)).length}/{tasksToday.length}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {tasksToday.length === 0 ? (
              <p className="text-black/60">Dnes nič. Pridaj úlohu pre Bellu 🐶</p>
            ) : (
              tasksToday.map((t) => {
                const done = isDone(t.id, today);
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-3xl border border-black/10 bg-white px-4 py-3"
                  >
                    <div>
                      <div className="font-semibold">
                        {done ? "✅" : "⬜"} {t.title}{" "}
                        <span className="text-sm text-black/50">
                          • {petNameById.get(t.pet_id) ?? "Pet"} • {t.category}
                        </span>
                      </div>
                      <div className="text-sm text-black/60">
                        {t.repeat_type === "daily"
                          ? "Opakuje sa: denne"
                          : t.repeat_type === "weekly"
                          ? "Opakuje sa: týždenne"
                          : `Jednorazovo: ${t.start_date}`}
                      </div>

                      {/* “riadok s možnosťou delete” len v Manage mode */}
                      {manageMode && (
                        <div className="mt-2 text-sm">
                          <button
                            onClick={() => {
                              const ok = confirm(`Archivovať úlohu "${t.title}"? História ostane.`);
                              if (ok) archiveTask(t.id);
                            }}
                            className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            🗑️ Delete (archivovať)
                          </button>
                          <span className="ml-2 text-xs text-black/45">
                            (nezmaže históriu splnení)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {done ? (
                        <button
                          onClick={() => unmarkDoneOn(t.id, today)}
                          className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/5"
                          title="Zruší splnenie len pre dnešok"
                        >
                          Undo (today)
                        </button>
                      ) : (
                        <button
                          onClick={() => markDoneOn(t.id, today)}
                          className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                        >
                          Mark done
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {manageMode && (
            <div className="mt-4 rounded-3xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/60">
              <div className="font-semibold">Manage mode</div>
              <div className="mt-1">
                “Delete” je teraz <span className="font-semibold">archivácia</span> — úloha zmizne z dneška, ale história
                splnení zostane uložená.
              </div>
            </div>
          )}
        </div>

        {/* UPCOMING */}
        <div className="mt-6 rounded-[2.5rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="text-xl font-semibold">📆 Najbližších 7 dní</div>

          <div className="mt-4 space-y-4">
            {upcomingDays.every((d) => (tasksByDay.get(d) ?? []).length === 0) ? (
              <p className="text-black/60">Nič naplánované.</p>
            ) : (
              upcomingDays.map((day) => {
                const list = tasksByDay.get(day) ?? [];
                if (list.length === 0) return null;

                return (
                  <div key={day} className="rounded-3xl border border-black/10 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{day}</div>
                      <div className="text-sm text-black/50">
                        Hotovo: {(doneByDate.get(day)?.size ?? 0)}/{list.length}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {list.map((t) => {
                        const done = isDone(t.id, day);
                        return (
                          <div
                            key={t.id}
                            className="flex items-center justify-between rounded-3xl border border-black/10 bg-white px-4 py-3"
                          >
                            <div>
                              <div className="font-semibold">
                                {done ? "✅" : "⬜"} {t.title}{" "}
                                <span className="text-sm text-black/50">
                                  • {petNameById.get(t.pet_id) ?? "Pet"} • {t.category}
                                </span>
                              </div>
                              <div className="text-sm text-black/60">
                                {t.repeat_type === "daily"
                                  ? "Opakuje sa: denne"
                                  : t.repeat_type === "weekly"
                                  ? "Opakuje sa: týždenne"
                                  : "Jednorazovo"}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {done ? (
                                <button
                                  onClick={() => unmarkDoneOn(t.id, day)}
                                  className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/5"
                                >
                                  Undo
                                </button>
                              ) : (
                                <button
                                  onClick={() => markDoneOn(t.id, day)}
                                  className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                                >
                                  Mark done
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Week detail modal */}
      {showWeekDetail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-[2.5rem] border border-black/10 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-semibold">📊 Detail týždňa</div>
                <div className="mt-1 text-sm text-black/60">
                  {weekStart} – {addDaysISO(weekStart, 6)}
                </div>
              </div>
              <button
                onClick={() => setShowWeekDetail(false)}
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5"
              >
                Zavrieť
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 md:items-center">
              <div className="flex justify-center">
                <ProgressRing percent={weekStats.percent} />
              </div>
              <div className="rounded-3xl bg-black/[0.03] p-4">
                <div className="text-sm text-black/55">Súhrn</div>
                <div className="mt-1 text-xl font-semibold">
                  {weekStats.done}/{weekStats.total} hotovo
                </div>
                <div className="mt-2 text-sm text-black/60">
                  Kliknutím na úlohy ich riešiš v Today / Upcoming.
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {weekDays.map((day) => {
                const due = tasks.filter((t) => isDueOnDate(t, day));
                const doneSet = doneByDate.get(day) ?? new Set<string>();
                const doneCount = due.filter((t) => doneSet.has(t.id)).length;

                return (
                  <div key={day} className="flex items-center justify-between rounded-3xl border border-black/10 px-4 py-3">
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
