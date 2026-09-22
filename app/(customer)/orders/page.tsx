import Link from "next/link";
import { WaterLink } from "@/components/WaterButton";
import { fmtMoney, STATUS_LABEL, type Status } from "@/lib/domain";
import { myOrders } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { humanDate, slotLabel, type Slot } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Миний захиалгууд" };

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await myOrders(user.id, 100);
  return (
    <>
      <header className="pagehead" style={{ paddingBottom: 6 }}>
        <div><h1>Миний захиалгууд</h1><div className="sub">{orders.length} захиалга</div></div>
      </header>
      {orders.length === 0 ? (
        <section className="card mx" style={{ marginTop: 10, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Захиалга алга</div>
          <p className="muted" style={{ fontSize: 14, margin: "6px 0 16px" }}>Эхний захиалгаа өгөөд хаалган дээрээ ус хүлээж аваарай.</p>
          <WaterLink href="/order" style={{ height: 48, padding: "0 22px" }}>Захиалга өгөх</WaterLink>
        </section>
      ) : (
        <section className="card mx" style={{ marginTop: 10, padding: "2px 16px" }}>
          {orders.map((o) => {
            const d = new Date(o.deliveryDate + "T00:00:00Z");
            return (
              <Link key={o.id} href={`/orders/${o.id}`} className="li">
                <div className="date"><b>{d.getUTCDate()}</b>{d.getUTCMonth() + 1} сар</div>
                <div className="main">
                  <div className="t">{o.qtyFree ? `${o.qtyPaid} + ${o.qtyFree} бэлэг · ${o.qtyPaid + o.qtyFree} баллон` : `${o.qtyPaid} баллон`}</div>
                  <div className="s">#{o.id} · {humanDate(o.deliveryDate)}, {slotLabel(o.slot as Slot)}</div>
                </div>
                <div className="end">
                  <span className="sum">{fmtMoney(o.total)}</span>
                  <span className={`tag st-${o.status}`}>{STATUS_LABEL[o.status as Status]}</span>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </>
  );
}
