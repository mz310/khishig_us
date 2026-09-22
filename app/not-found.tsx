import { Lockup } from "@/components/Lockup";
import { WaterLink } from "@/components/WaterButton";

export const metadata = { title: "Хуудас олдсонгүй" };

export default function NotFound() {
  return (
    <main className="phone login" style={{ textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}><Lockup href="/" size={24} /></div>
      <div className="hero-fig" style={{ fontSize: 64, marginTop: 36, color: "var(--water)" }}>404</div>
      <h1>Хуудас олдсонгүй</h1>
      <p className="lede">Хаяг буруу эсвэл энэ хуудас устгагдсан байна.</p>
      <WaterLink href="/" style={{ height: 52, padding: "0 26px", fontSize: 15.5, alignSelf: "center" }}>Нүүр хуудас руу</WaterLink>
    </main>
  );
}
