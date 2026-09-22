import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { CopyButton } from "@/components/CopyButton";
import { IconBack, IconBank, IconCheck, IconPhone, IconSwap } from "@/components/icons";
import { fmtMoney, type Status } from "@/lib/domain";
import { getOrder, getSettings } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { parseId } from "@/lib/validation";
import { humanDate, humanDateTime, slotLabel, ubTime, type Slot } from "@/lib/time";
import { wave } from "@/lib/wave";

export const dynamic = "force-dynamic";

export default async function OrderStatus({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const user = await requireUser("/orders");
  const [{ id }, { new: isNew }, s] = await Promise.all([params, searchParams, getSettings()]);
  const orderId = parseId(id);
  const order = orderId ? await getOrder(orderId) : null;
  if (!order || (order.userId !== user.id && !user.isAdmin)) notFound();

  const status = order.status as Status;
  const step = status === "delivered" ? 2 : status === "out" ? 1 : 0;
  const when = `${humanDate(order.deliveryDate)}, ${slotLabel(order.slot as Slot)}`;
  const TEXT: Record<Status, [string, string]> = {
    new: ["Хүлээн авлаа", `Удахгүй хүргэлтэнд гарна. ${when}.`],
    out: ["Замдаа явж байна", `${when}. Утсаа ойрхон байлгаарай.`],
    delivered: ["Хүргэгдлээ", "Баярлалаа! Дараагийн захиалгаар уулзъя."],
    cancelled: ["Цуцлагдсан", "Энэ захиалга цуцлагдсан. Шинээр захиалж болно."],
  };

  return (
    <>
      <header className="pagehead">
        <Link href="/orders" className="iconbtn" aria-label="Буцах"><IconBack /></Link>
        <div><h1>Захиалга #{order.id}</h1><div className="sub">{humanDateTime(order.createdAt)}</div></div>
      </header>

      {isNew && <div className="mx notice ok" role="status" style={{ marginBottom: 12 }}>Захиалга хүлээж авлаа. Хоосон баллоноо бэлдэж байгаарай.</div>}

      <section className={`mx status-card${status === "cancelled" ? " off" : ""}`}>
        <div className="waves"><svg className="run-slow" viewBox="0 0 800 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 34 Q50 20 100 34 T200 34 T300 34 T400 34 T500 34 T600 34 T700 34 T800 34 V70 H0 Z" fill="rgba(255,255,255,.08)" /></svg></div>
        <div style={{ position: "relative" }}>
          <div className="lbl">Төлөв</div>
          <h2>{TEXT[status][0]}</h2>
          <p>{TEXT[status][1]}</p>
          {status !== "cancelled" && (
            <>
              <div className="track" role="progressbar" aria-label="Хүргэлтийн явц" aria-valuemin={0} aria-valuemax={2} aria-valuenow={step}>
                <div className="track-fill" style={{ width: `${step * 50}%` }}><svg className="run" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d={wave(7, 5, 25, 200, 14)} fill="#7CC4EC" /></svg></div>
                {[0, 1, 2].map((i) => <div key={i} className={`node${i <= step ? " done" : ""}`} style={{ left: `${i * 50}%` }}><IconCheck /></div>)}
              </div>
              <div className="track-steps">
                <div><b>Хүлээн авсан</b>{ubTime(order.createdAt)}</div>
                <div><b>Замдаа</b>{order.outAt ? ubTime(order.outAt) : "—"}</div>
                <div><b>Хүргэгдсэн</b>{order.deliveredAt ? ubTime(order.deliveredAt) : "—"}</div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="card mx" style={{ marginTop: 16, padding: "6px 18px" }}>
        <div className="row"><span>Тоо</span><span>{order.qtyFree ? `${order.qtyPaid} + ${order.qtyFree} бэлэг = ${order.qtyPaid + order.qtyFree} баллон` : `${order.qtyPaid} баллон`}</span></div>
        <div className="row"><span>Хаяг</span><span>{order.bag}-р баг, {order.street}, {order.unit}</span></div>
        {order.note && <div className="row"><span>Тайлбар</span><span>{order.note}</span></div>}
        <div className="row"><span>Цаг</span><span>{when}</span></div>
        <div className="row total"><span>Нийт</span><span>{fmtMoney(order.total)}</span></div>
      </section>

      {status !== "cancelled" && (
        <section className="card mx stack" style={{ marginTop: 14, padding: 18, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="callbtn" style={{ width: 38, height: 38, borderRadius: 12 }} aria-hidden="true"><IconBank /></div>
            <div><div style={{ fontSize: 15, fontWeight: 700 }}>{order.payment ? "Төлбөр төлөгдсөн" : "Хүргэлтээр төлнө"}</div><div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Бэлнээр эсвэл дансаар шилжүүлж болно</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 14, borderRadius: 16, background: "var(--ground)" }}>
            <div style={{ minWidth: 0 }}>
              <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{s.bankName}</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginTop: 4, letterSpacing: ".02em", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{s.bankAccount}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Гүйлгээний утга: <b style={{ color: "var(--ink)" }}>{order.id}</b></div>
            </div>
            <CopyButton text={s.bankAccount} />
          </div>
        </section>
      )}

      {status === "new" && (
        <section className="mx" style={{ marginTop: 14, padding: "16px 18px", borderRadius: 20, background: "var(--saffron-bg)", color: "var(--saffron-ink)", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <IconSwap size={22} />
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}><b>Хоосон баллоноо бэлдээрэй.</b> Дүүрэн баллоныг хуучин хоосон баллонтой тань солино.</div>
        </section>
      )}

      <section className="mx grid2" style={{ marginTop: 16, alignItems: "start" }}>
        <a href={`tel:${s.phone1}`} className="wbtn" style={{ height: 52, fontSize: 15 }}><IconPhone />Залгах</a>
        {status === "new" && <CancelOrderButton id={order.id} />}
        {status === "out" && <div className="muted" style={{ fontSize: 12, lineHeight: 1.45, alignSelf: "center" }}>Хүргэлтэнд гарсан тул цуцлахын тулд залгана уу.</div>}
      </section>
    </>
  );
}
