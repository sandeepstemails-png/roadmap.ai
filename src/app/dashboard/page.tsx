import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getOverallProgress, getRoadmaps } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await verifySession();
  const [roadmaps, overallProgress] = await Promise.all([
    getRoadmaps(),
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
              <CardContent className="text-sm text-muted-foreground">
                {roadmap.description ?? "No description yet."}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
