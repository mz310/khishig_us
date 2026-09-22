import Link from "next/link";
import { IconBank, IconCash } from "@/components/icons";
import { ChartWithTable, Kpis, PeriodBar, RevenueSummary } from "@/components/ReportBlocks";
import { fmtMoney, PAYMENT_LABEL } from "@/lib/domain";
import { GRANS, type Gran } from "@/lib/period";
import { buildReport } from "@/lib/report";
import { humanDate, ubDateStr, ubTime } from "@/lib/time";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Гүйлгээ" };

type Filter = "all" | "cash" | "transfer" | "debt";

export default async function Transactions({ searchParams }: { searchParams: Promise<{ g?: string; ref?: string; f?: string; q?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const gran: Gran = GRANS.includes(sp.g as Gran) ? (sp.g as Gran) : "month";
  const today = ubDateStr(new Date());
  const ref = sp.ref && /^\d{4}-\d{2}-\d{2}$/.test(sp.ref) && sp.ref <= today ? sp.ref : today;
  const f: Filter = (["cash", "transfer", "debt"] as Filter[]).includes(sp.f as Filter) ? (sp.f as Filter) : "all";
  const q = (sp.q ?? "").trim().slice(0, 60).toLowerCase();
  const r = await buildReport(gran, ref);

  const list = r.payments.filter((p) => {
    if (f === "debt" && p.orderId != null) return false;
    if ((f === "cash" || f === "transfer") && p.method !== f) return false;
    return !q || p.customer.name.toLowerCase().includes(q) || p.customer.phone.includes(q);
  });
  const groups: { day: string; sum: number; items: typeof list }[] = [];
  for (const p of list) {
    const day = ubDateStr(p.createdAt);
    let g = groups[groups.length - 1];
    if (!g || g.day !== day) { g = { day, sum: 0, items: [] }; groups.push(g); }
    g.sum += p.amount; g.items.push(p);
  }
  const chip = (id: Filter, label: string) => <Link key={id} href={`/admin/transactions?g=${gran}&ref=${ref}&f=${id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`chip${f === id ? " on" : ""}`}>{label}</Link>;

  return (
    <>
      <header className="pagehead" style={{ paddingBottom: 6 }}><div><h1>Гүйлгээ</h1><div className="sub">Орлого ба төлбөрүүд · <Link href="/admin/reports">дэлгэрэнгүй тайлан</Link></div></div></header>
      <PeriodBar base="/admin/transactions" gran={gran} r={r} />
      <section className="card mx" style={{ marginTop: 12, padding: "18px 16px 12px" }}>
        <RevenueSummary r={r} />
        <div style={{ marginTop: 14 }}><ChartWithTable r={r} height={200} /></div>
      </section>
      <section className="mx kpis" style={{ marginTop: 12 }}><Kpis r={r} /></section>

      <div style={{ padding: "24px 20px 10px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16.5 }}>Гүйлгээнүүд</h2>
        <span className="muted" style={{ fontSize: 13 }}>{list.length} гүйлгээ</span>
      </div>
      <div className="mx stack" style={{ gap: 10 }}>
        <nav className="chips" aria-label="Төрлөөр шүүх">{chip("all", "Бүгд")}{chip("cash", "Бэлэн")}{chip("transfer", "Данс")}{chip("debt", "Өр төлөлт")}</nav>
        <form className="search" action="/admin/transactions" role="search">
          <input type="hidden" name="g" value={gran} /><input type="hidden" name="ref" value={ref} /><input type="hidden" name="f" value={f} />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
          <input className="inp" name="q" type="search" maxLength={60} defaultValue={sp.q ?? ""} placeholder="Нэр эсвэл утасны дугаар" aria-label="Хайх" />
        </form>
      </div>
      <section className="card mx" style={{ marginTop: 12, padding: "0 16px 6px" }}>
        {groups.length === 0 && <div className="empty" style={{ padding: "30px 0" }}>Гүйлгээ олдсонгүй</div>}
        {groups.map((g) => (
          <div key={g.day}>
            <div className="dayhead"><span>{humanDate(g.day)}</span><b>{fmtMoney(g.sum)}</b></div>
            {g.items.map((p) => (
              <Link key={p.id} href={`/admin/customers/${p.customerId}`} className="txrow">
                <div className={`txicon ${p.method}`}>{p.method === "cash" ? <IconCash size={19} /> : <IconBank size={19} />}</div>
                <div className="main">
                  <div className="t">{p.customer.name}</div>
                  <div className="s">{p.orderId != null ? `Захиалга #${p.orderId}` : "Өр төлөлт"} · {ubTime(p.createdAt)}</div>
                </div>
                <div className="end">
                  <div style={{ fontWeight: 800 }} className="num">+{fmtMoney(p.amount)}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{PAYMENT_LABEL[p.method as "cash" | "transfer"]}</div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </section>
    </>
  );
}
