"use client";
import { useActionState, useMemo, useState } from "react";
import { createOrder, type ActionState } from "@/app/actions/orders";
import { fmtMoney, freeBottles, MAX_QTY, MIN_QTY, normalizePhone, type Settings } from "@/lib/domain";
import type { DayOptions, Slot } from "@/lib/time";
import { Segmented } from "./AudienceTabs";
import { IconBank, IconChevron, IconMinus, IconPlus, IconSwap } from "./icons";
import { Fill } from "./WaterButton";

type Props = {
  settings: Settings & { bottleLabel: string; bankName: string; bankAccount: string };
  slots: { today: DayOptions; tomorrow: DayOptions };
  prefill: { qty: number; name: string; phone: string; bag: number; street: string; unit: string; note: string };
};

const BottleIcon = () => <svg width="16" height="24" viewBox="0 0 16 24" aria-hidden="true"><path d="M6 1h4v3c0 1 4 1.6 4 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9c0-3.4 4-4 4-5z" /></svg>;

export function OrderForm({ settings: s, slots, prefill }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createOrder, {});
  const [qty, setQty] = useState(prefill.qty);
  const [day, setDay] = useState<"today" | "tomorrow">(slots.today.closed ? "tomorrow" : "today");
  const dayOpts = day === "today" ? slots.today : slots.tomorrow;
  const firstAvailable = (d: DayOptions) => d.slots.find((x) => x.available)?.id ?? "09-12";
  const [slot, setSlot] = useState<Slot>(firstAvailable(dayOpts));
  const [phone, setPhone] = useState(prefill.phone);
  const [touched, setTouched] = useState(false);

  const free = freeBottles(qty, s);
  const total = qty * s.price + s.deliveryFee;
  const phoneOk = normalizePhone(phone) !== null;
  const nudge = s.bonusEnabled && free === 0 && s.bonusBuy > 0 && qty % s.bonusBuy === s.bonusBuy - 1;
  const bottles = useMemo(() => Array.from({ length: qty + free }, (_, i) => i >= qty), [qty, free]);

  function pickDay(d: "today" | "tomorrow") {
    setDay(d);
    const opts = d === "today" ? slots.today : slots.tomorrow;
    if (!opts.slots.some((x) => x.id === slot && x.available)) setSlot(firstAvailable(opts));
  }

  return (
    <form action={action} className="with-bar" style={{ paddingBottom: 130 }}>
      <input type="hidden" name="qty" value={qty} />
      <input type="hidden" name="date" value={dayOpts.date} />
      <input type="hidden" name="slot" value={slot} />

      <div className="sec">Хэдэн баллон?</div>
      <section className="card mx" style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{s.bottleLabel} баллонтой ус</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>{fmtMoney(s.price)} / ширхэг</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button type="button" className="step" aria-label="Хасах" disabled={qty <= MIN_QTY} onClick={() => setQty((q) => Math.max(MIN_QTY, q - 1))}><IconMinus /></button>
            <div className="qty-num" aria-live="polite">{qty}</div>
            <button type="button" className="step" aria-label="Нэмэх" disabled={qty >= MAX_QTY} onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}><IconPlus /></button>
          </div>
        </div>
        <div className="bottles" aria-hidden="true">
          {bottles.map((isFree, i) => <span key={i} className={`bt${isFree ? " free" : ""}`}><BottleIcon /></span>)}
        </div>
        {free > 0 && <div className="bonus-box got"><span className="disp">+{free}</span>{qty} + {free} бэлэг = {qty + free} баллон</div>}
        {nudge && (
          <div className="bonus-box nudge">
            Дахиад 1 нэмбэл {s.bonusFree} баллон үнэгүй
            <button type="button" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}>+1 нэмэх</button>
          </div>
        )}
        {s.bonusEnabled && free === 0 && !nudge && <div className="bonus-box hint">{s.bonusBuy} авбал {s.bonusFree} баллон бэлэг</div>}
      </section>

      <div className="sec">Холбоо барих</div>
      <section className="card mx" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="field"><label htmlFor="name">Нэр</label><input id="name" name="name" className="inp" defaultValue={prefill.name} autoComplete="name" placeholder="Таны нэр" required /></div>
        <div className="field">
          <label htmlFor="phone">Утасны дугаар</label>
          <input id="phone" name="phone" className={`inp${touched && !phoneOk ? " bad" : ""}`} inputMode="numeric" autoComplete="tel" placeholder="8 оронтой дугаар" value={phone}
            onChange={(e) => { setPhone(e.target.value); setTouched(true); }} required />
          {touched && !phoneOk && <div className="err">8 оронтой утасны дугаар оруулна уу</div>}
        </div>
      </section>

      <div className="sec">Хүргэх хаяг</div>
      <section className="card mx" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="field">
          <label htmlFor="bag">Баг</label>
          <div className="selwrap">
            <select id="bag" name="bag" className="inp" defaultValue={prefill.bag}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}-р баг</option>)}
            </select>
            <IconChevron />
          </div>
        </div>
        <div className="grid2">
          <div className="field"><label htmlFor="street">Байр / гудамж</label><input id="street" name="street" className="inp" defaultValue={prefill.street} placeholder="12-р байр" required /></div>
          <div className="field"><label htmlFor="unit">Тоот / хашаа</label><input id="unit" name="unit" className="inp" defaultValue={prefill.unit} placeholder="34 тоот" required /></div>
        </div>
        <div className="field"><label htmlFor="note">Нэмэлт тайлбар</label><textarea id="note" name="note" className="inp" defaultValue={prefill.note} placeholder="Орц, код, ойролцоох тэмдэг…" /></div>
      </section>

      <div className="sec">Хүргэлтийн цаг</div>
      <section className="card mx" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <Segmented className="segbox" options={[{ id: "today", label: "Өнөөдөр" }, { id: "tomorrow", label: "Маргааш" }]} value={day} onChange={pickDay} />
        {slots.today.closed && day === "today" && <div className="muted" style={{ fontSize: 13 }}>Өнөөдрийн цаг дууссан. Маргаашийн цагаас сонгоно уу.</div>}
        <div className="grid2">
          {dayOpts.slots.map((x) => (
            <button key={x.id} type="button" className={`slot${x.id === slot && x.available ? " on" : ""}`} disabled={!x.available} onClick={() => setSlot(x.id)}>
              <b>{x.label}</b>
              <span>{x.available ? (x.id === "asap" ? "Дараалалд орно" : day === "today" ? "Өнөөдөр" : "Маргааш") : x.reason}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card mx" style={{ marginTop: 16, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="info"><IconSwap /><span><b>Хоосон баллоноо бэлдээрэй.</b> Хүргэхдээ хуучин баллоныг тань аваад дүүрэнээр солино.</span></div>
        <div className="info"><IconBank /><span>Төлбөрөө хүргэлтээр — бэлнээр эсвэл {s.bankName} {s.bankAccount} дансаар.</span></div>
      </section>

      {state.error && <div className="mx note-debt" role="alert" style={{ marginTop: 14 }}>{state.error}</div>}

      <div className="bottombar glass milk">
        <div style={{ minWidth: 0 }}>
          <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Нийт</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 2 }}>{fmtMoney(total)}</div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>{qty} × {fmtMoney(s.price)}{s.deliveryFee ? ` · хүргэлт ${fmtMoney(s.deliveryFee)}` : " · хүргэлт үнэгүй"}</div>
        </div>
        <button type="submit" className="wbtn" disabled={pending || !phoneOk} style={{ height: 56, padding: "0 26px", fontSize: 16, flexShrink: 0 }}>
          <Fill />{pending ? "Илгээж байна…" : "Захиалах"}
        </button>
      </div>
    </form>
  );
}
