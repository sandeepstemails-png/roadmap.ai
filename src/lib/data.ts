import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  progress,
  roadmapEdges,
  roadmapNodeResources,
  roadmaps,
} from "@/db/schema";

export async function getRoadmaps() {
  return db.query.roadmaps.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt),
  });
}

export async function getRoadmapBySlug(slug: string) {
  return db.query.roadmaps.findFirst({
    where: eq(roadmaps.slug, slug),
    with: {
      nodes: {
        orderBy: (table, { asc }) => asc(table.id),
        with: { resources: true },
      },
      edges: true,
    },
  });
}

export async function getRoadmapById(id: number) {
  return db.query.roadmaps.findFirst({
    where: eq(roadmaps.id, id),
    with: {
      nodes: {
        orderBy: (table, { asc }) => asc(table.id),
        with: { resources: true },
      },
      edges: true,
    },
  });
}

// Fresher / Intermediate / Expert thresholds are expressed as a percentage
// of a roadmap's topics completed. They're a simple, transparent proxy for
// job-readiness — not derived from real hiring data — so they're easy to
// see and adjust here if that mapping should change.
export const JOB_READINESS_LEVELS = [
  { key: "fresher", label: "Fresher", threshold: 40 },
  { key: "intermediate", label: "Intermediate", threshold: 70 },
  { key: "expert", label: "Expert", threshold: 100 },
] as const;

export function getJobReadiness(percentComplete: number) {
  return JOB_READINESS_LEVELS.map((level) => ({
    ...level,
    achieved: percentComplete >= level.threshold,
    remaining: Math.max(0, level.threshold - percentComplete),
  }));
}

export async function getRoadmapsWithProgress(userId: number) {
  const allRoadmaps = await db.query.roadmaps.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt),
    with: { nodes: { columns: { id: true } } },
  });

  const completedRows = await db.query.progress.findMany({
    where: and(eq(progress.userId, userId), eq(progress.status, "completed")),
    columns: { nodeId: true },
  });
  const completedNodeIds = new Set(completedRows.map((row) => row.nodeId));

  return allRoadmaps.map((roadmap) => {
    const totalNodes = roadmap.nodes.length;
    const completedNodes = roadmap.nodes.filter((node) =>
      completedNodeIds.has(node.id),
    ).length;
    const percentComplete =
      totalNodes === 0 ? 0 : Math.round((completedNodes / totalNodes) * 100);

    return {
      id: roadmap.id,
      slug: roadmap.slug,
      title: roadmap.title,
      description: roadmap.description,
      totalNodes,
      completedNodes,
      percentComplete,
      readiness: getJobReadiness(percentComplete),
    };
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
export type RoadmapNode = RoadmapWithGraph["nodes"][number];
export type RoadmapEdge = typeof roadmapEdges.$inferSelect;
export type RoadmapNodeResource = typeof roadmapNodeResources.$inferSelect;
export type RoadmapWithProgress = Awaited<
  ReturnType<typeof getRoadmapsWithProgress>
>[number];
