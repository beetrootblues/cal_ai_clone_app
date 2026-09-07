import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { useUser } from "../lib/userContext";
import { dateKeyLocal } from "../lib/health";
import { Trash2, Flame, ChevronLeft, ChevronRight } from "lucide-react";

type Meal = {
  _id: Id<"meals">;
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function shift(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return dateKeyLocal(dt);
}

export default function History() {
  const { user } = useUser();
  const [selected, setSelected] = useState(() => dateKeyLocal());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(dateKeyLocal()));

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => shift(weekStart, i)),
    [weekStart]
  );

  const today = dateKeyLocal();
  const meals = useQuery(
    api.meals.byDate,
    user ? ({ userId: user._id, dateKey: selected } as const) : "skip"
  ) as Meal[] | undefined;

  const removeMeal = useMutation(api.meals.remove);
  const total = (meals ?? []).reduce((a, m) => a + m.calories, 0);

  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),16px)]">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        {selected !== today && (
          <button onClick={() => setSelected(today)} className="text-xs font-semibold text-[#d3fd50]">Today</button>
        )}
      </div>

      {/* week strip */}
      <div className="mt-4 flex items-center gap-1">
        <button
          onClick={() => setWeekStart(shift(weekStart, -7))}
          aria-label="Previous week"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-zinc-400"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex flex-1 justify-between">
          {days.map((d) => {
            const dt = new Date(d + "T12:00:00");
            const isSel = d === selected;
            const isToday = d === today;
            return (
              <button
                key={d}
                onClick={() => setSelected(d)}
                className={`flex h-14 w-11 flex-col items-center justify-center gap-0.5 rounded-2xl transition ${
                  isSel ? "bg-[#d3fd50] text-[#09090b]" : isToday ? "bg-white/[0.08] text-zinc-200" : "text-zinc-500"
                }`}
              >
                <span className="text-[9px] font-semibold uppercase opacity-70">
                  {dt.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
                </span>
                <span className="text-base font-bold">{dt.getDate()}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setWeekStart(shift(weekStart, 7))}
          aria-label="Next week"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-zinc-400"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* selected day totals */}
      <div className="card mt-4 flex items-center justify-around p-4 text-center">
        {[
          { l: "Calories", v: Math.round(total) },
          { l: "Protein", v: `${Math.round((meals ?? []).reduce((a, m) => a + m.protein, 0))}g` },
          { l: "Carbs", v: `${Math.round((meals ?? []).reduce((a, m) => a + m.carbs, 0))}g` },
          { l: "Fat", v: `${Math.round((meals ?? []).reduce((a, m) => a + m.fat, 0))}g` },
        ].map((s) => (
          <div key={s.l}>
            <div className="text-base font-bold">{s.v}</div>
            <div className="text-[10px] text-zinc-500">{s.l}</div>
          </div>
        ))}
      </div>

      {/* meals */}
      <div className="mt-4 space-y-2 pb-4">
        {meals === undefined ? (
          [0, 1].map((i) => <div key={i} className="card h-16 animate-pulse bg-white/[0.03]" />)
        ) : meals.length === 0 ? (
          <div className="card p-8 text-center text-sm text-zinc-500">No meals logged this day.</div>
        ) : (
          meals.map((m) => (
            <div key={m._id} className="card flex items-center gap-3 p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d3fd50]/10 text-[#d3fd50]">
                <Flame size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{m.name}</div>
                <div className="text-[11px] capitalize text-zinc-500">{m.mealType} · {m.protein}p {m.carbs}c {m.fat}f</div>
              </div>
              <span className="text-sm font-bold">{Math.round(m.calories)}</span>
              <button
                onClick={() => removeMeal({ mealId: m._id })}
                aria-label={`Delete ${m.name}`}
                className="text-zinc-600 hover:text-red-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function startOfWeek(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = (dt.getDay() + 6) % 7; // Monday-start
  dt.setDate(dt.getDate() - dow);
  return dateKeyLocal(dt);
}
