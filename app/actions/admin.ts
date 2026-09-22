"use server";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/db";
import { orderTotals, type Payment } from "@/lib/domain";
import { findCustomerByPhone, getOrder, getSettings, toDomainSettings, upsertCustomer } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";
import { notifyNewOrder } from "@/lib/telegram";
import { addDays, SLOTS, ubDateStr } from "@/lib/time";
import { firstIssue, isId, orderInput, paymentInput, settingsInput } from "@/lib/validation";
import type { ActionState } from "./orders";

function revalidateOrder(id: number, customerId?: number) {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/app");
  if (customerId) revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/admin/customers");
  revalidatePath("/admin/transactions");
  revalidatePath("/admin/reports");
}

export async function markOut(id: number): Promise<ActionState> {
  await requireAdmin();
  if (!isId(id)) return { error: "Буруу хүсэлт" };
  const db = await getDb();
  const rows = await db.update(schema.orders).set({ status: "out", outAt: new Date() })
    .where(and(eq(schema.orders.id, id), eq(schema.orders.status, "new"))).returning({ customerId: schema.orders.customerId });
  if (!rows.length) return { error: "Захиалгын төлөв өөрчлөгдсөн байна" };
  revalidateOrder(id, rows[0].customerId);
  return { ok: true };
}

export async function deliver(id: number, payment: Payment): Promise<ActionState> {
  await requireAdmin();
  if (!isId(id)) return { error: "Буруу хүсэлт" };
  if (!["cash", "transfer", "debt"].includes(payment)) return { error: "Төлбөрийн хэлбэр буруу" };
  const db = await getDb();
  const now = new Date();
  const rows = await db.update(schema.orders)
    .set({ status: "delivered", deliveredAt: now, payment })
    .where(and(eq(schema.orders.id, id), inArray(schema.orders.status, ["new", "out"])))
    .returning({ customerId: schema.orders.customerId, total: schema.orders.total, outAt: schema.orders.outAt });
  if (!rows.length) return { error: "Захиалга аль хэдийн хаагдсан байна" };
  const o = rows[0];
  if (!o.outAt) await db.update(schema.orders).set({ outAt: now }).where(eq(schema.orders.id, id));
  if (payment !== "debt") {
    await db.insert(schema.payments).values({ customerId: o.customerId, orderId: id, amount: o.total, method: payment, note: `Захиалга #${id}` });
  }
  revalidateOrder(id, o.customerId);
  return { ok: true };
}

export async function cancelByAdmin(id: number): Promise<ActionState> {
  await requireAdmin();
  if (!isId(id)) return { error: "Буруу хүсэлт" };
  const db = await getDb();
  const rows = await db.update(schema.orders).set({ status: "cancelled", cancelledAt: new Date() })
    .where(and(eq(schema.orders.id, id), inArray(schema.orders.status, ["new", "out"]))).returning({ customerId: schema.orders.customerId });
  if (!rows.length) return { error: "Хүргэгдсэн эсвэл цуцлагдсан захиалгыг цуцлах боломжгүй" };
  revalidateOrder(id, rows[0].customerId);
  return { ok: true };
}

// Undo a mistaken "delivered": back to "out" and drop the payment that was auto-recorded for it.
export async function revertDelivered(id: number): Promise<ActionState> {
  await requireAdmin();
  if (!isId(id)) return { error: "Буруу хүсэлт" };
  const db = await getDb();
  const rows = await db.update(schema.orders).set({ status: "out", deliveredAt: null, payment: null })
    .where(and(eq(schema.orders.id, id), eq(schema.orders.status, "delivered"))).returning({ customerId: schema.orders.customerId });
  if (!rows.length) return { error: "Захиалга хүргэгдсэн төлөвт биш байна" };
  await db.delete(schema.payments).where(eq(schema.payments.orderId, id));
  revalidateOrder(id, rows[0].customerId);
  return { ok: true };
}

