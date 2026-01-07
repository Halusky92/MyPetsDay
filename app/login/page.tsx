"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function sendLink() {
    setStatus("sending");
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/today",
      },
    });

    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="text-3xl font-semibold">🔐 Login</div>
        <p className="mt-2 text-black/60">We’ll send you a magic link.</p>

        <label className="mt-6 block text-sm font-medium">Email</label>
        <input
          className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={sendLink}
          disabled={!email || status === "sending"}
          className="mt-4 w-full rounded-xl bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : "Send magic link"}
        </button>

        {status === "sent" && (
          <p className="mt-4 text-sm">✅ Check your email and click the link.</p>
        )}
        {status === "error" && (
          <p className="mt-4 text-sm text-red-600">❌ {error}</p>
        )}

        <a
          href="/"
          className="mt-6 inline-block rounded-xl border border-black/10 px-4 py-2 font-medium hover:bg-black/5"
        >
          ← Back
        </a>
      </div>
    </main>
  );
}
