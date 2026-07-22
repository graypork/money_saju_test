import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  readCookieFromHeader,
  verifyAdminSessionToken,
} from "../../../../src/lib/testLogs/adminAuth";
import {
  getTestLogStorage,
  isStorageConfigError,
} from "../../../../src/lib/testLogs/storage";
import { toTestLogCsv } from "../../../../src/lib/testLogs/csv";
import type { TestLogQuery } from "../../../../src/lib/testLogs/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

function hasAdminCookie(request: NextRequest) {
  const token =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    readCookieFromHeader(request.headers.get("cookie"), ADMIN_COOKIE_NAME);

  return verifyAdminSessionToken(token);
}

function readQuery(request: NextRequest): TestLogQuery {
  const searchParams = request.nextUrl.searchParams;

  return {
    q: searchParams.get("q") || undefined,
    animalKey: searchParams.get("animalKey") || undefined,
    calendarType: searchParams.get("calendarType") || undefined,
    birthTime: searchParams.get("birthTime") || undefined,
    dayStem: searchParams.get("dayStem") || undefined,
    limit: Number(searchParams.get("limit") || "1000"),
  };
}

export async function GET(request: NextRequest) {
  if (!hasAdminCookie(request)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const logs = await getTestLogStorage().list(readQuery(request));

    return new NextResponse(toTestLogCsv(logs), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="money-saju-test-logs.csv"`,
        ...NO_STORE_HEADERS,
      },
    });
  } catch (error) {
    if (isStorageConfigError(error)) {
      return NextResponse.json(
        { ok: false, error: "server_error" },
        { status: 503, headers: NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
