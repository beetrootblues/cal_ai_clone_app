import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    onboardingComplete: v.boolean(),
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
    goalCalories: v.number(),
    goalProtein: v.number(),
    goalCarbs: v.number(),
    goalFat: v.number(),
    goalWaterMl: v.number(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  meals: defineTable({
    userId: v.id("users"),
    dateKey: v.string(), // YYYY-MM-DD (local to the user's device)
    name: v.string(),
    mealType: v.string(), // breakfast | lunch | dinner | snack
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    source: v.string(), // photo | text | manual
    description: v.optional(v.string()),
    healthScore: v.optional(v.number()),
    ingredients: v.optional(v.array(v.string())),
    tip: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_user_date", ["userId", "dateKey"])
    .index("by_user", ["userId"]),

  waterLogs: defineTable({
    userId: v.id("users"),
    dateKey: v.string(),
    ml: v.number(),
  }).index("by_user_date", ["userId", "dateKey"]),

  weightLogs: defineTable({
    userId: v.id("users"),
    dateKey: v.string(),
    weightKg: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
