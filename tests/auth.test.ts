import { describe, expect, it } from "vitest";
import { isAdminToken } from "@/lib/validation";

describe("isAdminToken", () => {
  it("yalnız admin claim'i tam olarak true ise kabul eder", () => {
    expect(isAdminToken({ admin: true })).toBe(true);
    expect(isAdminToken({ admin: "true" })).toBe(false);
    expect(isAdminToken({ admin: 1 })).toBe(false);
    expect(isAdminToken({})).toBe(false);
  });
});
