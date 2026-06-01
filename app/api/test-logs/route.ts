import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  readCookieFromHeader,
  verifyAdminSessionToken,
} from "../../../src/lib/testLogs/adminAuth";
import {
  getTestLogStorage,
  isStorageConfigError,
} from "../../../src/lib/testLogs/storage";
import type { TestLogPayload, TestLogQuery } from "../../../src/lib/testLogs/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeBirthDateWithAdminMarker(rawBirthDate: string) {
  const cleaned = rawBirthDate.replace(/\D/g, "");

  if (/^22\d{8}$/.test(cleaned)) {
    return { birthDate: cleaned.slice(2), isAdminTestCase: true };
  }

  if (/^\d{8}22$/.test(cleaned)) {
    return { birthDate: cleaned.slice(0, 8), isAdminTestCase: true };
  }

  return { birthDate: cleaned, isAdminTestCase: false };
}

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

function isTestModeRequest(request: NextRequest, body: Record<string, unknown>) {
  const searchParams = request.nextUrl.searchParams;

  return (
    searchParams.get("adminCode") === "22" ||
    searchParams.get("testMode") === "1" ||
    body.adminCode === "22" ||
    body.testMode === "1"
  );
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

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const marker = normalizeBirthDateWithAdminMarker(String(body.birthDate || ""));

  if (
    hasAdminCookie(request) ||
    isTestModeRequest(request, body) ||
    marker.isAdminTestCase ||
    body.isAdminTestCase === true
  ) {
    return NextResponse.json({ ok: true, skipped: true });
  }

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
    return storageErrorResponse(error);
  }
}
