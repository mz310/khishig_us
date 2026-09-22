// Business rules that do not touch the database. Kept pure so they can be unit tested.

export type Settings = {
  price: number;
  deliveryFee: number;
  bonusEnabled: boolean;
  bonusBuy: number;
  bonusFree: number;
  acceptingOrders: boolean;
};

export type Status = "new" | "out" | "delivered" | "cancelled";
export type Payment = "cash" | "transfer" | "debt";
export type Actor = "customer" | "admin";

export const MIN_QTY = 1;
export const MAX_QTY = 20;
export const MAX_OPEN_ORDERS = 3;
// Per signed-in account, across every phone it orders for: caps spam and number squatting.
export const MAX_OPEN_ORDERS_PER_USER = 5;
export const MAX_ORDERS_PER_USER_PER_DAY = 10;
export const MAX_PHONES_PER_USER = 3;

export function freeBottles(qtyPaid: number, s: Settings): number {
  if (!s.bonusEnabled || s.bonusBuy <= 0 || s.bonusFree <= 0) return 0;
  return Math.floor(qtyPaid / s.bonusBuy) * s.bonusFree;
}

export function orderTotals(qtyPaid: number, s: Settings) {
  if (!Number.isInteger(qtyPaid) || qtyPaid < MIN_QTY || qtyPaid > MAX_QTY) {
    throw new Error(`Тоо ${MIN_QTY}–${MAX_QTY} хооронд байх ёстой`);
  }
  const qtyFree = freeBottles(qtyPaid, s);
  return {
    qtyPaid,
    qtyFree,
    unitPrice: s.price,
    deliveryFee: s.deliveryFee,
    total: qtyPaid * s.price + s.deliveryFee,
  };
}

export function canOrder(s: Settings): boolean {
  return s.acceptingOrders && s.price > 0;
}

export const PHONE_RE = /^[6-9]\d{7}$/;

export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("976")) digits = digits.slice(3);
  return PHONE_RE.test(digits) ? digits : null;
}

export function isPhone(value: string): boolean {
  return PHONE_RE.test(value);
}

export function canTransition(from: Status, to: Status, actor: Actor): boolean {
  if (to === "cancelled") {
    if (from === "new") return true;
    if (from === "out") return actor === "admin";
    return false;
  }
  if (actor !== "admin") return false;
  return (from === "new" && to === "out") || (from === "out" && to === "delivered");
}

export function debtOf(deliveredTotal: number, paid: number): number {
  return Math.max(0, deliveredTotal - paid);
}

export function ordersOpen(statuses: Status[]): number {
  return statuses.filter((x) => x === "new" || x === "out").length;
}

export const STATUS_LABEL: Record<Status, string> = {
  new: "Шинэ",
  out: "Замдаа",
  delivered: "Хүргэсэн",
  cancelled: "Цуцалсан",
};

export const PAYMENT_LABEL: Record<Payment, string> = {
  cash: "Бэлэн",
  transfer: "Данс",
  debt: "Өр",
};

export function fmtMoney(n: number): string {
  return Math.round(n).toLocaleString("en-US") + "₮";
}

// 88027971 -> "8802 7971"; anything that is not a plain 8-digit number is shown as entered.
export function fmtPhone(p: string): string {
  return /^\d{8}$/.test(p) ? `${p.slice(0, 4)} ${p.slice(4)}` : p;
}
