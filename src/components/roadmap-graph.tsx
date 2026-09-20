"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toggleNodeProgress } from "@/app/actions/progress";
import { cn } from "@/lib/utils";
import {
  buildNodeResources,
  NodeResourcesDialog,
  type NodeResource,
} from "@/components/node-resources-dialog";
import type { RoadmapEdge, RoadmapNode } from "@/lib/data";
import type { progress as progressTable } from "@/db/schema";

type ProgressRow = typeof progressTable.$inferSelect;

type RoadmapGraphProps = {
  roadmapSlug: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  progress: ProgressRow[];
};

type NodeData = {
  label: string;
  description: string | null;
  resources: NodeResource[];
  completed: boolean;
  pending: boolean;
  onToggle: () => void;
};

function TopicNode({ data }: NodeProps<Node<NodeData>>) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={data.pending}
      onClick={() => {
        if (!data.pending) data.onToggle();
      }}
      onKeyDown={(event) => {
        if (
          !data.pending &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          data.onToggle();
        }
      }}
      className={cn(
        "cursor-pointer rounded-md border bg-card px-4 py-2 text-left shadow-sm transition-colors",
        data.completed
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/60",
        data.pending && "pointer-events-none opacity-70",
      )}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-1">
        <div className="text-sm font-medium">{data.label}</div>
        <NodeResourcesDialog nodeTitle={data.label} resources={data.resources} />
      </div>
      {data.description && (
        <div className="text-xs text-muted-foreground">
          {data.description}
        </div>
      )}
      <div className="mt-1 text-xs">
        {data.completed ? "✅ Completed" : "Click to mark complete"}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { topic: TopicNode };

export function RoadmapGraph({
  roadmapSlug,
  nodes,
  edges,
  progress,
}: RoadmapGraphProps) {
  const [completedIds, setCompletedIds] = useState<Set<number>>(
    () =>
      new Set(
        progress
          .filter((row) => row.status === "completed")
          .map((row) => row.nodeId),
      ),
  );
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const handleToggle = (nodeId: number) => {
    setPendingId(nodeId);
    startTransition(async () => {
      const nextStatus = await toggleNodeProgress(nodeId, roadmapSlug);
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (nextStatus === "completed") {
          next.add(nodeId);
        } else {
          next.delete(nodeId);
        }
        return next;
      });
      setPendingId(null);
    });
  };

  const flowNodes = useMemo<Node<NodeData>[]>(
    () =>
      nodes.map((node) => ({
        id: String(node.id),
        type: "topic",
        position: { x: node.positionX, y: node.positionY },
        data: {
          label: node.title,
          description: node.description,
          resources: buildNodeResources(node),
          completed: completedIds.has(node.id),
          pending: pendingId === node.id,
          onToggle: () => handleToggle(node.id),
        },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, completedIds, pendingId],
  );

  const flowEdges = useMemo<Edge[]>(
    () =>
      edges.map((edge) => ({
        id: String(edge.id),
        source: String(edge.sourceNodeId),
        target: String(edge.targetNodeId),
      })),
    [edges],
  );

  if (nodes.length === 0) {
    return (
      <p className="text-muted-foreground">
        This roadmap doesn&apos;t have any topics yet.
      </p>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-lg border">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
