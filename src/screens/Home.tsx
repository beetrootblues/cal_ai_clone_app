import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { useUser } from "../lib/userContext";
import CalRing from "../components/CalRing";
import MacroBars from "../components/MacroBars";
import { dateKeyLocal } from "../lib/health";
import { Camera, Droplets, Plus, Trash2, Flame } from "lucide-react";

type Meal = {
  _id: Id<"meals">;
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  storageId?: Id<"_storage">;
};

const TYPE_ORDER: Record<string, number> = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };

export default function Home({ onGoScan }: { onGoScan: () => void }) {
  const { user } = useUser();
  const today = useMemo(() => dateKeyLocal(), []);
  const meals = useQuery(
    api.meals.byDate,
    user ? ({ userId: user._id, dateKey: today } as const) : "skip"
  ) as Meal[] | undefined;
  const water = useQuery(
    api.tracking.getWater,
    user ? ({ userId: user._id, dateKey: today } as const) : "skip"
  ) as { ml: number } | undefined;
  const removeMeal = useMutation(api.meals.remove);
  const logWater = useMutation(api.tracking.logWater);

  const list = (meals ?? []).slice().sort((a, b) => (TYPE_ORDER[a.mealType] ?? 9) - (TYPE_ORDER[b.mealType] ?? 9));
  const tot = (k: "calories" | "protein" | "carbs" | "fat") => list.reduce((a, m) => a + m[k], 0);

  const goal = user?.goalCalories ?? 2000;
  const consumed = tot("calories");
  const remaining = Math.max(0, goal - consumed);
  const waterMl = water?.ml ?? 0;
  const waterGoal = user?.goalWaterMl ?? 2500;

  if (!user) return null;

  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),16px)]">
      {/* header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-xs text-zinc-500">{formatToday()}</div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.name ? `Hey, ${user.name}` : "Your day"}
          </h1>
        </div>
        <button
          onClick={onGoScan}
          aria-label="Scan meal"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d3fd50] text-[#09090b] shadow-[0_6px_20px_rgba(211,253,80,0.3)] active:scale-95"
        >
          <Camera size={20} strokeWidth={2.4} />
        </button>
      </div>

      {/* ring card */}
      <section className="card mt-5 flex flex-col items-center p-6">
        <CalRing calories={consumed} goal={goal} protein={tot("protein")} proteinGoal={user.goalProtein} />
        <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
          {[
            { l: "Eaten", v: consumed },
            { l: "Remaining", v: remaining },
            { l: "Burn base", v: user.goalCalories },
          ].map((x) => (
            <div key={x.l} className="rounded-2xl bg-white/[0.04] py-3">
              <div className="text-[15px] font-bold">{Math.round(x.v).toLocaleString()}</div>
              <div className="text-[10px] text-zinc-500">{x.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* macros */}
      <section className="mt-4">
        <MacroBars
          protein={tot("protein")} goalProtein={user.goalProtein}
          carbs={tot("carbs")} goalCarbs={user.goalCarbs}
          fat={tot("fat")} goalFat={user.goalFat}
        />
      </section>

      {/* water */}
      <section className="card mt-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Droplets size={16} className="text-sky-400" /> Water
          </div>
          <div className="text-xs text-zinc-400">
            {(waterMl / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-sky-400"
            style={{ width: `${Math.min(100, (waterMl / waterGoal) * 100)}%`, transition: "width .5s ease" }}
          />
        </div>
        <div className="mt-3 flex gap-2">
          {[250, 500].map((ml) => (
            <button
              key={ml}
              onClick={() => logWater({ userId: user._id, dateKey: today, ml: waterMl + ml })}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] py-2 text-xs font-semibold active:scale-95"
            >
              +{ml} ml
            </button>
          ))}
          <button
            onClick={() => logWater({ userId: user._id, dateKey: today, ml: Math.max(0, waterMl - 250) })}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold active:scale-95"
            aria-label="Remove water"
          >
            −
          </button>
        </div>
      </section>

      {/* meals */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-300">Today's meals</h2>
          <button onClick={onGoScan} className="flex items-center gap-1 text-xs font-semibold text-[#d3fd50]">
            <Plus size={14} /> Add
          </button>
        </div>
        {meals === undefined ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-20 animate-pulse bg-white/[0.03]" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <button onClick={onGoScan} className="card flex w-full flex-col items-center gap-2 p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d3fd50]/10 text-[#d3fd50]">
              <Camera size={22} />
            </span>
            <span className="text-sm font-semibold">Scan your first meal</span>
            <span className="text-xs text-zinc-500">Point the camera at your plate — AI does the rest</span>
          </button>
        ) : (
          <ul className="space-y-2">
            {list.map((m) => (
              <li key={m._id} className="card flex items-center gap-3 p-3.5">
                <MealDot type={m.mealType} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{m.name}</div>
                  <div className="text-[11px] capitalize text-zinc-500">
                    {m.mealType} · {m.protein}p {m.carbs}c {m.fat}f
                  </div>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold">
                  <Flame size={14} className="text-[#d3fd50]" /> {Math.round(m.calories)}
                </span>
                <button
                  onClick={() => removeMeal({ mealId: m._id })}
                  aria-label={`Delete ${m.name}`}
                  className="text-zinc-600 transition hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MealDot({ type }: { type: string }) {
  const map: Record<string, string> = {
    breakfast: "🌅",
    lunch: "🥗",
    dinner: "🍽️",
    snack: "🍎",
  };
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-lg">
      {map[type] ?? "🍴"}
    </span>
  );
}

function formatToday() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}
