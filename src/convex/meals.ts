import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const MAX_IMAGE_CHARS = 900_000; // stay under Convex 1MB arg/value limits

export const byDate = query({
  args: { userId: v.id("users"), dateKey: v.string() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("meals")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("dateKey", args.dateKey))
      .order("desc")
      .collect(),
});

export const recent = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) =>
    await ctx.db
      .query("meals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 50),
});

export const log = mutation({
  args: {
    userId: v.id("users"),
    dateKey: v.string(),
    name: v.string(),
    mealType: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    source: v.string(),
    description: v.optional(v.string()),
    healthScore: v.optional(v.number()),
    ingredients: v.optional(v.array(v.string())),
    tip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...body } = args;
    return await ctx.db.insert("meals", { userId, ...body, createdAt: Date.now() });
  },
});

export const remove = mutation({
  args: { mealId: v.id("meals") },
  handler: async (ctx, args) => {
    const meal = await ctx.db.get(args.mealId);
    if (meal?.storageId) {
      await ctx.storage.delete(meal.storageId);
    }
    await ctx.db.delete(args.mealId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const attachPhoto = mutation({
  args: { mealId: v.id("meals"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.mealId, { storageId: args.storageId });
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => await ctx.storage.getUrl(args.storageId),
});
