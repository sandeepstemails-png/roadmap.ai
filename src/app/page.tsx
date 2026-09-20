import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { auth } from "@/auth";
import { WaypointLogo } from "@/components/waypoint-logo";
import { ThemeToggle } from "@/components/theme-toggle";

const tracks = [
  {
    slug: "devops",
    title: "DevOps",
    description:
      "From Linux fundamentals to Kubernetes and infrastructure automation.",
    blobClassName: "from-[#F3986A]/80",
  },
  {
    slug: "cloud-engineering",
    title: "Cloud Engineering",
    description: "Core AWS services and cloud architecture patterns.",
    blobClassName: "from-[#A9CBE8]/80",
  },
];

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-(--waypoint-accent-to) focus-visible:ring-offset-2 focus-visible:ring-offset-(--waypoint-bg)";

export default async function Home() {
  const session = await auth();
  const primaryHref = session?.user ? "/dashboard" : "/signup";

  return (
    <div className="waypoint-dots flex flex-1 flex-col bg-(--waypoint-bg) text-(--waypoint-text)">
      <header className="flex items-center justify-between border-b border-(--waypoint-border) px-6 py-4 sm:px-10">
        <WaypointLogo />
        <nav className="flex items-center gap-5">
          {session?.user ? (
            <Link
              href="/dashboard"
              className={`rounded-full bg-gradient-to-b from-(--waypoint-accent-from) to-(--waypoint-accent-to) px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] ${focusRing}`}
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`rounded-full text-sm font-medium text-(--waypoint-text) hover:opacity-70 ${focusRing}`}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={`rounded-full bg-gradient-to-b from-(--waypoint-accent-from) to-(--waypoint-accent-to) px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] ${focusRing}`}
              >
                Start learning
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-16 text-center sm:px-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-(--waypoint-badge-border) bg-(--waypoint-badge-bg) px-4 py-1.5 text-xs font-medium text-(--waypoint-badge-text)">
          <MapPin className="size-3.5" />
          Plot your route, not just a checklist
        </span>

        <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-fraunces)] text-5xl font-black leading-[1.1] tracking-tight text-(--waypoint-heading) sm:text-6xl">
          Learning, <span className="bg-(--waypoint-highlight) px-1">mapped</span> like a
          trail.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-(--waypoint-muted)">
          Waypoint turns DevOps, Cloud, and other technical journeys into a
          walkable roadmap — pick a track, follow the trail, and mark every
          milestone as you clear it.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <Link
            href={primaryHref}
            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-(--waypoint-accent-from) to-(--waypoint-accent-to) px-7 py-3.5 text-base font-semibold text-white shadow-md transition-transform hover:scale-[1.02] ${focusRing}`}
          >
            Start your trail
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/login"
            className={`rounded-full text-base font-medium text-(--waypoint-text) hover:opacity-70 ${focusRing}`}
          >
            Browse tracks
          </Link>
        </div>

        <div className="mt-14 w-full max-w-4xl text-left">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold tracking-tight text-(--waypoint-heading)">
            Choose a track
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {tracks.map((track) => (
              <div
                key={track.slug}
                className="relative overflow-hidden rounded-2xl border border-(--waypoint-border) bg-(--waypoint-surface)/70 p-6"
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br ${track.blobClassName} to-transparent blur-2xl`}
                />
                <h3 className="relative font-[family-name:var(--font-fraunces)] text-xl font-bold text-(--waypoint-heading)">
                  {track.title}
                </h3>
                <p className="relative mt-2 text-sm text-(--waypoint-muted)">
                  {track.description}
                </p>
                <Link
                  href="/login"
                  className={`relative mt-4 inline-flex items-center gap-1 rounded text-sm font-semibold text-(--waypoint-accent-text) hover:underline ${focusRing}`}
                >
                  View trail
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-(--waypoint-border) px-6 py-6 text-center text-sm text-(--waypoint-muted-2)">
        Waypoint — built with Next.js
      </footer>
    </div>
  );
}
