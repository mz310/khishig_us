import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { CopyButton } from "@/components/CopyButton";
import { IconBack, IconBank, IconCheck, IconPhone, IconSwap } from "@/components/icons";
import { fmtMoney, type Status } from "@/lib/domain";
import { getOrder, getSettings } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { humanDate, humanDateTime, slotLabel, ubTime, type Slot } from "@/lib/time";
import { wave } from "@/lib/wave";

export const dynamic = "force-dynamic";

export default async function OrderStatus({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const user = await requireUser();
  const [{ id }, { new: isNew }, s] = await Promise.all([params, searchParams, getSettings()]);
  const order = await getOrder(Number(id));
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
        <div><h1>Захиалга #{order.id}</h1><div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{humanDateTime(order.createdAt)}</div></div>
      </header>

      {isNew && <div className="mx" style={{ marginBottom: 12, padding: "12px 14px", borderRadius: 14, background: "var(--ok-bg)", color: "var(--ok-ink)", fontWeight: 600, fontSize: 14 }}>Захиалга хүлээж авлаа. Хоосон баллоноо бэлдэж байгаарай.</div>}

      <section className="mx" style={{ borderRadius: 24, background: status === "cancelled" ? "#5B5F7A" : "var(--brand)", color: "#fff", padding: "22px 22px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, overflow: "hidden", pointerEvents: "none" }}>
          <svg className="run-slow" viewBox="0 0 800 70" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: 0, width: "200%", height: 70 }} aria-hidden="true"><path d="M0 34 Q50 20 100 34 T200 34 T300 34 T400 34 T500 34 T600 34 T700 34 T800 34 V70 H0 Z" fill="rgba(255,255,255,.08)" /></svg>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9BD98A" }}>Төлөв</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{TEXT[status][0]}</div>
          <div style={{ fontSize: 14, color: "#C9CBEA", marginTop: 6, lineHeight: 1.5 }}>{TEXT[status][1]}</div>
          {status !== "cancelled" && (
            <>
              <div className="track" role="progressbar" aria-valuemin={0} aria-valuemax={2} aria-valuenow={step}>
                <div className="track-fill" style={{ width: `${step * 50}%` }}><svg className="run" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d={wave(7, 5, 25, 200, 14)} fill="#7CC4EC" /></svg></div>
                {[0, 1, 2].map((i) => <div key={i} className={`node${i <= step ? " done" : ""}`} style={{ left: `${i * 50}%` }}><IconCheck /></div>)}
              </div>
              <div className="grid3" style={{ gap: 6, marginTop: 18, fontSize: 12, color: "#C9CBEA" }}>
                <div><div style={{ fontWeight: 700, color: "#fff" }}>Хүлээн авсан</div><div style={{ marginTop: 2 }}>{ubTime(order.createdAt)}</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontWeight: 700, color: "#fff" }}>Замдаа</div><div style={{ marginTop: 2 }}>{order.outAt ? ubTime(order.outAt) : "—"}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: "#fff" }}>Хүргэгдсэн</div><div style={{ marginTop: 2 }}>{order.deliveredAt ? ubTime(order.deliveredAt) : "—"}</div></div>
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
        <div className="row" style={{ alignItems: "center" }}><span>Нийт</span><span style={{ fontSize: 18, fontWeight: 800 }}>{fmtMoney(order.total)}</span></div>
      </section>

      {status !== "cancelled" && (
        <section className="card mx" style={{ marginTop: 14, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--ice)", color: "var(--water)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconBank /></div>
            <div><div style={{ fontSize: 15, fontWeight: 700 }}>{order.payment ? "Төлбөр төлөгдсөн" : "Хүргэлтээр төлнө"}</div><div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Бэлнээр эсвэл дансаар шилжүүлж болно</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 14, borderRadius: 16, background: "var(--ground)" }}>
            <div>
              <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{s.bankName}</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginTop: 4, letterSpacing: ".02em" }}>{s.bankAccount}</div>
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

      <section className="mx grid2" style={{ marginTop: 16 }}>
        <a href={`tel:${s.phone1}`} className="wbtn" style={{ height: 54, fontSize: 15 }}><IconPhone />Залгах</a>
        {status === "new" && <CancelOrderButton id={order.id} />}
        {status === "out" && <div className="muted" style={{ fontSize: 12, lineHeight: 1.45, display: "flex", alignItems: "center" }}>Хүргэлтэнд гарсан тул цуцлахын тулд залгана уу.</div>}
      </section>
    </>
  );
}
