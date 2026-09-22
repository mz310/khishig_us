import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

// Neon in production (DATABASE_URL set); an embedded PGlite database under .pglite/ otherwise,
// so local development and tests need no Postgres server.
const g = globalThis as unknown as { __khishigDb?: Promise<DB> };

async function create(): Promise<DB> {
  const url = process.env.DATABASE_URL;
  if (url && /^postgres/.test(url)) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(url), { schema }) as unknown as DB;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dir = process.env.PGLITE_DIR ?? (process.env.NODE_ENV === "test" ? undefined : ".pglite");
  const client = dir ? new PGlite(dir) : new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  await seed(db as unknown as DB);
  return db as unknown as DB;
}

export async function seed(db: DB) {
  const rows = await db.select().from(schema.settings).limit(1);
  if (rows.length === 0) await db.insert(schema.settings).values({ id: 1 });
}

export function getDb(): Promise<DB> {
  if (!g.__khishigDb) g.__khishigDb = create();
  return g.__khishigDb;
}

export { schema };
