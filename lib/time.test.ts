import { describe, expect, it } from "vitest";
import { addDays, availableSlots, isSlotAllowed, slotLabel, ubDateStr, ubParts } from "./time";

// Ulaanbaatar is UTC+8 all year. 2026-09-23 03:00Z = 11:00 local.
const at = (iso: string) => new Date(iso);

describe("Ulaanbaatar clock", () => {
  it("converts UTC instants to local date and time", () => {
    const p = ubParts(at("2026-09-23T03:00:00Z"));
    expect(p.dateStr).toBe("2026-09-23");
    expect(p.hour).toBe(11);
    expect(p.minute).toBe(0);
  });
  it("rolls the date at local midnight, not UTC midnight", () => {
    expect(ubDateStr(at("2026-09-23T17:30:00Z"))).toBe("2026-09-24");
    expect(ubDateStr(at("2026-09-23T15:59:00Z"))).toBe("2026-09-23");
  });
  it("adds days on the date string", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("delivery slots", () => {
  it("at 11:00 offers asap and the two remaining windows today", () => {
    const { today, tomorrow } = availableSlots(at("2026-09-23T03:00:00Z"));
    expect(today.date).toBe("2026-09-23");
    expect(today.slots.map((x) => [x.id, x.available])).toEqual([
      ["asap", true],
      ["09-12", false],
      ["12-15", true],
      ["15-17", true],
    ]);
    expect(tomorrow.date).toBe("2026-09-24");
    expect(tomorrow.slots.map((x) => x.id)).toEqual(["09-12", "12-15", "15-17"]);
    expect(tomorrow.slots.every((x) => x.available)).toBe(true);
  });
  it("needs at least 60 minutes before a window ends", () => {
    const { today } = availableSlots(at("2026-09-23T06:00:00Z")); // 14:00
    expect(today.slots.find((x) => x.id === "12-15")?.available).toBe(false);
    expect(today.slots.find((x) => x.id === "15-17")?.available).toBe(true);
    const later = availableSlots(at("2026-09-23T08:00:00Z")).today; // 16:00
    expect(later.slots.find((x) => x.id === "15-17")?.available).toBe(false);
    expect(later.slots.find((x) => x.id === "asap")?.available).toBe(true);
  });
  it("after 17:00 nothing is left today", () => {
    const { today } = availableSlots(at("2026-09-23T09:05:00Z")); // 17:05
    expect(today.slots.every((x) => !x.available)).toBe(true);
    expect(today.closed).toBe(true);
  });
  it("validates a submitted choice with the same rules", () => {
    const now = at("2026-09-23T03:00:00Z");
    expect(isSlotAllowed(now, "2026-09-23", "asap")).toBe(true);
    expect(isSlotAllowed(now, "2026-09-23", "09-12")).toBe(false);
    expect(isSlotAllowed(now, "2026-09-24", "asap")).toBe(false);
    expect(isSlotAllowed(now, "2026-09-24", "12-15")).toBe(true);
    expect(isSlotAllowed(now, "2026-09-25", "12-15")).toBe(false);
    expect(isSlotAllowed(now, "2026-09-22", "12-15")).toBe(false);
  });
  it("labels slots in Mongolian", () => {
    expect(slotLabel("asap")).toBe("Аль болох хурдан");
    expect(slotLabel("12-15")).toBe("12:00–15:00");
  });
});
