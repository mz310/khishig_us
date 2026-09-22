import Link from "next/link";
import { AudienceTabs } from "@/components/AudienceTabs";
import { Bottle } from "@/components/Bottle";
import { IconBank, IconCalendar, IconCart, IconClock, IconDrop, IconGift, IconHome, IconPhone, IconPin, IconReceipt, IconRefresh, IconRight, IconTruck } from "@/components/icons";
import { LiquidNav } from "@/components/LiquidNav";
import { MobileMenu } from "@/components/MobileMenu";
import { Lockup } from "@/components/Lockup";
import { WaterLink } from "@/components/WaterButton";
import { fmtMoney, fmtPhone } from "@/lib/domain";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const s = await getSettings();
  const price = s.price > 0 ? fmtMoney(s.price) : "Удахгүй";
  const fee = s.deliveryFee > 0 ? fmtMoney(s.deliveryFee) : "Үнэгүй";
  const phone = fmtPhone(s.phone1);
  const bonus = s.bonusEnabled ? `${s.bonusBuy} авбал ${s.bonusFree} нь бэлэг` : "";

  const navItems = [
    { href: "#top", label: "Нүүр" },
    { href: "#who", label: "Бидний тухай" },
    { href: "#water", label: "Усны тухай" },
    { href: "#price", label: "Үнэ" },
    { href: "#contact", label: "Холбоо" },
  ];

  return (
    <div className="site">
      <header className="site-top" id="top">
        <div className="wrap">
          <Lockup dark href="#top" />
          <LiquidNav className="dnav bare" itemClass="navi" ariaLabel="Үндсэн цэс" current="#top" items={navItems} />
          <div className="top-actions">
            <a href={`tel:${s.phone1}`} className="phone-link d-only"><IconPhone size={19} />{phone}</a>
            <WaterLink href="/app" className="blue top-cta d-only">Захиалах<IconRight size={18} /></WaterLink>
            <a href={`tel:${s.phone1}`} className="phone-pill m-only"><IconPhone size={17} />{phone}</a>
            <MobileMenu items={navItems} />
          </div>
        </div>
      </header>

      <section className="hero photo">
        <HeroPicture />
        <div className="hero-shade" />

        <div className="wrap hero-grid">
          <div className="hero-text">
            <span className="chip-glass glass dark"><IconPin size={17} />Арвайхээр сум</span>
            <h1><span className="w">Цэвэр ус,</span><br /><span className="w lt" style={{ animationDelay: ".12s" }}>хаалган дээр тань.</span></h1>
            <p className="hero-sub">Ариутгалтай савласан цэвэр ус<br />Арвайхээр суманд хүргэлттэй.</p>
            <div className="hero-cta">
              <WaterLink href="/app" className="blue hero-order"><IconCart size={24} />Захиалах<IconRight size={20} /></WaterLink>
              <span className="vsep" aria-hidden="true" />
              <a href={`tel:${s.phone1}`} className="hero-phone"><IconPhone size={24} />{phone}</a>
            </div>
            <div className="hero-stats glass dark">
              <div className="st"><i><IconDrop size={26} /></i><div><b>{price}</b><small>/ баллон</small></div></div>
              <div className="sep" />
              <div className="st fee"><i><IconTruck size={26} /></i><div className="two">{s.deliveryFee > 0 ? <>Хүргэлт<br />{fee}</> : <>Үнэгүй<br />хүргэлт</>}</div></div>
              {s.bonusEnabled && (
                <>
                  <div className="sep" />
                  <div className="st"><i className="leaf"><IconGift size={26} /></i><div><small style={{ marginTop: 0 }}>{s.bonusBuy} авбал</small><span className="pill">+{s.bonusFree} бэлэг</span></div></div>
                </>
              )}
            </div>
          </div>
        </div>

        <a href="#who" className="hero-scroll m-only" aria-label="Доош гүйлгэх"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" /></svg></a>
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
                  <li><i><IconHome size={20} /></i><span><b>Хаалган дээр</b><span>Байр, хашаа ялгаагүй. Орцны код, давхраа бичээд орхино.</span></span></li>
                  <li><i><IconClock size={20} /></i><span><b>Цагаа өөрөө сонгоно</b><span>09–12, 12–15, 15–17, эсвэл аль болох хурдан.</span></span></li>
                  <li><i><IconRefresh size={20} /></i><span><b>Нэг товчоор дахин</b><span>Хаяг, тоо санагдсан байна. Дараагийн удаа 10 секунд.</span></span></li>
                </ul>
              </>
            )}
            org={(
              <>
                <h2>Оффис, дэлгүүр, сургуульд тогтмол ус.</h2>
                <p className="lede">Долоо хоногийн хуваариар хүргэж, сарын эцэст нэг тооцоо хийнэ. Дансаар төлөхөд баримт гарна.</p>
                <ul className="benefits">
                  <li><i><IconCalendar size={20} /></i><span><b>Тогтмол хуваарь</b><span>Даваа, Пүрэв гэх мэт. Утсаар нэг удаа тохироод л болно.</span></span></li>
                  <li><i><IconReceipt size={20} /></i><span><b>Сарын нэгдсэн тооцоо</b><span>Хэдэн баллон, хэдэн төгрөг — нэг хуудсанд. Өр, төлөлт тодорхой.</span></span></li>
                  <li><i><IconBank size={20} /></i><span><b>Дансаар, баримттай</b><span>Нягтлан бодогчид ойлгомжтой. Бэлнээр ч болно.</span></span></li>
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
        <div className="wrap two-col reveal">
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
        <div className="wrap reveal">
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
        <div className="wrap reveal">
          <h2>Үнэ</h2>
          <p className="lede">Нуугдмал төлбөргүй. Нэг үнэ, бүх багт.</p>
          <div className="price-grid">
            <table className="price-table">
              <tbody>
                <tr><td>Баллонтой ус ({s.bottleLabel})</td><td>{price} / ширхэг</td></tr>
                <tr><td>Хүргэлт</td><td>{fee}</td></tr>
                {s.bonusEnabled && <tr><td>Урамшуулал</td><td>Нэг захиалгад {s.bonusBuy} баллон авбал {s.bonusFree} баллон нэмж бэлэглэнэ.</td></tr>}
                <tr><td>Төлбөр</td><td>Хүргэлтийн үед бэлнээр, эсвэл {s.bankName} {s.bankAccount}</td></tr>
                <tr><td>Хамгийн бага захиалга</td><td>1 баллон</td></tr>
              </tbody>
            </table>
            <div className="price-cta">
              <div>
                <div className="k">{s.bottleLabel} баллон</div>
                <div className="big">{price}{s.price > 0 && <small>/ ширхэг</small>}</div>
                <p>{s.deliveryFee > 0 ? `Хүргэлт ${fee}.` : "Хүргэлт үнэгүй."} Өнөөдөр 17:00-оос өмнө захиалбал тухайн өдөртөө хүрнэ.</p>
              </div>
              <div className="acts">
                <WaterLink href="/app" className="blue"><IconCart size={20} />Захиалах<IconRight size={18} /></WaterLink>
                <a href={`tel:${s.phone1}`} className="phone-link"><IconPhone size={19} />{phone}</a>
              </div>
              <div className="waves" aria-hidden="true">
                <svg className="run-slow" viewBox="0 0 800 90" preserveAspectRatio="none" style={{ height: 90 }}><path d="M0 44 Q50 28 100 44 T200 44 T300 44 T400 44 T500 44 T600 44 T700 44 T800 44 V90 H0 Z" fill="#2F7FC1" opacity=".55" /></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-foot" id="contact">
        <div className="wrap">
          <div className="cols">
            <div>
              <Lockup dark href="#top" size={26} />
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
            <Link href="/admin">Эзний хэсэг</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// The lake photo. Phones get a jug-centred crop drawn for 1–3× screens; wider screens get the full scene,
// which covers a hero at least 2050px wide (820px tall at 2.5:1). AVIF first, WebP next, JPEG last.
const HERO = "/hero-v2";
const set = (name: string, ext: string, widths: number[]) => widths.map((w) => `${HERO}-${name}-${w}.${ext} ${w}w`).join(", ");
const PHONE = { media: "(max-width: 760px)", sizes: "146vw", widths: [1000, 1400, 1800] };
const WIDE = { sizes: "(max-width: 960px) max(100vw, 165vh), max(100vw, 2050px)", widths: [1400, 2200, 3000] };

function HeroPicture() {
  return (
    <picture className="hero-bg" aria-hidden="true">
      <source media={PHONE.media} type="image/avif" srcSet={set("phone", "avif", PHONE.widths)} sizes={PHONE.sizes} />
      <source media={PHONE.media} type="image/webp" srcSet={set("phone", "webp", PHONE.widths)} sizes={PHONE.sizes} />
      <source type="image/avif" srcSet={set("wide", "avif", WIDE.widths)} sizes={WIDE.sizes} />
      <source type="image/webp" srcSet={set("wide", "webp", WIDE.widths)} sizes={WIDE.sizes} />
      <img src={`${HERO}-wide-2200.jpg`} alt="" width={2200} height={880} fetchPriority="high" />
    </picture>
  );
}

function PanelRidge() {
  return (
    <svg className="ridge" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 250 L90 170 L130 200 L230 90 L290 150 L380 60 L440 130 L520 90 L600 200 V260 H0 Z" fill="rgba(255,255,255,.06)" />
    </svg>
  );
}
