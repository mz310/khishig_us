import { addDays, ubDateStr } from "./time";
import { daysBetween, periodOf, PREV_LABEL, shiftPeriod, type Bucket, type Gran } from "./period";
import { ordersBetween, paymentsBetween, type PaymentWithCustomer } from "./queries";

// Local midnight in Ulaanbaatar (UTC+8) as a UTC instant.
export function ubStartOfDay(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, -8));
}

export type Sums = { cash: number; transfer: number; total: number; repaid: number; count: number };
export type ChartBucket = Bucket & { cash: number; transfer: number; total: number; future: boolean; today: boolean };

function sumUp(pays: PaymentWithCustomer[]): Sums {
  const s: Sums = { cash: 0, transfer: 0, total: 0, repaid: 0, count: 0 };
  for (const p of pays) {
    if (p.method === "cash") s.cash += p.amount; else s.transfer += p.amount;
    s.total += p.amount; s.count++;
    if (p.orderId == null) s.repaid += p.amount;
  }
  return s;
}

export async function buildReport(gran: Gran, ref: string, now = new Date()) {
  const today = ubDateStr(now);
  const period = periodOf(gran, ref);
  const current = period.start <= today && today < period.end;
  const upto = current ? addDays(today, 1) : period.end;

  const [pays, ords] = await Promise.all([
    paymentsBetween(ubStartOfDay(period.start), ubStartOfDay(upto)),
    ordersBetween(period.start, upto),
  ]);
  const sums = sumUp(pays);

  const prevPeriod = periodOf(gran, shiftPeriod(gran, ref, -1));
  const prevEnd = current ? addDays(prevPeriod.start, Math.min(daysBetween(prevPeriod.start, prevPeriod.end), daysBetween(period.start, upto))) : prevPeriod.end;
  const [prevPays, prevOrds] = await Promise.all([
    paymentsBetween(ubStartOfDay(prevPeriod.start), ubStartOfDay(prevEnd)),
    ordersBetween(prevPeriod.start, prevEnd),
  ]);
  const prevSums = sumUp(prevPays);

  const orderStats = (list: typeof ords) => ({
    orders: list.filter((o) => o.status !== "cancelled").length,
    bottles: list.filter((o) => o.status === "delivered").reduce((a, o) => a + o.qtyPaid + o.qtyFree, 0),
    newDebt: list.filter((o) => o.status === "delivered" && o.payment === "debt").reduce((a, o) => a + o.total, 0),
  });

  const byDay = new Map<string, { cash: number; transfer: number }>();
  for (const p of pays) {
    const d = ubDateStr(p.createdAt);
    const b = byDay.get(d) ?? { cash: 0, transfer: 0 };
    if (p.method === "cash") b.cash += p.amount; else b.transfer += p.amount;
    byDay.set(d, b);
  }
  const buckets: ChartBucket[] = period.buckets.map((bk) => {
    let cash = 0, transfer = 0;
    for (const [d, v] of byDay) if (d >= bk.start && d < bk.end) { cash += v.cash; transfer += v.transfer; }
    return { ...bk, cash, transfer, total: cash + transfer, future: bk.start > today, today: bk.start <= today && today < bk.end };
  });

  const delta = prevSums.total > 0
    ? { pct: Math.round(((sums.total - prevSums.total) / prevSums.total) * 100), text: PREV_LABEL[gran][current ? 0 : 1] }
    : null;

  return {
    period, current, today, sums, delta, buckets, payments: pays,
    orders: orderStats(ords),
    prev: { sums: prevSums, orders: orderStats(prevOrds) },
    canPrev: prevPeriod.end > "2000-01-01",
    canNext: shiftPeriod(gran, ref, 1) <= today,
    prevRef: shiftPeriod(gran, ref, -1),
    nextRef: shiftPeriod(gran, ref, 1),
  };
}

export type Report = Awaited<ReturnType<typeof buildReport>>;
