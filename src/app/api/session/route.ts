import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import { isAdminToken } from "@/lib/validation";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
} as const;

// Firebase önerisi: yalnız son 5 dakikada giriş yapılmışsa oturum oluşturulur.
const MAX_AUTH_AGE_SECONDS = 5 * 60;

export async function POST(request: NextRequest) {
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return NextResponse.json(
      { error: "Sunucu kimlik doğrulama yapılandırması eksik." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as { idToken?: unknown };
    if (typeof body.idToken !== "string" || !body.idToken) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(body.idToken, true);
    if (!isAdminToken(decoded)) {
      return NextResponse.json({ error: "Yetkisiz kullanıcı." }, { status: 403 });
    }
    if (Date.now() / 1000 - decoded.auth_time > MAX_AUTH_AGE_SECONDS) {
      return NextResponse.json(
        { error: "Lütfen yeniden giriş yapın." },
        { status: 401 },
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(body.idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      ...cookieOptions,
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Oturum oluşturulamadı." },
      { status: 401 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const adminAuth = sessionCookie ? getAdminAuth() : null;
  if (sessionCookie && adminAuth) {
    try {
      // Çıkışta tüm yenileme token'ları iptal edilir; çalınan cookie geçersizleşir.
      const decoded = await adminAuth.verifySessionCookie(sessionCookie);
      await adminAuth.revokeRefreshTokens(decoded.sub);
    } catch {
      // Geçersiz/eskimiş cookie olsa da cookie temizlenir.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
