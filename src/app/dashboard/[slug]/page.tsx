import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getRoadmapBySlug, getUserProgressForRoadmap } from "@/lib/data";
import { RoadmapGraph } from "@/components/roadmap-graph";
import { RoadmapTimeline } from "@/components/roadmap-timeline";

export default async function RoadmapPage({
  params,
}: PageProps<"/dashboard/[slug]">) {
  const { slug } = await params;
  const session = await verifySession();
  const roadmap = await getRoadmapBySlug(slug);

  if (!roadmap) {
    notFound();
  }

  const nodeIds = roadmap.nodes.map((node) => node.id);
  const progressRows = await getUserProgressForRoadmap(
    Number(session.user.id),
    nodeIds,
  );

  // Roadmaps with no edges are a pure sequence — render them as a linear
  // timeline. Roadmaps with edges are a branching graph and keep the
  // React Flow canvas, which can represent multiple parents/paths.
  if (roadmap.edges.length === 0) {
    return (
      <RoadmapTimeline
        roadmapSlug={roadmap.slug}
        title={roadmap.title}
        description={roadmap.description}
        nodes={roadmap.nodes}
        progress={progressRows}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{roadmap.title}</h1>
        {roadmap.description && (
          <p className="text-muted-foreground">{roadmap.description}</p>
        )}
      </div>
      <RoadmapGraph
        roadmapSlug={roadmap.slug}
        nodes={roadmap.nodes}
        edges={roadmap.edges}
        progress={progressRows}
      />
    </div>
  );
}
