"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { addPayment, deletePayment } from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/orders";
import type { Order, PaymentRow } from "@/db/schema";
import { fmtMoney, PAYMENT_LABEL, STATUS_LABEL, type Payment, type Status } from "@/lib/domain";
import { ubParts } from "@/lib/time";
import { Segmented } from "./AudienceTabs";
import { IconBank, IconCash } from "./icons";
import { Fill } from "./WaterButton";

const TAG: Record<string, string> = { new: "tag new", out: "tag new", cancelled: "tag cancelled", debt: "tag pay-debt", cash: "tag pay-cash", transfer: "tag pay-transfer" };
const DateBox = ({ d }: { d: Date | string }) => { const p = ubParts(new Date(d)); return <div className="date"><b>{String(p.d).padStart(2, "0")}</b>{p.m} сар</div>; };

export function CustomerLedger({ customerId, name, debt, orders, payments }: { customerId: number; name: string; debt: number; orders: Order[]; payments: PaymentRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "tx">("orders");
  const [sheet, setSheet] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(addPayment, {});
  const [amount, setAmount] = useState(String(debt || ""));
  const [method, setMethod] = useState<"cash" | "transfer">("cash");
  const [delPending, startDel] = useTransition();
  useEffect(() => { if (state.ok) { setSheet(false); setTab("tx"); router.refresh(); } }, [state, router]);

  return (
    <>
      <button type="button" className="wbtn" disabled={debt <= 0} onClick={() => { setAmount(String(debt)); setSheet(true); }} style={{ width: "100%", height: 52, fontSize: 15, marginTop: 16 }}><Fill />Төлбөр бүртгэх</button>
      <div style={{ marginTop: 16 }}>
        <Segmented options={[{ id: "orders", label: "Захиалгууд" }, { id: "tx", label: "Гүйлгээ" }]} value={tab} onChange={setTab} />
      </div>
      <div style={{ marginTop: 6 }}>
        {tab === "orders" ? (
          orders.length === 0 ? <div className="muted" style={{ textAlign: "center", padding: "24px 0", fontSize: 14 }}>Захиалга алга</div> :
          orders.slice(0, 40).map((o) => {
            const key = o.status === "delivered" ? (o.payment ?? "cash") : o.status;
            return (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="li" style={{ color: "inherit" }}>
                <DateBox d={o.deliveryDate + "T00:00:00Z"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{o.qtyFree ? `${o.qtyPaid} + ${o.qtyFree} бэлэг · ${o.qtyPaid + o.qtyFree} баллон` : `${o.qtyPaid} баллон`}</div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>#{o.id}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{fmtMoney(o.total)}</span>
                  <span className={TAG[key]}>{o.status === "delivered" ? PAYMENT_LABEL[(o.payment ?? "cash") as Payment] : STATUS_LABEL[o.status as Status]}</span>
                </div>
              </Link>
            );
          })
        ) : (
          payments.length === 0 ? <div className="muted" style={{ textAlign: "center", padding: "24px 0", fontSize: 14 }}>Гүйлгээ алга</div> :
          payments.map((p) => (
            <div key={p.id} className="li">
              <DateBox d={p.createdAt} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{p.orderId != null ? `Захиалга #${p.orderId}` : "Өр төлөлт"}</div>
                <div style={{ marginTop: 5, display: "flex", gap: 8, alignItems: "center" }}><span className={`tag pay-${p.method}`}>{PAYMENT_LABEL[p.method as Payment]}</span>{p.note && p.orderId == null && <span className="muted" style={{ fontSize: 12 }}>{p.note}</span>}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ok-ink)" }} className="num">+{fmtMoney(p.amount)}</div>
                {p.orderId == null && <button type="button" className="linkbtn" style={{ color: "var(--debt)", fontSize: 12, padding: "4px 0" }} disabled={delPending}
                  onClick={() => { if (confirm("Энэ гүйлгээг устгах уу?")) startDel(async () => { await deletePayment(p.id); router.refresh(); }); }}>Устгах</button>}
              </div>
            </div>
          ))
        )}
      </div>

      {sheet && (
        <>
          <div className="veil dim" onClick={() => setSheet(false)} />
          <form action={action} className="sheet" role="dialog" aria-modal="true" aria-labelledby="payTitle">
            <input type="hidden" name="customerId" value={customerId} />
            <input type="hidden" name="method" value={method} />
            <div className="grab" />
            <h2 id="payTitle" style={{ margin: 0, fontSize: 19 }}>Төлбөр бүртгэх</h2>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{name} · өр {fmtMoney(debt)}</div>
            <label htmlFor="amount" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)", margin: "18px 0 6px" }}>Дүн (₮)</label>
            <input id="amount" name="amount" className="inp amount-inp" inputMode="numeric" autoComplete="off" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button type="button" className="chip-debt" onClick={() => setAmount(String(debt))}>Бүх өр · {fmtMoney(debt)}</button></div>
            <div className="grid2" style={{ marginTop: 16 }}>
              <button type="button" className={`payopt row${method === "cash" ? " on" : ""}`} onClick={() => setMethod("cash")}><IconCash />Бэлэн</button>
              <button type="button" className={`payopt row${method === "transfer" ? " on" : ""}`} onClick={() => setMethod("transfer")}><IconBank />Данс</button>
            </div>
            <input name="note" type="hidden" value="Өр төлөлт" />
            {state.error && <div className="err" style={{ marginTop: 10 }}>{state.error}</div>}
            <div className="grid2" style={{ marginTop: 18 }}>
              <button type="button" className="btn-plain" style={{ height: 54 }} onClick={() => setSheet(false)}>Болих</button>
              <button type="submit" className="wbtn" disabled={pending || !Number(amount)} style={{ height: 54, fontSize: 15 }}><Fill />{pending ? "Хадгалж байна…" : "Хадгалах"}</button>
            </div>
          </form>
        </>
      )}
    </>
  );
}
