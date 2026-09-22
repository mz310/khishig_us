import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerLedger } from "@/components/CustomerLedger";
import { IconBack, IconPhone } from "@/components/icons";
import { fmtMoney } from "@/lib/domain";
import { customerDetail } from "@/lib/queries";
import { avatarStyle, initials } from "../../reports/page";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const d = await customerDetail(Number(id));
  if (!d) notFound();
  const c = d.customer;
  const pct = d.delivered ? Math.min(100, Math.round((d.paid / d.delivered) * 100)) : 100;
  return (
    <>
      <header className="pagehead">
        <Link href="/admin/customers" className="iconbtn" aria-label="Буцах"><IconBack /></Link>
        <h1>Хэрэглэгч</h1>
      </header>
      <section className="card mx" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
        <div className="avatar" style={{ width: 54, height: 54, borderRadius: 18, fontSize: 17, ...avatarStyle(c.id) }}>{initials(c.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{c.name}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>{c.phone} · {c.bag}-р баг, {c.street}, {c.unit}</div>
          {c.note && <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{c.note}</div>}
        </div>
        <a href={`tel:${c.phone}`} className="wbtn" aria-label="Залгах" style={{ width: 48, height: 48, flexShrink: 0 }}><IconPhone /></a>
      </section>

      <section className="card mx" style={{ marginTop: 14, padding: "20px 18px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>Үлдэгдэл өр</div>
            <div className="hero-fig" style={{ fontSize: 34, marginTop: 6, color: d.debt > 0 ? "var(--debt)" : "var(--ok-ink)" }}>{fmtMoney(d.debt)}</div>
          </div>
          <div className="muted" style={{ textAlign: "right", fontSize: 12, lineHeight: 1.6 }}>Хүргэсэн <b style={{ color: "var(--ink)" }}>{fmtMoney(d.delivered)}</b><br />Төлсөн <b style={{ color: "var(--ok-ink)" }}>{fmtMoney(d.paid)}</b></div>
        </div>
        <div className="paid-track" role="meter" aria-label="Төлсөн хувь" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><div className="paid-fill" style={{ width: `${pct}%` }} /></div>
        <CustomerLedger customerId={c.id} name={c.name} debt={d.debt} orders={d.orders} payments={d.payments} />
      </section>

      <section className="mx" style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <div className="mini"><div className="v">{d.count}</div><div className="l">Захиалга</div></div>
        <div className="mini"><div className="v">{d.bottles}</div><div className="l">Баллон</div></div>
        <div className="mini"><div className="v" style={{ color: "var(--saffron-ink)" }}>{d.gifts}</div><div className="l">Бэлэг</div></div>
      </section>
    </>
  );
}
