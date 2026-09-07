import { useEffect, useState } from "react";

type Props = {
  calories: number;
  goal: number;
  protein: number;
  proteinGoal: number;
  size?: number;
};

export default function CalRing({ calories, goal, protein, proteinGoal, size = 220 }: Props) {
  const [t, setT] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setT(1));
    return () => cancelAnimationFrame(raf);
  }, []);

  const pct = (v: number, g: number) => Math.min(1, g > 0 ? v / g : 0);
  const calPct = pct(calories, goal) * t;
  const proPct = pct(protein, proteinGoal) * t;

  const R = 84;
  const C = 2 * Math.PI * R;
  const R2 = 66;
  const C2 = 2 * Math.PI * R2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} className="-rotate-90">
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={R} fill="none"
          stroke="url(#calGrad)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - calPct)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)" }}
        />
        <circle cx="100" cy="100" r={R2} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="100" cy="100" r={R2} fill="none"
          stroke="#a3e635" strokeWidth="10" strokeLinecap="round" opacity={0.85}
          strokeDasharray={C2} strokeDashoffset={C2 * (1 - proPct)}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)" }}
        />
        <defs>
          <linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d3fd50" />
            <stop offset="100%" stopColor="#65e08c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold tracking-tight">{Math.round(calories).toLocaleString()}</div>
        <div className="text-xs text-zinc-400 mt-0.5">of {goal.toLocaleString()} kcal</div>
        <div className="mt-2 px-2 py-0.5 rounded-full bg-[#a3e635]/10 text-[#d3fd50] text-[11px] font-semibold">
          {Math.round(protein)}g / {proteinGoal}g protein
        </div>
      </div>
    </div>
  );
}
