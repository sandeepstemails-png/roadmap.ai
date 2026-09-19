"use client";

import { useActionState } from "react";
import { createRoadmap } from "@/app/actions/roadmaps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewRoadmapPage() {
  const [state, action, pending] = useActionState(createRoadmap, undefined);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>New roadmap</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
            {state?.errors?.title && (
              <p className="text-sm text-destructive">
                {state.errors.title[0]}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" placeholder="e.g. frontend-basics" required />
            {state?.errors?.slug && (
              <p className="text-sm text-destructive">
                {state.errors.slug[0]}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>
          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <Button disabled={pending} type="submit">
            {pending ? "Creating…" : "Create roadmap"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
