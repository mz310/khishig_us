"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelByAdmin, deliver, markOut, reopenCancelled, revertDelivered } from "@/app/actions/admin";
import type { Payment, Status } from "@/lib/domain";
import { DeliverSheet } from "./AdminOrderCard";
import { Fill } from "./WaterButton";

export function AdminOrderActions({ id, status, total, name }: { id: number; status: Status; total: number; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [sheet, setSheet] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<{ error?: string }>) => start(async () => { const r = await fn(); if (r.error) setError(r.error); else { setError(null); setConfirmCancel(false); router.refresh(); } });

  return (
    <section className="mx" style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      {status === "new" && <button className="wbtn" disabled={pending} onClick={() => run(() => markOut(id))} style={{ height: 52, fontSize: 15 }}><Fill />Хүргэлтэнд гарлаа</button>}
      {(status === "new" || status === "out") && <button className="wbtn green" disabled={pending} onClick={() => setSheet(true)} style={{ height: 52, fontSize: 15 }}><Fill />Хүргэсэн, төлбөр авах</button>}
      {(status === "new" || status === "out") && (
        confirmCancel
          ? <div className="grid2"><button className="btn-plain" style={{ height: 52 }} onClick={() => setConfirmCancel(false)}>Болих</button><button className="ghost-danger" disabled={pending} onClick={() => run(() => cancelByAdmin(id))}>Тийм, цуцал</button></div>
          : <button className="ghost-danger" onClick={() => setConfirmCancel(true)}>Захиалгыг цуцлах</button>
      )}
      {status === "delivered" && <button className="btn-plain" style={{ height: 52 }} disabled={pending} onClick={() => run(() => revertDelivered(id))}>Андуурч хүргэсэн гэж тэмдэглэсэн — буцаах</button>}
      {status === "cancelled" && <button className="btn-plain" style={{ height: 52 }} disabled={pending} onClick={() => run(() => reopenCancelled(id))}>Цуцлалтыг буцааж, шинэ болгох</button>}
      {error && <div className="err">{error}</div>}
      {sheet && <DeliverSheet title={`Хүргэсэн · #${id} · ${name}`} total={total} name={name} pending={pending} onClose={() => setSheet(false)} onConfirm={(p: Payment) => { setSheet(false); run(() => deliver(id, p)); }} />}
    </section>
  );
}
