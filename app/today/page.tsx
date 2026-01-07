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
  // pripravene do buducna (volitelne v DB)
  notify?: boolean;
  notify_minutes_before?: number | null;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function weekday1to7(d = new Date()) {
  // JS: 0=Sun..6=Sat -> convert to 1=Mon..7=Sun
  const js = d.getDay();
  return js === 0 ? 7 : js; // Sun -> 7, Mon ->1 ...
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

function weekday1to7FromISO(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return weekday1to7(dt);
}

/**
 * Pripraveny hook na notifikacie.
 * Zatial nic nerobi – neskor sem pridame planovanie / request permission / push.
 */
function useNotifications(_tasks: Task[], _pets: Pet[]) {
  useEffect(() => {
    // TODO: notifications in future
  }, [_tasks, _pets]);
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

  const today = useMemo(() => todayISO(), []);
  const todayW = useMemo(() => weekday1to7(new Date()), []);

  const upcomingDays = useMemo(() => {
    const days: string[] = [];
    for (let i = 1; i <= 7; i++) days.push(addDaysISO(today, i));
    return days;
  }, [today]);

  const rangeStart = today;
  const rangeEnd = upcomingDays.length ? upcomingDays[upcomingDays.length - 1] : today;

  async function requireUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  }
async function ensureNotificationSettings(user: any) {
  if (!user.email) return;

  await supabase.from("notification_settings").upsert({
    user_id: user.id,
    email: user.email,
    email_enabled: true,
    notify_time: "07:00:00",
    timezone: "Europe/Bratislava",
    days_ahead: 0,
  });
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
      .select("id,pet_id,title,category,repeat_type,start_date,weekdays,created_at")
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

  /**
   * ✅ Jeden centralny refresh – pouzi vsade.
   */
  async function refreshAll(opts?: { keepSelectedPetId?: string }) {
    const [p, t, doneMap] = await Promise.all([loadPets(), loadTasks(), loadDoneInRange()]);
    setPets(p);
    setTasks(t);
    setDoneByDate(doneMap);

    setTaskPetId((prev) => {
      const desired = opts?.keepSelectedPetId ?? prev;
      if (desired && p.some((x) => x.id === desired)) return desired;
      return p.length ? p[0].id : "";
    });
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
        await refreshAll();
      } catch (e: any) {
        setError(e.message ?? "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
    // rangeStart/rangeEnd nechavame v zavislostiach ako predtym
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

  const tasksToday = useMemo(() => tasks.filter((t) => isDueOnDate(t, today)), [tasks, today, todayW]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const day of upcomingDays) {
      map.set(day, tasks.filter((t) => isDueOnDate(t, day)));
    }
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
    // teraz refreshujeme vsetko – aby to bolo konzistentne
    try {
      await refreshAll();
    } catch (e: any) {
      setError(e.message ?? "Failed to refresh");
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
      await refreshAll();
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

  // 🔔 NOTIFICATIONS – BOD 2
  task_time: "09:00",
  notify: true,
  notify_minutes_before: 30,
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
      await refreshAll({ keepSelectedPetId: taskPetId });
    } catch (e: any) {
      setError(e.message ?? "Failed to reload tasks");
    }
  }

  // ✅ delete pet with confirmation + safe cascade (tasks + completions)
  async function deletePet(pet: Pet) {
    const ok = window.confirm(`Naozaj chceš odstrániť "${pet.name}"?`);
    if (!ok) return;

    setError("");

    const user = await requireUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      // 1) get tasks for this pet (so we can delete completions by task_id)
      const { data: petTasks, error: tasksErr } = await supabase
        .from("care_tasks")
        .select("id")
        .eq("pet_id", pet.id);

      if (tasksErr) throw tasksErr;

      const taskIds = (petTasks ?? []).map((x: any) => x.id);

      // 2) delete completions for these tasks
      if (taskIds.length > 0) {
        const { error: delCompErr } = await supabase.from("task_completions").delete().in("task_id", taskIds);
        if (delCompErr) throw delCompErr;
      }

      // 3) delete tasks for this pet
      const { error: delTasksErr } = await supabase.from("care_tasks").delete().eq("pet_id", pet.id);
      if (delTasksErr) throw delTasksErr;

      // 4) delete the pet
      const { error: delPetErr } = await supabase.from("pets").delete().eq("id", pet.id);
      if (delPetErr) throw delPetErr;

      await refreshAll();
    } catch (e: any) {
      setError(e.message ?? "Failed to delete pet");
    }
  }

  // ✅ delete task + its completions
  async function deleteTask(task: Task) {
    const ok = window.confirm(`Naozaj chceš odstrániť task "${task.title}"?`);
    if (!ok) return;

    setError("");

    const user = await requireUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      const { error: delCompErr } = await supabase.from("task_completions").delete().eq("task_id", task.id);
      if (delCompErr) throw delCompErr;

      const { error: delTaskErr } = await supabase.from("care_tasks").delete().eq("id", task.id);
      if (delTaskErr) throw delTaskErr;

      await refreshAll({ keepSelectedPetId: taskPetId });
    } catch (e: any) {
      setError(e.message ?? "Failed to delete task");
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

    // unique constraint: already done -> ignore
    if (error) {
      const msg = String(error.message).toLowerCase();
      if (!msg.includes("duplicate") && !msg.includes("unique")) {
        setError(error.message);
      }
      return;
    }

    // update local state
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

  function toggleWeekday(d: number) {
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  // ✅ priprava na notifikacie
  useNotifications(tasks, pets);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-lg w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
          <div className="text-xl font-semibold">Loading…</div>
          <p className="mt-2 text-black/60">Checking your session.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-3xl font-semibold">📅 Today</div>
            <p className="mt-2 text-black/60">
              Signed in as <span className="font-medium">{email}</span>
            </p>
            <p className="mt-1 text-sm text-black/50">Date: {today}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={refreshDone}
              className="rounded-xl border border-black/10 px-4 py-2 font-medium hover:bg-black/5"
            >
              Refresh
            </button>
            <button
              onClick={signOut}
              className="rounded-xl bg-black px-4 py-2 font-medium text-white hover:opacity-90"
            >
              Sign out
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">❌ {error}</p>}

        <hr className="my-6 border-black/10" />

        {/* PETS */}
        <div className="text-xl font-semibold">🐾 Your pets</div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Pet name (e.g., Bella)"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
          />

          <select
            className="rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
          >
            <option value="dog">Dog 🐶</option>
            <option value="cat">Cat 🐱</option>
            <option value="other">Other 🐾</option>
          </select>

          <input
            className="rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            type="date"
            value={petBirthday}
            onChange={(e) => setPetBirthday(e.target.value)}
          />
        </div>

        <button
          onClick={addPet}
          disabled={!petName.trim() || savingPet}
          className="mt-3 rounded-xl bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {savingPet ? "Saving..." : "Add pet"}
        </button>

        <div className="mt-6 space-y-2">
          {pets.length === 0 ? (
            <p className="text-black/60">No pets yet. Add your first dog 🐶</p>
          ) : (
            pets.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3"
              >
                <div>
                  <div className="font-semibold">
                    {p.type === "dog" ? "🐶" : p.type === "cat" ? "🐱" : "🐾"} {p.name}
                  </div>
                  <div className="text-sm text-black/60">
                    {p.birthday ? `Birthday: ${p.birthday}` : "Birthday: —"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-black/50">{p.type}</div>

                  <button
                    type="button"
                    onClick={() => deletePet(p)}
                    className="rounded-xl border border-red-600/20 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <hr className="my-6 border-black/10" />

        {/* ADD TASK */}
        <div className="text-xl font-semibold">➕ Add care task</div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select
            className="rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            value={taskPetId}
            onChange={(e) => setTaskPetId(e.target.value)}
            disabled={pets.length === 0}
          >
            {pets.length === 0 ? (
              <option value="">Add a pet first</option>
            ) : (
              pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            )}
          </select>

          <input
            className="rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 md:col-span-2"
            placeholder="Task title (e.g., Morning walk)"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />

          <select
            className="rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
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
            className="rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            value={repeatType}
            onChange={(e) => setRepeatType(e.target.value as any)}
          >
            <option value="none">One-time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>

          <input
            className="rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <div className="text-sm text-black/50 flex items-center">
            {repeatType === "weekly" ? "Pick weekdays below" : " "}
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
                className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                  weekdays.includes(n as number)
                    ? "border-black bg-black text-white"
                    : "border-black/10 hover:bg-black/5"
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
          className="mt-3 rounded-xl bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {savingTask ? "Saving..." : "Add task"}
        </button>

        <hr className="my-6 border-black/10" />

        {/* TODAY TASKS */}
        <div className="text-xl font-semibold">✅ Today’s tasks</div>

        <div className="mt-4 space-y-2">
          {tasksToday.length === 0 ? (
            <p className="text-black/60">No tasks due today. Add one for Bella 🐶</p>
          ) : (
            tasksToday.map((t) => {
              const done = isDone(t.id, today);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3"
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
                        ? "Repeats: daily"
                        : t.repeat_type === "weekly"
                        ? "Repeats: weekly"
                        : `One-time: ${t.start_date}`}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => deleteTask(t)}
                      className="rounded-xl border border-red-600/20 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>

                    {done ? (
                      <button
                        onClick={() => unmarkDoneOn(t.id, today)}
                        className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5"
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        onClick={() => markDoneOn(t.id, today)}
                        className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
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

        <hr className="my-6 border-black/10" />

        {/* UPCOMING */}
        <div className="text-xl font-semibold">📆 Upcoming (next 7 days)</div>

        <div className="mt-4 space-y-4">
          {upcomingDays.every((d) => (tasksByDay.get(d) ?? []).length === 0) ? (
            <p className="text-black/60">Nothing scheduled in the next 7 days.</p>
          ) : (
            upcomingDays.map((day) => {
              const list = tasksByDay.get(day) ?? [];
              if (list.length === 0) return null;

              return (
                <div key={day} className="rounded-2xl border border-black/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{day}</div>
                    <div className="text-sm text-black/50">
                      Done: {(doneByDate.get(day)?.size ?? 0)}/{list.length}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {list.map((t) => {
                      const done = isDone(t.id, day);
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3"
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
                                ? "Repeats: daily"
                                : t.repeat_type === "weekly"
                                ? "Repeats: weekly"
                                : "One-time"}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => deleteTask(t)}
                              className="rounded-xl border border-red-600/20 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                            >
                              Delete
                            </button>

                            {done ? (
                              <button
                                onClick={() => unmarkDoneOn(t.id, day)}
                                className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5"
                              >
                                Undo
                              </button>
                            ) : (
                              <button
                                onClick={() => markDoneOn(t.id, day)}
                                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
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
    </main>
  );
}
