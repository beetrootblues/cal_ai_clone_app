import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "../lib/userContext";
import { fileToCompressedDataUrl, splitDataUrl, uploadMealPhoto } from "../lib/image";
import type { Analysis } from "../lib/scan";
import { dateKeyLocal } from "../lib/health";
import { Camera, RefreshCw, Check, X, Sparkles, Pencil, ScanLine } from "lucide-react";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function Scan({ dateKey }: { dateKey: string }) {
  const { user } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const analyze = useMutation(api.ai.analyzeMealPhoto);
  const logMeal = useMutation(api.meals.log);
  const generateUploadUrl = useMutation(api.meals.generateUploadUrl);
  const attachPhoto = useMutation(api.meals.attachPhoto);

  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "analyzing" | "result" | "error">("idle");
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [mealType, setMealType] = useState<MealType>(guessMealType());
  const [logging, setLogging] = useState(false);

  async function onPick(file: File | Blob) {
    setError(null);
    setResult(null);
    setPhase("analyzing");
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setPreview(dataUrl);
      const { mimeType, base64 } = splitDataUrl(dataUrl);
      const analysis: Analysis = await analyze({ imageBase64: base64, mimeType });
      if (!analysis.isFood) {
        setError("That doesn't look like food. Try snapping your plate from above.");
        setPhase("error");
        return;
      }
      setResult(analysis);
      setName(analysis.items.map((i) => i.name).slice(0, 3).join(", ").slice(0, 60) || "Meal");
      setCalories(analysis.totals.calories);
      setProtein(analysis.totals.protein);
      setCarbs(analysis.totals.carbs);
      setFat(analysis.totals.fat);
      setPhase("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed — try again.");
      setPhase("error");
    }
  }

  async function logIt() {
    if (!user || !result) return;
    setLogging(true);
    try {
      const mealId = await logMeal({
        userId: user._id,
        dateKey: dateKeyLocal(),
        name: name || "Meal",
        mealType,
        calories,
        protein,
        carbs,
        fat,
        source: "photo",
        healthScore: result.healthScore || undefined,
        ingredients: result.ingredients,
        tip: result.tip || undefined,
      });
      if (preview) {
        await uploadMealPhoto(generateUploadUrl, attachPhoto, mealId, preview);
      }
      reset();
    } catch {
      setError("Couldn't save the meal. Check connection and retry.");
      setPhase("error");
    } finally {
      setLogging(false);
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setPhase("idle");
    setError(null);
  }

  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),16px)]">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Scan meal</h1>
        {(phase === "result" || phase === "error") && (
          <button onClick={reset} className="text-xs font-semibold text-[#d3fd50]">New scan</button>
        )}
      </div>

      {/* meal type picker */}
      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition ${
              mealType === t ? "border-[#d3fd50] bg-[#d3fd50]/10 text-[#d3fd50]" : "border-white/10 text-zinc-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
      <input
        ref={camRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
      />

      {/* states */}
      {phase === "idle" && (
        <section className="mt-6">
          <button
            onClick={() => camRef.current?.click()}
            className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-[28px] border border-[#d3fd50]/25 bg-gradient-to-b from-[#d3fd50]/10 to-transparent"
          >
            <span aria-hidden className="scanline absolute left-6 right-6 h-px bg-[#d3fd50]/70 shadow-[0_0_12px_rgba(211,253,80,0.8)]" />
            <Camera size={44} className="text-[#d3fd50]" strokeWidth={1.8} />
            <span className="mt-4 text-base font-bold">Take photo</span>
            <span className="mt-1 px-8 text-center text-xs text-zinc-400">
              Hold the plate flat in frame. AI reads portions, calories & macros.
            </span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-ghost mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 text-sm font-semibold"
          >
            Choose from library
          </button>

          <div className="mt-6 card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Pencil size={15} className="text-zinc-400" /> Describe instead
            </div>
            <TextLogRow onLogged={reset} />
          </div>
        </section>
      )}

      {phase === "analyzing" && preview && (
        <section className="mt-6">
          <div className="relative overflow-hidden rounded-[28px] border border-[#d3fd50]/30">
            <img src={preview} alt="Meal" className="aspect-square w-full object-cover" />
            <span aria-hidden className="scanline absolute left-0 right-0 h-1 bg-[#d3fd50]/80 shadow-[0_0_16px_rgba(211,253,80,0.9)]" />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-4">
              <Sparkles size={16} className="animate-pulse text-[#d3fd50]" />
              <span className="text-sm font-semibold">AI is reading your plate…</span>
            </div>
          </div>
        </section>
      )}

      {phase === "error" && (
        <section className="mt-6">
          <div className="card border-red-400/20 p-5 text-center">
            <X size={28} className="mx-auto text-red-400" />
            <p className="mt-3 text-sm text-zinc-300">{error}</p>
            <button onClick={() => (preview ? setPhase("idle") : camRef.current?.click())} className="btn-primary mt-4 px-5 py-2.5 text-sm">
              Try again
            </button>
          </div>
        </section>
      )}

      {phase === "result" && result && (
        <section className="mt-6 space-y-4">
          {preview && (
            <img src={preview} alt="Meal" className="aspect-video w-full rounded-[24px] border border-white/10 object-cover" />
          )}

          {/* health score */}
          <div className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ScanLine size={16} className="text-[#d3fd50]" /> Health score
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-[#d3fd50]">{result.healthScore}</span>
              <span className="text-xs text-zinc-500">/10</span>
            </div>
          </div>

          {/* totals — editable */}
          <div className="card p-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-base font-bold outline-none"
              placeholder="Meal name"
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <NumField label="Calories" value={calories} onChange={setCalories} />
              <NumField label="Protein (g)" value={protein} onChange={setProtein} />
              <NumField label="Carbs (g)" value={carbs} onChange={setCarbs} />
              <NumField label="Fat (g)" value={fat} onChange={setFat} />
            </div>
          </div>

          {/* items */}
          {result.items.length > 0 && (
            <div className="card p-4">
              <div className="mb-2 text-xs font-semibold text-zinc-400">Detected items</div>
              <ul className="space-y-2">
                {result.items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="font-medium">{it.name}</span>
                      <span className="text-xs text-zinc-500"> · {it.portion}</span>
                    </span>
                    <span className="font-semibold">{it.calories} kcal</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.tip && (
            <div className="card border-[#d3fd50]/15 bg-[#d3fd50]/[0.04] p-4">
              <div className="text-xs font-semibold text-[#d3fd50]">AI tip</div>
              <p className="mt-1 text-xs leading-relaxed text-zinc-300">{result.tip}</p>
            </div>
          )}

          <button onClick={logIt} disabled={logging} className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-[15px]">
            {logging ? <RefreshCw size={16} className="animate-spin" /> : <Check size={17} />}
            {logging ? "Saving…" : `Log this meal · ${Math.round(calories)} kcal`}
          </button>
        </section>
      )}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium text-zinc-500">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-bold outline-none"
      />
    </label>
  );
}

/** Compact text-description logger on the scan screen */
function TextLogRow({ onLogged }: { onLogged: () => void }) {
  const { user } = useUser();
  const analyzeText = useMutation(api.ai.analyzeText);
  const logMeal = useMutation(api.meals.log);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (!text.trim() || !user || busy) return;
    setBusy(true);
    try {
      const a: Analysis = await analyzeText({ description: text });
      await logMeal({
        userId: user._id,
        dateKey: dateKeyLocal(),
        name: a.items[0]?.name ?? text.slice(0, 40),
        mealType: guessMealType(),
        calories: a.totals.calories,
        protein: a.totals.protein,
        carbs: a.totals.carbs,
        fat: a.totals.fat,
        source: "text",
        description: text,
      });
      setText("");
      onLogged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && go()}
        placeholder='e.g. "2 eggs + toast"'
        className="min-w-0 flex-1 rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm outline-none placeholder:text-zinc-600"
      />
      <button onClick={go} disabled={busy || !text.trim()} className="btn-primary px-4 py-2.5 text-xs disabled:opacity-40">
        {busy ? "…" : "Estimate"}
      </button>
    </div>
  );
}

function guessMealType(): MealType {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 22) return "dinner";
  return "snack";
}
