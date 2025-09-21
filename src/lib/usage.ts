import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const FREE_CREDITS = 50;
const PRO_CREDITS = 100;
const DURATION = 30 * 24 * 60 * 60;
const GENERATION_COST = 1;
export async function getUsageTracker() {
  const { has } = await auth();
  const hasProAccess = has({ plan: "pro_user" });

  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "Usage",
    points: hasProAccess ? PRO_CREDITS + FREE_CREDITS : FREE_CREDITS,
    duration: DURATION,
  });

  return usageTracker;
}

export async function consumeCredits() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.consume(userId, GENERATION_COST);

  return result;
}

export async function resetUsage(userId: string) {
  const usageTracker = await getUsageTracker();
  await usageTracker.delete(userId);
}

export async function getUsageStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const usageTracker = await getUsageTracker();
  const result = usageTracker.get(userId);

  return result;
}
