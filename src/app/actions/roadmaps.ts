"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { roadmapEdges, roadmapNodes, roadmaps } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { roadmapNodeSchema, roadmapSchema } from "@/lib/validation";

export type RoadmapFormState =
  | {
      errors?: { title?: string[]; slug?: string[]; description?: string[] };
      message?: string;
    }
  | undefined;

export async function createRoadmap(
  _state: RoadmapFormState,
  formData: FormData,
): Promise<RoadmapFormState> {
  const session = await requireAdmin();

  const validated = roadmapSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const [existing] = await db
    .select({ id: roadmaps.id })
    .from(roadmaps)
    .where(eq(roadmaps.slug, validated.data.slug))
    .limit(1);

  if (existing) {
    return { message: "A roadmap with this slug already exists." };
  }

  const [created] = await db
    .insert(roadmaps)
    .values({
      ...validated.data,
      createdBy: Number(session.user.id),
    })
    .returning({ id: roadmaps.id });

  revalidatePath("/admin");
  redirect(`/admin/roadmaps/${created.id}`);
}

export async function updateRoadmap(
  roadmapId: number,
  _state: RoadmapFormState,
  formData: FormData,
): Promise<RoadmapFormState> {
  await requireAdmin();

  const validated = roadmapSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const [existing] = await db
    .select({ id: roadmaps.id })
    .from(roadmaps)
    .where(
      and(eq(roadmaps.slug, validated.data.slug), ne(roadmaps.id, roadmapId)),
    )
    .limit(1);

  if (existing) {
    return { message: "A roadmap with this slug already exists." };
  }

  await db
    .update(roadmaps)
    .set({ ...validated.data, updatedAt: new Date().toISOString() })
    .where(eq(roadmaps.id, roadmapId));

  revalidatePath("/admin");
  revalidatePath(`/admin/roadmaps/${roadmapId}`);
  return { message: "Saved." };
}

export async function deleteRoadmap(roadmapId: number) {
  await requireAdmin();
  await db.delete(roadmaps).where(eq(roadmaps.id, roadmapId));
  revalidatePath("/admin");
  redirect("/admin");
}

export type NodeFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        resourceUrl?: string[];
      };
      message?: string;
    }
  | undefined;

export async function createNode(
  roadmapId: number,
  _state: NodeFormState,
  formData: FormData,
): Promise<NodeFormState> {
  await requireAdmin();

  const validated = roadmapNodeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    resourceUrl: formData.get("resourceUrl") || undefined,
    positionX: formData.get("positionX") || 0,
    positionY: formData.get("positionY") || 0,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await db.insert(roadmapNodes).values({
    roadmapId,
    title: validated.data.title,
    description: validated.data.description || null,
    resourceUrl: validated.data.resourceUrl || null,
    positionX: validated.data.positionX,
    positionY: validated.data.positionY,
  });

  revalidatePath(`/admin/roadmaps/${roadmapId}`);
  return undefined;
}

export async function deleteNode(roadmapId: number, nodeId: number) {
  await requireAdmin();
  await db.delete(roadmapNodes).where(eq(roadmapNodes.id, nodeId));
  revalidatePath(`/admin/roadmaps/${roadmapId}`);
}

export async function createEdge(
  roadmapId: number,
  sourceNodeId: number,
  targetNodeId: number,
) {
  await requireAdmin();

  if (sourceNodeId === targetNodeId) return;

  await db.insert(roadmapEdges).values({
    roadmapId,
    sourceNodeId,
    targetNodeId,
  });
  revalidatePath(`/admin/roadmaps/${roadmapId}`);
}

export async function deleteEdge(roadmapId: number, edgeId: number) {
  await requireAdmin();
  await db.delete(roadmapEdges).where(eq(roadmapEdges.id, edgeId));
  revalidatePath(`/admin/roadmaps/${roadmapId}`);
}
