import { z } from "zod";
import { MAX_QTY, MIN_QTY, normalizePhone } from "./domain";
import { SLOTS } from "./time";

export const phoneField = z.string().transform((v, ctx) => {
  const p = normalizePhone(v);
  if (!p) { ctx.addIssue({ code: "custom", message: "8 оронтой утасны дугаар оруулна уу" }); return z.NEVER; }
  return p;
});

export const orderInput = z.object({
  qty: z.coerce.number().int(`Тоо бүхэл байх ёстой`).min(MIN_QTY, `Хамгийн багадаа ${MIN_QTY}`).max(MAX_QTY, `Хамгийн ихдээ ${MAX_QTY}`),
  name: z.string().trim().min(1, "Нэрээ оруулна уу").max(80),
  phone: phoneField,
  bag: z.coerce.number().int().min(1, "Багаа сонгоно уу").max(10),
  street: z.string().trim().min(1, "Байр эсвэл гудамжаа оруулна уу").max(120),
  unit: z.string().trim().min(1, "Тоот эсвэл хашааны дугаараа оруулна уу").max(60),
  note: z.string().trim().max(300).default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Огноо буруу"),
  slot: z.enum(SLOTS, { message: "Цагаа сонгоно уу" }),
});
export type OrderInput = z.infer<typeof orderInput>;

export const paymentInput = z.object({
  customerId: z.coerce.number().int().positive(),
  amount: z.coerce.number().int("Дүн бүхэл байх ёстой").positive("Дүн 0-ээс их байх ёстой").max(100_000_000),
  method: z.enum(["cash", "transfer"], { message: "Хэлбэрээ сонгоно уу" }),
  note: z.string().trim().max(200).default(""),
});

export const settingsInput = z.object({
  price: z.coerce.number().int("Үнэ бүхэл тоо байна").min(0).max(10_000_000),
  deliveryFee: z.coerce.number().int("Хүргэлтийн төлбөр бүхэл тоо байна").min(0).max(10_000_000),
  bonusEnabled: z.coerce.boolean(),
  bonusBuy: z.coerce.number().int().min(1).max(50),
  bonusFree: z.coerce.number().int().min(0).max(50),
  phone1: z.string().trim().max(20).regex(/^[0-9+ -]*$/, "Утасны дугаарт зөвхөн тоо бичнэ"),
  phone2: z.string().trim().max(20).regex(/^[0-9+ -]*$/, "Утасны дугаарт зөвхөн тоо бичнэ"),
  bankName: z.string().trim().max(60),
  bankAccount: z.string().trim().max(40),
  acceptingOrders: z.coerce.boolean(),
  bottleLabel: z.string().trim().max(20),
});

export function firstIssue(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Оруулсан мэдээлэл буруу байна";
}

// Ids arrive from client components as plain JSON: accept only positive integers.
export const isId = (v: unknown): v is number => Number.isInteger(v) && (v as number) > 0;

// Route params arrive as strings: only plain positive integers are ids ("1e3", "12abc", " 7" are not).
export function parseId(v: string): number | null {
  if (!/^[1-9][0-9]{0,8}$/.test(v)) return null;
  return Number(v);
}
