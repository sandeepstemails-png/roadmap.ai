import { createClient } from "@libsql/client";
import { hash } from "bcryptjs";
import { drizzle } from "drizzle-orm/libsql";
import { roadmapEdges, roadmapNodes, roadmaps, users } from "../schema";

async function main() {
  // Self-contained connection (rather than importing ../index) so this
  // standalone script, run via `tsx`, doesn't have to load a module with
  // top-level await through tsx's CJS interop.
  const url = process.env.TURSO_DATABASE_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
  const client = createClient(authToken ? { url, authToken } : { url });
  await client.execute("PRAGMA foreign_keys = ON;");
  const db = drizzle(client);

  const adminPasswordHash = await hash("Admin123!", 10);
  const learnerPasswordHash = await hash("Learner123!", 10);

  const [admin] = await db
    .insert(users)
    .values({
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: "admin",
    })
    .returning({ id: users.id });

  await db.insert(users).values({
    name: "Learner User",
    email: "learner@example.com",
    passwordHash: learnerPasswordHash,
    role: "learner",
  });

  const [roadmap] = await db
    .insert(roadmaps)
    .values({
      slug: "frontend-basics",
      title: "Frontend Basics",
      description: "A short roadmap covering the fundamentals of frontend development.",
      createdBy: admin.id,
    })
    .returning({ id: roadmaps.id });

  const [html, css, js, react] = await db
    .insert(roadmapNodes)
    .values([
      {
        roadmapId: roadmap.id,
        title: "HTML",
        description: "Learn semantic HTML.",
        resourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML",
        positionX: 0,
        positionY: 0,
      },
      {
        roadmapId: roadmap.id,
        title: "CSS",
        description: "Learn layout and styling.",
        resourceUrl: "https://developer.mozilla.org/en-US/docs/Web/CSS",
        positionX: 250,
        positionY: 0,
      },
      {
        roadmapId: roadmap.id,
        title: "JavaScript",
        description: "Learn the language of the web.",
        resourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        positionX: 125,
        positionY: 150,
      },
      {
        roadmapId: roadmap.id,
        title: "React",
        description: "Build interactive UIs.",
        resourceUrl: "https://react.dev",
        positionX: 125,
        positionY: 300,
      },
    ])
    .returning();

  await db.insert(roadmapEdges).values([
    { roadmapId: roadmap.id, sourceNodeId: html.id, targetNodeId: js.id },
    { roadmapId: roadmap.id, sourceNodeId: css.id, targetNodeId: js.id },
    { roadmapId: roadmap.id, sourceNodeId: js.id, targetNodeId: react.id },
  ]);

  console.log("Seed complete.");
  console.log("Admin login:   admin@example.com / Admin123!");
  console.log("Learner login: learner@example.com / Learner123!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
