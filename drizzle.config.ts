import { defineConfig } from "drizzle-kit";

const isTurso = Boolean(process.env.TURSO_DATABASE_URL);

export default defineConfig(
  isTurso
    ? {
        schema: "./src/db/schema.ts",
        out: "./drizzle",
        dialect: "turso",
        dbCredentials: {
          url: process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN,
        },
      }
    : {
        schema: "./src/db/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: {
          url: "file:local.db",
        },
      },
);
