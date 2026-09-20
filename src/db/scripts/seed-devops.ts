import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { roadmapNodeResources, roadmapNodes, roadmaps, users } from "../schema";

// The exact TrainWithShubham video for each topic isn't something we can
// verify from here, so every node links to the channel and site home
// rather than a specific (possibly wrong or dead) video URL. Swap these
// for exact per-topic video links if/when you have them.
const TRAINWITHSHUBHAM_RESOURCES = [
  { label: "TrainWithShubham (YouTube)", url: "https://www.youtube.com/@TrainWithShubham" },
  { label: "trainwithshubham.com", url: "https://www.trainwithshubham.com" },
];

const DEVOPS_NODES = [
  {
    title: "Linux",
    description: "Shell, filesystem, permissions, processes.",
  },
  {
    title: "Networking",
    description: "TCP/IP, DNS, HTTP, load balancing basics.",
  },
  {
    title: "Git",
    description: "Version control workflows and collaboration.",
  },
  {
    title: "Docker",
    description: "Containers, images, Dockerfiles, Compose.",
  },
  {
    title: "Jenkins",
    description: "CI/CD pipelines and automation.",
  },
  {
    title: "Kubernetes",
    description: "Container orchestration at scale.",
  },
  {
    title: "Terraform",
    description: "Infrastructure as code.",
  },
];

async function backfillResources(
  db: ReturnType<typeof drizzle>,
  roadmapId: number,
) {
  const nodes = await db
    .select({ id: roadmapNodes.id })
    .from(roadmapNodes)
    .where(eq(roadmapNodes.roadmapId, roadmapId));

  const existingResources = await db
    .select({ nodeId: roadmapNodeResources.nodeId })
    .from(roadmapNodeResources);
  const nodesWithResources = new Set(existingResources.map((r) => r.nodeId));

  const nodesNeedingResources = nodes.filter(
    (node) => !nodesWithResources.has(node.id),
  );

  if (nodesNeedingResources.length === 0) {
    console.log(
      "DevOps roadmap already exists (id " + roadmapId + "), resources already present, skipping.",
    );
    return;
  }

  await db.insert(roadmapNodeResources).values(
    nodesNeedingResources.flatMap((node) =>
      TRAINWITHSHUBHAM_RESOURCES.map((resource) => ({
        nodeId: node.id,
        label: resource.label,
        url: resource.url,
      })),
    ),
  );

  console.log(
    "DevOps roadmap already existed (id " +
      roadmapId +
      "); backfilled resources for " +
      nodesNeedingResources.length +
      " node(s).",
  );
}

async function main() {
  // Self-contained connection (rather than importing ../index) so this
  // standalone script, run via `tsx`, doesn't have to load a module with
  // top-level await through tsx's CJS interop.
  const url = process.env.TURSO_DATABASE_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
  const client = createClient(authToken ? { url, authToken } : { url });
  await client.execute("PRAGMA foreign_keys = ON;");
  const db = drizzle(client);

  const [existing] = await db
    .select({ id: roadmaps.id })
    .from(roadmaps)
    .where(eq(roadmaps.slug, "devops"))
    .limit(1);

  if (existing) {
    await backfillResources(db, existing.id);
    return;
  }

  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  if (!admin) {
    throw new Error(
      "No admin user found — run `npm run db:seed` first to create the admin account.",
    );
  }

  const [roadmap] = await db
    .insert(roadmaps)
    .values({
      slug: "devops",
      title: "DevOps",
      description:
        "From Linux fundamentals to Kubernetes and infrastructure automation.",
      createdBy: admin.id,
    })
    .returning({ id: roadmaps.id });

  const insertedNodes = await db
    .insert(roadmapNodes)
    .values(
      DEVOPS_NODES.map((node, index) => ({
        roadmapId: roadmap.id,
        title: node.title,
        description: node.description,
        positionX: 0,
        positionY: index * 150,
      })),
    )
    .returning({ id: roadmapNodes.id });

  await db.insert(roadmapNodeResources).values(
    insertedNodes.flatMap((node) =>
      TRAINWITHSHUBHAM_RESOURCES.map((resource) => ({
        nodeId: node.id,
        label: resource.label,
        url: resource.url,
      })),
    ),
  );

  console.log("DevOps roadmap seeded with " + DEVOPS_NODES.length + " nodes.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
