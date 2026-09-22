import Link from "next/link";
import { Bottle } from "@/components/Bottle";
import { IconPhone } from "@/components/icons";
import { Lockup } from "@/components/Lockup";
import { WaterLink } from "@/components/WaterButton";
import { fmtMoney, STATUS_LABEL, type Status } from "@/lib/domain";
import { getSettings, myOrders } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { humanDate, slotLabel, type Slot } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const [user, s, orders, { denied }] = await Promise.all([requireUser(), getSettings(), myOrders(await (async () => (await requireUser()).id)(), 5), searchParams]);
  const last = orders[0];
  const open = orders.find((o) => o.status === "new" || o.status === "out");
  const firstName = user.name.split(" ")[0];
  const price = s.price > 0 ? fmtMoney(s.price) : "Удахгүй";
  const fee = s.deliveryFee > 0 ? `хүргэлт ${fmtMoney(s.deliveryFee)}` : "хүргэлт үнэгүй";

  return (
    <>
      <header className="topbar">
        <Lockup href="/" size={19} />
        <Link href="/profile" aria-label="Профайл" style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", boxShadow: "var(--shadow)", color: "var(--brand)", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {firstName.charAt(0).toUpperCase()}
        </Link>
      </header>

      {denied && <div className="mx note-debt" style={{ marginTop: 10 }}>Энэ Gmail хаягт эзний хэсэгт нэвтрэх эрх байхгүй.</div>}

      <section style={{ padding: "16px 20px 14px" }}>
        <div className="muted" style={{ fontSize: 14 }}>Сайн байна уу, {firstName}</div>
        <h1 style={{ margin: "4px 0 0", fontSize: 25, lineHeight: 1.15 }}>Ус захиалах уу?</h1>
      </section>

      <section className="phero" aria-label="Хишиг байгалийн цэвэр ус">
        <svg viewBox="0 0 400 330" preserveAspectRatio="xMidYMax slice" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="ps-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2B2A5C" /><stop offset=".6" stopColor="#232B66" /><stop offset="1" stopColor="#1D3A78" /></linearGradient>
            <linearGradient id="ps-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E6BB0" /><stop offset="1" stopColor="#16376B" /></linearGradient>
            <radialGradient id="ps-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#8CC6F2" stopOpacity=".5" /><stop offset="1" stopColor="#8CC6F2" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width="400" height="330" fill="url(#ps-sky)" />
          <ellipse cx="290" cy="232" rx="150" ry="60" fill="url(#ps-glow)" />
          <path d="M0 250 L50 200 L90 218 L150 160 L200 192 L260 150 L310 178 L360 160 L400 200 V270 H0 Z" fill="#343C86" opacity=".85" />
          <path d="M0 262 L70 214 L110 236 L170 186 L210 210 L270 168 L320 194 L400 232 V280 H0 Z" fill="#1E2358" />
          <rect y="240" width="400" height="90" fill="url(#ps-water)" />
        </svg>
        <div className="hcopy">
          <span className="chip-glass" style={{ height: 32, fontSize: 12, padding: "0 12px", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.28)" }}>{s.bottleLabel} баллон</span>
          <div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{price}</div>
            <div style={{ fontSize: 12.5, color: "#C9CBEA", marginTop: 6 }}>нэг баллон, {fee}</div>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "#C9CBEA" }}>Арвайхээр сум дотор хаалган дээр тань хүргэнэ</div>
        </div>
        <Bottle className="jug" kind="hero" />
        <div className="waves">
          <svg className="run-slow" viewBox="0 0 800 90" preserveAspectRatio="none" style={{ height: 84 }} aria-hidden="true"><path d="M0 40 Q50 22 100 40 T200 40 T300 40 T400 40 T500 40 T600 40 T700 40 T800 40 V90 H0 Z" fill="#2F7FC1" opacity=".6" /></svg>
          <svg className="run-mid" viewBox="0 0 800 90" preserveAspectRatio="none" style={{ height: 60 }} aria-hidden="true"><path d="M0 44 Q50 30 100 44 T200 44 T300 44 T400 44 T500 44 T600 44 T700 44 T800 44 V90 H0 Z" fill="#4A9FDB" opacity=".8" /></svg>
        </div>
        {s.bonusEnabled && <span className="pill glass dark"><i>+{s.bonusFree}</i>{s.bonusBuy} авбал {s.bonusFree} нь бэлэг</span>}
      </section>

      {open && (
        <Link href={`/orders/${open.id}`} className="card mx" style={{ marginTop: 14, padding: 16, display: "flex", gap: 14, alignItems: "center", color: "inherit" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Идэвхтэй захиалга #{open.id}</div>
            <div style={{ fontSize: 15.5, fontWeight: 700, marginTop: 2 }}>{STATUS_LABEL[open.status as Status]} · {humanDate(open.deliveryDate)}, {slotLabel(open.slot as Slot)}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{open.qtyPaid + open.qtyFree} баллон · {fmtMoney(open.total)}</div>
          </div>
          <span className="pill-s st-new">Харах</span>
        </Link>
      )}

      {last && !open && (
        <section className="card mx" style={{ marginTop: 14, padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Сүүлийн захиалга</div>
            <div style={{ fontSize: 15.5, fontWeight: 700 }}>{last.qtyFree ? `${last.qtyPaid} + ${last.qtyFree} бэлэг, ${last.qtyPaid + last.qtyFree} баллон` : `${last.qtyPaid} баллон`}</div>
            <div className="muted" style={{ fontSize: 13 }}>{last.bag}-р баг, {last.street}, {last.unit}</div>
          </div>
          <WaterLink href={`/order?qty=${last.qtyPaid}`} style={{ height: 44, padding: "0 16px", fontSize: 14, flexShrink: 0 }}>Дахин захиалах</WaterLink>
        </section>
      )}

      <WaterLink href="/order" className="mx" style={{ display: "flex", marginTop: 10, height: 54, fontSize: 15.5 }}>Шинэ захиалга өгөх</WaterLink>

      <div style={{ padding: "26px 20px 8px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: 16.5 }}>Хэрхэн ажилладаг</h2>
        <span className="muted" style={{ fontSize: 13 }}>09:00–17:00</span>
      </div>
      <section className="card mx" style={{ padding: "2px 16px" }}>
        <div className="step-row"><div className="stepnum">1</div><div><div style={{ fontSize: 15, fontWeight: 700 }}>Захиалгаа өгнө</div><div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Тоо, хаяг, хүргүүлэх цагаа сонгоно</div></div></div>
        <div className="step-row"><div className="stepnum">2</div><div><div style={{ fontSize: 15, fontWeight: 700 }}>Хоосон баллоноо бэлдэнэ</div><div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Хуучин баллоныг тань аваад дүүрэнээр солино</div></div></div>
        <div className="step-row"><div className="stepnum">3</div><div><div style={{ fontSize: 15, fontWeight: 700 }}>Хүргэлтээр төлнө</div><div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Бэлнээр эсвэл дансаар</div></div></div>
      </section>

      <section className="mx" style={{ marginTop: 12, padding: 16, borderRadius: 20, background: "var(--brand)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: "#C9CBEA" }}>Асуух зүйл байвал шууд залгаарай. Захиалгыг эзэн нь өөрөө хүргэдэг.</div>
        <a href={`tel:${s.phone1}`} className="gbtn" style={{ height: 44, padding: "0 14px", fontSize: 14.5, flexShrink: 0 }}><IconPhone size={16} />{s.phone1.slice(0, 4)} {s.phone1.slice(4)}</a>
      </section>
    </>
  );
}
