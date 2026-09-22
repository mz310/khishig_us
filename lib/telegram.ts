import type { Customer, Order } from "@/db/schema";
import { fmtMoney } from "./domain";
import { humanDate, slotLabel, type Slot } from "./time";

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));

// Fire-and-forget: a Telegram failure must never fail the order.
export async function notifyNewOrder(order: Order, customer: Customer) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const base = process.env.BETTER_AUTH_URL ?? "";
  const bottles = order.qtyPaid + order.qtyFree;
  const text = [
    `<b>Шинэ захиалга #${order.id}</b>${order.source === "admin" ? " (гараар)" : ""}`,
    `${esc(customer.name)} · <a href="tel:${customer.phone}">${customer.phone}</a>`,
    `${order.bag}-р баг, ${esc(order.street)}, ${esc(order.unit)}${order.note ? " · " + esc(order.note) : ""}`,
    `${bottles} баллон${order.qtyFree ? ` (${order.qtyFree} бэлэг)` : ""} · <b>${fmtMoney(order.total)}</b>`,
    `${humanDate(order.deliveryDate)}, ${slotLabel(order.slot as Slot)}`,
    base ? `${base}/admin/orders/${order.id}` : "",
  ].filter(Boolean).join("\n");
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
  } catch (e) {
    console.error("telegram notify failed", e);
  }
}
