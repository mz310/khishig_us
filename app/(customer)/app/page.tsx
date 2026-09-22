import Link from "next/link";
import { Bottle } from "@/components/Bottle";
import { IconPhone, IconRight } from "@/components/icons";
import { Lockup } from "@/components/Lockup";
import { WaterLink } from "@/components/WaterButton";
import { fmtMoney, fmtPhone, STATUS_LABEL, type Status } from "@/lib/domain";
import { getSettings, myOrders } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { humanDate, slotLabel, type Slot } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser("/app");
  const [s, orders, { denied }] = await Promise.all([getSettings(), myOrders(user.id, 5), searchParams]);
  const last = orders[0];
  const open = orders.find((o) => o.status === "new" || o.status === "out");
  const firstName = user.name.trim().split(/\s+/)[0] || "та";
  const price = s.price > 0 ? fmtMoney(s.price) : "Удахгүй";
  const fee = s.deliveryFee > 0 ? `хүргэлт ${fmtMoney(s.deliveryFee)}` : "хүргэлт үнэгүй";

  return (
    <>
      <header className="topbar">
        <Lockup href="/" size={19} />
        <Link href="/profile" aria-label="Профайл" className="avatar-btn">{firstName.charAt(0).toUpperCase()}</Link>
      </header>

      {denied && <div className="mx notice bad" style={{ marginTop: 10 }}>Энэ Gmail хаягт эзний хэсэгт нэвтрэх эрх байхгүй.</div>}

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
          <span className="chip-glass lbl">{s.bottleLabel} баллон</span>
          <div>
            <div className="price">{price}</div>
            <div className="per">нэг баллон, {fee}</div>
          </div>
          <p>Арвайхээр сум дотор хаалган дээр тань хүргэнэ</p>
        </div>
        <Bottle className="jug" kind="hero" phone={fmtPhone(s.phone1)} />
        <div className="waves">
          <svg className="run-slow" viewBox="0 0 800 90" preserveAspectRatio="none" style={{ height: 84 }} aria-hidden="true"><path d="M0 40 Q50 22 100 40 T200 40 T300 40 T400 40 T500 40 T600 40 T700 40 T800 40 V90 H0 Z" fill="#2F7FC1" opacity=".6" /></svg>
          <svg className="run-mid" viewBox="0 0 800 90" preserveAspectRatio="none" style={{ height: 60 }} aria-hidden="true"><path d="M0 44 Q50 30 100 44 T200 44 T300 44 T400 44 T500 44 T600 44 T700 44 T800 44 V90 H0 Z" fill="#4A9FDB" opacity=".8" /></svg>
        </div>
        {s.bonusEnabled && <span className="pill glass dark"><i>+{s.bonusFree}</i>{s.bonusBuy} авбал {s.bonusFree} нь бэлэг</span>}
      </section>

      {open && (
        <Link href={`/orders/${open.id}`} className="card mx linkcard" style={{ marginTop: 14 }}>
          <div className="main">
            <div className="s">Идэвхтэй захиалга #{open.id}</div>
            <div className="t">{STATUS_LABEL[open.status as Status]} · {humanDate(open.deliveryDate)}, {slotLabel(open.slot as Slot)}</div>
            <div className="s">{open.qtyPaid + open.qtyFree} баллон · {fmtMoney(open.total)}</div>
          </div>
          <span className={`pill-s st-${open.status}`}>Харах<IconRight size={14} /></span>
        </Link>
      )}

      {last && !open && (
        <section className="card mx linkcard" style={{ marginTop: 14 }}>
          <div className="main">
            <div className="s">Сүүлийн захиалга</div>
            <div className="t">{last.qtyFree ? `${last.qtyPaid} + ${last.qtyFree} бэлэг, ${last.qtyPaid + last.qtyFree} баллон` : `${last.qtyPaid} баллон`}</div>
            <div className="s">{last.bag}-р баг, {last.street}, {last.unit}</div>
          </div>
          <WaterLink href={`/order?qty=${last.qtyPaid}`} style={{ height: 44, padding: "0 16px", fontSize: 14, flexShrink: 0 }}>Дахин захиалах</WaterLink>
        </section>
      )}

      <WaterLink href="/order" className="mx" style={{ display: "flex", marginTop: 10, height: 54, fontSize: 15.5 }}>Шинэ захиалга өгөх</WaterLink>

      <div style={{ padding: "26px 20px 8px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16.5 }}>Хэрхэн ажилладаг</h2>
        <span className="muted" style={{ fontSize: 13 }}>09:00–17:00</span>
      </div>
      <section className="card mx" style={{ padding: "2px 16px" }}>
        <div className="step-row"><div className="stepnum">1</div><div><b>Захиалгаа өгнө</b><span>Тоо, хаяг, хүргүүлэх цагаа сонгоно</span></div></div>
        <div className="step-row"><div className="stepnum">2</div><div><b>Хоосон баллоноо бэлдэнэ</b><span>Хуучин баллоныг тань аваад дүүрэнээр солино</span></div></div>
        <div className="step-row"><div className="stepnum">3</div><div><b>Хүргэлтээр төлнө</b><span>Бэлнээр эсвэл дансаар</span></div></div>
      </section>

      <section className="mx callcard" style={{ marginTop: 12 }}>
        <p>Асуух зүйл байвал шууд залгаарай. Захиалгыг эзэн нь өөрөө хүргэдэг.</p>
        <a href={`tel:${s.phone1}`} className="gbtn" style={{ height: 44, padding: "0 14px", fontSize: 14.5, flexShrink: 0 }}><IconPhone size={16} />{fmtPhone(s.phone1)}</a>
      </section>
    </>
  );
}
