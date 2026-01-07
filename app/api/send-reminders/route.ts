import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// ---- helpers (rovnaká logika ako v UI) ----
function weekday1to7FromISO(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const js = dt.getUTCDay(); // 0=Sun..6=Sat
  return js === 0 ? 7 : js; // 1=Mon..7=Sun
}

function isDueOnDate(t: any, dateISO: string) {
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

function todayISO_UTC() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysISO(baseISO: string, days: number) {
  const [y, m, d] = baseISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ---- main ----
export async function GET(req: Request) {
  // ochrana: aby ti to nevolal hocikto
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  // 1) načítaj user settings
  const { data: settings, error: sErr } = await supabase
    .from("notification_settings")
    .select("user_id,email,email_enabled,days_ahead");

  if (sErr) return new Response(sErr.message, { status: 500 });

  const baseToday = todayISO_UTC();

  // 2) pre každého usera pošli digest
  for (const st of settings ?? []) {
    if (!st.email_enabled) continue;

    const targetDate = addDaysISO(baseToday, st.days_ahead ?? 0);

    // tasks
    const { data: tasks, error: tErr } = await supabase
      .from("care_tasks")
      .select("id,pet_id,title,category,repeat_type,start_date,weekdays")
      .eq("user_id", st.user_id);

    if (tErr) continue;

    const due = (tasks ?? []).filter((t) => isDueOnDate(t, targetDate));
    if (due.length === 0) continue;

    // done
    const { data: doneRows } = await supabase
      .from("task_completions")
      .select("task_id")
      .eq("user_id", st.user_id)
      .eq("completed_on", targetDate);

    const doneSet = new Set((doneRows ?? []).map((r) => r.task_id));

    const lines = due.map((t) => `${doneSet.has(t.id) ? "✅" : "⬜"} ${t.title} (${t.category})`);

    const subject = st.days_ahead ? `🐾 Tasks for ${targetDate}` : "🐾 Tasks for today";

    await resend.emails.send({
      from: process.env.RESEND_FROM!, // napr. "Pets <onboarding@resend.dev>" v dev
      to: st.email,
      subject,
      html: `
        <h2>${subject}</h2>
        <p>Date: ${targetDate}</p>
        <ul>${lines.map((x) => `<li>${x}</li>`).join("")}</ul>
      `,
    });
  }

  return Response.json({ ok: true });
}
