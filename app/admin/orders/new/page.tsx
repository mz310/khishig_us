import Link from "next/link";
import { AdminOrderForm } from "@/components/AdminOrderForm";
import { IconBack } from "@/components/icons";
import { getSettings, toDomainSettings } from "@/lib/queries";
import { addDays, ubDateStr } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Захиалга нэмэх" };

export default async function NewAdminOrder() {
  const s = await getSettings();
  const today = ubDateStr(new Date());
  return (
    <>
      <header className="pagehead">
        <Link href="/admin" className="iconbtn" aria-label="Буцах"><IconBack /></Link>
        <div><h1>Захиалга нэмэх</h1><div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>Утсаар ирсэн захиалгыг бүртгэх</div></div>
      </header>
      <AdminOrderForm settings={toDomainSettings(s)} today={today} tomorrow={addDays(today, 1)} />
    </>
  );
}
