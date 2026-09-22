import { redirect } from "next/navigation";
import { Bottle } from "@/components/Bottle";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { Lockup } from "@/components/Lockup";
import { getSessionUser } from "@/lib/session";

export const metadata = { title: "Нэвтрэх" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = next && next.startsWith("/") ? next : "/app";
  if (await getSessionUser()) redirect(target);
  return (
    <main className="phone" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 24px 40px", minHeight: "100dvh" }}>
      <div style={{ display: "flex", justifyContent: "center" }}><Lockup href="/" size={24} /></div>
      <Bottle kind="hero" className="login-jug" />
      <h1 style={{ margin: "8px 0 6px", fontSize: 26, textAlign: "center" }}>Захиалахын тулд нэвтэрнэ үү</h1>
      <p className="muted" style={{ margin: "0 0 22px", textAlign: "center", fontSize: 14.5 }}>Gmail хаягаараа нэг товшилтоор. Бүртгэл, нууц үг шаардлагагүй.</p>
      <GoogleSignIn callbackURL={target} />
      <p className="muted" style={{ marginTop: 18, textAlign: "center", fontSize: 13 }}>Утсаар захиалах бол <a href="tel:88027971" style={{ fontWeight: 700 }}>8802 7971</a></p>
    </main>
  );
}
