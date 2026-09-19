import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { getRoadmapById } from "@/lib/data";
import { RoadmapEditor } from "@/components/roadmap-editor";

export default async function EditRoadmapPage({
  params,
}: PageProps<"/admin/roadmaps/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const roadmapId = Number(id);

  if (Number.isNaN(roadmapId)) {
    notFound();
  }

  const roadmap = await getRoadmapById(roadmapId);

  if (!roadmap) {
    notFound();
  }

  return <RoadmapEditor roadmap={roadmap} />;
}
