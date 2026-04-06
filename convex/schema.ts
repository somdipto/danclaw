import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    openRouterToken: v.optional(v.string()),
    tier: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("elite"))),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  deployments: defineTable({
    userId: v.id("users"),
    serviceName: v.string(),
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
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("elite")),
    region: v.string(),
    model: v.string(),
    channel: v.string(),
    uptime: v.optional(v.number()),
    memoryUsage: v.optional(v.float64()),
    memoryLimit: v.optional(v.float64()),
    requestsToday: v.optional(v.number()),
    costThisMonth: v.optional(v.float64()),
    containerId: v.optional(v.string()),
    containerUrl: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_service_name", ["serviceName"]),

  messages: defineTable({
    deploymentId: v.id("deployments"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("agent")),
    content: v.string(),
    type: v.optional(
      v.union(v.literal("message"), v.literal("response"), v.literal("status"), v.literal("error"))
    ),
    createdAt: v.optional(v.number()),
  })
    .index("by_deployment", ["deploymentId"])
    .index("by_user", ["userId"]),

  activity: defineTable({
    userId: v.id("users"),
    action: v.string(),
    icon: v.optional(v.string()),
    metadata: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"]),

  authSessions: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    expiresAt: v.number(),
    sessionData: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  usage: defineTable({
    userId: v.id("users"),
    deploymentId: v.optional(v.id("deployments")),
    month: v.string(), // YYYY-MM
    messages: v.optional(v.number()),
    cost: v.optional(v.float64()),
  })
    .index("by_user", ["userId"])
    .index("by_month", ["month"]),
});
