// Reporting periods in Ulaanbaatar calendar terms. All dates are "YYYY-MM-DD" strings.
import { addDays, weekdayName } from "./time";

export type Gran = "week" | "month" | "quarter" | "year";
export const GRANS: Gran[] = ["week", "month", "quarter", "year"];
export const GRAN_LABEL: Record<Gran, string> = { week: "7 хоног", month: "Сар", quarter: "Улирал", year: "Жил" };

export type Bucket = { start: string; end: string; label: string; title: string; show: boolean };
export type Period = { gran: Gran; start: string; end: string; label: string; buckets: Bucket[] };

const ROMAN = ["I", "II", "III", "IV"];
const WD_SHORT = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
const split = (s: string) => s.split("-").map(Number) as [number, number, number];
const iso = (y: number, m0: number, d: number) => new Date(Date.UTC(y, m0, d)).toISOString().slice(0, 10);
const md = (s: string) => { const [, m, d] = split(s); return `${m}/${d}`; };
const dow = (s: string) => { const [y, m, d] = split(s); return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; }; // Monday = 0

export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = split(a); const [y2, m2, d2] = split(b);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export function humanDay(s: string): string {
  const [, m, d] = split(s);
  return `${m}-р сарын ${d}, ${weekdayName(s)}`;
}

export function periodOf(gran: Gran, ref: string): Period {
  const [y, m] = split(ref);
  const buckets: Bucket[] = [];
  let start: string, end: string, label: string;
  if (gran === "week") {
    start = addDays(ref, -dow(ref));
    end = addDays(start, 7);
    label = `${md(start)} – ${md(addDays(end, -1))}`;
    for (let i = 0; i < 7; i++) buckets.push({ start: addDays(start, i), end: addDays(start, i + 1), label: WD_SHORT[i], title: humanDay(addDays(start, i)), show: true });
  } else if (gran === "month") {
    start = iso(y, m - 1, 1); end = iso(y, m, 1);
    label = `${y} оны ${m}-р сар`;
    const n = daysBetween(start, end);
    for (let i = 0; i < n; i++) { const d = addDays(start, i); buckets.push({ start: d, end: addDays(d, 1), label: String(i + 1), title: humanDay(d), show: i === 0 || (i + 1) % 5 === 0 }); }
  } else if (gran === "quarter") {
    const q = Math.floor((m - 1) / 3);
    start = iso(y, q * 3, 1); end = iso(y, q * 3 + 3, 1);
    label = `${y} оны ${ROMAN[q]} улирал`;
    let i = 0;
    for (let d = start; d < end; d = addDays(d, 7), i++) {
      const e = addDays(d, 7) < end ? addDays(d, 7) : end;
      buckets.push({ start: d, end: e, label: md(d), title: `${md(d)} – ${md(addDays(e, -1))}`, show: i % 2 === 0 });
    }
  } else {
    start = iso(y, 0, 1); end = iso(y + 1, 0, 1);
    label = `${y} он`;
    for (let mm = 0; mm < 12; mm++) buckets.push({ start: iso(y, mm, 1), end: iso(y, mm + 1, 1), label: String(mm + 1), title: `${y} оны ${mm + 1}-р сар`, show: true });
  }
  return { gran, start, end, label, buckets };
}

export function shiftPeriod(gran: Gran, ref: string, dir: 1 | -1): string {
  if (gran === "week") return addDays(ref, dir * 7);
  const [y, m] = split(ref);
  const months = gran === "month" ? 1 : gran === "quarter" ? 3 : 12;
  return iso(y, m - 1 + dir * months, 1);
}

export const PREV_LABEL: Record<Gran, [string, string]> = {
  week: ["өмнөх 7 хоногийн мөн үеэс", "өмнөх 7 хоногоос"],
  month: ["өмнөх сарын мөн үеэс", "өмнөх сараас"],
  quarter: ["өмнөх улирлын мөн үеэс", "өмнөх улирлаас"],
  year: ["өмнөх жилийн мөн үеэс", "өмнөх жилээс"],
};
