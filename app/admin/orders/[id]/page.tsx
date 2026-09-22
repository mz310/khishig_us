import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminOrderActions } from "@/components/AdminOrderActions";
import { IconBack, IconPhone } from "@/components/icons";
import { fmtMoney, PAYMENT_LABEL, STATUS_LABEL, type Payment, type Status } from "@/lib/domain";
import { getOrder } from "@/lib/queries";
import { humanDate, humanDateTime, slotLabel, type Slot } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getOrder(Number(id));
  if (!o) notFound();
  const status = o.status as Status;
  return (
    <>
      <header className="pagehead">
        <Link href="/admin" className="iconbtn" aria-label="Буцах"><IconBack /></Link>
        <div><h1>Захиалга #{o.id}</h1><div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{humanDateTime(o.createdAt)} · {o.source === "admin" ? "гараар бүртгэсэн" : "вэбээр"}</div></div>
      </header>

      <section className="card mx" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/admin/customers/${o.customerId}`} style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{o.customer.name}</Link>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>{o.customer.phone}</div>
        </div>
        <a href={`tel:${o.customer.phone}`} className="wbtn" aria-label="Залгах" style={{ width: 48, height: 48, flexShrink: 0 }}><IconPhone /></a>
      </section>

      <section className="card mx" style={{ marginTop: 12, padding: "6px 18px" }}>
        <div className="row"><span>Төлөв</span><span><span className={`pill-s st-${status === "cancelled" ? "new" : status}`}>{STATUS_LABEL[status]}</span></span></div>
        {o.payment && <div className="row"><span>Төлбөр</span><span><span className={`tag pay-${o.payment}`}>{PAYMENT_LABEL[o.payment as Payment]}</span></span></div>}
        <div className="row"><span>Тоо</span><span>{o.qtyFree ? `${o.qtyPaid} + ${o.qtyFree} бэлэг = ${o.qtyPaid + o.qtyFree} баллон` : `${o.qtyPaid} баллон`}</span></div>
        <div className="row"><span>Үнэ</span><span>{o.qtyPaid} × {fmtMoney(o.unitPrice)}{o.deliveryFee ? ` + хүргэлт ${fmtMoney(o.deliveryFee)}` : ""}</span></div>
        <div className="row" style={{ alignItems: "center" }}><span>Нийт</span><span style={{ fontSize: 18, fontWeight: 800 }}>{fmtMoney(o.total)}</span></div>
        <div className="row"><span>Хаяг</span><span>{o.bag}-р баг, {o.street}, {o.unit}</span></div>
        {o.note && <div className="row"><span>Тайлбар</span><span>{o.note}</span></div>}
        <div className="row"><span>Хүргэх</span><span>{humanDate(o.deliveryDate)}, {slotLabel(o.slot as Slot)}</span></div>
        {o.outAt && <div className="row"><span>Гарсан</span><span>{humanDateTime(o.outAt)}</span></div>}
        {o.deliveredAt && <div className="row"><span>Хүргэсэн</span><span>{humanDateTime(o.deliveredAt)}</span></div>}
        {o.cancelledAt && <div className="row"><span>Цуцалсан</span><span>{humanDateTime(o.cancelledAt)}</span></div>}
      </section>

      <AdminOrderActions id={o.id} status={status} total={o.total} name={o.customer.name} />
    </>
  );
}
