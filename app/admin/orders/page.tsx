import Link from "next/link";
import { AdminOrderCard } from "@/components/AdminOrderCard";
import { IconPlus, IconSearch } from "@/components/icons";
import { WaterLink } from "@/components/WaterButton";
import { STATUS_LABEL, type Status } from "@/lib/domain";
import { listOrders } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Захиалгууд" };

const STATUSES: (Status | "all")[] = ["all", "new", "out", "delivered", "cancelled"];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ s?: string; q?: string }> }) {
  await requireAdmin();
  const { s, q } = await searchParams;
  const status = STATUSES.includes(s as Status) && s !== "all" ? (s as Status) : undefined;
  const query = q?.trim().slice(0, 60) || undefined;
  const orders = await listOrders({ status, q: query, limit: 300 });
  const qs = (st: string) => `/admin/orders?s=${st}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <>
      <header className="pagehead split" style={{ paddingBottom: 6 }}>
        <div><h1>Захиалгууд</h1><div className="sub">{orders.length} захиалга</div></div>
        <WaterLink href="/admin/orders/new" style={{ height: 44, padding: "0 14px", fontSize: 14, gap: 6 }}><IconPlus />Нэмэх</WaterLink>
      </header>
      <form className="mx search" action="/admin/orders" style={{ marginTop: 8 }}>
        <IconSearch />
        {status && <input type="hidden" name="s" value={status} />}
        <input className="inp" name="q" type="search" maxLength={60} defaultValue={q ?? ""} placeholder="Нэр эсвэл утасны дугаар" aria-label="Хайх" />
      </form>
      <nav className="mx chips" style={{ marginTop: 10 }} aria-label="Төлөвөөр шүүх">
        {STATUSES.map((st) => (
          <Link key={st} href={qs(st)} className={`chip${(st === "all" ? !status : status === st) ? " on" : ""}`}>{st === "all" ? "Бүгд" : STATUS_LABEL[st]}</Link>
        ))}
      </nav>
      <div className="olist" style={{ marginTop: 12 }}>
        {orders.map((o) => <AdminOrderCard key={o.id} order={o} showDate />)}
      </div>
      {orders.length === 0 && <div className="empty">Захиалга олдсонгүй</div>}
    </>
  );
}
