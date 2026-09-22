import Link from "next/link";
import { IconSearch } from "@/components/icons";
import { fmtMoney, fmtPhone } from "@/lib/domain";
import { customersWithStats } from "@/lib/queries";
import { ubDateStr } from "@/lib/time";
import { avatarStyle, initials } from "@/lib/avatar";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Хэрэглэгчид" };

type Sort = "debt" | "top" | "recent" | "name";

function ago(d: Date | null, now: Date) {
  if (!d) return "—";
  const x = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (x <= 0) return "өнөөдөр";
  if (x === 1) return "өчигдөр";
  if (x < 30) return `${x} хоногийн өмнө`;
  if (x < 365) return `${Math.floor(x / 30)} сарын өмнө`;
  return `${Math.floor(x / 365)} жилийн өмнө`;
}

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const sort: Sort = (["debt", "top", "recent", "name"] as Sort[]).includes(sp.sort as Sort) ? (sp.sort as Sort) : "recent";
  const q = (sp.q ?? "").trim().slice(0, 60).toLowerCase();
  const now = new Date();
  const all = await customersWithStats();
  const monthStart = ubDateStr(now).slice(0, 7) + "-01";
  const debtors = all.filter((c) => c.debt > 0);
  let list = all.filter((c) => !q || c.customer.name.toLowerCase().includes(q) || c.customer.phone.includes(q) || `${c.customer.bag}-р баг`.includes(q));
  if (sort === "debt") list = list.filter((c) => c.debt > 0).sort((a, b) => b.debt - a.debt);
  else if (sort === "top") list = list.sort((a, b) => b.bottles - a.bottles);
  else if (sort === "name") list = list.sort((a, b) => a.customer.name.localeCompare(b.customer.name));
  else list = list.sort((a, b) => (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0));
  const tab = (id: Sort, label: string) => <Link key={id} href={`/admin/customers?sort=${id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`chip${sort === id ? " on" : ""}`}>{label}</Link>;

  return (
    <>
      <header className="pagehead" style={{ paddingBottom: 6 }}><div><h1>Хэрэглэгчид</h1><div className="sub">Арвайхээр · {all.length} хэрэглэгч</div></div></header>
      <section className="mx navy-card" style={{ marginTop: 10 }}>
        <div className="k">Нийт авлага (өр)</div>
        <div className="hero-fig" style={{ fontSize: 36, marginTop: 6 }}>{fmtMoney(debtors.reduce((a, c) => a + c.debt, 0))}</div>
        <div className="s">{debtors.length} хэрэглэгч өртэй</div>
        <div className="grid3" style={{ marginTop: 16, gap: 8 }}>
          {[[all.length, "Бүгд"], [all.filter((c) => c.last && now.getTime() - c.last.getTime() < 30 * 86400000).length, "30 хоногт"], [all.filter((c) => ubDateStr(c.customer.createdAt) >= monthStart).length, "Энэ сар шинэ"]].map(([n, l]) => (
            <div key={String(l)} className="cell"><b>{n}</b><span>{l}</span></div>
          ))}
        </div>
      </section>
      <div className="mx stack" style={{ marginTop: 14, gap: 10 }}>
        <form className="search" action="/admin/customers" role="search"><IconSearch /><input type="hidden" name="sort" value={sort} /><input className="inp" name="q" type="search" maxLength={60} defaultValue={sp.q ?? ""} placeholder="Нэр, утас эсвэл баг" aria-label="Хэрэглэгч хайх" /></form>
        <nav className="chips" aria-label="Эрэмбэлэх">{tab("recent", "Сүүлд")}{tab("debt", "Өртэй")}{tab("top", "Их авдаг")}{tab("name", "Нэрээр")}</nav>
      </div>
      <section className="card mx" style={{ marginTop: 12, padding: "0 16px" }}>
        {list.length === 0 && <div className="empty" style={{ padding: "30px 0" }}>Хэрэглэгч олдсонгүй</div>}
        {list.map((c) => (
          <Link key={c.customer.id} href={`/admin/customers/${c.customer.id}`} className="custrow">
            <div className="avatar" style={avatarStyle(c.customer.id)}>{initials(c.customer.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cname">{c.customer.name}</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtPhone(c.customer.phone)} · {c.customer.bag}-р баг · {c.orders} захиалга</div>
            </div>
            {sort === "top" ? <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontWeight: 800 }} className="num">{c.bottles}</div><div className="muted" style={{ fontSize: 12 }}>баллон</div></div>
              : c.debt > 0 ? <span className="debtbadge">{fmtMoney(c.debt)}</span>
              : <div className="muted" style={{ fontSize: 12.5, textAlign: "right", whiteSpace: "nowrap" }}>{ago(c.last, now)}</div>}
          </Link>
        ))}
      </section>
    </>
  );
}
