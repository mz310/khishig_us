import Link from "next/link";
import { AdminOrderCard } from "@/components/AdminOrderCard";
import { IconPlus, IconSearch } from "@/components/icons";
import { WaterLink } from "@/components/WaterButton";
import { STATUS_LABEL, type Status } from "@/lib/domain";
import { listOrders } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Захиалгууд" };

const STATUSES: (Status | "all")[] = ["all", "new", "out", "delivered", "cancelled"];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ s?: string; q?: string }> }) {
  const { s, q } = await searchParams;
  const status = STATUSES.includes(s as Status) && s !== "all" ? (s as Status) : undefined;
  const orders = await listOrders({ status, q, limit: 300 });
  const qs = (st: string) => `/admin/orders?s=${st}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <>
      <header className="pagehead" style={{ paddingBottom: 6, justifyContent: "space-between" }}>
        <div><h1>Захиалгууд</h1><div className="muted" style={{ fontSize: 13, marginTop: 3 }}>{orders.length} захиалга</div></div>
        <WaterLink href="/admin/orders/new" style={{ height: 44, padding: "0 14px", fontSize: 14, gap: 6 }}><IconPlus />Нэмэх</WaterLink>
      </header>
      <form className="mx search" action="/admin/orders" style={{ marginTop: 8 }}>
        <IconSearch />
        {status && <input type="hidden" name="s" value={status} />}
        <input className="inp" name="q" type="search" defaultValue={q ?? ""} placeholder="Нэр эсвэл утасны дугаар" aria-label="Хайх" />
      </form>
      <div className="mx chips" style={{ marginTop: 10 }}>
        {STATUSES.map((st) => (
          <Link key={st} href={qs(st)} className={`chip${(st === "all" ? !status : status === st) ? " on" : ""}`}>{st === "all" ? "Бүгд" : STATUS_LABEL[st]}</Link>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        {orders.map((o) => <AdminOrderCard key={o.id} order={o} showDate />)}
        {orders.length === 0 && <div className="muted" style={{ textAlign: "center", padding: "40px 20px", fontSize: 14 }}>Захиалга олдсонгүй</div>}
      </div>
    </>
  );
}
