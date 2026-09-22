"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/db";
import { canOrder, canTransition, MAX_OPEN_ORDERS, orderTotals } from "@/lib/domain";
import { countOpenOrders, getOrder, getSettings, toDomainSettings, upsertCustomer } from "@/lib/queries";
import { getSessionUser } from "@/lib/session";
import { notifyNewOrder } from "@/lib/telegram";
import { isSlotAllowed } from "@/lib/time";
import { firstIssue, orderInput } from "@/lib/validation";

export type ActionState = { error?: string; ok?: boolean };

export async function createOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { error: "Нэвтэрсний дараа захиална уу" };
  const parsed = orderInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const input = parsed.data;

  const settingsRow = await getSettings();
  const s = toDomainSettings(settingsRow);
  if (!canOrder(s)) return { error: "Захиалга түр хаалттай байна. 8802 7971 руу залгана уу." };
  if (!isSlotAllowed(new Date(), input.date, input.slot)) return { error: "Сонгосон цагийн хүрээ өнгөрсөн байна. Дахин сонгоно уу." };

  const customer = await upsertCustomer({ phone: input.phone, name: input.name, bag: input.bag, street: input.street, unit: input.unit, note: input.note });
  if ((await countOpenOrders(customer.id)) >= MAX_OPEN_ORDERS) {
    return { error: `Нэг зэрэг ${MAX_OPEN_ORDERS}-аас олон нээлттэй захиалга байж болохгүй. Өмнөх захиалга хүргэгдсэний дараа дахин захиална уу.` };
  }

  const t = orderTotals(input.qty, s);
  const db = await getDb();
  const [order] = await db.insert(schema.orders).values({
    customerId: customer.id,
    userId: user.id,
    source: "web",
    qtyPaid: t.qtyPaid,
    qtyFree: t.qtyFree,
    unitPrice: t.unitPrice,
    deliveryFee: t.deliveryFee,
    total: t.total,
    bag: input.bag,
    street: input.street,
    unit: input.unit,
    note: input.note,
    deliveryDate: input.date,
    slot: input.slot,
  }).returning();

  await notifyNewOrder(order, customer);
  revalidatePath("/admin");
  redirect(`/orders/${order.id}?new=1`);
}

export async function cancelMyOrder(id: number): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { error: "Нэвтэрнэ үү" };
  const order = await getOrder(id);
  if (!order || order.userId !== user.id) return { error: "Захиалга олдсонгүй" };
  if (!canTransition(order.status as "new", "cancelled", "customer")) {
    return { error: "Хүргэлтэнд гарсан тул цуцлахын тулд залгана уу." };
  }
  const db = await getDb();
  // Conditional update: if the owner marked it out meanwhile, nothing changes.
  const rows = await db.update(schema.orders)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(and(eq(schema.orders.id, id), eq(schema.orders.status, "new"))).returning({ id: schema.orders.id });
  if (rows.length === 0) return { error: "Захиалга аль хэдийн хүргэлтэнд гарсан байна." };
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/admin");
  return { ok: true };
}
