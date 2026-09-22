import { describe, expect, it } from "vitest";
import {
  MAX_OPEN_ORDERS,
  canTransition,
  debtOf,
  freeBottles,
  isPhone,
  normalizePhone,
  orderTotals,
  ordersOpen,
  type Settings,
} from "./domain";

const s: Settings = {
  price: 3000,
  deliveryFee: 0,
  bonusEnabled: true,
  bonusBuy: 3,
  bonusFree: 1,
  acceptingOrders: true,
};

describe("bonus", () => {
  it("gives one free per three paid inside one order", () => {
    expect(freeBottles(1, s)).toBe(0);
    expect(freeBottles(2, s)).toBe(0);
    expect(freeBottles(3, s)).toBe(1);
    expect(freeBottles(5, s)).toBe(1);
    expect(freeBottles(6, s)).toBe(2);
  });
  it("respects custom rule and the off switch", () => {
    expect(freeBottles(4, { ...s, bonusBuy: 2, bonusFree: 1 })).toBe(2);
    expect(freeBottles(6, { ...s, bonusEnabled: false })).toBe(0);
    expect(freeBottles(6, { ...s, bonusBuy: 0 })).toBe(0);
  });
});

describe("totals", () => {
  it("charges paid bottles plus one delivery fee", () => {
    expect(orderTotals(3, s)).toEqual({ qtyPaid: 3, qtyFree: 1, unitPrice: 3000, deliveryFee: 0, total: 9000 });
    expect(orderTotals(2, { ...s, deliveryFee: 1000 }).total).toBe(7000);
  });
  it("rejects quantities outside 1..20", () => {
    expect(() => orderTotals(0, s)).toThrow();
    expect(() => orderTotals(21, s)).toThrow();
    expect(() => orderTotals(2.5, s)).toThrow();
  });
});

describe("phone", () => {
  it("accepts 8 digits starting 6-9, after normalising", () => {
    expect(normalizePhone(" 8802 7971 ")).toBe("88027971");
    expect(normalizePhone("+976 88027971")).toBe("88027971");
    expect(normalizePhone("976-8802-7971")).toBe("88027971");
    expect(isPhone("88027971")).toBe(true);
    expect(isPhone("58027971")).toBe(false);
    expect(isPhone("8802797")).toBe(false);
    expect(normalizePhone("abc")).toBeNull();
  });
});

describe("status transitions", () => {
  it("follows new → out → delivered", () => {
    expect(canTransition("new", "out", "admin")).toBe(true);
    expect(canTransition("out", "delivered", "admin")).toBe(true);
    expect(canTransition("new", "delivered", "admin")).toBe(false);
    expect(canTransition("delivered", "out", "admin")).toBe(false);
  });
  it("lets customers cancel only while new; admin also while out", () => {
    expect(canTransition("new", "cancelled", "customer")).toBe(true);
    expect(canTransition("out", "cancelled", "customer")).toBe(false);
    expect(canTransition("out", "cancelled", "admin")).toBe(true);
    expect(canTransition("delivered", "cancelled", "admin")).toBe(false);
    expect(canTransition("new", "out", "customer")).toBe(false);
  });
});

describe("debt", () => {
  it("is delivered total minus payments, never negative", () => {
    expect(debtOf(27000, 18000)).toBe(9000);
    expect(debtOf(9000, 12000)).toBe(0);
  });
  it("caps open orders per customer", () => {
    expect(MAX_OPEN_ORDERS).toBe(3);
    expect(ordersOpen(["new", "out", "delivered", "cancelled"])).toBe(2);
  });
});
