import Link from "next/link";
import { ChartWithTable, Kpis, PeriodBar, RevenueSummary } from "@/components/ReportBlocks";
import { WaterLink } from "@/components/WaterButton";
import { fmtMoney, PAYMENT_LABEL } from "@/lib/domain";
import { GRANS, type Gran } from "@/lib/period";
import { debtSummary } from "@/lib/queries";
import { buildReport } from "@/lib/report";
import { humanDate, ubDateStr, ubTime } from "@/lib/time";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Тайлан" };

const PALETTE = [["#E3EFF6", "#12314A"], ["#FBF1E0", "#6E4A0F"], ["#E2F1EA", "#1E5F45"], ["#ECEAF5", "#3E3A78"], ["#FAECE6", "#86341A"]];
export const avatarStyle = (id: number) => ({ background: PALETTE[id % PALETTE.length][0], color: PALETTE[id % PALETTE.length][1] });
export const initials = (name: string) => name.split(" ").map((s) => s.charAt(0)).join("").slice(0, 2).toUpperCase();

export default async function Reports({ searchParams }: { searchParams: Promise<{ g?: string; ref?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const gran: Gran = GRANS.includes(sp.g as Gran) ? (sp.g as Gran) : "month";
  const today = ubDateStr(new Date());
  const ref = sp.ref && /^\d{4}-\d{2}-\d{2}$/.test(sp.ref) && sp.ref <= today ? sp.ref : today;
  const [r, debt] = await Promise.all([buildReport(gran, ref), debtSummary()]);
  const recent = r.payments.slice(0, 12);

  return (
    <div className="wide-wrap">
      <header className="dhead">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: "var(--ok)" }}><span className="live" />Шууд шинэчлэгдэнэ</div>
          <h1 style={{ margin: "8px 0 0", fontSize: 30 }}>Тайлан</h1>
          <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>Орлого, гүйлгээ, хэрэглэгчийн өр</div>
        </div>
        <WaterLink href="/admin/orders/new" style={{ height: 48, padding: "0 20px", fontSize: 14 }}>Захиалга нэмэх</WaterLink>
      </header>
      <PeriodBar base="/admin/reports" gran={gran} r={r} chartMode />
      <div className="dgrid">
        <section className="panel span-4"><RevenueSummary r={r} hero={46} /></section>
        <div className="span-8" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}><Kpis r={r} tall /></div>
        <section className="panel span-12">
          <h3>Орлого хугацаагаар</h3>
          <div style={{ marginTop: 14 }}><ChartWithTable r={r} height={300} /></div>
        </section>
        <section className="panel span-8">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <h3>Сүүлийн гүйлгээнүүд <span className="muted" style={{ fontWeight: 500, fontSize: 13, marginLeft: 6 }}>{r.payments.length} гүйлгээ</span></h3>
            <Link href={`/admin/transactions?g=${gran}&ref=${ref}`} style={{ fontSize: 13, fontWeight: 600 }}>Бүгдийг харах</Link>
          </div>
          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table className="dtable">
              <thead><tr><th>Огноо</th><th>Хэрэглэгч</th><th>Утга</th><th>Хэлбэр</th><th className="num">Дүн</th></tr></thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{humanDate(ubDateStr(p.createdAt))} · {ubTime(p.createdAt)}</td>
                    <td><Link href={`/admin/customers/${p.customerId}`} style={{ color: "var(--ink)", fontWeight: 600 }}>{p.customer.name}</Link></td>
                    <td className="muted">{p.orderId != null ? `Захиалга #${p.orderId}` : "Өр төлөлт"}</td>
                    <td><span className={`tag pay-${p.method}`}>{PAYMENT_LABEL[p.method as "cash" | "transfer"]}</span></td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmtMoney(p.amount)}</td>
                  </tr>
                ))}
                {recent.length === 0 && <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: 30 }}>Гүйлгээ олдсонгүй</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel span-4">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <h3>Өртэй хэрэглэгчид</h3>
            <Link href="/admin/customers?sort=debt" style={{ fontSize: 13, fontWeight: 600 }}>Бүгдийг харах</Link>
          </div>
          <div className="hero-fig" style={{ fontSize: 30, marginTop: 12, color: "var(--debt)" }}>{fmtMoney(debt.total)}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{debt.count} хэрэглэгч · нийт авлага</div>
          <div style={{ marginTop: 8 }}>
            {debt.top.map((c) => (
              <Link key={c.customer.id} href={`/admin/customers/${c.customer.id}`} className="custrow">
                <div className="avatar" style={{ width: 38, height: 38, fontSize: 12, ...avatarStyle(c.customer.id) }}>{initials(c.customer.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div className="cname" style={{ fontSize: 14 }}>{c.customer.name}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{c.customer.phone}</div></div>
                <span className="debtbadge">{fmtMoney(c.debt)}</span>
              </Link>
            ))}
            {debt.top.length === 0 && <div className="muted" style={{ fontSize: 13, marginTop: 10 }}>Өртэй хэрэглэгч алга</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
