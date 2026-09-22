import { SettingsForm } from "@/components/SettingsForm";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Тохиргоо" };

export default async function AdminSettings() {
  const s = await getSettings();
  return (
    <>
      <header className="pagehead" style={{ paddingBottom: 6 }}><div><h1>Тохиргоо</h1><div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Үнэ, урамшуулал, холбоо барих</div></div></header>
      <SettingsForm s={s} />
    </>
  );
}
