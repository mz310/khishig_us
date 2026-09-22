import Link from "next/link";
import { fmtMoney } from "@/lib/domain";
import { GRAN_LABEL, GRANS, type Gran } from "@/lib/period";
import type { Report } from "@/lib/report";
import { IconLeft, IconRight } from "./icons";
import { RevenueChart } from "./RevenueChart";

const Arrow = ({ p }: { p: number }) => p > 0
  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
  : p < 0 ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" /></svg> : null;

export function Delta({ now, prev, upIsGood = true, text = "өмнөх үеэс" }: { now: number; prev: number | null | undefined; upIsGood?: boolean; text?: string }) {
  if (!prev) return <span className="delta flat">Харьцуулах өгөгдөл алга</span>;
  const p = Math.round(((now - prev) / prev) * 100);
  const cls = p === 0 ? "flat" : (p > 0) === upIsGood ? "good" : "bad";
  return <span className={`delta ${cls}`}><Arrow p={p} />{p > 0 ? "+" : ""}{p}% {text}</span>;
}

// Granularity switch + previous/next period, driven by the URL so it works without JS.
export function PeriodBar({ base, gran, r, chartMode = false }: { base: string; gran: Gran; r: Report; chartMode?: boolean }) {
  const href = (g: Gran, ref: string) => `${base}?g=${g}&ref=${ref}`;
  return (
    <div className={chartMode ? "filterrow" : "mx"} style={chartMode ? undefined : { display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
      <div className="segbox white" style={{ position: "relative" }}>
        {GRANS.map((g) => <Link key={g} href={href(g, r.today)} className={`seg${g === gran ? " on" : ""}`} style={g === gran ? { background: "var(--brand)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" } : { display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{GRAN_LABEL[g]}</Link>)}
      </div>
      <div className="perbar">
        <Link href={href(gran, r.prevRef)} className="navbtn" aria-label="Өмнөх" aria-disabled={!r.canPrev} style={!r.canPrev ? { opacity: .35, pointerEvents: "none" } : undefined}><IconLeft /></Link>
        <div className="plabel" aria-live="polite">{r.period.label}{r.current ? " · одоо" : ""}</div>
        <Link href={href(gran, r.nextRef)} className="navbtn" aria-label="Дараах" aria-disabled={!r.canNext} style={!r.canNext ? { opacity: .35, pointerEvents: "none" } : undefined}><IconRight /></Link>
      </div>
    </div>
  );
}

export function RevenueSummary({ r, hero = 40 }: { r: Report; hero?: number }) {
  return (
    <>
      <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>Орлого</div>
      <div className="hero-fig" style={{ fontSize: hero, marginTop: 6 }}>{fmtMoney(r.sums.total)}</div>
      <div style={{ marginTop: 8 }}>{r.delta ? <Delta now={r.sums.total} prev={r.prev.sums.total} text={r.delta.text} /> : <span className="delta flat">Харьцуулах өмнөх өгөгдөл алга</span>}</div>
      <div className="legend" style={{ marginTop: 14 }}>
        <span><i style={{ background: "#2F7FC1" }} />Данс <b>{fmtMoney(r.sums.transfer)}</b></span>
        <span><i style={{ background: "#E39B2E" }} />Бэлэн <b>{fmtMoney(r.sums.cash)}</b></span>
      </div>
    </>
  );
}

export function Kpis({ r, tall = false }: { r: Report; tall?: boolean }) {
  const cls = tall ? "kpi tall" : "kpi";
  return (
    <>
      <div className={cls}><div className="l">Захиалга</div><div className="v">{r.orders.orders.toLocaleString("en-US")}</div><div className="delta"><Delta now={r.orders.orders} prev={r.prev.orders.orders} /></div></div>
      <div className={cls}><div className="l">Хүргэсэн баллон</div><div className="v">{r.orders.bottles.toLocaleString("en-US")}</div><div className="delta"><Delta now={r.orders.bottles} prev={r.prev.orders.bottles} /></div></div>
      <div className={cls}><div className="l">Шинэ өр</div><div className="v" style={{ color: "var(--debt)" }}>{fmtMoney(r.orders.newDebt)}</div><div className="delta"><Delta now={r.orders.newDebt} prev={r.prev.orders.newDebt} upIsGood={false} /></div></div>
      <div className={cls}><div className="l">Өр төлөлт</div><div className="v" style={{ color: "var(--ok-ink)" }}>{fmtMoney(r.sums.repaid)}</div><div className="delta"><Delta now={r.sums.repaid} prev={r.prev.sums.repaid} /></div></div>
    </>
  );
}

export function ChartWithTable({ r, height }: { r: Report; height?: number }) {
  return (
    <>
      <RevenueChart buckets={r.buckets} height={height} label={`Орлого, ${r.period.label}`} />
      <details style={{ marginTop: 8 }}>
        <summary className="linkbtn" style={{ cursor: "pointer", listStyle: "none" }}>Хүснэгтээр харах</summary>
        <table className="vtable">
          <thead><tr><th>Хугацаа</th><th>Данс</th><th>Бэлэн</th><th>Нийт</th></tr></thead>
          <tbody>{r.buckets.filter((b) => !b.future).map((b) => <tr key={b.start}><td>{b.title}</td><td>{fmtMoney(b.transfer)}</td><td>{fmtMoney(b.cash)}</td><td>{fmtMoney(b.total)}</td></tr>)}</tbody>
        </table>
      </details>
    </>
  );
}
