"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AppLogo from "../components/AppLogo";

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
  return js === 0 ? 7 : js;
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
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function progressColor(p01: number) {
  const t = clamp01(p01);
  const hue = lerp(0, 120, t);
  return `hsl(${hue} 80% 40%)`;
}

function TodayBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />
      <div className="absolute right-8 top-10 h-24 w-24 rounded-full bg-yellow-200 shadow-[0_0_80px_rgba(253,224,71,0.55)]" />
      <svg className="absolute left-[-90px] top-10 h-40 w-[560px] opacity-95" viewBox="0 0 520 180">
        <path
          d="M150 130c-40 0-72-22-72-49 0-22 22-41 54-46 10-29 45-49 88-49 51 0 92 30 92 66 0 3 0 5-.4 8 39 5 70 26 70 52 0 29-36 52-80 52H150z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <svg className="absolute right-[-140px] top-28 h-40 w-[560px] opacity-85" viewBox="0 0 520 180">
        <path
          d="M150 130c-40 0-72-22-72-49 0-22 22-41 54-46 10-29 45-49 88-49 51 0 92 30 92 66 0 3 0 5-.4 8 39 5 70 26 70 52 0 29-36 52-80 52H150z"
          fill="white"
          opacity="0.95"
        />
      </svg>

      <svg className="absolute bottom-24 left-0 right-0 h-44 w-full opacity-65" viewBox="0 0 1200 220" preserveAspectRatio="none">
        <path d="M0 170 C 200 140, 380 190, 600 160 C 820 130, 980 180, 1200 150 L1200 220 L0 220 Z" fill="rgba(0,0,0,0.06)" />
        <g fill="rgba(0,0,0,0.10)">
          <rect x="160" y="110" width="70" height="70" rx="10" />
          <rect x="260" y="90" width="90" height="90" rx="12" />
          <rect x="390" y="105" width="60" height="75" rx="10" />
          <rect x="840" y="95" width="110" height="100" rx="14" />
          <rect x="980" y="115" width="70" height="80" rx="12" />
        </g>
      </svg>

      <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-emerald-200 via-emerald-100 to-transparent" />
    </div>
  );
}

function SegmentedRing({ total, done }: { total: number; done: number }) {
  const p01 = total === 0 ? 0 : done / total;
  const col = progressColor(p01);

  const r = 56;
  const c = 2 * Math.PI * r;
  const stroke = 14;
  const pct = Math.round(p01 * 100);

  const showSegments = total > 0 && total <= 120;

  if (!showSegments) {
    const dash = c * clamp01(p01);
    const gap = c - dash;

    return (
      <div className="relative grid place-items-center">
        <svg width={170} height={170} viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} stroke="rgba(0,0,0,0.10)" strokeWidth={stroke} fill="none" />
          <circle
            cx="70"
            cy="70"
            r={r}
            stroke={col}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-3xl font-semibold text-black">{pct}%</div>
        </div>
      </div>
    );
  }

  const segment = c / total;
  const segLen = segment * 0.78;
  const gapLen = segment - segLen;
  const dashAll = `${segLen} ${gapLen}`;

  return (
    <div className="relative grid place-items-center">
      <svg width={170} height={170} viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={r}
          stroke="rgba(0,0,0,0.12)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashAll}
          transform="rotate(-90 70 70)"
        />
        {Array.from({ length: done }).map((_, i) => (
          <circle
            key={i}
            cx="70"
            cy="70"
            r={r}
            stroke={col}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={dashAll}
            strokeDashoffset={-(segment * i)}
            transform="rotate(-90 70 70)"
          />
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-3xl font-semibold text-black">{pct}%</div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-9 w-16 rounded-full border border-black/10 transition ${
        value ? "bg-black" : "bg-white"
      }`}
      aria-label="toggle"
    >
      <span
        className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-sm transition ${
          value ? "left-8" : "left-1"
        }`}
      />
    </button>
  );
}

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

