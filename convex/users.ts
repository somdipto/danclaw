import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── User Queries ────────────────────────────────────────────────────────────

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserDeployments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deployments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getUserUsage = query({
  args: { userId: v.id("users"), month: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const currentMonth = args.month || new Date().toISOString().slice(0, 7);

    const usage = await ctx.db
      .query("usage")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("month"), currentMonth))
      .collect();

    const totalMessages = usage.reduce((sum, u) => sum + (u.messages || 0), 0);
    const totalCost = usage.reduce((sum, u) => sum + (u.cost || 0), 0);

    return {
      current_month: {
        deployments: usage.length,
        messages: totalMessages,
        cost: totalCost,
      },
      month: currentMonth,
    };
  },
});

// ─── User Mutations ──────────────────────────────────────────────────────────

export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    openRouterToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { email, name, image, openRouterToken } = args;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        image,
        openRouterToken,
        updatedAt: now,
      });
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      email,
      name,
      image,
      tier: "free",
      openRouterToken,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

export const updateUserOpenRouterToken = mutation({
  args: {
    userId: v.id("users"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      openRouterToken: args.token,
      updatedAt: Date.now(),
    });
  },
});

export const updateUserTier = mutation({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("elite")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      tier: args.tier,
      updatedAt: Date.now(),
    });
  },
});

// ─── Activity Logging ────────────────────────────────────────────────────────

export const logActivity = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    icon: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity", {
      userId: args.userId,
      action: args.action,
      icon: args.icon,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

export const getUserActivity = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const activities = await ctx.db
      .query("activity")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return activities.slice(0, limit);
  },
});
