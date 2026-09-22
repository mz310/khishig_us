import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/order")).toBe("/order");
    expect(safeNext("/orders/12?new=1")).toBe("/orders/12?new=1");
  });
  it("falls back for empty or absolute URLs", () => {
    expect(safeNext(undefined)).toBe("/app");
    expect(safeNext("")).toBe("/app");
    expect(safeNext("https://evil.com")).toBe("/app");
    expect(safeNext("javascript:alert(1)")).toBe("/app");
  });
  it("rejects protocol-relative and smuggled hosts", () => {
    expect(safeNext("//evil.com")).toBe("/app");
    expect(safeNext("/\\evil.com")).toBe("/app");
    expect(safeNext("/\t/evil.com")).toBe("/app");
    expect(safeNext("/%0a")).toBe("/%0a");
  });
});
