"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { addPayment, deletePayment } from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/orders";
import type { Order, PaymentRow } from "@/db/schema";
import { fmtMoney, PAYMENT_LABEL, STATUS_LABEL, type Payment, type Status } from "@/lib/domain";
import { ubParts } from "@/lib/time";
import { useSheet } from "./AdminOrderCard";
import { Segmented } from "./AudienceTabs";
import { IconBank, IconCash } from "./icons";
import { Fill } from "./WaterButton";

const DateBox = ({ d }: { d: Date | string }) => { const p = ubParts(new Date(d)); return <div className="date"><b>{String(p.d).padStart(2, "0")}</b>{p.m} сар</div>; };

export function CustomerLedger({ customerId, name, debt, orders, payments }: { customerId: number; name: string; debt: number; orders: Order[]; payments: PaymentRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "tx">("orders");
  const [sheet, setSheet] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(addPayment, {});
  const [delPending, startDel] = useTransition();
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  useEffect(() => { if (state.ok) { setSheet(false); setTab("tx"); router.refresh(); } }, [state, router]);

  return (
    <>
      <button type="button" className="wbtn block" disabled={debt <= 0} onClick={() => setSheet(true)} style={{ height: 52, fontSize: 15, marginTop: 16 }}><Fill />{debt > 0 ? "Төлбөр бүртгэх" : "Өр байхгүй"}</button>
      <div style={{ marginTop: 16 }}>
        <Segmented options={[{ id: "orders", label: "Захиалгууд" }, { id: "tx", label: "Гүйлгээ" }]} value={tab} onChange={setTab} />
      </div>
      <div style={{ marginTop: 6 }}>
        {tab === "orders" ? (
          orders.length === 0 ? <div className="empty" style={{ padding: "24px 0" }}>Захиалга алга</div> :
          orders.slice(0, 40).map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="li">
              <DateBox d={o.deliveryDate + "T00:00:00Z"} />
              <div className="main">
                <div className="t">{o.qtyFree ? `${o.qtyPaid} + ${o.qtyFree} бэлэг · ${o.qtyPaid + o.qtyFree} баллон` : `${o.qtyPaid} баллон`}</div>
                <div className="s">#{o.id}</div>
              </div>
              <div className="end">
                <span className="sum">{fmtMoney(o.total)}</span>
                {o.status === "delivered"
                  ? <span className={`tag pay-${o.payment ?? "cash"}`}>{PAYMENT_LABEL[(o.payment ?? "cash") as Payment]}</span>
                  : <span className={`tag st-${o.status}`}>{STATUS_LABEL[o.status as Status]}</span>}
              </div>
            </Link>
          ))
        ) : (
          payments.length === 0 ? <div className="empty" style={{ padding: "24px 0" }}>Гүйлгээ алга</div> :
          payments.map((p) => (
            <div key={p.id} className="li">
              <DateBox d={p.createdAt} />
              <div className="main">
                <div className="t">{p.orderId != null ? `Захиалга #${p.orderId}` : "Өр төлөлт"}</div>
                <div style={{ marginTop: 5, display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}><span className={`tag pay-${p.method}`}>{PAYMENT_LABEL[p.method as Payment]}</span>{p.note && p.orderId == null && <span className="muted" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.note}</span>}</div>
              </div>
              <div className="end">
                <span className="sum" style={{ fontSize: 15, fontWeight: 800, color: "var(--ok-ink)" }}>+{fmtMoney(p.amount)}</span>
                {p.orderId == null && (confirmDel === p.id
                  ? <span style={{ display: "flex", gap: 12 }}>
                      <button type="button" className="linkbtn" style={{ fontSize: 12, padding: "2px 0" }} onClick={() => setConfirmDel(null)}>Болих</button>
                      <button type="button" className="linkbtn danger" style={{ fontSize: 12, padding: "2px 0" }} disabled={delPending}
                        onClick={() => startDel(async () => { await deletePayment(p.id); setConfirmDel(null); router.refresh(); })}>{delPending ? "Устгаж…" : "Тийм, устга"}</button>
                    </span>
                  : <button type="button" className="linkbtn danger" style={{ fontSize: 12, padding: "2px 0" }} onClick={() => setConfirmDel(p.id)}>Устгах</button>)}
              </div>
            </div>
          ))
        )}
      </div>

      {sheet && <PaymentSheet customerId={customerId} name={name} debt={debt} action={action} pending={pending} error={state.error} onClose={() => setSheet(false)} />}
    </>
  );
}

function PaymentSheet({ customerId, name, debt, action, pending, error, onClose }: { customerId: number; name: string; debt: number; action: (f: FormData) => void; pending: boolean; error?: string; onClose: () => void }) {
  const [amount, setAmount] = useState(String(debt || ""));
  const [method, setMethod] = useState<"cash" | "transfer">("cash");
  const ref = useSheet<HTMLFormElement>(onClose);
  return (
    <>
      <div className="veil dim" onClick={onClose} />
      <form ref={ref} action={action} className="sheet" role="dialog" aria-modal="true" aria-labelledby="payTitle">
        <input type="hidden" name="customerId" value={customerId} />
        <input type="hidden" name="method" value={method} />
        <input name="note" type="hidden" value="Өр төлөлт" />
        <div className="grab" />
        <h2 id="payTitle" style={{ margin: 0, fontSize: 19 }}>Төлбөр бүртгэх</h2>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{name} · өр {fmtMoney(debt)}</div>
        <label htmlFor="amount" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)", margin: "18px 0 6px" }}>Дүн (₮)</label>
        <input id="amount" name="amount" data-autofocus className="inp amount-inp" inputMode="numeric" autoComplete="off" maxLength={9} value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button type="button" className="chip-debt" onClick={() => setAmount(String(debt))}>Бүх өр · {fmtMoney(debt)}</button></div>
        <div className="grid2" style={{ marginTop: 16 }} role="radiogroup" aria-label="Төлбөрийн хэлбэр">
          <button type="button" role="radio" aria-checked={method === "cash"} className={`payopt row${method === "cash" ? " on" : ""}`} onClick={() => setMethod("cash")}><IconCash />Бэлэн</button>
          <button type="button" role="radio" aria-checked={method === "transfer"} className={`payopt row${method === "transfer" ? " on" : ""}`} onClick={() => setMethod("transfer")}><IconBank />Данс</button>
        </div>
        {error && <div className="err" role="alert" style={{ marginTop: 10 }}>{error}</div>}
        <div className="grid2" style={{ marginTop: 18 }}>
          <button type="button" className="btn-plain" style={{ height: 54 }} onClick={onClose}>Болих</button>
          <button type="submit" className="wbtn" disabled={pending || !Number(amount)} style={{ height: 54, fontSize: 15 }}><Fill />{pending ? "Хадгалж байна…" : "Хадгалах"}</button>
        </div>
      </form>
    </>
  );
}