export async function reopenCancelled(id: number): Promise<ActionState> {
  await requireAdmin();
  if (!isId(id)) return { error: "Буруу хүсэлт" };
  const db = await getDb();
  const rows = await db.update(schema.orders).set({ status: "new", cancelledAt: null })
    .where(and(eq(schema.orders.id, id), eq(schema.orders.status, "cancelled"))).returning({ customerId: schema.orders.customerId });
  if (!rows.length) return { error: "Захиалга цуцлагдсан төлөвт биш байна" };
  revalidateOrder(id, rows[0].customerId);
  return { ok: true };
}

export async function addPayment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = paymentInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const p = parsed.data;
  const db = await getDb();
  const [exists] = await db.select({ id: schema.customers.id }).from(schema.customers).where(eq(schema.customers.id, p.customerId));
  if (!exists) return { error: "Хэрэглэгч олдсонгүй" };
  await db.insert(schema.payments).values({ customerId: p.customerId, amount: p.amount, method: p.method, note: p.note || "Өр төлөлт" });
  revalidatePath(`/admin/customers/${p.customerId}`);
  revalidatePath("/admin/customers");
  revalidatePath("/admin/transactions");
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function deletePayment(id: number): Promise<ActionState> {
  await requireAdmin();
  if (!isId(id)) return { error: "Буруу хүсэлт" };
  const db = await getDb();
  // Only standalone debt repayments: a payment tied to an order is undone by reverting that order.
  const rows = await db.delete(schema.payments).where(and(eq(schema.payments.id, id), isNull(schema.payments.orderId))).returning({ customerId: schema.payments.customerId });
  if (!rows.length) return { error: "Гүйлгээ олдсонгүй" };
  revalidatePath(`/admin/customers/${rows[0].customerId}`);
  revalidatePath("/admin/customers");
  revalidatePath("/admin/transactions");
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function lookupCustomer(phone: string) {
  await requireAdmin();
  if (typeof phone !== "string" || phone.length > 20) return null;
  const c = await findCustomerByPhone(phone.replace(/\D/g, "").slice(-8));
  return c ? { name: c.name, bag: c.bag, street: c.street, unit: c.unit, note: c.note } : null;
}

// Orders taken over the phone: same validation, but the owner may pick any slot today or tomorrow.
export async function createOrderAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = orderInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const input = parsed.data;
  const today = ubDateStr(new Date());
  if (![today, addDays(today, 1)].includes(input.date) || !SLOTS.includes(input.slot)) return { error: "Хүргэх өдөр өнөөдөр эсвэл маргааш байх ёстой" };
  const s = toDomainSettings(await getSettings());
  if (s.price <= 0) return { error: "Тохиргоонд үнэ оруулаагүй байна" };
  const customer = await upsertCustomer({ phone: input.phone, name: input.name, bag: input.bag, street: input.street, unit: input.unit, note: input.note });
  const t = orderTotals(input.qty, s);
  const db = await getDb();
  const [order] = await db.insert(schema.orders).values({
    customerId: customer.id, userId: null, source: "admin",
    qtyPaid: t.qtyPaid, qtyFree: t.qtyFree, unitPrice: t.unitPrice, deliveryFee: t.deliveryFee, total: t.total,
    bag: input.bag, street: input.street, unit: input.unit, note: input.note, deliveryDate: input.date, slot: input.slot,
  }).returning();
  await notifyNewOrder(order, customer);
  revalidateOrder(order.id, customer.id);
  redirect(`/admin/orders/${order.id}`);
}

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData);
  const parsed = settingsInput.safeParse({ ...raw, bonusEnabled: raw.bonusEnabled === "on", acceptingOrders: raw.acceptingOrders === "on" });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const db = await getDb();
  await db.update(schema.settings).set({ ...parsed.data, updatedAt: new Date() }).where(eq(schema.settings.id, 1));
  revalidatePath("/");
  revalidatePath("/app");
  revalidatePath("/order");
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function getOrderForAdmin(id: number) {
  await requireAdmin();
  if (!isId(id)) return null;
  return getOrder(id);
}
