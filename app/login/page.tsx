import { redirect } from "next/navigation";
import { Bottle } from "@/components/Bottle";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { Lockup } from "@/components/Lockup";
import { fmtPhone } from "@/lib/domain";
import { getSettings } from "@/lib/queries";
import { getSessionUser, safeNext } from "@/lib/session";

export const metadata = { title: "Нэвтрэх" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next);
  const [user, s] = await Promise.all([getSessionUser(), getSettings()]);
  if (user) redirect(target);
  return (
    <main className="phone login">
      <div style={{ display: "flex", justifyContent: "center" }}><Lockup href="/" size={24} /></div>
      <Bottle kind="hero" className="login-jug" phone={fmtPhone(s.phone1)} />
      <h1>Захиалахын тулд нэвтэрнэ үү</h1>
      <p className="lede">Gmail хаягаараа нэг товшилтоор. Бүртгэл, нууц үг шаардлагагүй.</p>
      <GoogleSignIn callbackURL={target} />
      <p className="foot">Утсаар захиалах бол <a href={`tel:${s.phone1}`} style={{ fontWeight: 700 }}>{fmtPhone(s.phone1)}</a></p>
    </main>
  );
}
