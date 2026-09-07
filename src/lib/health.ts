/**
 * Pure nutrition math shared by the Convex backend and the React app.
 * No browser or server APIs — importable from both runtimes.
 */

export type Sex = "male" | "female";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "athlete";
export type Goal = "lose" | "maintain" | "gain";

export const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Mifflin-St Jeor BMR */
export function bmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

export function computePlan(input: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: Activity;
  goal: Goal;
  weeklyGoalKg?: number;
}): {
  tdee: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  const maintenance = bmr(input.sex, input.weightKg, input.heightCm, input.age) *
    ACTIVITY_FACTORS[input.activityLevel];
  const weekly = clamp(input.weeklyGoalKg ?? 0.5, 0.1, 1.25);
  const dailyDeltaKcal = (weekly * 7700) / 7;

  let calories: number;
  if (input.goal === "lose") calories = maintenance - dailyDeltaKcal;
  else if (input.goal === "gain") calories = maintenance + dailyDeltaKcal;
  else calories = maintenance;

  calories = Math.round(clamp(calories, 1200, 5000));

  const proteinPerKg =
    input.goal === "lose" ? 2.0 : input.goal === "gain" ? 1.8 : 1.6;
  const protein = Math.round(input.weightKg * proteinPerKg);
  const fat = Math.round((calories * 0.27) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { tdee: Math.round(maintenance), calories, protein, carbs, fat };
}

export function dateKeyLocal(d = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}
