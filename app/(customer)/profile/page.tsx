import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { getSettings, myOrders } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Профайл" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const [orders, s] = await Promise.all([myOrders(user.id, 1), getSettings()]);
  const last = orders[0];
  return (
    <>
      <header className="pagehead" style={{ paddingBottom: 6 }}><h1>Профайл</h1></header>
      <section className="card mx" style={{ marginTop: 10, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
        <div className="avatar" style={{ width: 54, height: 54, borderRadius: 18, background: "var(--ice)", color: "var(--brand)", fontSize: 18 }}>{user.name.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{user.name}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
        </div>
      </section>
      {last && (
        <section className="card mx" style={{ marginTop: 12, padding: "6px 18px" }}>
          <div className="row"><span>Утас</span><span>{last.customer.phone}</span></div>
          <div className="row"><span>Хаяг</span><span>{last.bag}-р баг, {last.street}, {last.unit}</span></div>
        </section>
      )}
      <p className="muted mx" style={{ fontSize: 13, marginTop: 14 }}>Утас, хаягаа дараагийн захиалга дээрээ шууд засаж болно.</p>
      {user.isAdmin && <Link href="/admin" className="wbtn mx" style={{ display: "flex", marginTop: 12, height: 50 }}>Эзний хэсэг</Link>}
      <div className="mx" style={{ marginTop: 12 }}><SignOutButton /></div>
      <p className="muted mx" style={{ fontSize: 13, marginTop: 22 }}>Асуулт байвал: <a href={`tel:${s.phone1}`} style={{ fontWeight: 700 }}>{s.phone1}</a></p>
    </>
  );
}
