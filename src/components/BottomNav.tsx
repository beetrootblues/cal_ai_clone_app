import { Home, ScanLine, History, TrendingUp, User } from "lucide-react";

export type TabKey = "home" | "scan" | "history" | "progress" | "profile";

const TABS: Array<{ key: TabKey; label: string; icon: typeof Home }> = [
  { key: "home", label: "Home", icon: Home },
  { key: "scan", label: "Scan", icon: ScanLine },
  { key: "history", label: "History", icon: History },
  { key: "progress", label: "Progress", icon: TrendingUp },
  { key: "profile", label: "Profile", icon: User },
];

export default function BottomNav({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto mb-[max(env(safe-area-inset-bottom),12px)] mx-4 flex w-full max-w-md items-center justify-between rounded-[26px] border border-white/10 bg-[#101013]/90 px-3 py-2.5 shadow-2xl backdrop-blur-xl">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = value === t.key;
          const isScan = t.key === "scan";
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              aria-label={t.label}
              className={
                isScan
                  ? "relative -mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#d3fd50] text-[#09090b] shadow-[0_8px_24px_rgba(211,253,80,0.35)] transition active:scale-95"
                  : `flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition ${active ? "text-[#d3fd50]" : "text-zinc-500"}`
              }
            >
              <Icon size={isScan ? 28 : 21} strokeWidth={active || isScan ? 2.4 : 2} />
              {!isScan && <span className="text-[10px] font-medium">{t.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
