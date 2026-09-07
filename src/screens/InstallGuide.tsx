import { ArrowLeft, Share, PlusSquare, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    n: 1,
    title: "Open in Safari",
    desc: "Tap the Share button (□↑) in Safari's toolbar at the bottom of the screen.",
  },
  {
    n: 2,
    title: "Choose “Add to Home Screen”",
    desc: "Scroll down the share sheet and tap “Add to Home Screen”.",
  },
  {
    n: 3,
    title: "Tap “Add”",
    desc: "Name it Cal AI (or keep the default) and tap Add. The icon appears on your Home Screen.",
  },
  {
    n: 4,
    title: "Launch it full-screen",
    desc: "Open Cal AI from your Home Screen — it now runs full-screen like a native app, works offline, and keeps you signed in.",
  },
];

export default function InstallGuide({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-dvh bg-[#09090b] px-5 pb-10 pt-[max(env(safe-area-inset-top),16px)] text-zinc-50">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onBack}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]"
          >
            <ArrowLeft size={17} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Install on iPhone</h1>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Cal AI is a web app (<span className="text-zinc-200">PWA</span>) — iPhone doesn't need the App
          Store. Adding it to your Home Screen gives you a real app icon, full-screen mode and offline support.
        </p>

        <ol className="mt-6 space-y-3">
          {STEPS.map((s) => (
            <li key={s.n} className="card flex gap-3.5 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d3fd50] text-sm font-bold text-[#09090b]">
                {s.n}
              </span>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {s.title}
                  {s.n === 1 && <Share size={13} className="text-zinc-500" />}
                  {s.n === 2 && <PlusSquare size={13} className="text-zinc-500" />}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-[#d3fd50]/20 bg-[#d3fd50]/[0.06] p-4">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#d3fd50]" />
          <p className="text-xs leading-relaxed text-zinc-300">
            Already added it? You're all set — this banner disappears automatically when the app runs
            in standalone mode.
          </p>
        </div>
      </div>
    </div>
  );
}
