import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { getRoadmaps } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminRoadmapsPage() {
  await requireAdmin();
  const roadmaps = await getRoadmaps();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roadmaps</h1>
        <Button
          nativeButton={false}
          render={<Link href="/admin/roadmaps/new">New roadmap</Link>}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roadmaps.map((roadmap) => (
            <TableRow key={roadmap.id}>
              <TableCell className="font-medium">{roadmap.title}</TableCell>
              <TableCell className="text-muted-foreground">
                {roadmap.slug}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(roadmap.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link href={`/admin/roadmaps/${roadmap.id}`}>Edit</Link>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
          {roadmaps.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                No roadmaps yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
