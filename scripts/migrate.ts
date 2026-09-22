// Runs pending SQL migrations. Used at build time on Vercel (DATABASE_URL set) and locally.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "../db/schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url || !/^postgres/.test(url)) {
    console.log("DATABASE_URL not set: skipping migration (PGlite migrates itself on first use).");
    return;
  }
  const db = drizzle(neon(url), { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  const rows = await db.select().from(schema.settings).limit(1);
  if (rows.length === 0) await db.insert(schema.settings).values({ id: 1 });
  console.log("Migrations applied.");
}

main().catch((e) => { console.error(e); process.exit(1); });
