import { and, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Customer, Order, PaymentRow, SettingsRow } from "@/db/schema";
import { debtOf, type Settings, type Status } from "./domain";

const { customers, orders, payments, settings } = schema;

export async function getSettings(): Promise<SettingsRow> {
  const db = await getDb();
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  if (rows[0]) return rows[0];
  await db.insert(schema.settings).values({ id: 1 });
  return (await db.select().from(settings).where(eq(settings.id, 1)))[0];
}

export function toDomainSettings(s: SettingsRow): Settings {
  return {
    price: s.price,
    deliveryFee: s.deliveryFee,
    bonusEnabled: s.bonusEnabled,
    bonusBuy: s.bonusBuy,
    bonusFree: s.bonusFree,
    acceptingOrders: s.acceptingOrders,
  };
}

export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  const db = await getDb();
  return (await db.select().from(customers).where(eq(customers.phone, phone)))[0] ?? null;
}

export type CustomerInput = { phone: string; name: string; bag: number; street: string; unit: string; note: string };

export class PhoneOwnedByOther extends Error {}

// One customer per phone number; a repeat order refreshes the name and address on file.
// A web order claims the phone for its account (userId); another account may not edit or order under it.
// Phone orders taken by the owner pass no userId and never change the claim.
export async function upsertCustomer(c: CustomerInput, userId?: string): Promise<Customer> {
  const db = await getDb();
  const existing = await findCustomerByPhone(c.phone);
  if (existing) {
    if (userId && existing.userId && existing.userId !== userId) throw new PhoneOwnedByOther();
    const [row] = await db.update(customers)
      .set({ name: c.name, bag: c.bag, street: c.street, unit: c.unit, note: c.note, userId: existing.userId ?? userId ?? null, updatedAt: new Date() })
      .where(eq(customers.id, existing.id)).returning();
    return row;
  }
  const [row] = await db.insert(customers).values({ ...c, userId: userId ?? null }).returning();
  return row;
}

export async function countOpenOrders(customerId: number): Promise<number> {
  const db = await getDb();
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(orders)
    .where(and(eq(orders.customerId, customerId), inArray(orders.status, ["new", "out"])));
  return r?.n ?? 0;
}

// Abuse limits for web orders, counted per signed-in account.
export async function userOrderLoad(userId: string, since: Date): Promise<{ open: number; recent: number; phones: number }> {
  const db = await getDb();
  const [o] = await db.select({
    open: sql<number>`count(*) filter (where ${orders.status} in ('new', 'out'))::int`,
    recent: sql<number>`count(*) filter (where ${orders.createdAt} >= ${since.toISOString()}::timestamptz)::int`,
  }).from(orders).where(eq(orders.userId, userId));
  const [c] = await db.select({ n: sql<number>`count(*)::int` }).from(customers).where(eq(customers.userId, userId));
  return { open: o?.open ?? 0, recent: o?.recent ?? 0, phones: c?.n ?? 0 };
}

export type OrderWithCustomer = Order & { customer: Customer };

function join(rows: { o: Order; c: Customer }[]): OrderWithCustomer[] {
  return rows.map(({ o, c }) => ({ ...o, customer: c }));
}

export async function myOrders(userId: string, limit = 50): Promise<OrderWithCustomer[]> {
  const db = await getDb();
  const rows = await db.select({ o: orders, c: customers }).from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)).limit(limit);
  return join(rows);
}

export async function getOrder(id: number): Promise<OrderWithCustomer | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const db = await getDb();
  const rows = await db.select({ o: orders, c: customers }).from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id)).where(eq(orders.id, id));
  return join(rows)[0] ?? null;
}

export async function ordersForDate(dateStr: string): Promise<OrderWithCustomer[]> {
  const db = await getDb();
  const rows = await db.select({ o: orders, c: customers }).from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.deliveryDate, dateStr)).orderBy(orders.createdAt);
  return join(rows);
}

// Orders whose delivery date has passed but are still open — must not fall off the admin's radar.
export async function overdueOpenOrders(todayStr: string): Promise<OrderWithCustomer[]> {
  const db = await getDb();
  const rows = await db.select({ o: orders, c: customers }).from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(and(lt(orders.deliveryDate, todayStr), inArray(orders.status, ["new", "out"]))).orderBy(orders.deliveryDate);
  return join(rows);
}

export type OrderFilter = { status?: Status; q?: string; from?: string; to?: string; limit?: number };

