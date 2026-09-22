import Link from "next/link";
import { IconSearch } from "@/components/icons";
import { fmtMoney } from "@/lib/domain";
import { customersWithStats } from "@/lib/queries";
import { ubDateStr } from "@/lib/time";
import { avatarStyle, initials } from "../reports/page";

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
  const sp = await searchParams;
  const sort: Sort = (["debt", "top", "recent", "name"] as Sort[]).includes(sp.sort as Sort) ? (sp.sort as Sort) : "recent";
  const q = (sp.q ?? "").trim().toLowerCase();
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
      <header className="pagehead" style={{ paddingBottom: 6 }}><div><h1>Хэрэглэгчид</h1><div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Арвайхээр · {all.length} хэрэглэгч</div></div></header>
      <section className="mx" style={{ marginTop: 10, borderRadius: 24, background: "var(--brand)", color: "#fff", padding: "18px 18px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#9BD98A" }}>Нийт авлага (өр)</div>
        <div className="hero-fig" style={{ fontSize: 36, marginTop: 6 }}>{fmtMoney(debtors.reduce((a, c) => a + c.debt, 0))}</div>
        <div style={{ fontSize: 13, color: "#C9CBEA", marginTop: 6 }}>{debtors.length} хэрэглэгч өртэй</div>
        <div className="grid3" style={{ marginTop: 16, gap: 8 }}>
          {[[all.length, "Бүгд"], [all.filter((c) => c.last && now.getTime() - c.last.getTime() < 30 * 86400000).length, "30 хоногт"], [all.filter((c) => ubDateStr(c.customer.createdAt) >= monthStart).length, "Энэ сар шинэ"]].map(([n, l]) => (
            <div key={String(l)} style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(255,255,255,.08)" }}><div style={{ fontSize: 18, fontWeight: 800 }}>{n}</div><div style={{ fontSize: 11.5, color: "#C9CBEA", marginTop: 2 }}>{l}</div></div>
          ))}
        </div>
      </section>
      <div className="mx" style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <form className="search" action="/admin/customers"><IconSearch /><input type="hidden" name="sort" value={sort} /><input className="inp" name="q" type="search" defaultValue={sp.q ?? ""} placeholder="Нэр, утас эсвэл баг" aria-label="Хэрэглэгч хайх" /></form>
        <div className="chips">{tab("recent", "Сүүлд")}{tab("debt", "Өртэй")}{tab("top", "Их авдаг")}{tab("name", "Нэрээр")}</div>
      </div>
      <section className="card mx" style={{ marginTop: 12, padding: "0 16px" }}>
        {list.length === 0 && <div className="muted" style={{ textAlign: "center", padding: "30px 0", fontSize: 14 }}>Хэрэглэгч олдсонгүй</div>}
        {list.map((c) => (
          <Link key={c.customer.id} href={`/admin/customers/${c.customer.id}`} className="custrow">
            <div className="avatar" style={avatarStyle(c.customer.id)}>{initials(c.customer.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cname">{c.customer.name}</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.customer.phone} · {c.customer.bag}-р баг · {c.orders} захиалга</div>
            </div>
            {sort === "top" ? <div style={{ textAlign: "right" }}><div style={{ fontWeight: 800 }}>{c.bottles}</div><div className="muted" style={{ fontSize: 12 }}>баллон</div></div>
              : c.debt > 0 ? <span className="debtbadge">{fmtMoney(c.debt)}</span>
              : <div className="muted" style={{ fontSize: 12.5, textAlign: "right", whiteSpace: "nowrap" }}>{ago(c.last, now)}</div>}
          </Link>
        ))}
      </section>
    </>
  );
}
