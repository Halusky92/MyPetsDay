export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-lg w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="text-3xl font-semibold">🐾 MyPetsDay</div>
        <p className="mt-2 text-base text-black/60">Every pet. Every day.</p>

        <div className="mt-6 space-y-3">
          <a
            href="/login"
            className="block w-full rounded-xl border border-black/10 px-4 py-3 text-center font-medium hover:bg-black/5"
          >
            Continue with email
          </a>
          <a
            href="/today"
            className="block w-full rounded-xl bg-black px-4 py-3 text-center font-medium text-white hover:opacity-90"
          >
            Go to Today
          </a>
        </div>

        <p className="mt-6 text-sm text-black/50">
          MVP: pets, care tasks, reminders.
        </p>
      </div>
    </main>
  );
}