export async function listOrders(f: OrderFilter): Promise<OrderWithCustomer[]> {
  const db = await getDb();
  const conds = [];
  if (f.status) conds.push(eq(orders.status, f.status));
  if (f.from) conds.push(gte(orders.deliveryDate, f.from));
  if (f.to) conds.push(lt(orders.deliveryDate, f.to));
  if (f.q) {
    const q = `%${f.q.trim()}%`;
    conds.push(sql`(${customers.name} ilike ${q} or ${customers.phone} like ${q})`);
  }
  const rows = await db.select({ o: orders, c: customers }).from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(orders.deliveryDate), desc(orders.createdAt)).limit(f.limit ?? 200);
  return join(rows);
}

export type CustomerStats = {
  customer: Customer;
  orders: number;
  bottles: number;
  gifts: number;
  delivered: number;
  paid: number;
  debt: number;
  last: Date | null;
};

export async function customersWithStats(): Promise<CustomerStats[]> {
  const db = await getDb();
  const all = await db.select().from(customers).orderBy(customers.name);
  const ord = await db.select({
    customerId: orders.customerId,
    n: sql<number>`count(*) filter (where ${orders.status} <> 'cancelled')::int`,
    bottles: sql<number>`coalesce(sum(${orders.qtyPaid} + ${orders.qtyFree}) filter (where ${orders.status} = 'delivered'), 0)::int`,
    gifts: sql<number>`coalesce(sum(${orders.qtyFree}) filter (where ${orders.status} = 'delivered'), 0)::int`,
    delivered: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} = 'delivered'), 0)::int`,
    last: sql<string | null>`max(${orders.createdAt}) filter (where ${orders.status} <> 'cancelled')`,
  }).from(orders).groupBy(orders.customerId);
  const pay = await db.select({ customerId: payments.customerId, paid: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
    .from(payments).groupBy(payments.customerId);
  const oMap = new Map(ord.map((r) => [r.customerId, r]));
  const pMap = new Map(pay.map((r) => [r.customerId, r.paid]));
  return all.map((c) => {
    const o = oMap.get(c.id);
    const paid = pMap.get(c.id) ?? 0;
    const delivered = o?.delivered ?? 0;
    return {
      customer: c,
      orders: o?.n ?? 0,
      bottles: o?.bottles ?? 0,
      gifts: o?.gifts ?? 0,
      delivered,
      paid,
      debt: debtOf(delivered, paid),
      last: o?.last ? new Date(o.last) : null,
    };
  });
}

export async function customerDetail(id: number) {
  if (!Number.isInteger(id) || id <= 0) return null;
  const db = await getDb();
  const [customer] = await db.select().from(customers).where(eq(customers.id, id));
  if (!customer) return null;
  const list = await db.select().from(orders).where(eq(orders.customerId, id)).orderBy(desc(orders.createdAt));
  const pays = await db.select().from(payments).where(eq(payments.customerId, id)).orderBy(desc(payments.createdAt));
  const deliveredOrders = list.filter((o) => o.status === "delivered");
  const delivered = deliveredOrders.reduce((a, o) => a + o.total, 0);
  const paid = pays.reduce((a, p) => a + p.amount, 0);
  return {
    customer,
    orders: list,
    payments: pays,
    delivered,
    paid,
    debt: debtOf(delivered, paid),
    bottles: deliveredOrders.reduce((a, o) => a + o.qtyPaid + o.qtyFree, 0),
    gifts: deliveredOrders.reduce((a, o) => a + o.qtyFree, 0),
    count: list.filter((o) => o.status !== "cancelled").length,
  };
}

export type PaymentWithCustomer = PaymentRow & { customer: Customer };

export async function paymentsBetween(from: Date, to: Date): Promise<PaymentWithCustomer[]> {
  const db = await getDb();
  const rows = await db.select({ p: payments, c: customers }).from(payments)
    .innerJoin(customers, eq(payments.customerId, customers.id))
    .where(and(gte(payments.createdAt, from), lt(payments.createdAt, to))).orderBy(desc(payments.createdAt));
  return rows.map(({ p, c }) => ({ ...p, customer: c }));
}

export async function ordersBetween(from: string, to: string): Promise<Order[]> {
  const db = await getDb();
  return db.select().from(orders).where(and(gte(orders.deliveryDate, from), lt(orders.deliveryDate, to)));
}

export async function debtSummary(): Promise<{ total: number; count: number; top: CustomerStats[] }> {
  const all = (await customersWithStats()).filter((c) => c.debt > 0).sort((a, b) => b.debt - a.debt);
  return { total: all.reduce((a, c) => a + c.debt, 0), count: all.length, top: all.slice(0, 8) };
}
