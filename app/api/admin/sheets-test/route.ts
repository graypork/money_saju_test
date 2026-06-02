import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  readCookieFromHeader,
  verifyAdminSessionToken,
} from "../../../../src/lib/testLogs/adminAuth";
import {
  appendGoogleSheetsDebugRow,
  isStorageConfigError,
} from "../../../../src/lib/testLogs/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasAdminCookie(request: NextRequest) {
  const token =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    readCookieFromHeader(request.headers.get("cookie"), ADMIN_COOKIE_NAME);

  return verifyAdminSessionToken(token);
}

// Temporary admin-only debug endpoint for isolating Google Sheets append issues.
export async function POST(request: NextRequest) {
  if (!hasAdminCookie(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    await appendGoogleSheetsDebugRow();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[testLogs] sheets-test failed", {
      message: error instanceof Error ? error.message : "unknown",
    });

    if (isStorageConfigError(error)) {
      return NextResponse.json(
        { ok: false, error: "storage_config_missing" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "sheets_test_failed",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
