import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminCookieOptions,
  isAdminSessionSigningConfigured,
  isAdminKeyValid,
} from "../../../../src/lib/testLogs/adminAuth";
import {
  buildRateLimitFingerprint,
  FixedWindowRateLimiter,
  isSameOriginRequest,
} from "../../../../src/lib/testLogs/requestSecurity";

export const runtime = "nodejs";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

const loginRateLimiter = new FixedWindowRateLimiter({
  fingerprintLimit: 5,
  processLimit: 100,
});

async function readAdminKey(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = (await request.json().catch(() => ({}))) as { adminKey?: string };

      return body.adminKey || "";
    }

    const formData = await request.formData();

    return String(formData.get("adminKey") || "");
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  if (!loginRateLimiter.consume(buildRateLimitFingerprint(request, "admin-login"))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: NO_STORE_HEADERS },
    );
  }

  const adminKey = await readAdminKey(request);

  if (!isAdminKeyValid(adminKey)) {
    return NextResponse.redirect(new URL("/admin?error=1", request.url), {
      status: 303,
      headers: NO_STORE_HEADERS,
    });
  }

  if (!isAdminSessionSigningConfigured()) {
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }

  const response = NextResponse.redirect(new URL("/admin/logs", request.url), {
    status: 303,
    headers: NO_STORE_HEADERS,
  });

  response.cookies.set(
    ADMIN_COOKIE_NAME,
    createAdminSessionToken(),
    getAdminCookieOptions(),
  );

  return response;
}
