import { Lockup } from "@/components/Lockup";
import { AdminSideNav, AdminTabBar } from "@/components/TabBar";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="desk">
      <aside className="side">
        <Lockup dark href="/" size={18} tag={false} className="side-lockup" />
        <AdminSideNav />
        <div className="side-user">
          <div className="avatar" style={{ width: 38, height: 38, borderRadius: 12, background: "#7CC4EC", color: "#0E2A44", fontSize: 13 }}>{user.name.trim().charAt(0).toUpperCase()}</div>
          <div className="who"><b>{user.name}</b><span>{user.email}</span></div>
        </div>
        <div className="side-waves">
          <svg className="run-slow" viewBox="0 0 800 120" preserveAspectRatio="none" style={{ height: 120 }} aria-hidden="true"><path d="M0 60 Q50 44 100 60 T200 60 T300 60 T400 60 T500 60 T600 60 T700 60 T800 60 V120 H0 Z" fill="#2F7FC1" opacity=".35" /></svg>
          <svg className="run-mid" viewBox="0 0 800 120" preserveAspectRatio="none" style={{ height: 80 }} aria-hidden="true"><path d="M0 60 Q50 46 100 60 T200 60 T300 60 T400 60 T500 60 T600 60 T700 60 T800 60 V120 H0 Z" fill="#4A9FDB" opacity=".45" /></svg>
        </div>
      </aside>
      <div className="dmain">
        <main className="phone admin-phone">{children}</main>
      </div>
      <div className="admin-tb"><AdminTabBar /></div>
    </div>
  );
}
