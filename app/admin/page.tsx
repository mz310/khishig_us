import Link from "next/link";
import { AdminOrderCard } from "@/components/AdminOrderCard";
import { IconLeft, IconPlus, IconRight } from "@/components/icons";
import { WaterLink } from "@/components/WaterButton";
import { fmtMoney } from "@/lib/domain";
import { ordersForDate, overdueOpenOrders } from "@/lib/queries";
import { addDays, humanDate, slotLabel, ubDateStr, weekdayName, type Slot, SLOTS } from "@/lib/time";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Өнөөдөр" };

export default async function AdminToday({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  await requireAdmin();
  const { d } = await searchParams;
  const today = ubDateStr(new Date());
  const date = d && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)) ? d : today;
  const [orders, overdue] = await Promise.all([ordersForDate(date), date === today ? overdueOpenOrders(today) : Promise.resolve([])]);
  const live = orders.filter((o) => o.status !== "cancelled");
  const toDeliver = live.filter((o) => o.status !== "delivered").reduce((a, o) => a + o.qtyPaid + o.qtyFree, 0);
  const revenue = live.filter((o) => o.status === "delivered" && o.payment !== "debt").reduce((a, o) => a + o.total, 0);
  const debt = live.filter((o) => o.status === "delivered" && o.payment === "debt").reduce((a, o) => a + o.total, 0);
  const [y, m, dd] = date.split("-").map(Number);

  return (
    <>
      <header className="topbar" style={{ alignItems: "flex-start", padding: "20px 16px 6px 20px" }}>
        <div style={{ minWidth: 0 }}>
          <div className="livehead"><span className="live" />Шууд шинэчлэгдэнэ</div>
          <h1 style={{ margin: "8px 0 0", fontSize: 26, lineHeight: 1.15 }}>{date === today ? "Өнөөдөр" : humanDate(date)}</h1>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>{m}-р сарын {dd}, {weekdayName(date)} · {y}</div>
        </div>
        <WaterLink href="/admin/orders/new" style={{ height: 48, padding: "0 16px", fontSize: 14, gap: 8, flexShrink: 0 }}><IconPlus />Захиалга</WaterLink>
      </header>

      <nav className="mx chips" style={{ marginTop: 10 }} aria-label="Өдөр сонгох">
        <Link href={`/admin?d=${addDays(date, -1)}`} className="chip" style={{ gap: 4, paddingLeft: 10 }}><IconLeft size={15} />Өмнөх өдөр</Link>
        {date !== today && <Link href="/admin" className="chip on">Өнөөдөр</Link>}
        <Link href={`/admin?d=${addDays(date, 1)}`} className="chip" style={{ gap: 4, paddingRight: 10 }}>Дараах өдөр<IconRight size={15} /></Link>
      </nav>

      <section className="mx tiles" style={{ marginTop: 14 }}>
        <div className="tile deep"><div className="lbl">Хүргэх баллон</div><div className="val">{toDeliver}</div></div>
        <div className="tile card"><div className="lbl">Захиалга</div><div className="val">{live.length}</div></div>
        <div className="tile card"><div className="lbl">Орлого</div><div className="val" style={{ color: "var(--ok-ink)" }}>{fmtMoney(revenue)}</div></div>
        <div className="tile card"><div className="lbl">Өр (энэ өдөр)</div><div className="val" style={{ color: "var(--debt)" }}>{fmtMoney(debt)}</div></div>
      </section>

      {overdue.length > 0 && (
        <>
          <div className="ghead late"><span>Хоцорсон — өмнөх өдрүүдийн нээлттэй захиалга</span><b>{overdue.length}</b></div>
          <div className="olist">{overdue.map((o) => <AdminOrderCard key={o.id} order={o} showDate />)}</div>
        </>
      )}

      {SLOTS.map((slot) => {
        const list = orders.filter((o) => o.slot === slot);
        if (!list.length) return null;
        return (
          <div key={slot}>
            <div className="ghead"><span>{slotLabel(slot as Slot)}</span><b>{list.length}</b></div>
            <div className="olist">{list.map((o) => <AdminOrderCard key={o.id} order={o} />)}</div>
          </div>
        );
      })}
      {orders.length === 0 && overdue.length === 0 && <div className="empty">Энэ өдөрт захиалга алга</div>}
    </>
  );
}
