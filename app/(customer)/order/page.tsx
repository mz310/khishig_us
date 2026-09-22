import Link from "next/link";
import { IconBack } from "@/components/icons";
import { OrderForm } from "@/components/OrderForm";
import { canOrder } from "@/lib/domain";
import { getSettings, myOrders, toDomainSettings } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { availableSlots } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Захиалах" };

export default async function OrderPage({ searchParams }: { searchParams: Promise<{ qty?: string }> }) {
  const user = await requireUser("/order");
  const [s, orders, { qty }] = await Promise.all([getSettings(), myOrders(user.id, 1), searchParams]);
  const domain = toDomainSettings(s);
  const last = orders[0];
  const slots = availableSlots(new Date());

  return (
    <>
      <header className="pagehead">
        <Link href="/app" className="iconbtn" aria-label="Буцах"><IconBack /></Link>
        <h1>Захиалга</h1>
      </header>
      {!canOrder(domain) ? (
        <section className="card mx" style={{ padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Захиалга удахгүй нээгдэнэ</div>
          <p className="muted" style={{ fontSize: 14, margin: "8px 0 0" }}>Одоогоор утсаар захиална уу: <a href={`tel:${s.phone1}`} style={{ fontWeight: 700 }}>{s.phone1}</a></p>
        </section>
      ) : (
        <OrderForm
          settings={{ ...domain, bottleLabel: s.bottleLabel, bankName: s.bankName, bankAccount: s.bankAccount }}
          slots={slots}
          prefill={{
            qty: Math.min(20, Math.max(1, Number(qty) || last?.qtyPaid || 2)),
            name: last?.customer.name ?? user.name,
            phone: last?.customer.phone ?? "",
            bag: last?.bag ?? 1,
            street: last?.street ?? "",
            unit: last?.unit ?? "",
            note: last?.note ?? "",
          }}
        />
      )}
    </>
  );
}
