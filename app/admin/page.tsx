import Link from "next/link";
import { AdminOrderCard } from "@/components/AdminOrderCard";
import { IconPlus } from "@/components/icons";
import { WaterLink } from "@/components/WaterButton";
import { fmtMoney } from "@/lib/domain";
import { ordersForDate, overdueOpenOrders } from "@/lib/queries";
import { humanDate, slotLabel, ubDateStr, weekdayName, type Slot, SLOTS } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Өнөөдөр" };

export default async function AdminToday({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  const today = ubDateStr(new Date());
  const date = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : today;
  const [orders, overdue] = await Promise.all([ordersForDate(date), date === today ? overdueOpenOrders(today) : Promise.resolve([])]);
  const live = orders.filter((o) => o.status !== "cancelled");
  const toDeliver = live.filter((o) => o.status !== "delivered").reduce((a, o) => a + o.qtyPaid + o.qtyFree, 0);
  const revenue = live.filter((o) => o.status === "delivered" && o.payment !== "debt").reduce((a, o) => a + o.total, 0);
  const debt = live.filter((o) => o.status === "delivered" && o.payment === "debt").reduce((a, o) => a + o.total, 0);
  const [y, m, dd] = date.split("-").map(Number);

  return (
    <>
      <header style={{ padding: "20px 16px 6px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "var(--ok)" }}><span className="live" />Шууд шинэчлэгдэнэ</div>
          <h1 style={{ margin: "8px 0 0", fontSize: 26 }}>{date === today ? "Өнөөдөр" : humanDate(date)}</h1>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>{m}-р сарын {dd}, {weekdayName(date)} · {y}</div>
        </div>
        <WaterLink href="/admin/orders/new" style={{ height: 48, padding: "0 16px", fontSize: 14, gap: 8 }}><IconPlus />Захиалга</WaterLink>
      </header>

      <div className="mx" style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <Link href={`/admin?d=${prevDay(date)}`} className="chip">‹ Өмнөх өдөр</Link>
        {date !== today && <Link href="/admin" className="chip on">Өнөөдөр</Link>}
        <Link href={`/admin?d=${nextDay(date)}`} className="chip">Дараах өдөр ›</Link>
      </div>

      <section className="mx grid2" style={{ marginTop: 14 }}>
        <div className="tile deep"><div className="lbl">Хүргэх баллон</div><div className="val">{toDeliver}</div></div>
        <div className="tile card"><div className="lbl">Захиалга</div><div className="val">{live.length}</div></div>
        <div className="tile card"><div className="lbl">Орлого</div><div className="val" style={{ color: "var(--ok-ink)" }}>{fmtMoney(revenue)}</div></div>
        <div className="tile card"><div className="lbl">Өр (энэ өдөр)</div><div className="val" style={{ color: "var(--debt)" }}>{fmtMoney(debt)}</div></div>
      </section>

      {overdue.length > 0 && (
        <>
          <div className="ghead" style={{ color: "var(--debt)" }}><span>Хоцорсон — өмнөх өдрүүдийн нээлттэй захиалга</span><b style={{ color: "var(--debt)" }}>{overdue.length}</b></div>
          {overdue.map((o) => <AdminOrderCard key={o.id} order={o} showDate />)}
        </>
      )}

      {SLOTS.map((slot) => {
        const list = orders.filter((o) => o.slot === slot);
        if (!list.length) return null;
        return (
          <div key={slot}>
            <div className="ghead"><span>{slotLabel(slot as Slot)}</span><b>{list.length}</b></div>
            {list.map((o) => <AdminOrderCard key={o.id} order={o} />)}
          </div>
        );
      })}
      {orders.length === 0 && overdue.length === 0 && (
        <div className="muted" style={{ textAlign: "center", padding: "40px 20px", fontSize: 14 }}>Энэ өдөрт захиалга алга</div>
      )}
    </>
  );
}

function shift(dateStr: string, n: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}
const prevDay = (d: string) => shift(d, -1);
const nextDay = (d: string) => shift(d, 1);
