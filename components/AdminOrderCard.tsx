"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deliver, markOut } from "@/app/actions/admin";
import { fmtMoney, PAYMENT_LABEL, STATUS_LABEL, type Payment, type Status } from "@/lib/domain";
import type { OrderWithCustomer } from "@/lib/queries";
import { humanDate, slotLabel, type Slot } from "@/lib/time";
import { IconBank, IconCash, IconLater, IconPhone } from "./icons";
import { Fill } from "./WaterButton";

export function AdminOrderCard({ order: o, showDate = false }: { order: OrderWithCustomer; showDate?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [sheet, setSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = o.status as Status;
  const free = o.qtyFree;

  function run(fn: () => Promise<{ error?: string }>) {
    start(async () => { const r = await fn(); if (r.error) setError(r.error); else { setError(null); router.refresh(); } });
  }

  return (
    <article className={`ocard${status === "delivered" || status === "cancelled" ? " is-done" : ""}`}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <Link href={`/admin/orders/${o.id}`} className="oname">{o.customer.name}</Link>
          <div className="muted" style={{ fontSize: 13, marginTop: 3, lineHeight: 1.4 }}>#{o.id} · {o.bag}-р баг, {o.street}, {o.unit}{showDate ? ` · ${humanDate(o.deliveryDate)}, ${slotLabel(o.slot as Slot)}` : ""}</div>
        </div>
        <span className={`pill-s st-${status === "cancelled" ? "new" : status}`} style={status === "cancelled" ? { background: "#EEF0EF", color: "#56605C" } : undefined}>{STATUS_LABEL[status]}</span>
      </div>
      {o.note && <div style={{ fontSize: 12.5, color: "var(--saffron-ink)", background: "var(--saffron-bg)", borderRadius: 10, padding: "7px 10px" }}>{o.note}</div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span className="qty">{o.qtyPaid + free} баллон{free ? ` · ${free} бэлэг` : ""}</span>
          <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>{fmtMoney(o.total)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <a href={`tel:${o.customer.phone}`} className="callbtn" aria-label={`${o.customer.name} руу залгах`}><IconPhone /></a>
          {status === "new" && <button className="wbtn" disabled={pending} onClick={() => run(() => markOut(o.id))} style={{ height: 44, padding: "0 16px", fontSize: 14 }}><Fill />Гарлаа</button>}
          {(status === "out" || status === "new") && <button className="wbtn green" disabled={pending} onClick={() => setSheet(true)} style={{ height: 44, padding: "0 16px", fontSize: 14 }}><Fill />Хүргэсэн</button>}
          {status === "delivered" && o.payment && <span className={`paytag pay-${o.payment}`}>{PAYMENT_LABEL[o.payment as Payment]}</span>}
        </div>
      </div>
      {error && <div className="err">{error}</div>}
      {sheet && (
        <DeliverSheet
          title={`Хүргэсэн · #${o.id} · ${o.customer.name}`}
          total={o.total}
          name={o.customer.name}
          pending={pending}
          onClose={() => setSheet(false)}
          onConfirm={(p) => { setSheet(false); run(() => deliver(o.id, p)); }}
        />
      )}
    </article>
  );
}

export function DeliverSheet({ title, total, name, pending, onClose, onConfirm }: { title: string; total: number; name: string; pending: boolean; onClose: () => void; onConfirm: (p: Payment) => void }) {
  const [pay, setPay] = useState<Payment>("cash");
  const opt = (k: Payment) => `payopt${pay === k ? " on" : ""}${k === "debt" ? " is-debt" : ""}`;
  return (
    <>
      <div className="veil dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Төлбөр">
        <div className="grab" />
        <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", margin: "6px 0 18px" }}>{fmtMoney(total)}</div>
        <div className="muted" style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Төлбөр</div>
        <div className="grid3">
          <button type="button" className={opt("cash")} onClick={() => setPay("cash")}><IconCash size={24} />Бэлэн</button>
          <button type="button" className={opt("transfer")} onClick={() => setPay("transfer")}><IconBank size={24} />Данс</button>
          <button type="button" className={opt("debt")} onClick={() => setPay("debt")}><IconLater size={24} />Дараа төлнө</button>
        </div>
        {pay === "debt" && <div className="note-debt">{name}-ийн өрөнд <b>{fmtMoney(total)}</b> нэмэгдэнэ.</div>}
        <div className="grid2" style={{ marginTop: 18 }}>
          <button type="button" className="btn-plain" style={{ height: 54 }} onClick={onClose}>Болих</button>
          <button type="button" className="wbtn" disabled={pending} style={{ height: 54, fontSize: 15 }} onClick={() => onConfirm(pay)}><Fill />Батлах</button>
        </div>
      </div>
    </>
  );
}
