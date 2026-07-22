import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  readCookieFromHeader,
  verifyAdminSessionToken,
} from "../../../src/lib/testLogs/adminAuth";
import { defaultTestLogRequestSecurity } from "../../../src/lib/testLogs/requestSecurity";
import {
  getTestLogStorage,
  isAppendError,
  isStorageConfigError,
} from "../../../src/lib/testLogs/storage";
import type { TestLogPayload, TestLogQuery } from "../../../src/lib/testLogs/types";

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

function toPayload(body: {
  createdAt: string;
  birthDate: string;
  calendarType: string;
  birthTime: string;
  gender: string;
  animalKey: string;
  animalTitle: string;
  resultSummary: string;
  firstImpressionSummary: string;
  resultExplanationSnapshot: TestLogPayload["resultExplanationSnapshot"];
  dayStem: string;
  element: string;
  salList: string[];
  scoreSnapshot: Record<string, unknown>;
  copyVersion: string;
  logicVersion: string;
  path: string;
}): TestLogPayload {
  return {
    createdAt: body.createdAt,
    birthDate: body.birthDate,
    calendarType: body.calendarType,
    birthTime: body.birthTime,
    gender: body.gender,
    animalKey: body.animalKey,
    animalTitle: body.animalTitle,
    resultSummary: body.resultSummary,
    firstImpressionSummary: body.firstImpressionSummary,
    resultExplanationSnapshot: body.resultExplanationSnapshot,
    dayStem: body.dayStem,
    element: body.element,
    salList: body.salList,
    scoreSnapshot: body.scoreSnapshot,
    copyVersion: body.copyVersion,
    logicVersion: body.logicVersion,
    userAgent: "",
    referrer: "",
    path: body.path,
  };
}

function publicJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function storageErrorResponse(error: unknown) {
  if (isStorageConfigError(error)) {
    return publicJson({ ok: false, error: "server_error" }, 503);
  }

  return publicJson({ ok: false, error: "server_error" }, 500);
}

export async function POST(request: NextRequest) {
  const validation = await defaultTestLogRequestSecurity.validate(request);

  if (!validation.ok) {
    return publicJson({ ok: false, error: validation.error }, validation.status);
  }

  if (validation.skipped) {
    console.log("[testLogs] save skipped", { reason: "test-case-code" });
    return publicJson({ ok: true, skipped: true, reason: "test-case-code" });
  }

  console.log("[testLogs] post received");

  try {
    await getTestLogStorage().create(toPayload(validation.payload));

    return publicJson({ ok: true, skipped: false });
  } catch (error) {
    console.error("[testLogs] append failed", {
      message: error instanceof Error ? error.message : "unknown",
    });

    if (isAppendError(error)) {
      return publicJson({ ok: false, error: "server_error" }, 500);
    }

    return storageErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  if (!hasAdminCookie(request)) {
    return publicJson({ ok: false, error: "unauthorized" }, 401);
  }

  try {
    const logs = await getTestLogStorage().list(readQuery(request));

    return publicJson({ ok: true, logs });
  } catch (error) {
    console.error("[testLogs] list failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return storageErrorResponse(error);
  }
}
