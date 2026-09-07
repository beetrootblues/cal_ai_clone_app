import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { computePlan } from "../lib/health";

export const startIfNeeded = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) return existing._id;
    // Device-scoped account — minimal profile, completed in onboarding.
    return await ctx.db.insert("users", {
      email,
      name: "",
      onboardingComplete: false,
      sex: "male",
      age: 25,
      heightCm: 175,
      weightKg: 75,
      activityLevel: "light",
        goal: "maintain",
      weeklyGoalKg: 0.5,
      goalCalories: 2000,
      goalProtein: 120,
      goalCarbs: 200,
      goalFat: 60,
      goalWaterMl: 2500,
      createdAt: Date.now(),
    });
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => await ctx.db.get(args.userId),
});

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    sex: v.union(v.literal("male"), v.literal("female")),
    age: v.number(),
    heightCm: v.number(),
    weightKg: v.number(),
    activityLevel: v.union(
      v.literal("sedentary"),
      v.literal("light"),
      v.literal("moderate"),
      v.literal("active"),
      v.literal("athlete")
    ),
    goal: v.union(v.literal("lose"), v.literal("maintain"), v.literal("gain")),
    weeklyGoalKg: v.number(),
    dietPreference: v.optional(
      v.union(v.literal("none"), v.literal("vegetarian"), v.literal("vegan"), v.literal("keto"))
    ),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, email, onboardingComplete: true });
      return existing._id;
    }
    const plan = computePlan(args);
    return await ctx.db.insert("users", {
      ...args,
      email,
      onboardingComplete: true,
      goalCalories: plan.calories,
      goalProtein: plan.protein,
      goalCarbs: plan.carbs,
      goalFat: plan.fat,
      goalWaterMl: 2500,
      createdAt: Date.now(),
    });
  },
});

export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    sex: v.union(v.literal("male"), v.literal("female")),
    age: v.number(),
    heightCm: v.number(),
    weightKg: v.number(),
    activityLevel: v.union(
      v.literal("sedentary"),
      v.literal("light"),
      v.literal("moderate"),
      v.literal("active"),
      v.literal("athlete")
    ),
    goal: v.union(v.literal("lose"), v.literal("maintain"), v.literal("gain")),
    weeklyGoalKg: v.number(),
    dietPreference: v.optional(
      v.union(v.literal("none"), v.literal("vegetarian"), v.literal("vegan"), v.literal("keto"))
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...body } = args;
    const plan = computePlan(body);
    await ctx.db.patch(userId, {
      ...body,
      onboardingComplete: true,
      goalCalories: plan.calories,
      goalProtein: plan.protein,
      goalCarbs: plan.carbs,
      goalFat: plan.fat,
      goalWaterMl: 2500,
    });
    return plan;
  },
});

export const updateGoals = mutation({
  args: {
    userId: v.id("users"),
    sex: v.union(v.literal("male"), v.literal("female")),
    age: v.number(),
    heightCm: v.number(),
    weightKg: v.number(),
    activityLevel: v.union(
      v.literal("sedentary"),
      v.literal("light"),
      v.literal("moderate"),
      v.literal("active"),
      v.literal("athlete")
    ),
    goal: v.union(v.literal("lose"), v.literal("maintain"), v.literal("gain")),
    weeklyGoalKg: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, ...body } = args;
    const plan = computePlan(body);
    await ctx.db.patch(userId, {
      ...body,
      goalCalories: plan.calories,
      goalProtein: plan.protein,
      goalCarbs: plan.carbs,
      goalFat: plan.fat,
    });
    return plan;
  },
});

export const updateManualTargets = mutation({
  args: {
    userId: v.id("users"),
    goalCalories: v.number(),
    goalProtein: v.number(),
    goalCarbs: v.number(),
    goalFat: v.number(),
    goalWaterMl: v.optional(v.number()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...patch } = args;
    await ctx.db.patch(userId, patch);
  },
});
