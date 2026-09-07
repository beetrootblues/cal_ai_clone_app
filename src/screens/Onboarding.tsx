import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser, setStoredEmail } from "../lib/userContext";
import type { Sex, Activity, Goal, Diet } from "../lib/userContext";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const ACTIVITIES: Array<{ v: Activity; label: string; desc: string }> = [
  { v: "sedentary", label: "Sedentary", desc: "Mostly sitting, little exercise" },
  { v: "light", label: "Lightly active", desc: "Light exercise 1–3 days/wk" },
  { v: "moderate", label: "Moderately active", desc: "Exercise 3–5 days/wk" },
  { v: "active", label: "Very active", desc: "Hard exercise 6–7 days/wk" },
  { v: "athlete", label: "Athlete", desc: "Training 2× per day" },
];

const GOALS: Array<{ v: Goal; label: string; desc: string }> = [
  { v: "lose", label: "Lose weight", desc: "Sustainable calorie deficit" },
  { v: "maintain", label: "Maintain", desc: "Stay at your current weight" },
  { v: "gain", label: "Build muscle", desc: "Controlled calorie surplus" },
];

export default function Onboarding() {
  const { user } = useUser();
  const complete = useMutation(api.users.completeOnboarding);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(75);
  const [activityLevel, setActivityLevel] = useState<Activity>("light");
  const [goal, setGoal] = useState<Goal>("lose");
  const [dietPreference, setDietPreference] = useState<Diet>("none");

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    setBusy(true);
    try {
      if (email.trim()) setStoredEmail(email.trim());
      await complete({
        userId: user!._id,
        name: name.trim() || "Friend",
        sex,
        age,
        heightCm,
        weightKg,
        activityLevel,
        goal,
        weeklyGoalKg: 0.5,
        dietPreference,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#09090b] text-zinc-50">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-[max(env(safe-area-inset-top),20px)] pb-8">
        {/* progress */}
        <div className="mt-4 flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#d3fd50]" : "bg-white/10"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <section className="mt-10 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Welcome! Let's set up your plan.</h1>
            <p className="mt-2 text-sm text-zinc-400">Takes under a minute.</p>
            <div className="mt-8 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-[15px] outline-none placeholder:text-zinc-600 focus:border-[#d3fd50]/60"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">Email</span>
                <input
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-[15px] outline-none placeholder:text-zinc-600 focus:border-[#d3fd50]/60"
                />
              </label>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="mt-10 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">About your body</h1>
            <p className="mt-2 text-sm text-zinc-400">Used only to compute your calorie target.</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {(["male", "female"] as Sex[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className={`rounded-2xl border px-4 py-4 text-sm font-semibold capitalize transition ${
                    sex === s ? "border-[#d3fd50] bg-[#d3fd50]/10 text-[#d3fd50]" : "border-white/10 bg-white/[0.04] text-zinc-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {[
                { label: "Age", value: age, set: setAge, min: 14, max: 90, unit: "yrs" },
                { label: "Height", value: heightCm, set: setHeightCm, min: 130, max: 220, unit: "cm" },
                { label: "Weight", value: weightKg, set: setWeightKg, min: 35, max: 250, unit: "kg" },
              ].map((f) => (
                <div key={f.label} className="card flex items-center justify-between p-4">
                  <span className="text-sm text-zinc-300">{f.label}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={f.value}
                      min={f.min}
                      max={f.max}
                      onChange={(e) => f.set(Number(e.target.value) || f.min)}
                      className="w-16 rounded-lg bg-white/[0.06] px-2 py-1.5 text-right text-[15px] font-bold outline-none"
                    />
                    <span className="w-8 text-xs text-zinc-500">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="mt-10 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">How active are you?</h1>
            <div className="mt-6 space-y-2.5">
              {ACTIVITIES.map((a) => (
                <button
                  key={a.v}
                  onClick={() => setActivityLevel(a.v)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                    activityLevel === a.v ? "border-[#d3fd50] bg-[#d3fd50]/10" : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold">{a.label}</span>
                    <span className="block text-xs text-zinc-500">{a.desc}</span>
                  </span>
                  {activityLevel === a.v && <Check size={18} className="text-[#d3fd50]" />}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="mt-10 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">What's your goal?</h1>
            <div className="mt-6 space-y-2.5">
              {GOALS.map((g) => (
                <button
                  key={g.v}
                  onClick={() => setGoal(g.v)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                    goal === g.v ? "border-[#d3fd50] bg-[#d3fd50]/10" : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold">{g.label}</span>
                    <span className="block text-xs text-zinc-500">{g.desc}</span>
                  </span>
                  {goal === g.v && <Check size={18} className="text-[#d3fd50]" />}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <span className="mb-2 block text-xs font-medium text-zinc-400">Diet preference (optional)</span>
              <div className="flex flex-wrap gap-2">
                {(["none", "vegetarian", "vegan", "keto"] as Diet[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDietPreference(d)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition ${
                      dietPreference === d ? "border-[#d3fd50] bg-[#d3fd50]/10 text-[#d3fd50]" : "border-white/10 text-zinc-400"
                    }`}
                  >
                    {d === "none" ? "No preference" : d}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* nav */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button onClick={back} aria-label="Back" className="btn-square flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
              <ArrowLeft size={18} />
            </button>
          )}
          {step < 3 ? (
            <button onClick={next} className="btn-primary flex flex-1 items-center justify-center gap-2 px-4 py-4 text-[15px]">
              Continue <ArrowRight size={17} />
            </button>
          ) : (
            <button onClick={finish} disabled={busy || !user} className="btn-primary flex flex-1 items-center justify-center gap-2 px-4 py-4 text-[15px]">
              {busy ? "Building your plan…" : "Create my plan"} <SparklesInline />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SparklesInline() {
  return <span aria-hidden>✨</span>;
}
