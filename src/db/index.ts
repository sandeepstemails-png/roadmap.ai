import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient(
  authToken ? { url, authToken } : { url },
);

// SQLite/libSQL disable foreign-key enforcement per connection by default —
// without this, the ON DELETE CASCADE constraints in schema.ts are inert.
await client.execute("PRAGMA foreign_keys = ON;");

export const db = drizzle(client, { schema });
