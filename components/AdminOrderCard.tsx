"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
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
    <article className={`ocard${status === "delivered" || status === "cancelled" ? " is-done" : ""}`} aria-busy={pending || undefined}>
      <div className="top">
        <div style={{ minWidth: 0 }}>
          <Link href={`/admin/orders/${o.id}`} className="oname">{o.customer.name}</Link>
          <div className="addr">#{o.id} · {o.bag}-р баг, {o.street}, {o.unit}{showDate ? ` · ${humanDate(o.deliveryDate)}, ${slotLabel(o.slot as Slot)}` : ""}</div>
        </div>
        <span className={`pill-s st-${status}`}>{STATUS_LABEL[status]}</span>
      </div>
      {o.note && <div className="note">{o.note}</div>}
      <div className="bottom">
        <div>
          <span className="qty">{o.qtyPaid + free} баллон{free ? ` · ${free} бэлэг` : ""}</span>
          <span className="sum">{fmtMoney(o.total)}</span>
        </div>
        <div className="acts">
          <a href={`tel:${o.customer.phone}`} className="callbtn" aria-label={`${o.customer.name} руу залгах`}><IconPhone /></a>
          {status === "new" && <button type="button" className="wbtn" disabled={pending} onClick={() => run(() => markOut(o.id))}><Fill />Гарлаа</button>}
          {(status === "out" || status === "new") && <button type="button" className="wbtn green" disabled={pending} onClick={() => setSheet(true)}><Fill />Хүргэсэн</button>}
          {status === "delivered" && o.payment && <span className={`paytag pay-${o.payment}`}>{PAYMENT_LABEL[o.payment as Payment]}</span>}
        </div>
      </div>
      {error && <div className="err" role="alert">{error}</div>}
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

// Closes on Escape or a tap on the veil; focus starts on the default payment and returns to the page afterwards.
export function useSheet<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close.current(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); before?.focus?.({ preventScroll: true }); };
  }, []);
  return ref;
}

export function DeliverSheet({ title, total, name, pending, onClose, onConfirm }: { title: string; total: number; name: string; pending: boolean; onClose: () => void; onConfirm: (p: Payment) => void }) {
  const [pay, setPay] = useState<Payment>("cash");
  const ref = useSheet<HTMLDivElement>(onClose);
  const opt = (k: Payment) => `payopt${pay === k ? " on" : ""}${k === "debt" ? " is-debt" : ""}`;
  return (
    <>
      <div className="veil dim" onClick={onClose} />
      <div ref={ref} className="sheet" role="dialog" aria-modal="true" aria-label="Төлбөр">
        <div className="grab" />
        <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        <div className="amt">{fmtMoney(total)}</div>
        <div className="muted" style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Төлбөр</div>
        <div className="grid3" role="radiogroup" aria-label="Төлбөрийн хэлбэр">
          <button type="button" role="radio" aria-checked={pay === "cash"} data-autofocus className={opt("cash")} onClick={() => setPay("cash")}><IconCash size={24} />Бэлэн</button>
          <button type="button" role="radio" aria-checked={pay === "transfer"} className={opt("transfer")} onClick={() => setPay("transfer")}><IconBank size={24} />Данс</button>
          <button type="button" role="radio" aria-checked={pay === "debt"} className={opt("debt")} onClick={() => setPay("debt")}><IconLater size={24} />Дараа төлнө</button>
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