export default function TodayPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pets, setPets] = useState<Pet[]>([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("dog");
  const [petBreed, setPetBreed] = useState("Mix / Neviem");
  const [petBirthday, setPetBirthday] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [doneByDate, setDoneByDate] = useState<Map<string, Set<string>>>(new Map());

  const [taskPetId, setTaskPetId] = useState<string>("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("walk");
  const [repeatType, setRepeatType] = useState<"none" | "daily" | "weekly">("daily");
  const [startDate, setStartDate] = useState(todayISO());
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  const [savingPet, setSavingPet] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const [openWeek, setOpenWeek] = useState(false);
  const [openArchived, setOpenArchived] = useState(false);

  const [remind7, setRemind7] = useState(false);

  const today = useMemo(() => todayISO(), []);
  const weekStart = useMemo(() => startOfWeekMondayISO(today), [today]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i)), [weekStart]);

  const rangeStart = weekStart;
  const rangeEnd = useMemo(() => addDaysISO(weekStart, 6), [weekStart]);

  useEffect(() => {
    const saved = localStorage.getItem("mypetsday_remind7");
    setRemind7(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("mypetsday_remind7", remind7 ? "1" : "0");
  }, [remind7]);

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

  async function loadTasksActive() {
    const { data, error } = await supabase
      .from("care_tasks")
      .select("id,pet_id,title,category,repeat_type,start_date,weekdays,is_archived,created_at")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Task[];
  }

  async function loadTasksArchived() {
    const { data, error } = await supabase
      .from("care_tasks")
      .select("id,pet_id,title,category,repeat_type,start_date,weekdays,is_archived,created_at")
      .eq("is_archived", true)
      .order("created_at", { ascending: false })
      .limit(20);
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
        const [p, t, a, doneMap] = await Promise.all([
          loadPets(),
          loadTasksActive(),
          loadTasksArchived(),
          loadDoneInRange(),
        ]);

        if (!mounted) return;

        setPets(p);
        setTasks(t);
        setArchivedTasks(a);
        setDoneByDate(doneMap);

        if (p.length > 0) setTaskPetId(p[0].id);
        setShowAddPet(p.length === 0);
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

  const petNameById = useMemo(() => {
    const m = new Map<string, string>();
    pets.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [pets]);

  function isDone(taskId: string, dateISO: string) {
    return doneByDate.get(dateISO)?.has(taskId) ?? false;
  }

  const mainPetName = pets[0]?.name ?? "tvoj psík";
  const tasksToday = useMemo(() => tasks.filter((t) => isDueOnDate(t, today)), [tasks, today]);

  const todayDone = tasksToday.filter((t) => isDone(t.id, today)).length;
  const todayTotal = tasksToday.length;
  const todayLeft = Math.max(0, todayTotal - todayDone);

  const weekCounts = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const day of weekDays) {
      const due = tasks.filter((t) => isDueOnDate(t, day));
      total += due.length;
      const doneSet = doneByDate.get(day) ?? new Set<string>();
      done += due.filter((t) => doneSet.has(t.id)).length;
    }
    return { total, done };
  }, [weekDays, tasks, doneByDate]);

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

    const p = await loadPets();
    setPets(p);
    if (p.length > 0) setTaskPetId(p[0].id);
    setShowAddPet(false);
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

    const t = await loadTasksActive();
    setTasks(t);
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
    const { error } = await supabase.from("care_tasks").update({ is_archived: true }).eq("id", taskId);
    if (error) {
      setError(error.message);
      return;
    }
    // refresh both
    const [t, a] = await Promise.all([loadTasksActive(), loadTasksArchived()]);
    setTasks(t);
    setArchivedTasks(a);
    setOpenArchived(true);
  }

  async function restoreTask(taskId: string) {
    setError("");
    const { error } = await supabase.from("care_tasks").update({ is_archived: false }).eq("id", taskId);
    if (error) {
      setError(error.message);
      return;
    }
    const [t, a] = await Promise.all([loadTasksActive(), loadTasksArchived()]);
    setTasks(t);
    setArchivedTasks(a);
  }

  function toggleWeekday(d: number) {
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  const dayLabel = (iso: string) => {
    const w = weekday1to7FromISO(iso);
    const names: Record<number, string> = { 1: "Po", 2: "Ut", 3: "St", 4: "Št", 5: "Pi", 6: "So", 7: "Ne" };
    return `${names[w]} ${iso}`;
  };

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <TodayBackground />
        <div className="relative mx-auto max-w-4xl px-5 py-10">
          <div className="rounded-[2rem] border border-black/10 bg-white/80 p-7 shadow-sm backdrop-blur">
            <div classжаўName="text-xl font-semibold text-black">Loading…</div>
            <p className="mt-2 text-black/60">Pripravujem tvoj deň.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <TodayBackground />

      <div className="relative mx-auto max-w-4xl px-5 py-10">
        {/* HEADER (viac app vibe) */}
        <div className="rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AppLogo size={58} className="drop-shadow-sm" />
              <div>
                <div className="text-xl md:text-2xl font-semibold tracking-tight text-black">MyPetsDay</div>
                <div className="text-sm text-black/65">
                  {mainPetName}{" "}
                  {todayLeft === 0
                    ? "má dnes splnené všetko. 🐾"
                    : `čeká ešte ${todayLeft} úloh dnes.`}
                </div>
              </div>
            </div>

            <button
              onClick={signOut}
              className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Odhlásiť
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-black">Ranné pripomenutie</div>
              <div className="text-xs text-black/55">Každý deň o 7:00 (email)</div>
            </div>
            <Toggle value={remind7} onChange={setRemind7} />
          </div>

          {error && <p className="mt-3 text-sm text-red-700">❌ {error}</p>}
        </div>

        {/* WEEK PROGRESS */}
        <div className="mt-6 rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
          <div className="text-sm font-semibold text-black/70">Týždenný progres</div>

          <div className="mt-3 grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
            <div className="flex justify-center md:justify-start">
              <SegmentedRing total={weekCounts.total} done={weekCounts.done} />
            </div>

            <div className="text-black">
              <div className="text-lg md:text-xl font-semibold">Tvoje zvieratko tento týždeň splnilo</div>
              <div className="mt-1 text-3xl font-semibold">
                {weekCounts.done} <span className="text-black/60 text-base font-medium">z</span> {weekCounts.total}
              </div>
              <div className="mt-2 text-sm text-black/60">
                Počítajú sa všetky výskyty úloh v týždni (presne podľa toho, koľko úloh si nastavíš).
              </div>
            </div>
          </div>

          {/* WEEK PLAN collapsible */}
          <button
            onClick={() => setOpenWeek((v) => !v)}
            className="mt-5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-black hover:bg-black/5"
          >
            📅 Týždenný plán {openWeek ? "— skryť" : "— rozkliknúť"}
          </button>

          {openWeek && (
            <div className="mt-3 space-y-2">
              {weekDays.map((day) => {
                const due = tasks.filter((t) => isDueOnDate(t, day));
                const doneSet = doneByDate.get(day) ?? new Set<string>();
                const doneCount = due.filter((t) => doneSet.has(t.id)).length;

                return (
                  <div key={day} className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-black">{dayLabel(day)}</div>
                      <div className="text-sm text-black/60">
                        {doneCount}/{due.length}
                      </div>
                    </div>

                    {due.length === 0 ? (
                      <div className="mt-2 text-sm text-black/50">Žiadne úlohy.</div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {due.map((t) => {
                          const d = doneSet.has(t.id);
                          return (
                            <div
                              key={t.id}
                              className="flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3"
                            >
                              <div className="text-sm font-medium text-black">
                                {d ? "✅" : "⬜"} {t.title}{" "}
                                <span className="text-black/50">
                                  • {petNameById.get(t.pet_id) ?? "Pet"}
                                </span>
                              </div>

                              {d ? (
                                <button
                                  onClick={() => unmarkDoneOn(t.id, day)}
                                  className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-black/5"
                                >
                                  Undo
                                </button>
                              ) : (
                                <button
                                  onClick={() => markDoneOn(t.id, day)}
                                  className="rounded-2xl bg-black px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                                >
                                  Hotovo
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PETS */}
        <div className="mt-6 rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-black">🐾 Miláčikovia</div>
            <button
              onClick={() => setShowAddPet((v) => !v)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
            >
              {showAddPet ? "Zavrieť" : "+ Add new pet"}
            </button>
          </div>

          {!showAddPet && pets.length > 0 && (
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {pets.slice(0, 2).map((p) => (
                <div key={p.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                  <div className="font-semibold text-black">
                    {p.type === "dog" ? "🐶" : p.type === "cat" ? "🐱" : "🐾"} {p.name}
                  </div>
                  <div className="text-sm text-black/60">
                    {p.type === "dog" && p.breed ? `Plemeno: ${p.breed}` : "Plemeno: —"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddPet && (
            <div className="mt-4">
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 text-black"
                  placeholder="Meno (napr. Bella)"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                />

                <select
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 text-black"
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                >
                  <option value="dog">Dog 🐶</option>
                  <option value="cat">Cat 🐱</option>
                  <option value="other">Other 🐾</option>
                </select>

                <input
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 text-black"
                  type="date"
                  value={petBirthday}
                  onChange={(e) => setPetBirthday(e.target.value)}
                />
              </div>

              {petType === "dog" && (
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-black">Plemeno</label>
                  <select
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 text-black"
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
        <div className="mt-6 rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
          <div className="text-lg font-semibold text-black">➕ Pridať úlohu</div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <select
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 text-black"
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
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 text-black md:col-span-2"
              placeholder="Názov (napr. Ranné venčenie)"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />

            <select
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 text-black"
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
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 text-black"
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as any)}
            >
              <option value="none">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>

            <input
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 text-black"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <div className="text-sm text-black/60 flex items-center">
              {repeatType === "weekly" ? "Vyber dni nižšie" : " "}
            </div>
          </div>

          {repeatType === "weekly" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                [1, "Mon"], [2, "Tue"], [3, "Wed"], [4, "Thu"], [5, "Fri"], [6, "Sat"], [7, "Sun"],
              ].map(([n, label]) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleWeekday(n as number)}
                  className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                    weekdays.includes(n as number)
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:bg-black/5 text-black"
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
            className="mt-4 w-full md:w-auto rounded-2xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {savingTask ? "Ukladám..." : "Pridať úlohu"}
          </button>
        </div>

        {/* TODAY TASKS */}
        <div className="mt-6 rounded-[2rem] border border-black/10 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-black">✅ Dnešné úlohy</div>
            <div className="text-sm text-black/60">{todayDone}/{todayTotal}</div>
          </div>

          <div className="mt-4 space-y-2">
            {tasksToday.length === 0 ? (
              <div className="rounded-2xl bg-black/[0.03] p-4 text-black/70">
                Dnes nič nemáš. Pridaj úlohu a ideš ďalej 🟢
              </div>
            ) : (
              tasksToday.map((t) => {
                const done = isDone(t.id, today);
                return (
                  <div key={t.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-black">
                          {done ? "✅" : "⬜"} {t.title}
                          <span className="ml-2 text-sm text-black/55">
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

                        <button
                          onClick={() => {
                            const ok = confirm(`Archivovať úlohu "${t.title}"?`);
                            if (ok) archiveTask(t.id);
                          }}
                          className="mt-2 inline-flex items-center rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-black/5"
                        >
                          Archivovať
                        </button>
                      </div>

                      <div className="flex gap-2">
                        {done ? (
                          <button
                            onClick={() => unmarkDoneOn(t.id, today)}
                            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5 text-black"
                          >
                            Undo
                          </button>
                        ) : (
                          <button
                            onClick={() => markDoneOn(t.id, today)}
                            className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                          >
                            Hotovo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ARCHIVED TASKS */}
        <div className="mt-4 rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <button
            onClick={() => setOpenArchived((v) => !v)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-black hover:bg-black/5"
          >
            🗃️ Archivované ({archivedTasks.length}) {openArchived ? "— skryť" : "— zobraziť"}
          </button>

          {openArchived && (
            <div className="mt-3 space-y-2">
              {archivedTasks.length === 0 ? (
                <div className="text-sm text-black/55">Zatiaľ nič.</div>
              ) : (
                archivedTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3">
                    <div className="text-sm font-medium text-black">
                      {t.title} <span className="text-black/50">• {petNameById.get(t.pet_id) ?? "Pet"}</span>
                    </div>
                    <button
                      onClick={() => restoreTask(t.id)}
                      className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-black/5"
                    >
                      Obnoviť
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-black/50">
          MyPetsDay 🦴 • Tvoje úlohy, tvoj pokoj.
        </div>
      </div>
    </main>
  );
}
