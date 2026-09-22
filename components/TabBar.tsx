import { IconCalendar, IconChart, IconDrop, IconGear, IconHome, IconList, IconReceipt, IconUser, IconUsers } from "./icons";
import { LiquidNav } from "./LiquidNav";

export function CustomerTabBar() {
  return (
    <LiquidNav
      className="tb glass"
      itemClass="tab"
      ariaLabel="Үндсэн цэс"
      items={[
        { href: "/app", label: "Нүүр", icon: <IconHome /> },
        { href: "/order", label: "Захиалах", icon: <IconDrop /> },
        { href: "/orders", label: "Захиалгууд", icon: <IconList />, prefix: true },
        { href: "/profile", label: "Профайл", icon: <IconUser /> },
      ]}
    />
  );
}

export const adminItems = [
  { href: "/admin", label: "Өнөөдөр", icon: <IconCalendar /> },
  { href: "/admin/orders", label: "Захиалга", icon: <IconList />, prefix: true },
  { href: "/admin/customers", label: "Хэрэглэгч", icon: <IconUsers />, prefix: true },
  { href: "/admin/transactions", label: "Гүйлгээ", icon: <IconReceipt /> },
  { href: "/admin/settings", label: "Тохиргоо", icon: <IconGear /> },
];

export function AdminTabBar() {
  return <LiquidNav className="tb glass five" itemClass="tab" ariaLabel="Admin цэс" items={adminItems} />;
}

export function AdminSideNav() {
  return (
    <LiquidNav
      className="vnav"
      itemClass="vitem"
      vertical
      ariaLabel="Admin цэс"
      items={[
        { href: "/admin", label: "Өнөөдөр", icon: <IconCalendar size={20} /> },
        { href: "/admin/orders", label: "Захиалгууд", icon: <IconList size={20} />, prefix: true },
        { href: "/admin/customers", label: "Хэрэглэгчид", icon: <IconUsers size={20} />, prefix: true },
        { href: "/admin/transactions", label: "Гүйлгээ", icon: <IconReceipt size={20} /> },
        { href: "/admin/reports", label: "Тайлан", icon: <IconChart size={20} /> },
        { href: "/admin/settings", label: "Тохиргоо", icon: <IconGear size={20} /> },
      ]}
    />
  );
}
