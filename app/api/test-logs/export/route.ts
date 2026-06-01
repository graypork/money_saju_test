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
import type { TestLogQuery, TestLogRecord } from "../../../../src/lib/testLogs/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function csvCell(value: unknown) {
  const text = Array.isArray(value)
    ? value.join(" / ")
    : typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(logs: TestLogRecord[]) {
  const columns: Array<[string, keyof TestLogRecord]> = [
    ["저장 시간", "createdAt"],
    ["생년월일", "birthDate"],
    ["양/음력", "calendarType"],
    ["생시", "birthTime"],
    ["성별", "gender"],
    ["animalKey", "animalKey"],
    ["결과유형", "animalTitle"],
    ["결과요약", "resultSummary"],
    ["dayStem", "dayStem"],
    ["element", "element"],
    ["salList", "salList"],
    ["copyVersion", "copyVersion"],
    ["logicVersion", "logicVersion"],
    ["userAgent", "userAgent"],
    ["referrer", "referrer"],
    ["path", "path"],
  ];
  const header = columns.map(([label]) => csvCell(label)).join(",");
  const rows = logs.map((log) =>
    columns.map(([, key]) => csvCell(log[key])).join(","),
  );

  return `\uFEFF${[header, ...rows].join("\n")}`;
}

export async function GET(request: NextRequest) {
  if (!hasAdminCookie(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const logs = await getTestLogStorage().list(readQuery(request));

    return new NextResponse(toCsv(logs), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="money-saju-test-logs.csv"`,
      },
    });
  } catch (error) {
    if (isStorageConfigError(error)) {
      return NextResponse.json(
        { ok: false, error: "storage_not_configured" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "storage_error" },
      { status: 500 },
    );
  }
}
