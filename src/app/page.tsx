import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Visual roadmaps",
    description:
      "Follow structured, node-by-node learning paths instead of guessing what to learn next.",
  },
  {
    title: "Track your progress",
    description:
      "Mark topics complete as you go and see exactly how far along you are.",
  },
  {
    title: "Curated by admins",
    description:
      "Roadmaps are built and maintained by admins, so the content stays accurate and current.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold">Roadmap AI</span>
        <nav className="flex items-center gap-2">
          {session?.user ? (
            <Button
              render={<Link href="/dashboard">Go to dashboard</Link>}
            />
          ) : (
            <>
              <Button
                variant="ghost"
                render={<Link href="/login">Log in</Link>}
              />
              <Button render={<Link href="/signup">Sign up</Link>} />
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Learn with a clear roadmap, not a wall of tabs.
          </h1>
          <p className="text-lg text-muted-foreground">
            Roadmap AI turns scattered learning resources into a single,
            trackable path — so you always know what to learn next.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              size="lg"
              render={<Link href="/signup">Get started</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              render={
                <Link href="/login">I already have an account</Link>
              }
            />
          </div>
        </div>

        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="text-left">
              <CardHeader>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-sm text-muted-foreground">
        Roadmap AI — built with Next.js
      </footer>
    </div>
  );
}
