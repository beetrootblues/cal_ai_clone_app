import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getWater = query({
  args: { userId: v.id("users"), dateKey: v.string() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("waterLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("dateKey", args.dateKey))
      .first(),
});

export const logWater = mutation({
  args: { userId: v.id("users"), dateKey: v.string(), ml: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("waterLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("dateKey", args.dateKey))
      .first();
    const ml = Math.max(0, args.ml);
    if (existing) await ctx.db.patch(existing._id, { ml });
    else await ctx.db.insert("waterLogs", { userId: args.userId, dateKey: args.dateKey, ml });
  },
});

export const getWeights = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) =>
    (await ctx.db
      .query("weightLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 30)),
});

export const logWeight = mutation({
  args: { userId: v.id("users"), dateKey: v.string(), weightKg: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("weightLogs", {
      userId: args.userId,
      dateKey: args.dateKey,
      weightKg: args.weightKg,
      createdAt: Date.now(),
    });
  },
});
