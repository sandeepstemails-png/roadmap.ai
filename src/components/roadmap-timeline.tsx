"use client";

import { useState, useTransition } from "react";
import { MapPin } from "lucide-react";
import { toggleNodeProgress } from "@/app/actions/progress";
import { cn } from "@/lib/utils";
import {
  buildNodeResources,
  NodeResourcesDialog,
} from "@/components/node-resources-dialog";
import type { RoadmapNode } from "@/lib/data";
import type { progress as progressTable } from "@/db/schema";

type ProgressRow = typeof progressTable.$inferSelect;

type RoadmapTimelineProps = {
  roadmapSlug: string;
  title: string;
  description: string | null;
  nodes: RoadmapNode[];
  progress: ProgressRow[];
};

export function RoadmapTimeline({
  roadmapSlug,
  title,
  description,
  nodes,
  progress,
}: RoadmapTimelineProps) {
  const [completedIds, setCompletedIds] = useState<Set<number>>(
    () =>
      new Set(
        progress
          .filter((row) => row.status === "completed")
          .map((row) => row.nodeId),
      ),
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);
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

  return (
    <div className="waypoint-dots -mx-6 -mb-8 flex flex-1 flex-col bg-(--waypoint-bg) px-6 py-12 text-(--waypoint-text) sm:px-10">
      <div className="mx-auto w-full max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-(--waypoint-badge-border) bg-(--waypoint-badge-bg) px-4 py-1.5 text-xs font-medium text-(--waypoint-badge-text)">
          <MapPin className="size-3.5" />
          Roadmap
        </span>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl font-black tracking-tight text-(--waypoint-heading) sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base text-(--waypoint-muted)">
            {description}
          </p>
        )}
      </div>

      <ol className="relative mx-auto mt-14 flex w-full max-w-3xl flex-col gap-10">
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-6 w-px border-l-2 border-dotted border-(--waypoint-line-color) sm:left-1/2 sm:-translate-x-1/2"
        />
        {nodes.map((node, index) => {
          const completed = completedIds.has(node.id);
          const pending = pendingId === node.id;
          const expanded = expandedId === node.id;
          const alignRight = index % 2 === 1;
          const resources = buildNodeResources(node);

          return (
            <li key={node.id} className="relative">
              <div
                aria-hidden="true"
                className={cn(
                  "absolute top-1 left-6 z-10 size-4 -translate-x-1/2 rounded-full border-4 border-(--waypoint-bg) shadow-sm sm:left-1/2",
                  completed
                    ? "bg-(--waypoint-accent-to)"
                    : "bg-(--waypoint-dot-color)",
                )}
              />
              <div
                className={cn(
                  "ml-12 sm:ml-0 sm:w-[calc(50%-2rem)]",
                  alignRight ? "sm:ml-auto" : "sm:mr-auto",
                )}
              >
                <div
                  className={cn(
                    "w-full rounded-2xl border bg-(--waypoint-surface)/80 p-4 shadow-sm transition-colors hover:border-(--waypoint-accent-to)/60",
                    completed
                      ? "border-(--waypoint-accent-to)"
                      : "border-(--waypoint-border)",
                  )}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.title} details`}
                    onClick={() => setExpandedId(expanded ? null : node.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setExpandedId(expanded ? null : node.id);
                      }
                    }}
                    className="w-full cursor-pointer text-left"
                    aria-expanded={expanded}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-(--waypoint-heading)">
                          {node.title}
                        </h3>
                        <NodeResourcesDialog
                          nodeTitle={node.title}
                          resources={resources}
                        />
                      </div>
                      <span className="shrink-0 text-xs font-medium text-(--waypoint-muted-2)">
                        Step {index + 1}
                      </span>
                    </div>
                    {node.description && (
                      <p className="mt-1 text-sm text-(--waypoint-muted)">
                        {node.description}
                      </p>
                    )}
                  </div>

                  {expanded && (
                    <div className="mt-3 flex items-center gap-3 border-t border-(--waypoint-border) pt-3">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleToggle(node.id)}
                        className={cn(
                          "ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-50",
                          completed
                            ? "bg-(--waypoint-border) text-(--waypoint-heading)"
                            : "bg-gradient-to-b from-(--waypoint-accent-from) to-(--waypoint-accent-to) text-white",
                        )}
                      >
                        {completed ? "✅ Completed" : "Mark complete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
