"use client";

import type { MouseEvent } from "react";
import { ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type NodeResource = { label: string; url: string };

// Older nodes only ever got a single `resourceUrl`; newer ones can have
// several rows in `roadmap_node_resources`. Merge both into one list so
// callers don't have to care which storage a given node used.
export function buildNodeResources(node: {
  resourceUrl: string | null;
  resources: NodeResource[];
}): NodeResource[] {
  const resources = [...node.resources];
  if (node.resourceUrl && !resources.some((r) => r.url === node.resourceUrl)) {
    resources.unshift({ label: "Resource", url: node.resourceUrl });
  }
  return resources;
}

type NodeResourcesDialogProps = {
  nodeTitle: string;
  resources: NodeResource[];
  className?: string;
  size?: "icon-xs" | "icon-sm" | "icon";
};

export function NodeResourcesDialog({
  nodeTitle,
  resources,
  className,
  size = "icon-xs",
}: NodeResourcesDialogProps) {
  if (resources.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={size}
            aria-label={`Learning resources for ${nodeTitle}`}
            className={cn("rounded-full", className)}
            onClick={(event: MouseEvent) => event.stopPropagation()}
          >
            <Info className="size-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{nodeTitle} resources</DialogTitle>
          <DialogDescription>
            Curated links to help you learn this topic.
          </DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {resources.map((resource) => (
            <li key={resource.url}>
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                {resource.label}
                <ExternalLink className="size-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
