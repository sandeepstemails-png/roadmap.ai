import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { progress, roadmapEdges, roadmapNodes, roadmaps } from "@/db/schema";

export async function getRoadmaps() {
  return db.query.roadmaps.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt),
  });
}

export async function getRoadmapBySlug(slug: string) {
  return db.query.roadmaps.findFirst({
    where: eq(roadmaps.slug, slug),
    with: { nodes: true, edges: true },
  });
}

export async function getRoadmapById(id: number) {
  return db.query.roadmaps.findFirst({
    where: eq(roadmaps.id, id),
    with: { nodes: true, edges: true },
  });
}

export async function getUserProgressForRoadmap(
  userId: number,
  nodeIds: number[],
) {
  if (nodeIds.length === 0) return [];
  return db.query.progress.findMany({
    where: (table, { and, eq, inArray }) =>
      and(eq(table.userId, userId), inArray(table.nodeId, nodeIds)),
  });
}

export async function getOverallProgress(userId: number) {
  const rows = await db.query.progress.findMany({
    where: eq(progress.userId, userId),
  });
  const total = rows.length;
  const completed = rows.filter((row) => row.status === "completed").length;
  return { total, completed };
}

export type RoadmapWithGraph = NonNullable<
  Awaited<ReturnType<typeof getRoadmapBySlug>>
>;
export type RoadmapNode = typeof roadmapNodes.$inferSelect;
export type RoadmapEdge = typeof roadmapEdges.$inferSelect;
