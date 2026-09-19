"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createEdge,
  createNode,
  deleteEdge,
  deleteNode,
  deleteRoadmap,
  updateRoadmap,
} from "@/app/actions/roadmaps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RoadmapWithGraph } from "@/lib/data";

export function RoadmapEditor({ roadmap }: { roadmap: RoadmapWithGraph }) {
  const updateAction = updateRoadmap.bind(null, roadmap.id);
  const [detailsState, detailsAction, detailsPending] = useActionState(
    updateAction,
    undefined,
  );

  const createNodeAction = createNode.bind(null, roadmap.id);
  const [nodeState, nodeAction, nodePending] = useActionState(
    createNodeAction,
    undefined,
  );

  const [sourceId, setSourceId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Roadmap details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={detailsAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Roadmap title</Label>
              <Input id="title" name="title" defaultValue={roadmap.title} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={roadmap.slug} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={roadmap.description ?? ""}
              />
            </div>
            {detailsState?.message && (
              <p className="text-sm text-muted-foreground">
                {detailsState.message}
              </p>
            )}
            <div className="flex gap-2">
              <Button disabled={detailsPending} type="submit">
                {detailsPending ? "Saving…" : "Save changes"}
              </Button>
              <Button
                variant="destructive"
                type="button"
                onClick={() =>
                  startTransition(() => deleteRoadmap(roadmap.id))
                }
              >
                Delete roadmap
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Resource URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roadmap.nodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell className="font-medium">{node.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {node.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {node.resourceUrl ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        startTransition(() =>
                          deleteNode(roadmap.id, node.id),
                        )
                      }
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {roadmap.nodes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No topics yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <form
            action={nodeAction}
            className="grid gap-3 border-t pt-4 sm:grid-cols-2"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="node-title">Topic title</Label>
              <Input id="node-title" name="title" required />
              {nodeState?.errors?.title && (
                <p className="text-sm text-destructive">
                  {nodeState.errors.title[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="node-resourceUrl">Resource URL</Label>
              <Input id="node-resourceUrl" name="resourceUrl" type="url" />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="node-description">Description</Label>
              <Textarea id="node-description" name="description" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="node-positionX">Position X</Label>
              <Input
                id="node-positionX"
                name="positionX"
                type="number"
                defaultValue={0}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="node-positionY">Position Y</Label>
              <Input
                id="node-positionY"
                name="positionY"
                type="number"
                defaultValue={0}
              />
            </div>
            <Button disabled={nodePending} type="submit" className="sm:col-span-2">
              {nodePending ? "Adding…" : "Add topic"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roadmap.edges.map((edge) => {
                const source = roadmap.nodes.find(
                  (node) => node.id === edge.sourceNodeId,
                );
                const target = roadmap.nodes.find(
                  (node) => node.id === edge.targetNodeId,
                );
                return (
                  <TableRow key={edge.id}>
                    <TableCell>{source?.title ?? edge.sourceNodeId}</TableCell>
                    <TableCell>{target?.title ?? edge.targetNodeId}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          startTransition(() =>
                            deleteEdge(roadmap.id, edge.id),
                          )
                        }
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {roadmap.edges.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No connections yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="grid gap-3 border-t pt-4 sm:grid-cols-3 sm:items-end">
            <div className="flex flex-col gap-2">
              <Label>From</Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {roadmap.nodes.map((node) => (
                    <SelectItem key={node.id} value={String(node.id)}>
                      {node.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>To</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {roadmap.nodes.map((node) => (
                    <SelectItem key={node.id} value={String(node.id)}>
                      {node.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={!sourceId || !targetId}
              onClick={() =>
                startTransition(() =>
                  createEdge(roadmap.id, Number(sourceId), Number(targetId)),
                )
              }
            >
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
