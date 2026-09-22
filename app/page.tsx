import Link from "next/link";
import { AudienceTabs } from "@/components/AudienceTabs";
import { Bottle } from "@/components/Bottle";
import { IconBank, IconCalendar, IconClock, IconHome, IconMail, IconPhone, IconReceipt, IconRefresh, IconSwap } from "@/components/icons";
import { LiquidNav } from "@/components/LiquidNav";
import { Lockup } from "@/components/Lockup";
import { WaterLink } from "@/components/WaterButton";
import { fmtMoney } from "@/lib/domain";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

const fmtPhone = (p: string) => (p.length === 8 ? `${p.slice(0, 4)} ${p.slice(4)}` : p);

export default async function Landing() {
  const s = await getSettings();
  const price = s.price > 0 ? fmtMoney(s.price) : "Удахгүй";
  const fee = s.deliveryFee > 0 ? fmtMoney(s.deliveryFee) : "Үнэгүй";
  const phone = fmtPhone(s.phone1);
  const bonus = s.bonusEnabled ? `${s.bonusBuy} авбал ${s.bonusFree} нь бэлэг` : "";

  return (
    <div className="site">
      <header className="site-top" id="top">
        <div className="wrap">
          <Lockup dark href="#top" />
          <LiquidNav
            className="dnav glass dark"
            itemClass="navi"
            ariaLabel="Үндсэн цэс"
            current="#top"
            items={[
              { href: "#top", label: "Нүүр" },
              { href: "#who", label: "Хэнд" },
              { href: "#water", label: "Усны тухай" },
              { href: "#price", label: "Үнэ" },
              { href: "#contact", label: "Холбоо барих" },
            ]}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href={`tel:${s.phone1}`} className="phone-link"><IconPhone size={17} />{phone}</a>
            <WaterLink href="/app" className="light" style={{ height: 46, padding: "0 22px", fontSize: 14.5, borderRadius: 23 }}>Захиалах</WaterLink>
          </div>
        </div>
      </header>

      <section className="hero">
        <HeroScene />
        <svg className="bubbles" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <circle className="drift" cx="180" cy="780" r="5" fill="rgba(124,196,236,.5)" />
          <circle className="drift e2" cx="420" cy="800" r="3" fill="rgba(124,196,236,.45)" />
          <circle className="drift e3" cx="660" cy="790" r="6" fill="rgba(124,196,236,.35)" />
          <circle className="drift e4" cx="1240" cy="800" r="4" fill="rgba(124,196,236,.45)" />
          <circle className="drift e2" cx="1330" cy="780" r="2.5" fill="rgba(124,196,236,.5)" />
          <circle className="drift e3" cx="760" cy="810" r="3" fill="rgba(124,196,236,.4)" />
        </svg>
        <div className="vig" />

        <div className="wrap hero-grid">
          <div className="hero-text">
            <span className="chip-glass glass dark"><IconClock />Арвайхээр сум, өдөр бүр 09:00–17:00</span>
            <h1><span className="w">Цэвэр ус,</span><br /><span className="w" style={{ animationDelay: ".1s" }}>хаалган дээр</span> <span className="w" style={{ animationDelay: ".2s" }}>тань.</span></h1>
            <div className="hero-cta">
              <WaterLink href="/app" className="light" style={{ height: 56, padding: "0 26px", fontSize: 16, borderRadius: 28 }}>
                <IconMail />Gmail-ээр нэвтэрч захиалах
              </WaterLink>
              <a href={`tel:${s.phone1}`} className="gbtn" style={{ height: 56, padding: "0 24px", fontSize: 16, borderRadius: 28 }}><IconPhone />{phone}</a>
            </div>
            <div className="hero-price glass dark">
              <div><div className="k">Нэг баллон</div><div className="v">{price}</div></div>
              <div className="sep" />
              <div><div className="k">Хүргэлт</div><div className="v">{fee}</div></div>
              {s.bonusEnabled && (<><div className="sep" /><div><div className="k">{s.bonusBuy} авбал</div><div className="v" style={{ color: "#8FE07A" }}>{s.bonusFree} бэлэг</div></div></>)}
            </div>
          </div>

          <div className="hero-product">
            <div className="jug-wrap">
              <Bottle className="jug" kind="hero" phone={phone} />
              <Bottle className="jug-reflect" kind="plain" phone={phone} />
            </div>
            {s.bonusEnabled && (
              <div className="fbadge glass dark float" style={{ left: -10, top: 200 }}>
                <span className="ico" style={{ background: "var(--leaf-2)", color: "#fff", fontSize: 15 }}>+{s.bonusFree}</span>
                <span><b>{bonus}</b><small>Нэг захиалга дотор</small></span>
              </div>
            )}
            <div className="fbadge glass dark float f2" style={{ right: -10, top: 420 }}>
              <span className="ico" style={{ background: "rgba(255,255,255,.16)", color: "#fff" }}><IconSwap size={22} /></span>
              <span><b>Хоосноо өгөөд</b><small>дүүрэнийг нь аваарай</small></span>
            </div>
          </div>
        </div>

        <div className="hero-waves">
          <svg className="run-slow" viewBox="0 0 1600 150" preserveAspectRatio="none" style={{ height: 150 }} aria-hidden="true"><path d="M0 60 Q100 30 200 60 T400 60 T600 60 T800 60 T1000 60 T1200 60 T1400 60 T1600 60 V150 H0 Z" fill="#2F7FC1" opacity=".55" /></svg>
          <svg className="run-mid" viewBox="0 0 1600 150" preserveAspectRatio="none" style={{ height: 112 }} aria-hidden="true"><path d="M0 64 Q100 40 200 64 T400 64 T600 64 T800 64 T1000 64 T1200 64 T1400 64 T1600 64 V150 H0 Z" fill="#4A9FDB" opacity=".75" /></svg>
          <svg className="run-slow" viewBox="0 0 1600 150" preserveAspectRatio="none" style={{ height: 64, bottom: -2, animationDirection: "reverse" }} aria-hidden="true"><path d="M0 70 Q100 44 200 70 T400 70 T600 70 T800 70 T1000 70 T1200 70 T1400 70 T1600 70 V150 H0 Z" fill="#F4F5FA" /></svg>
        </div>
      </section>

      <section className="section alt" id="who">
        <div className="wrap aud2">
          <AudienceTabs
            home={(
              <>
                <h2>Гэртээ хүнд баллон зөөх шаардлагагүй.</h2>
                <p className="lede">Захиалснаас хойш тухайн өдрөө хаалган дээр тань ирнэ. Хоосон баллоноо л бэлдээрэй.</p>
                <ul className="benefits">
                  <li><i><IconHome size={20} /></i><span><b>Хаалган дээр</b>Байр, хашаа ялгаагүй. Орцны код, давхраа бичээд орхино.</span></li>
                  <li><i><IconClock size={20} /></i><span><b>Цагаа өөрөө сонгоно</b>09–12, 12–15, 15–17, эсвэл аль болох хурдан.</span></li>
                  <li><i><IconRefresh size={20} /></i><span><b>Нэг товчоор дахин</b>Хаяг, тоо санагдсан байна. Дараагийн удаа 10 секунд.</span></li>
                </ul>
              </>
            )}
            org={(
              <>
                <h2>Оффис, дэлгүүр, сургуульд тогтмол ус.</h2>
                <p className="lede">Долоо хоногийн хуваариар хүргэж, сарын эцэст нэг тооцоо хийнэ. Дансаар төлөхөд баримт гарна.</p>
                <ul className="benefits">
                  <li><i><IconCalendar size={20} /></i><span><b>Тогтмол хуваарь</b>Даваа, Пүрэв гэх мэт. Утсаар нэг удаа тохироод л болно.</span></li>
                  <li><i><IconReceipt size={20} /></i><span><b>Сарын нэгдсэн тооцоо</b>Хэдэн баллон, хэдэн төгрөг — нэг хуудсанд. Өр, төлөлт тодорхой.</span></li>
                  <li><i><IconBank size={20} /></i><span><b>Дансаар, баримттай</b>Нягтлан бодогчид ойлгомжтой. Бэлнээр ч болно.</span></li>
                </ul>
              </>
            )}
            homeFacts={(
              <div className="aud-panel">
                <PanelRidge />
                <Bottle className="jug-sm" kind="hero" phone={phone} />
                <div className="facts-col">
                  <div className="fact glass dark"><b>1–2</b><span>баллон долоо хоногт, дундаж айл</span></div>
                  <div className="fact glass dark"><b>Өнөөдрөө</b><span>17:00-оос өмнөх захиалга</span></div>
                  {s.bonusEnabled && <div className="fact glass dark"><b>{s.bonusBuy} + {s.bonusFree}</b><span>{bonus}</span></div>}
                </div>
              </div>
            )}
            orgFacts={(
              <div className="aud-panel">
                <PanelRidge />
                <Bottle className="jug-sm" kind="hero" phone={phone} />
                <div className="facts-col">
                  <div className="fact glass dark"><b>Хуваарь</b><span>долоо хоног бүр, тогтсон өдөр</span></div>
                  <div className="fact glass dark"><b>Нэг тооцоо</b><span>сарын эцэст, бүх захиалга нэг дор</span></div>
                  <div className="fact glass dark"><b>Баримт</b><span>дансны гүйлгээ бүрт</span></div>
                </div>
              </div>
            )}
          />
        </div>
      </section>

      <section className="section water" id="water">
        <div className="wrap two-col">
          <div>
            <h2>Усны найрлага</h2>
            <p className="lede">Байгалийн эх үүсвэрээс. Шошгон дээрх лабораторийн үзүүлэлт, нэг литрт:</p>
            <table className="minerals" style={{ marginTop: 26, maxWidth: 520 }}>
              <tbody>
                <tr><td>Кальци (Ca²⁺)</td><td>2.0–6.0 мг</td></tr>
                <tr><td>Магни (Mg²⁺)</td><td>1.0–4.0 мг</td></tr>
                <tr><td>Натри (Na⁺)</td><td>1.0–5.0 мг</td></tr>
                <tr><td>Кали (K⁺)</td><td>0.5–2.0 мг</td></tr>
                <tr><td>Бикарбонат (HCO₃⁻)</td><td>30–80 мг</td></tr>
                <tr><td>Хлорид (Cl⁻)</td><td>5–15 мг</td></tr>
                <tr><td>Сульфат (SO₄²⁻)</td><td>5–20 мг</td></tr>
              </tbody>
            </table>
          </div>
          <div style={{ paddingTop: 12 }}>
            <div className="badges">
              <span className="glass dark"><i><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5c3.4 4 5.8 7.2 5.8 10.2a5.8 5.8 0 0 1-11.6 0c0-3 2.4-6.2 5.8-10.2z" /></svg></i>Цэвэр</span>
              <span className="glass dark"><i><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="6" r="2.6" /><path d="M8 11h8M12 11v9M9.5 20l2.5-4 2.5 4" /></svg></i>Эрүүл</span>
              <span className="glass dark"><i><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 19c0-7 4-11 13-13-1 9-5 13-13 13z" /><path d="M5 19c3-4 6-7 10-9" /></svg></i>Эрч хүч</span>
            </div>
            <table className="minerals" style={{ marginTop: 26 }}>
              <tbody>
                <tr><td>Баллон</td><td>{s.bottleLabel}, буцаан солигддог</td></tr>
                <tr><td>Хадгалах хугацаа</td><td>14 хоног</td></tr>
                <tr><td>Хадгалах нөхцөл</td><td>0–30 °C, нарнаас хамгаална</td></tr>
                <tr><td>Үйлдвэрлэсэн</td><td>Өвөрхангай, Арвайхээр</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <h2>Хэрхэн ажилладаг</h2>
          <p className="lede">Гурван алхам. Ихэнх захиалга тухайн өдрөө хүрдэг.</p>
          <div className="stepcards">
            <div className="stepcard"><div className="n">1</div><h3>Захиалгаа өгнө</h3><p>Gmail-ээр нэвтэрч тоо, хаяг, хүргүүлэх цагаа сонгоно. Утсаар залгаж ч болно.</p></div>
            <div className="stepcard"><div className="n">2</div><h3>Хоосон баллоноо бэлдэнэ</h3><p>Сонгосон цагт тань хүрч очно. Хуучин баллоныг аваад дүүрэнээр солино.</p></div>
            <div className="stepcard"><div className="n">3</div><h3>Хүргэлтээр төлнө</h3><p>Бэлнээр эсвэл дансаар. Захиалгын төлөвийг сайт дээрээс харна.</p></div>
          </div>
        </div>
      </section>

      <section className="section alt" id="price">
        <div className="wrap">
          <h2>Үнэ</h2>
          <p className="lede">Нуугдмал төлбөргүй. Нэг үнэ, бүх багт.</p>
          <table className="price-table">
            <tbody>
              <tr><td>Баллонтой ус ({s.bottleLabel})</td><td>{price} / ширхэг</td></tr>
              <tr><td>Хүргэлт</td><td>{fee}</td></tr>
              {s.bonusEnabled && <tr><td>Урамшуулал</td><td>Нэг захиалгад {s.bonusBuy} баллон авбал {s.bonusFree} баллон нэмж бэлэглэнэ.</td></tr>}
              <tr><td>Төлбөр</td><td>Хүргэлтийн үед бэлнээр, эсвэл {s.bankName} {s.bankAccount}</td></tr>
              <tr><td>Хамгийн бага захиалга</td><td>1 баллон</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer className="site-foot" id="contact">
        <div className="wrap">
          <div className="cols">
            <div>
              <Lockup dark href="#top" size={26} className="" />
              <p style={{ marginTop: 16, maxWidth: 420 }}>Өвөрхангай аймаг, Арвайхээр сум. Захиалгыг эзэн нь өөрөө хүлээн авч, өөрөө хүргэдэг.</p>
            </div>
            <div>
              <h4>Холбоо барих</h4>
              <p><a href={`tel:${s.phone1}`}>{phone}</a></p>
              {s.phone2 && <p><a href={`tel:${s.phone2}`}>{fmtPhone(s.phone2)}</a></p>}
              <p>Өдөр бүр 09:00–17:00</p>
            </div>
            <div>
              <h4>Төлбөр</h4>
              <p>{s.bankName} {s.bankAccount}</p>
              <p>Гүйлгээний утга: захиалгын дугаар</p>
            </div>
          </div>
          <div className="bottom">
            <span>© {new Date().getFullYear()} Хишиг ус</span>
            <Link href="/admin" style={{ color: "#8FB0C8" }}>Эзний хэсэг</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroScene() {
  return (
    <svg className="scene" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2B2A5C" /><stop offset=".55" stopColor="#232B66" /><stop offset="1" stopColor="#1D3A78" /></linearGradient>
        <linearGradient id="hs-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E6BB0" /><stop offset=".5" stopColor="#22508F" /><stop offset="1" stopColor="#16376B" /></linearGradient>
        <radialGradient id="hs-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#8CC6F2" stopOpacity=".55" /><stop offset="1" stopColor="#8CC6F2" stopOpacity="0" /></radialGradient>
        <linearGradient id="hs-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".12" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
        <filter id="hs-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18" /></filter>
      </defs>
      <rect width="1440" height="800" fill="url(#hs-sky)" />
      <g filter="url(#hs-soft)">
        <path d="M260 -40 L470 -40 L860 620 L560 620 Z" fill="url(#hs-beam)" />
        <path d="M560 -40 L640 -40 L1040 620 L900 620 Z" fill="url(#hs-beam)" opacity=".7" />
      </g>
      <ellipse cx="1030" cy="540" rx="420" ry="150" fill="url(#hs-glow)" />
      <path d="M0 560 L120 480 L220 515 L360 410 L470 470 L600 372 L700 430 L820 390 L940 462 L1060 412 L1180 480 L1300 444 L1440 512 V600 H0 Z" fill="#343C86" opacity=".85" />
      <path d="M0 580 L160 498 L240 538 L380 440 L440 486 L560 408 L640 456 L760 420 L880 494 L1000 448 L1140 514 L1250 478 L1440 552 V620 H0 Z" fill="#1E2358" />
      <path d="M0 580 L160 498 L240 538 L380 440 L440 486 L560 408 L640 456 L760 420 L880 494 L1000 448 L1140 514 L1250 478 L1440 552" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="2" strokeLinejoin="round" />
      <rect y="540" width="1440" height="260" fill="url(#hs-water)" />
      <path d="M0 540 L160 498 L240 538 L380 440 L440 486 L560 408 L640 456 L760 420 L880 494 L1000 448 L1140 514 L1250 478 L1440 552 V540 Z" fill="#1E2358" opacity=".35" transform="translate(0 1080) scale(1 -1)" />
      <g stroke="rgba(255,255,255,.09)" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M120 600 Q220 592 320 600 T520 600" /><path d="M700 640 Q820 632 940 640 T1180 640" /><path d="M60 700 Q160 692 260 700 T460 700" />
        <path d="M980 700 Q1080 692 1180 700 T1380 700" /><path d="M420 760 Q540 752 660 760 T900 760" /><path d="M1100 590 Q1180 584 1260 590" />
      </g>
    </svg>
  );
}

function PanelRidge() {
  return (
    <svg className="ridge" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 250 L90 170 L130 200 L230 90 L290 150 L380 60 L440 130 L520 90 L600 200 V260 H0 Z" fill="rgba(255,255,255,.06)" />
    </svg>
  );
}
