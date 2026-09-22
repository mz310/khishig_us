// Everything the business calls "today" happens in Ulaanbaatar time, even though the server runs in UTC.

export const TZ = "Asia/Ulaanbaatar";
export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 17;
export const MIN_LEAD_MINUTES = 60;

export type Slot = "asap" | "09-12" | "12-15" | "15-17";
export const FIXED_SLOTS: { id: Slot; start: number; end: number }[] = [
  { id: "09-12", start: 9, end: 12 },
  { id: "12-15", start: 12, end: 15 },
  { id: "15-17", start: 15, end: 17 },
];
export const SLOTS: Slot[] = ["asap", "09-12", "12-15", "15-17"];

export function slotLabel(slot: Slot): string {
  if (slot === "asap") return "Аль болох хурдан";
  const s = FIXED_SLOTS.find((x) => x.id === slot)!;
  return `${pad(s.start)}:00–${pad(s.end)}:00`;
}

const pad = (n: number) => String(n).padStart(2, "0");

const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});

export function ubParts(date: Date) {
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) parts[p.type] = p.value;
  const y = +parts.year, m = +parts.month, d = +parts.day;
  return {
    y, m, d,
    hour: +parts.hour,
    minute: +parts.minute,
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday,
  };
}

export function ubDateStr(date: Date): string {
  return ubParts(date).dateStr;
}

export function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export type SlotOption = { id: Slot; label: string; available: boolean; reason?: string };
export type DayOptions = { date: string; slots: SlotOption[]; closed: boolean };

function todaySlots(minutesNow: number): SlotOption[] {
  const closeMin = CLOSE_HOUR * 60;
  const asapOk = minutesNow < closeMin;
  const out: SlotOption[] = [
    { id: "asap", label: slotLabel("asap"), available: asapOk, reason: asapOk ? undefined : "Өнөөдрийн цаг дууссан" },
  ];
  for (const s of FIXED_SLOTS) {
    const ok = minutesNow + MIN_LEAD_MINUTES < s.end * 60;
    out.push({ id: s.id, label: slotLabel(s.id), available: ok, reason: ok ? undefined : "Өнгөрсөн" });
  }
  return out;
}

export function availableSlots(now: Date): { today: DayOptions; tomorrow: DayOptions } {
  const p = ubParts(now);
  const minutesNow = p.hour * 60 + p.minute;
  const today = todaySlots(minutesNow);
  return {
    today: { date: p.dateStr, slots: today, closed: !today.some((x) => x.available) },
    tomorrow: {
      date: addDays(p.dateStr, 1),
      slots: FIXED_SLOTS.map((s) => ({ id: s.id, label: slotLabel(s.id), available: true })),
      closed: false,
    },
  };
}

// Server-side check of a submitted (date, slot) pair against the same rules the form used.
export function isSlotAllowed(now: Date, dateStr: string, slot: Slot): boolean {
  const { today, tomorrow } = availableSlots(now);
  const day = dateStr === today.date ? today : dateStr === tomorrow.date ? tomorrow : null;
  if (!day) return false;
  return day.slots.some((x) => x.id === slot && x.available);
}

const WEEKDAYS = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
const WD_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// "9-р сарын 23, Мягмар" style labels; "Өнөөдөр"/"Маргааш" relative to now.
export function humanDate(dateStr: string, now: Date = new Date()): string {
  const todayStr = ubDateStr(now);
  if (dateStr === todayStr) return "Өнөөдөр";
  if (dateStr === addDays(todayStr, 1)) return "Маргааш";
  if (dateStr === addDays(todayStr, -1)) return "Өчигдөр";
  const [y, m, d] = dateStr.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${m}-р сарын ${d}, ${WEEKDAYS[wd]}`;
}

export function humanDateTime(date: Date): string {
  const p = ubParts(date);
  return `${p.m}-р сарын ${p.d}, ${pad(p.hour)}:${pad(p.minute)}`;
}

export function ubTime(date: Date): string {
  const p = ubParts(date);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export function weekdayName(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export { WD_INDEX };
