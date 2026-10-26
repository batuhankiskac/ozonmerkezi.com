import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminAuth: vi.fn(),
  cookieValue: { current: undefined as string | undefined },
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  verifySessionCookie: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "admin_session" && mocks.cookieValue.current !== undefined
        ? { name, value: mocks.cookieValue.current }
        : undefined,
  }),
}));
vi.mock("@/lib/firebase-admin", () => ({ getAdminAuth: mocks.getAdminAuth }));

import { requireAdmin, getAdminSession } from "@/lib/auth";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.cookieValue.current = "session-cookie";
  mocks.getAdminAuth.mockReturnValue({
    verifySessionCookie: mocks.verifySessionCookie,
  });
});

describe("requireAdmin", () => {
  it("geçerli admin oturumu varsa token'ı döner ve yönlendirmez", async () => {
    mocks.verifySessionCookie.mockResolvedValue({ uid: "u1", admin: true });

    await expect(requireAdmin()).resolves.toEqual({ uid: "u1", admin: true });
    expect(mocks.verifySessionCookie).toHaveBeenCalledWith("session-cookie", true);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("oturum çerezi yoksa /login'e yönlendirir", async () => {
    mocks.cookieValue.current = undefined;

    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
    expect(mocks.verifySessionCookie).not.toHaveBeenCalled();
  });

  it("çerez doğrulanamazsa /login'e yönlendirir", async () => {
    mocks.verifySessionCookie.mockRejectedValue(new Error("expired"));

    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });

  it("admin claim'i olmayan oturumda /login'e yönlendirir", async () => {
    mocks.verifySessionCookie.mockResolvedValue({ uid: "u2", admin: "true" });

    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });

  it("Firebase Admin yapılandırılmamışsa /login'e yönlendirir", async () => {
    mocks.getAdminAuth.mockReturnValue(null);

    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});

describe("getAdminSession", () => {
  it("doğrulama hatasında null döner (yönlendirme yapmaz)", async () => {
    mocks.verifySessionCookie.mockRejectedValue(new Error("bad"));

    await expect(getAdminSession()).resolves.toBeNull();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
