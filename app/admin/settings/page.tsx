import { SettingsForm } from "@/components/SettingsForm";
import { getSettings } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Тохиргоо" };

export default async function AdminSettings() {
  await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <header className="pagehead" style={{ paddingBottom: 6 }}><div><h1>Тохиргоо</h1><div className="sub">Үнэ, урамшуулал, холбоо барих</div></div></header>
      <SettingsForm s={s} />
    </>
  );
}
