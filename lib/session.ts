import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth, isAdminEmail } from "./auth";

export type SessionUser = { id: string; name: string; email: string; image?: string | null; isAdmin: boolean };

export async function getSessionUser(): Promise<SessionUser | null> {
  const auth = await getAuth();
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s?.user) return null;
  const u = s.user;
  return { id: u.id, name: u.name, email: u.email, image: u.image, isAdmin: isAdminEmail(u.email) };
}

export async function requireUser(next?: string): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return u;
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser("/admin");
  if (!u.isAdmin) redirect("/app?denied=1");
  return u;
}
