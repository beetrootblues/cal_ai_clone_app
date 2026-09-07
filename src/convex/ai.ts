"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const MAX_IMAGE_CHARS = 900_000;

type FoodItem = {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Analysis = {
  isFood: boolean;
  items: FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  healthScore: number; // 1-10
  tip: string;
  ingredients: string[];
};

function safeParse(json: string | null): unknown | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function num(x: unknown, fallback = 0): number {
  const n = typeof x === "string" ? parseFloat(x) : typeof x === "number" ? x : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalize(raw: unknown): Analysis {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const items = Array.isArray(obj.items) ? obj.items : [];
  const normItems: FoodItem[] = items.slice(0, 10).map((it) => {
    const o = (it ?? {}) as Record<string, unknown>;
    return {
      name: String(o.name ?? "Food").slice(0, 60),
      portion: String(o.portion ?? "1 serving").slice(0, 40),
      calories: Math.round(num(o.calories)),
      protein: Math.round(num(o.protein) * 10) / 10,
      carbs: Math.round(num(o.carbs) * 10) / 10,
      fat: Math.round(num(o.fat) * 10) / 10,
    };
  });

  const sum = (k: keyof FoodItem) => normItems.reduce((a, it) => a + (it[k] as number), 0);
  let totals = obj.totals as Record<string, unknown> | undefined;
  let calories = Math.round(num(totals?.calories, 0));
  let protein = Math.round(num(totals?.protein, 0) * 10) / 10;
  let carbs = Math.round(num(totals?.carbs, 0) * 10) / 10;
  let fat = Math.round(num(totals?.fat, 0) * 10) / 10;

  if (!calories && normItems.length) calories = Math.round(sum("calories"));
  if (!protein && normItems.length) protein = Math.round(sum("protein") * 10) / 10;
  if (!carbs && normItems.length) carbs = Math.round(sum("carbs") * 10) / 10;
  if (!fat && normItems.length) fat = Math.round(sum("fat") * 10) / 10;

  return {
    isFood: obj.isFood === undefined ? normItems.length > 0 : Boolean(obj.isFood),
    items: normItems,
    totals: { calories, protein, carbs, fat },
    healthScore: clamp(Math.round(num(obj.healthScore, 6)), 1, 10),
    tip: String(obj.tip ?? "").slice(0, 280),
    ingredients: Array.isArray(obj.ingredients)
      ? obj.ingredients.slice(0, 12).map((s) => String(s).slice(0, 60))
      : normItems.map((i) => i.name),
  };
}

const SYSTEM_PROMPT = `You are Cal AI, an expert nutritionist analyzing photos of meals.
Identify every distinct food item visible, estimate its portion using visual cues (plate size, hands, packaging), then estimate calories and macronutrients for that portion.
Be realistic about restaurant portions. Prefer underestimating rather than wildly overestimating.
Respond ONLY with a JSON object matching exactly this schema:
{
  "isFood": boolean,
  "items": [ { "name": string, "portion": string, "calories": number, "protein": number, "carbs": number, "fat": number } ],
  "totals": { "calories": number, "protein": number, "carbs": number, "fat": number }, 
  "healthScore": number 1-10,
  "tip": string (one short actionable nutrition tip),
  "ingredients": string[]
}`;

export const analyzeMealPhoto = action({
  args: { imageBase64: v.string(), mimeType: v.string() },
  handler: async (ctx, args) => {
    if (args.imageBase64.length > MAX_IMAGE_CHARS)
      throw new Error("Image too large. Retake the photo in better lighting and try again.");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
      throw new Error(
        "AI is not configured yet — add your OPENAI_API_KEY in the Freebuff keys panel and try again."
      );

    const openai = new OpenAI({ apiKey });
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this meal photo and return the JSON nutrition estimate.",
            },
            {
              type: "image_url",
              image_url: { url: `data:${args.mimeType};base64,${args.imageBase64}` },
            },
          ],
        },
      ],
    });

    const content = res.choices[0]?.message?.content ?? "{}";
    return normalize(safeParse(content));
  },
});

export const analyzeText = action({
  args: { description: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
      throw new Error(
        "AI is not configured yet — add your OPENAI_API_KEY in the Freebuff keys panel and try again."
      );

    const openai = new OpenAI({ apiKey });
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Estimate nutrition for this meal description (no photo): ${args.description}`,
        },
      ],
    });
    const content = res.choices[0]?.message?.content ?? "{}";
    return normalize(safeParse(content));
  },
});
