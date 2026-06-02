import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  readCookieFromHeader,
  verifyAdminSessionToken,
} from "../../../src/lib/testLogs/adminAuth";
import {
  getTestLogStorage,
  isAppendError,
  isStorageConfigError,
} from "../../../src/lib/testLogs/storage";
import type { TestLogPayload, TestLogQuery } from "../../../src/lib/testLogs/types";

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
  const limit = Number(searchParams.get("limit") || "200");

  return {
    q: searchParams.get("q") || undefined,
    animalKey: searchParams.get("animalKey") || undefined,
    calendarType: searchParams.get("calendarType") || undefined,
    birthTime: searchParams.get("birthTime") || undefined,
    dayStem: searchParams.get("dayStem") || undefined,
    limit,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.map((item) => String(item)).filter(Boolean);
}

function recordValue(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function isValidPayload(body: Record<string, unknown>) {
  return Boolean(
    body.createdAt &&
      body.birthDate &&
      body.animalKey &&
      body.animalTitle &&
      body.resultExplanationSnapshot,
  );
}

function toPayload(body: Record<string, unknown>): TestLogPayload {
  return {
    createdAt: String(body.createdAt || new Date().toISOString()),
    birthDate: String(body.birthDate || ""),
    calendarType: String(body.calendarType || ""),
    birthTime: String(body.birthTime || ""),
    gender: String(body.gender || ""),
    animalKey: String(body.animalKey || ""),
    animalTitle: String(body.animalTitle || ""),
    resultSummary: String(body.resultSummary || ""),
    firstImpressionSummary: String(body.firstImpressionSummary || ""),
    resultExplanationSnapshot:
      recordValue(body.resultExplanationSnapshot) as TestLogPayload["resultExplanationSnapshot"],
    dayStem: String(body.dayStem || ""),
    element: String(body.element || ""),
    salList: stringArray(body.salList),
    scoreSnapshot: recordValue(body.scoreSnapshot),
    copyVersion: String(body.copyVersion || ""),
    logicVersion: String(body.logicVersion || ""),
    userAgent: String(body.userAgent || ""),
    referrer: String(body.referrer || ""),
    path: String(body.path || ""),
  };
}

function storageErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "storage_error";

  if (isStorageConfigError(error)) {
    return NextResponse.json(
      { ok: false, error: "storage_config_missing", message },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { ok: false, error: "storage_error", message },
    { status: 500 },
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  if (String(body.testCaseCode || "").trim() === "admin22") {
    console.log("[testLogs] save skipped", { reason: "test-case-code" });
    return NextResponse.json({ ok: true, skipped: true, reason: "test-case-code" });
  }

  console.log("[testLogs] post received");

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 },
    );
  }

  try {
    const saved = await getTestLogStorage().create(toPayload(body));

    return NextResponse.json({ ok: true, skipped: false, log: saved });
  } catch (error) {
    console.error("[testLogs] append failed", {
      message: error instanceof Error ? error.message : "unknown",
    });

    if (isStorageConfigError(error)) {
      return NextResponse.json(
        { ok: false, error: "storage_config_missing" },
        { status: 503 },
      );
    }

    if (isAppendError(error)) {
      return NextResponse.json(
        { ok: false, error: "append_failed" },
        { status: 500 },
      );
    }

    return storageErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  if (!hasAdminCookie(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const logs = await getTestLogStorage().list(readQuery(request));

    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    console.error("[testLogs] list failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return storageErrorResponse(error);
  }
}
