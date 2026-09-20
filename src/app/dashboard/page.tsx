import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getOverallProgress, getRoadmapsWithProgress } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await verifySession();
  const [roadmaps, overallProgress] = await Promise.all([
    getRoadmapsWithProgress(Number(session.user.id)),
    getOverallProgress(Number(session.user.id)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
        <p className="text-muted-foreground">
          {overallProgress.completed} of {overallProgress.total} tracked
          topics completed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roadmaps.length === 0 && (
          <p className="text-muted-foreground">
            No roadmaps are available yet. Check back soon.
          </p>
        )}
        {roadmaps.map((roadmap) => (
          <Link key={roadmap.id} href={`/dashboard/${roadmap.slug}`}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {roadmap.title}
                  </CardTitle>
                  <Badge variant="secondary">Roadmap</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                <p>{roadmap.description ?? "No description yet."}</p>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>
                      {roadmap.completedNodes} of {roadmap.totalNodes} topics
                    </span>
                    <span className="font-medium text-foreground">
                      {roadmap.percentComplete}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${roadmap.percentComplete}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 border-t pt-2 text-xs">
                  {roadmap.readiness.map((level) => (
                    <div
                      key={level.key}
                      className="flex items-center justify-between"
                    >
                      <span
                        className={cn(
                          level.achieved && "font-medium text-foreground",
                        )}
                      >
                        {level.achieved ? "✅" : "⬜"} Job-ready:{" "}
                        {level.label} ({level.threshold}%)
                      </span>
                      {!level.achieved && (
                        <span>{level.remaining}% more</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
