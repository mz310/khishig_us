"use client";
import { useActionState } from "react";
import { saveSettings } from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/orders";
import type { SettingsRow } from "@/db/schema";
import { Fill } from "./WaterButton";

export function SettingsForm({ s }: { s: SettingsRow }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveSettings, {});
  return (
    <form action={action} style={{ paddingBottom: 40 }}>
      <div className="sec">Үнэ</div>
      <section className="card mx stack" style={{ padding: 18 }}>
        <div className="grid2">
          <div className="field"><label htmlFor="price">Нэг баллон (₮)</label><input id="price" name="price" className="inp" type="number" min={0} step={100} defaultValue={s.price} /></div>
          <div className="field"><label htmlFor="deliveryFee">Хүргэлт (₮)</label><input id="deliveryFee" name="deliveryFee" className="inp" type="number" min={0} step={100} defaultValue={s.deliveryFee} /></div>
        </div>
        <div className="field"><label htmlFor="bottleLabel">Баллоны хэмжээ (бичвэр)</label><input id="bottleLabel" name="bottleLabel" className="inp" defaultValue={s.bottleLabel} maxLength={20} placeholder="18.9 л" /></div>
        <label className="check"><input type="checkbox" name="acceptingOrders" defaultChecked={s.acceptingOrders} />Захиалга хүлээн авч байна</label>
        <p className="muted" style={{ margin: 0, fontSize: 12.5 }}>Үнэ 0 эсвэл энэ сонголт унтарсан бол сайт дээр "Удахгүй нээгдэнэ" гэж харагдана.</p>
      </section>

      <div className="sec">Урамшуулал</div>
      <section className="card mx stack" style={{ padding: 18 }}>
        <label className="check"><input type="checkbox" name="bonusEnabled" defaultChecked={s.bonusEnabled} />Бонус идэвхтэй</label>
        <div className="grid2">
          <div className="field"><label htmlFor="bonusBuy">Хэдийг авбал</label><input id="bonusBuy" name="bonusBuy" className="inp" type="number" min={1} defaultValue={s.bonusBuy} /></div>
          <div className="field"><label htmlFor="bonusFree">Хэд үнэгүй</label><input id="bonusFree" name="bonusFree" className="inp" type="number" min={0} defaultValue={s.bonusFree} /></div>
        </div>
      </section>

      <div className="sec">Холбоо барих, данс</div>
      <section className="card mx stack" style={{ padding: 18 }}>
        <div className="grid2">
          <div className="field"><label htmlFor="phone1">Утас 1</label><input id="phone1" name="phone1" className="inp" inputMode="tel" maxLength={20} defaultValue={s.phone1} /></div>
          <div className="field"><label htmlFor="phone2">Утас 2</label><input id="phone2" name="phone2" className="inp" inputMode="tel" maxLength={20} defaultValue={s.phone2} /></div>
        </div>
        <div className="grid2">
          <div className="field"><label htmlFor="bankName">Банк</label><input id="bankName" name="bankName" className="inp" maxLength={60} defaultValue={s.bankName} /></div>
          <div className="field"><label htmlFor="bankAccount">Данс</label><input id="bankAccount" name="bankAccount" className="inp" inputMode="numeric" maxLength={40} defaultValue={s.bankAccount} /></div>
        </div>
      </section>

      {state.error && <div className="mx note-debt" role="alert" style={{ marginTop: 14 }}>{state.error}</div>}
      {state.ok && <div className="mx notice ok" role="status" style={{ marginTop: 14 }}>Хадгалагдлаа</div>}
      <div className="mx" style={{ marginTop: 16 }}>
        <button type="submit" className="wbtn" disabled={pending} style={{ width: "100%", height: 54, fontSize: 15.5 }}><Fill />{pending ? "Хадгалж байна…" : "Хадгалах"}</button>
      </div>
    </form>
  );
}
