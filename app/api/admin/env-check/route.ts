import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  readCookieFromHeader,
  verifyAdminSessionToken,
} from "../../../../src/lib/testLogs/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SHEET_NAME = "test_logs";

function hasAdminCookie(request: NextRequest) {
  const token =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    readCookieFromHeader(request.headers.get("cookie"), ADMIN_COOKIE_NAME);

  return verifyAdminSessionToken(token);
}

function readServiceAccountJson() {
  const raw =
    process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    return {
      serviceAccountJson: false,
      serviceAccountJsonParsed: false,
      serviceAccountJsonClientEmail: false,
      serviceAccountJsonPrivateKey: false,
    };
  }

  try {
    const parsed = JSON.parse(raw) as {
      client_email?: unknown;
      private_key?: unknown;
    };

    return {
      serviceAccountJson: true,
      serviceAccountJsonParsed: true,
      serviceAccountJsonClientEmail: Boolean(parsed.client_email),
      serviceAccountJsonPrivateKey: Boolean(parsed.private_key),
    };
  } catch {
    return {
      serviceAccountJson: true,
      serviceAccountJsonParsed: false,
      serviceAccountJsonClientEmail: false,
      serviceAccountJsonPrivateKey: false,
    };
  }
}

export async function GET(request: NextRequest) {
  if (!hasAdminCookie(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const jsonState = readServiceAccountJson();
  const clientEmail =
    Boolean(process.env.GOOGLE_SHEETS_CLIENT_EMAIL) ||
    jsonState.serviceAccountJsonClientEmail;
  const privateKey =
    Boolean(process.env.GOOGLE_SHEETS_PRIVATE_KEY) ||
    jsonState.serviceAccountJsonPrivateKey;

  // Temporary admin-only debug endpoint. Never return actual env values here.
  return NextResponse.json({
    spreadsheetId: Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID),
    googleSheetsServiceAccountJson: Boolean(process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON),
    googleServiceAccountJson: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    serviceAccountJson: jsonState.serviceAccountJson,
    serviceAccountJsonParsed: jsonState.serviceAccountJsonParsed,
    serviceAccountJsonClientEmail: jsonState.serviceAccountJsonClientEmail,
    serviceAccountJsonPrivateKey: jsonState.serviceAccountJsonPrivateKey,
    splitClientEmail: Boolean(process.env.GOOGLE_SHEETS_CLIENT_EMAIL),
    splitPrivateKey: Boolean(process.env.GOOGLE_SHEETS_PRIVATE_KEY),
    clientEmail,
    privateKey,
    sheetName: process.env.GOOGLE_SHEETS_LOG_SHEET_NAME || DEFAULT_SHEET_NAME,
  });
}
