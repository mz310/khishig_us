"use client";
import { useActionState, useState } from "react";
import { createOrderAdmin, lookupCustomer } from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/orders";
import { fmtMoney, freeBottles, MAX_QTY, MIN_QTY, normalizePhone, type Settings } from "@/lib/domain";
import { SLOTS, slotLabel, type Slot } from "@/lib/time";
import { Segmented } from "./AudienceTabs";
import { IconChevron, IconMinus, IconPlus } from "./icons";
import { Fill } from "./WaterButton";

export function AdminOrderForm({ settings: s, today, tomorrow }: { settings: Settings; today: string; tomorrow: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createOrderAdmin, {});
  const [qty, setQty] = useState(2);
  const [day, setDay] = useState<"today" | "tomorrow">("today");
  const [slot, setSlot] = useState<Slot>("asap");
  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<null | boolean>(null);
  const [c, setC] = useState({ name: "", bag: 1, street: "", unit: "", note: "" });
  const free = freeBottles(qty, s);
  const slots = day === "today" ? SLOTS : SLOTS.filter((x) => x !== "asap");

  async function onPhoneBlur() {
    const p = normalizePhone(phone);
    if (!p) return;
    const r = await lookupCustomer(p);
    setFound(!!r);
    if (r) setC({ name: r.name, bag: r.bag, street: r.street, unit: r.unit, note: r.note });
  }

  return (
    <form action={action} style={{ paddingBottom: 40 }}>
      <input type="hidden" name="qty" value={qty} />
      <input type="hidden" name="date" value={day === "today" ? today : tomorrow} />
      <input type="hidden" name="slot" value={slot} />

      <div className="sec">Хэрэглэгч</div>
      <section className="card mx" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="field">
          <label htmlFor="phone">Утасны дугаар</label>
          <input id="phone" name="phone" className="inp" inputMode="numeric" value={phone} onChange={(e) => { setPhone(e.target.value); setFound(null); }} onBlur={onPhoneBlur} placeholder="8 оронтой дугаар" required />
          {found === true && <div style={{ fontSize: 12.5, color: "var(--ok-ink)", fontWeight: 600 }}>Бүртгэлтэй хэрэглэгч — хаяг нь бөглөгдлөө</div>}
          {found === false && <div className="muted" style={{ fontSize: 12.5 }}>Шинэ хэрэглэгч</div>}
        </div>
        <div className="field"><label htmlFor="name">Нэр</label><input id="name" name="name" className="inp" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} required /></div>
        <div className="field">
          <label htmlFor="bag">Баг</label>
          <div className="selwrap">
            <select id="bag" name="bag" className="inp" value={c.bag} onChange={(e) => setC({ ...c, bag: Number(e.target.value) })}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}-р баг</option>)}
            </select>
            <IconChevron />
          </div>
        </div>
        <div className="grid2">
          <div className="field"><label htmlFor="street">Байр / гудамж</label><input id="street" name="street" className="inp" value={c.street} onChange={(e) => setC({ ...c, street: e.target.value })} required /></div>
          <div className="field"><label htmlFor="unit">Тоот / хашаа</label><input id="unit" name="unit" className="inp" value={c.unit} onChange={(e) => setC({ ...c, unit: e.target.value })} required /></div>
        </div>
        <div className="field"><label htmlFor="note">Тайлбар</label><textarea id="note" name="note" className="inp" value={c.note} onChange={(e) => setC({ ...c, note: e.target.value })} /></div>
      </section>

      <div className="sec">Тоо</div>
      <section className="card mx" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div><div style={{ fontSize: 15, fontWeight: 700 }}>{qty} баллон{free ? ` + ${free} бэлэг` : ""}</div><div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Нийт {fmtMoney(qty * s.price + s.deliveryFee)}</div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button type="button" className="step" disabled={qty <= MIN_QTY} onClick={() => setQty(qty - 1)} aria-label="Хасах"><IconMinus /></button>
          <div className="qty-num">{qty}</div>
          <button type="button" className="step" disabled={qty >= MAX_QTY} onClick={() => setQty(qty + 1)} aria-label="Нэмэх"><IconPlus /></button>
        </div>
      </section>

      <div className="sec">Хүргэлтийн цаг</div>
      <section className="card mx" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <Segmented className="segbox" options={[{ id: "today", label: "Өнөөдөр" }, { id: "tomorrow", label: "Маргааш" }]} value={day} onChange={(d) => { setDay(d); if (d === "tomorrow" && slot === "asap") setSlot("09-12"); }} />
        <div className="grid2">
          {slots.map((x) => <button key={x} type="button" className={`slot${x === slot ? " on" : ""}`} onClick={() => setSlot(x)}><b>{slotLabel(x)}</b><span>{day === "today" ? "Өнөөдөр" : "Маргааш"}</span></button>)}
        </div>
      </section>

      {state.error && <div className="mx note-debt" role="alert" style={{ marginTop: 14 }}>{state.error}</div>}
      <div className="mx" style={{ marginTop: 16 }}>
        <button type="submit" className="wbtn" disabled={pending} style={{ width: "100%", height: 54, fontSize: 15.5 }}><Fill />{pending ? "Бүртгэж байна…" : "Захиалга бүртгэх"}</button>
      </div>
    </form>
  );
}
