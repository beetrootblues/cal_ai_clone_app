import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { setStoredEmail } from "../lib/userContext";
import { ScanLine, Flame, Sparkles, ChartNoAxesColumn, ArrowRight, Smartphone } from "lucide-react";

export default function Landing() {
  const [email, setEmail] = useState("");
  const start = useMutation(api.users.startIfNeeded);
  const [busy, setBusy] = useState(false);

  const begin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setBusy(true);
    try {
      setStoredEmail(email);
      await start({ email });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#09090b] text-zinc-50 overflow-x-hidden">
      {/* glow blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-[#d3fd50]/15 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-96 w-96 rounded-full bg-[#65e08c]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-[max(env(safe-area-inset-top),24px)] pb-10">
        {/* hero */}
        <header className="pt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d3fd50]/25 bg-[#d3fd50]/10 px-3 py-1 text-[11px] font-semibold text-[#d3fd50]">
            <Sparkles size={13} /> AI CALORIE TRACKER
          </div>
          <h1 className="mt-5 text-[42px] leading-[1.05] font-bold tracking-tight">
            Snap it.
            <br />
            <span className="bg-gradient-to-r from-[#d3fd50] to-[#65e08c] bg-clip-text text-transparent">
              Know it.
            </span>
            <br />
            Crush it.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
            Point your camera at any meal. Cal AI reads the plate and gives you calories, protein,
            carbs and fat in seconds — no typing, no guessing.
          </p>
        </header>

        {/* floating phone mock */}
        <div className="relative my-10 flex justify-center">
          <div className="floaty relative w-64 rounded-[36px] border border-white/10 bg-gradient-to-b from-[#16161a] to-[#0c0c0e] p-3 shadow-[0_30px_80px_-20px_rgba(211,253,80,0.25)]">
            <div className="rounded-[28px] bg-[#09090b] p-5">
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Today</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5">Sep 7</span>
              </div>
              <div className="mt-4 flex justify-center">
                <div className="relative h-28 w-28">
                  <svg viewBox="0 0 100 100" className="-rotate-90 h-full w-full">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="9" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="#d3fd50" strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={264} strokeDashoffset={90}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold">1,284</span>
                    <span className="text-[9px] text-zinc-500">kcal</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  ["Protein", 82, "#d3fd50"],
                  ["Carbs", 46, "#60a5fa"],
                  ["Fat", 31, "#f59e0b"],
                ].map(([l, w, c]) => (
                  <div key={l as string}>
                    <div className="mb-1 flex justify-between text-[10px] text-zinc-500">
                      <span>{l as string}</span>
                      <span>{w as number}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5">
                      <div className="h-full rounded-full" style={{ width: `${w}%`, background: c as string }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#d3fd50]/20 bg-[#d3fd50]/10 p-3">
                <ScanLine size={18} className="text-[#d3fd50]" />
                <span className="text-[11px] font-semibold text-[#d3fd50]">Scanning grilled salmon bowl…</span>
              </div>
            </div>
          </div>
        </div>

        {/* features */}
        <ul className="space-y-3">
          {[
            { icon: ScanLine, title: "AI food scanner", desc: "Photo → full macro breakdown with per-item portions." },
            { icon: Flame, title: "Smart daily targets", desc: "Calorie & protein goals tuned to your body and goal." },
            { icon: ChartNoAxesColumn, title: "Progress that sticks", desc: "Trends, streaks and weight tracking over weeks." },
          ].map((f) => (
            <li key={f.title} className="card flex items-start gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d3fd50]/12 text-[#d3fd50]">
                <f.icon size={18} />
              </span>
              <div>
                <div className="text-sm font-semibold">{f.title}</div>
                <div className="text-xs text-zinc-400">{f.desc}</div>
              </div>
            </li>
          ))}
        </ul>

        {/* install hint */}
        <div className="mt-8 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-zinc-400">
          <Smartphone size={15} className="shrink-0 text-zinc-500" />
          iPhone: add to Home Screen after sign-in for the full-screen app experience.
        </div>

        {/* CTA */}
        <form onSubmit={begin} className="mt-5 space-y-3">
          <input
            type="email"
            required
            inputMode="email"
            autoCapitalize="none"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-[15px] outline-none placeholder:text-zinc-600 focus:border-[#d3fd50]/60"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-4 text-[15px]"
          >
            {busy ? "Setting up…" : "Start tracking free"} <ArrowRight size={17} />
          </button>
          <p className="text-center text-[11px] text-zinc-600">
            No password. Your email creates your account on this device.
          </p>
        </form>
      </div>
    </div>
  );
}
