import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser, signOutLocal } from "../lib/userContext";
import type { Sex, Activity, Goal } from "../lib/userContext";
import { Smartphone, LogOut, ChevronRight, Check } from "lucide-react";

export default function Profile({ onGoInstall }: { onGoInstall: () => void }) {
  const { user } = useUser();
  const updateGoals = useMutation(api.users.updateGoals);
  const updateManual = useMutation(api.users.updateManualTargets);

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(() => ({
    sex: user?.sex ?? "male",
    age: user?.age ?? 25,
    heightCm: user?.heightCm ?? 175,
    weightKg: user?.weightKg ?? 75,
    activityLevel: user?.activityLevel ?? "light",
    goal: user?.goal ?? "lose",
    weeklyGoalKg: user?.weeklyGoalKg ?? 0.5,
  }));
  const [manual, setManual] = useState(() => ({
    goalCalories: user?.goalCalories ?? 2000,
    goalProtein: user?.goalProtein ?? 120,
    goalCarbs: user?.goalCarbs ?? 200,
    goalFat: user?.goalFat ?? 60,
    goalWaterMl: user?.goalWaterMl ?? 2500,
  }));
  const [manualDirty, setManualDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const save = async () => {
    setBusy(true);
    try {
      if (manualDirty) {
        await updateManual({ userId: user._id, ...manual });
      } else {
        await updateGoals({ userId: user._id, ...form });
      }
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),16px)]">
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      </div>

      {/* identity card */}
      <section className="card mt-4 flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d3fd50] to-[#65e08c] text-xl font-bold text-[#09090b]">
          {(user.name || user.email)[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-bold">{user.name || "Friend"}</div>
          <div className="truncate text-xs text-zinc-500">{user.email}</div>
        </div>
      </section>

      {/* today's targets */}
      <section className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-300">Daily targets</h2>
          <button
            onClick={() => {
              setManualDirty(false);
              setEditing((v) => !v);
            }}
            className="text-xs font-semibold text-[#d3fd50]"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: "Calories", v: `${user.goalCalories.toLocaleString()} kcal`, c: "#d3fd50" },
            { l: "Protein", v: `${user.goalProtein} g`, c: "#d3fd50" },
            { l: "Carbs", v: `${user.goalCarbs} g`, c: "#60a5fa" },
            { l: "Fat", v: `${user.goalFat} g`, c: "#f59e0b" },
            { l: "Water", v: `${(user.goalWaterMl / 1000).toFixed(1)} L`, c: "#38bdf8" },
          ].map((x) => (
            <div key={x.l} className="card p-3.5">
              <div className="text-[10px] font-medium text-zinc-500">{x.l}</div>
              <div className="mt-0.5 text-base font-bold" style={{ color: x.c }}>{x.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* edit panel */}
      {editing && (
        <section className="card mt-4 space-y-4 p-4">
          {!manualDirty ? (
            <>
              <ToggleRow
                label="Sex"
                options={["male", "female"] as Sex[]}
                value={form.sex}
                onChange={(v) => setForm({ ...form, sex: v as Sex })}
              />
              <NumberRow label="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
              <NumberRow label="Height (cm)" value={form.heightCm} onChange={(v) => setForm({ ...form, heightCm: v })} />
              <NumberRow label="Weight (kg)" value={form.weightKg} onChange={(v) => setForm({ ...form, weightKg: v })} />
              <SelectRow
                label="Activity"
                value={form.activityLevel}
                options={["sedentary", "light", "moderate", "active", "athlete"] as Activity[]}
                onChange={(v) => setForm({ ...form, activityLevel: v as Activity })}
              />
              <SelectRow
                label="Goal"
                value={form.goal}
                options={["lose", "maintain", "gain"] as Goal[]}
                onChange={(v) => setForm({ ...form, goal: v as Goal })}
              />
              <button
                onClick={() => setManualDirty(true)}
                className="w-full text-center text-[11px] font-medium text-zinc-500 underline underline-offset-2"
              >
                Or set numbers manually
              </button>
            </>
          ) : (
            <>
              <NumberRow label="Calories (kcal)" value={manual.goalCalories} onChange={(v) => setManual({ ...manual, goalCalories: v })} />
              <NumberRow label="Protein (g)" value={manual.goalProtein} onChange={(v) => setManual({ ...manual, goalProtein: v })} />
              <NumberRow label="Carbs (g)" value={manual.goalCarbs} onChange={(v) => setManual({ ...manual, goalCarbs: v })} />
              <NumberRow label="Fat (g)" value={manual.goalFat} onChange={(v) => setManual({ ...manual, goalFat: v })} />
              <NumberRow label="Water goal (ml)" value={manual.goalWaterMl} onChange={(v) => setManual({ ...manual, goalWaterMl: v })} />
              <button
                onClick={() => setManualDirty(false)}
                className="w-full text-center text-[11px] font-medium text-zinc-500 underline underline-offset-2"
              >
                Back to body-based calculation
              </button>
            </>
          )}
          <button onClick={save} disabled={busy} className="btn-primary w-full py-3 text-sm">
            {busy ? "Saving…" : saved ? (<span className="flex items-center justify-center gap-1"><Check size={15} /> Saved</span>) : "Save targets"}
          </button>
        </section>
      )}

      {/* body stats summary */}
      <section className="card mt-4 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { l: "Age", v: user.age },
            { l: "Height", v: `${user.heightCm} cm` },
            { l: "Weight", v: `${user.weightKg} kg` },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-sm font-bold">{s.v}</div>
              <div className="text-[10px] text-zinc-500">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-[11px] capitalize text-zinc-500">
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5">{user.goal}</span>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5">{user.activityLevel}</span>
        </div>
      </section>

      {/* rows */}
      <section className="mt-4 space-y-2 pb-4">
        <button onClick={onGoInstall} className="card flex w-full items-center gap-3 p-4 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d3fd50]/10 text-[#d3fd50]">
            <Smartphone size={17} />
          </span>
          <span className="flex-1 text-sm font-semibold">Install on your iPhone</span>
          <ChevronRight size={16} className="text-zinc-600" />
        </button>
        <button onClick={signOutLocal} className="card flex w-full items-center gap-3 p-4 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
            <LogOut size={17} />
          </span>
          <span className="flex-1 text-sm font-semibold text-red-400">Sign out</span>
        </button>
      </section>
    </div>
  );
}

function ToggleRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="mb-2 block text-xs font-medium text-zinc-400">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition ${
              value === o ? "border-[#d3fd50] bg-[#d3fd50]/10 text-[#d3fd50]" : "border-white/10 text-zinc-400"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-zinc-300">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-20 rounded-xl bg-white/[0.06] px-3 py-2 text-right text-sm font-bold outline-none"
      />
    </label>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-zinc-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/10 bg-[#16161a] px-3 py-2 text-sm font-semibold capitalize outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
