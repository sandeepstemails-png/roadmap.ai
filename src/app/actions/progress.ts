"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export async function toggleNodeProgress(nodeId: number, roadmapSlug: string) {
  const session = await verifySession();
  const userId = Number(session.user.id);

  const [existing] = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.nodeId, nodeId)))
    .limit(1);

  const nextStatus =
    existing?.status === "completed" ? "not_started" : "completed";

  if (existing) {
    await db
      .update(progress)
      .set({
        status: nextStatus,
        completedAt: nextStatus === "completed" ? new Date().toISOString() : null,
      })
      .where(eq(progress.id, existing.id));
  } else {
    await db.insert(progress).values({
      userId,
      nodeId,
      status: nextStatus,
      completedAt: nextStatus === "completed" ? new Date().toISOString() : null,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${roadmapSlug}`);

  return nextStatus;
}
