import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  readCookieFromHeader,
  verifyAdminSessionToken,
} from "../../../../src/lib/testLogs/adminAuth";
import { isSameOriginRequest } from "../../../../src/lib/testLogs/requestSecurity";
import {
  appendGoogleSheetsDebugRow,
  isStorageConfigError,
} from "../../../../src/lib/testLogs/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      ...NO_STORE_HEADERS,
      ...headers,
    },
  });
}

function hasAdminCookie(request: NextRequest) {
  const token =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    readCookieFromHeader(request.headers.get("cookie"), ADMIN_COOKIE_NAME);

  return verifyAdminSessionToken(token);
}

// Temporary admin-only debug endpoint for isolating Google Sheets append issues.
export async function POST(request: NextRequest) {
  if (!hasAdminCookie(request)) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  if (!isSameOriginRequest(request)) {
    return json({ ok: false, error: "invalid_request" }, 400);
  }

  try {
    await appendGoogleSheetsDebugRow();

    return json({ ok: true });
  } catch (error) {
    console.error("[testLogs] sheets-test failed", {
      message: error instanceof Error ? error.message : "unknown",
    });

    if (isStorageConfigError(error)) {
      return json({ ok: false, error: "server_error" }, 503);
    }

    return json({ ok: false, error: "server_error" }, 500);
  }
}

export async function GET() {
  return json(
    { ok: false, error: "method_not_allowed" },
    405,
    { Allow: "POST" },
  );
}
