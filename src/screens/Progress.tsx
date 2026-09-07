import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { useUser } from "../lib/userContext";
import { dateKeyLocal } from "../lib/health";
import { Trophy, Scale, TrendingDown, TrendingUp } from "lucide-react";

type Meal = { calories: number; protein: number; dateKey: string };
type Weight = { _id: Id<"weightLogs">; dateKey: string; weightKg: number };

function shift(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return dateKeyLocal(dt);
}

export default function Progress() {
  const { user } = useUser();
  const today = dateKeyLocal();

  const from = useMemo(() => shift(today, -13), [today]);
  const meals = useQuery(
    api.meals.recent,
    user ? ({ userId: user._id, limit: 300 } as const) : "skip"
  ) as Meal[] | undefined;
  const weights = useQuery(
    api.tracking.getWeights,
    user ? ({ userId: user._id, limit: 30 } as const) : "skip"
  ) as Weight[] | undefined;

  const logWeight = useMutation(api.tracking.logWeight);
  const [newWeight, setNewWeight] = useState("");

  const byDay = useMemo(() => {
    const m = new Map<string, { cal: number; pro: number }>();
    for (const meal of meals ?? []) {
      const cur = m.get(meal.dateKey) ?? { cal: 0, pro: 0 };
      cur.cal += meal.calories;
      cur.pro += meal.protein;
      m.set(meal.dateKey, cur);
    }
    return m;
  }, [meals]);

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => shift(today, i - 13)), [today]);
  const goal = user?.goalCalories ?? 2000;
  const maxBar = Math.max(goal * 1.25, ...days.map((d) => byDay.get(d)?.cal ?? 0), 1);

  // streak = consecutive days (ending today/yesterday) with any logged meal
  const streak = useMemo(() => {
    let s = 0;
    let cursor = today;
    if (!byDay.has(cursor)) cursor = shift(today, -1);
    while (byDay.has(cursor) && (byDay.get(cursor)?.cal ?? 0) > 0) {
      s += 1;
      cursor = shift(cursor, -1);
    }
    return s;
  }, [byDay, today]);

  const latest = weights?.[0];
  const prev = weights?.[1];
  const delta = latest && prev ? latest.weightKg - prev.weightKg : 0;
  const start = weights?.length ? weights[weights.length - 1].weightKg : latest?.weightKg;
  const totalDelta = latest && start ? latest.weightKg - start : 0;

  async function saveWeight() {
    const kg = parseFloat(newWeight);
    if (!user || !Number.isFinite(kg) || kg <= 0) return;
    await logWeight({ userId: user._id, dateKey: today, weightKg: kg });
    setNewWeight("");
  }

  if (!user) return null;

  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),16px)]">
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
      </div>

      {/* stat chips */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { l: "Day streak", v: streak, icon: "🔥" },
          { l: "Days logged", v: byDay.size, icon: "📅" },
          { l: "Avg kcal", v: Math.round(days.reduce((a, d) => a + (byDay.get(d)?.cal ?? 0), 0) / 14), icon: "⚡" },
        ].map((s) => (
          <div key={s.l} className="card p-3 text-center">
            <div className="text-lg">{s.icon}</div>
            <div className="text-base font-bold">{s.v}</div>
            <div className="text-[10px] text-zinc-500">{s.l}</div>
          </div>
        ))}
      </div>

      {/* 14-day bars */}
      <section className="card mt-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Last 14 days</span>
          <span className="text-[10px] text-zinc-500">goal {goal.toLocaleString()} kcal</span>
        </div>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {days.map((d) => {
            const cal = byDay.get(d)?.cal ?? 0;
            const over = cal > goal;
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${Math.max(2, (cal / maxBar) * 100)}%`,
                      background: cal === 0 ? "rgba(255,255,255,0.06)" : over ? "#f59e0b" : "#d3fd50",
                      transition: "height .7s cubic-bezier(.22,1,.36,1)",
                    }}
                  />
                </div>
                <span className="text-[8px] text-zinc-600">{d.slice(8)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* weight */}
      <section className="card mt-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Scale size={15} className="text-[#d3fd50]" /> Weight
          </div>
          {latest && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold">{latest.weightKg.toFixed(1)} kg</span>
              {Math.abs(delta) >= 0.1 && (
                <span className={`flex items-center gap-0.5 ${delta < 0 ? "text-[#d3fd50]" : "text-amber-400"}`}>
                  {delta < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                  {Math.abs(delta).toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>
        {totalDelta !== 0 && latest && (
          <p className="mt-1 text-[11px] text-zinc-500">
            {Math.abs(totalDelta).toFixed(1)} kg {totalDelta < 0 ? "lost" : "gained"} since you started tracking
          </p>
        )}
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="Today's weight (kg)"
            className="min-w-0 flex-1 rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm outline-none placeholder:text-zinc-600"
          />
          <button onClick={saveWeight} disabled={!newWeight} className="btn-primary px-4 py-2.5 text-xs disabled:opacity-40">
            Log
          </button>
        </div>
      </section>

      {/* achievements */}
      <section className="mt-5 pb-4">
        <h2 className="mb-2 text-sm font-bold text-zinc-300">Achievements</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "first", label: "First scan", unlocked: byDay.size >= 1 },
            { id: "streak3", label: "3-day streak", unlocked: streak >= 3 },
            { id: "streak7", label: "Week streak", unlocked: streak >= 7 },
            { id: "logged10", label: "10 days logged", unlocked: byDay.size >= 10 },
            { id: "weigh", label: "Weight tracked", unlocked: (weights?.length ?? 0) >= 1 },
            { id: "streak30", label: "30-day streak", unlocked: streak >= 30 },
          ].map((a) => (
            <div
              key={a.id}
              className={`card flex flex-col items-center gap-1.5 p-3 text-center ${a.unlocked ? "" : "opacity-35"}`}
            >
              <Trophy size={18} className={a.unlocked ? "text-[#d3fd50]" : "text-zinc-600"} />
              <span className="text-[10px] font-semibold leading-tight">{a.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
