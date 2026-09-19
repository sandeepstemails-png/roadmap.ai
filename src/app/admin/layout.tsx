import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-lg font-semibold">
            Roadmap AI — Admin
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {session.user.name}
          </span>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard">Learner view</Link>}
          />
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
