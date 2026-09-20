import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await verifySession();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/dashboard" className="text-lg font-semibold">
          Roadmap AI
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {session.user.name}
          </span>
          {session.user.role === "admin" && (
            <Link
              href="/admin"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Admin
            </Link>
          )}
          <ThemeToggle />
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
