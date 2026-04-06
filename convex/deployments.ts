import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { TIER_DEPLOYMENT_LIMITS } from "../packages/shared/src/constants";

// ─── Deployment Queries ─────────────────────────────────────────────────────

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deployments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { deploymentId: v.id("deployments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.deploymentId);
  },
});

export const getByName = query({
  args: { serviceName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deployments")
      .withIndex("by_service_name", (q) => q.eq("serviceName", args.serviceName))
      .first();
  },
});

export const getActiveCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const deployments = await ctx.db
      .query("deployments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "running"),
          q.eq(q.field("status"), "starting"),
          q.eq(q.field("status"), "provisioning")
        )
      )
      .collect();
    return deployments.length;
  },
});

// ─── Deployment Mutations ───────────────────────────────────────────────────

export const create = mutation({
  args: {
    userId: v.id("users"),
    serviceName: v.string(),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("elite")),
    region: v.string(),
    model: v.string(),
    channel: v.string(),
    containerId: v.optional(v.string()),
    containerUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check deployment limits
    const activeCount = await ctx.db
      .query("deployments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "running"),
          q.eq(q.field("status"), "starting"),
          q.eq(q.field("status"), "provisioning")
        )
      )
      .collect();

    const limit = TIER_DEPLOYMENT_LIMITS[args.tier]?.maxDeployments ?? 1;
    if (activeCount.length >= limit) {
      throw new Error(`Deployment limit reached for ${args.tier} tier (${limit} max)`);
    }

    // Check unique service name
    const existing = await ctx.db
      .query("deployments")
      .withIndex("by_service_name", (q) => q.eq("serviceName", args.serviceName))
      .first();

    if (existing) {
      throw new Error(`Service name "${args.serviceName}" is already taken`);
    }

    const now = Date.now();
    const deploymentId = await ctx.db.insert("deployments", {
      userId: args.userId,
      serviceName: args.serviceName,
      status: "provisioning",
      tier: args.tier,
      region: args.region,
      model: args.model,
      channel: args.channel,
      containerId: args.containerId,
      containerUrl: args.containerUrl,
      uptime: 0,
      memoryUsage: 0,
      memoryLimit: getMemoryLimit(args.tier),
      requestsToday: 0,
      costThisMonth: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("activity", {
      userId: args.userId,
      action: `Deployed "${args.serviceName}" agent`,
      icon: "🚀",
      createdAt: now,
    });

    return deploymentId;
  },
});

export const updateStatus = mutation({
  args: {
    deploymentId: v.id("deployments"),
    status: v.union(
      v.literal("provisioning"),
      v.literal("starting"),
      v.literal("running"),
      v.literal("stopping"),
      v.literal("stopped"),
      v.literal("restarting"),
      v.literal("destroying"),
      v.literal("error")
    ),
  },
  handler: async (ctx, args) => {
    const deployment = await ctx.db.get(args.deploymentId);
    if (!deployment) {
      throw new Error("Deployment not found");
    }

    const validTransitions: Record<string, string[]> = {
      provisioning: ["starting", "error"],
      starting: ["running", "error"],
      running: ["stopping", "restarting", "error"],
      stopping: ["stopped", "error"],
      stopped: ["starting", "destroying", "error"],
      restarting: ["running", "error"],
      destroying: ["provisioning", "error"],
      error: ["starting", "destroying"],
    };

    const allowed = validTransitions[deployment.status] || [];
    if (!allowed.includes(args.status)) {
      throw new Error(
        `Cannot transition from ${deployment.status} to ${args.status}`
      );
    }

    await ctx.db.patch(args.deploymentId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const containerUpdate = mutation({
  args: {
    deploymentId: v.id("deployments"),
    containerId: v.string(),
    containerUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.deploymentId, {
      containerId: args.containerId,
      containerUrl: args.containerUrl,
      status: "running",
      updatedAt: Date.now(),
    });
  },
});

export const destroy = mutation({
  args: { deploymentId: v.id("deployments") },
  handler: async (ctx, args) => {
    const deployment = await ctx.db.get(args.deploymentId);
    if (!deployment) {
      throw new Error("Deployment not found");
    }

    await ctx.db.patch(args.deploymentId, {
      status: "destroying",
      updatedAt: Date.now(),
    });

    // Clean up messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_deployment", (q) => q.eq("deploymentId", args.deploymentId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMemoryLimit(tier: string): number | undefined {
  const limits: Record<string, number> = {
    free: 0.5,
    pro: 4,
    elite: 16,
  };
  return limits[tier];
}
