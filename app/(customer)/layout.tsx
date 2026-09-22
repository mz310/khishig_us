import { CustomerTabBar } from "@/components/TabBar";
import { requireUser } from "@/lib/session";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <>
      <main className="phone">{children}</main>
      <CustomerTabBar />
    </>
  );
}
