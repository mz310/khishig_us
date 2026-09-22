import Link from "next/link";
import { AudienceTabs } from "@/components/AudienceTabs";
import { Bottle } from "@/components/Bottle";
import { IconBank, IconCalendar, IconCart, IconClock, IconDrop, IconGift, IconHome, IconPhone, IconPin, IconReceipt, IconRefresh, IconRight, IconTruck } from "@/components/icons";
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
            className="dnav bare"
            itemClass="navi"
            ariaLabel="Үндсэн цэс"
            current="#top"
            items={[
              { href: "#top", label: "Нүүр" },
              { href: "#who", label: "Бидний тухай" },
              { href: "#water", label: "Усны тухай" },
              { href: "#price", label: "Үнэ" },
              { href: "#contact", label: "Холбоо" },
            ]}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a href={`tel:${s.phone1}`} className="phone-link big"><IconPhone size={19} />{phone}</a>
            <WaterLink href="/app" className="blue" style={{ height: 50, padding: "0 12px 0 24px", fontSize: 15.5, borderRadius: 25 }}>Захиалах<IconRight size={18} /></WaterLink>
          </div>
        </div>
      </header>

      <section className="hero photo">
        <picture className="hero-bg" aria-hidden="true">
          <source media="(max-width: 760px)" srcSet="/hero-bg-mobile.webp" type="image/webp" />
          <source srcSet="/hero-bg.webp" type="image/webp" />
          <img src="/hero-bg.jpg" alt="" fetchPriority="high" />
        </picture>
        <div className="hero-shade" />

        <div className="wrap hero-grid">
          <div className="hero-text">
            <span className="chip-glass glass dark"><IconPin size={17} />Арвайхээр сум</span>
            <h1><span className="w">Цэвэр ус,</span><br /><span className="w lt" style={{ animationDelay: ".12s" }}>хаалган дээр тань.</span></h1>
            <p className="hero-sub">Ариутгалтай савласан цэвэр ус<br />Арвайхээр суманд хүргэлттэй.</p>
            <div className="hero-cta">
              <WaterLink href="/app" className="blue" style={{ height: 66, padding: "0 30px 0 34px", fontSize: 20, borderRadius: 33 }}>
                <IconCart size={24} />Захиалах<IconRight size={20} />
              </WaterLink>
              <span className="vsep" aria-hidden="true" />
              <a href={`tel:${s.phone1}`} className="hero-phone"><IconPhone size={24} />{phone}</a>
            </div>
            <div className="hero-stats glass dark">
              <div className="st"><i><IconDrop size={26} /></i><div><b>{price}</b><small>/ баллон</small></div></div>
              <div className="sep" />
              <div className="st"><i><IconTruck size={26} /></i><div className="two">{s.deliveryFee > 0 ? <>Хүргэлт<br />{fee}</> : <>Үнэгүй<br />хүргэлт</>}</div></div>
              {s.bonusEnabled && (
                <>
                  <div className="sep" />
                  <div className="st"><i className="leaf"><IconGift size={26} /></i><div><small style={{ marginTop: 0 }}>{s.bonusBuy} авбал</small><span className="pill">+{s.bonusFree} бэлэг</span></div></div>
                </>
              )}
            </div>
          </div>
        </div>

        {s.bonusEnabled && (
          <div className="hero-bubble" aria-hidden="true">
            <span className="ico"><IconGift size={30} /></span>
            <span>{s.bonusBuy} авбал<b>+{s.bonusFree} бэлэг</b></span>
          </div>
        )}
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

function PanelRidge() {
  return (
    <svg className="ridge" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 250 L90 170 L130 200 L230 90 L290 150 L380 60 L440 130 L520 90 L600 200 V260 H0 Z" fill="rgba(255,255,255,.06)" />
    </svg>
  );
}
