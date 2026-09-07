type Props = {
  protein: number; goalProtein: number;
  carbs: number; goalCarbs: number;
  fat: number; goalFat: number;
};

const ROWS: Array<{ key: keyof Props; label: string; color: string; goalKey: keyof Props }> = [
  { key: "protein", label: "Protein", color: "#d3fd50", goalKey: "goalProtein" },
  { key: "carbs", label: "Carbs", color: "#60a5fa", goalKey: "goalCarbs" },
  { key: "fat", label: "Fat", color: "#f59e0b", goalKey: "goalFat" },
];

export default function MacroBars(p: Props) {
  return (
    <div className="card p-4 w-full">
      <div className="space-y-3">
        {ROWS.map((r) => {
          const v = p[r.key] as number;
          const g = p[r.goalKey] as number;
          const pct = g > 0 ? Math.min(100, Math.round((v / g) * 100)) : 0;
          return (
            <div key={r.key}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400 font-medium">{r.label}</span>
                <span className="text-zinc-200 font-semibold">{Math.round(v)}<span className="text-zinc-500"> / {g}g</span></span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: r.color, transition: "width .9s cubic-bezier(.22,1,.36,1)" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
