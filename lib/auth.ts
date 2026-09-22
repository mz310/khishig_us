import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb, schema, type DB } from "@/db";

function build(db: DB) {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
    }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    // Email/password exists only for local development (DEV_LOGIN=1); production signs in with Google only.
    emailAndPassword: { enabled: process.env.DEV_LOGIN === "1" && process.env.NODE_ENV !== "production" },
    session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
    plugins: [nextCookies()],
  });
}

type Auth = ReturnType<typeof build>;
const g = globalThis as unknown as { __khishigAuth?: Promise<Auth> };

export function getAuth(): Promise<Auth> {
  if (!g.__khishigAuth) g.__khishigAuth = getDb().then(build);
  return g.__khishigAuth;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}
