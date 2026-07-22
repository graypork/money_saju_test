import type { NextRequest } from "next/server";
import type { TestLogExplanationSnapshot } from "./types";

const MAX_REQUEST_BYTES = 32 * 1024;
const WINDOW_MS = 60_000;
const FINGERPRINT_LIMIT = 10;
const PROCESS_LIMIT = 600;
const MAX_TRACKED_FINGERPRINTS = 256;

const TOP_LEVEL_FIELDS = new Set([
  "createdAt",
  "birthDate",
  "calendarType",
  "birthTime",
  "gender",
  "animalKey",
  "animalTitle",
  "resultSummary",
  "firstImpressionSummary",
  "resultExplanationSnapshot",
  "dayStem",
  "element",
  "salList",
  "scoreSnapshot",
  "copyVersion",
  "logicVersion",
  "path",
  "testCaseCode",
]);

const EXPLANATION_FIELDS = new Set([
  "title",
  "subtitle",
  "firstImpression",
  "moneyPattern",
  "elementText",
  "salText",
  "closingNote",
]);

const CALENDAR_TYPES = new Set<"solar" | "lunar">(["solar", "lunar"]);
const GENDERS = new Set<"male" | "female" | "unknown">(["male", "female", "unknown"]);
const BIRTH_TIMES = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]);

const MAX_SHORT_TEXT_BYTES = 128;
const MAX_SUMMARY_BYTES = 512;
const MAX_LONG_TEXT_BYTES = 4_096;
const MAX_PATH_BYTES = 2_048;
const MAX_SAL_COUNT = 12;
const MAX_SAL_BYTES = 64;
const MAX_SCORE_BYTES = 8_192;
const MAX_SCORE_DEPTH = 5;
const MAX_SCORE_NODES = 128;
const MAX_SCORE_KEY_BYTES = 128;
const MAX_SCORE_STRING_BYTES = 512;

type PublicRequestError = "invalid_request" | "payload_too_large" | "rate_limited" | "unsupported_media_type";

type ValidationFailure = {
  ok: false;
  status: 400 | 413 | 415 | 429;
  error: PublicRequestError;
};

type ValidationSkip = {
  ok: true;
  skipped: true;
};

export type AcceptedPublicTestLogPayload = {
  createdAt: string;
  birthDate: string;
  calendarType: "solar" | "lunar";
  birthTime: string;
  gender: "male" | "female" | "unknown";
  animalKey: string;
  animalTitle: string;
  resultSummary: string;
  firstImpressionSummary: string;
  resultExplanationSnapshot: TestLogExplanationSnapshot;
  dayStem: string;
  element: string;
  salList: string[];
  scoreSnapshot: Record<string, unknown>;
  copyVersion: string;
  logicVersion: string;
  path: string;
  testCaseCode: string;
};

type ValidationSuccess = {
  ok: true;
  skipped: false;
  payload: AcceptedPublicTestLogPayload;
};

export type PublicTestLogValidationResult = ValidationFailure | ValidationSkip | ValidationSuccess;

type WindowBucket = {
  count: number;
  startedAt: number;
};

type FixedWindowRateLimiterOptions = {
  fingerprintLimit?: number;
  maxTrackedFingerprints?: number;
  now?: () => number;
  processLimit?: number;
  windowMs?: number;
};

export class FixedWindowRateLimiter {
  private readonly fingerprintLimit: number;
  private readonly maxTrackedFingerprints: number;
  private readonly now: () => number;
  private readonly processLimit: number;
  private readonly windowMs: number;
  private readonly buckets = new Map<string, WindowBucket>();
  private processBucket: WindowBucket | null = null;

  constructor(options: FixedWindowRateLimiterOptions = {}) {
    this.fingerprintLimit = options.fingerprintLimit ?? FINGERPRINT_LIMIT;
    this.maxTrackedFingerprints = options.maxTrackedFingerprints ?? MAX_TRACKED_FINGERPRINTS;
    this.now = options.now ?? (() => Date.now());
    this.processLimit = options.processLimit ?? PROCESS_LIMIT;
    this.windowMs = options.windowMs ?? WINDOW_MS;
  }

  consume(fingerprint?: string) {
    const now = this.now();
    const processBucket = this.getProcessBucket(now);

    if (processBucket.count >= this.processLimit) {
      return false;
    }

    if (fingerprint) {
      const bucket = this.getFingerprintBucket(fingerprint, now);

      if (bucket.count >= this.fingerprintLimit) {
        return false;
      }

      bucket.count += 1;
    }

    processBucket.count += 1;
    return true;
  }

  private getProcessBucket(now: number) {
    if (!this.processBucket || now - this.processBucket.startedAt >= this.windowMs) {
      this.processBucket = {
        count: 0,
        startedAt: now,
      };
    }

    return this.processBucket;
  }

  private getFingerprintBucket(fingerprint: string, now: number) {
    this.evictExpired(now);

    let bucket = this.buckets.get(fingerprint);

    if (!bucket) {
      if (this.buckets.size >= this.maxTrackedFingerprints) {
        const oldestFingerprint = this.buckets.keys().next().value;

        if (oldestFingerprint) {
          this.buckets.delete(oldestFingerprint);
        }
      }

      bucket = {
        count: 0,
        startedAt: now,
      };
      this.buckets.set(fingerprint, bucket);
      return bucket;
    }

    if (now - bucket.startedAt >= this.windowMs) {
      bucket = {
        count: 0,
        startedAt: now,
      };
      this.buckets.set(fingerprint, bucket);
    }

    return bucket;
  }

  private evictExpired(now: number) {
    for (const [fingerprint, bucket] of this.buckets) {
      if (now - bucket.startedAt >= this.windowMs) {
        this.buckets.delete(fingerprint);
      }
    }
  }
}

type RequestSecurityOptions = {
  rateLimiter?: FixedWindowRateLimiter;
};

export function createTestLogRequestSecurity(options: RequestSecurityOptions = {}) {
  const rateLimiter = options.rateLimiter ?? new FixedWindowRateLimiter();

  return {
    async validate(request: NextRequest): Promise<PublicTestLogValidationResult> {
      if (!hasJsonContentType(request.headers.get("content-type"))) {
        return reject(415, "unsupported_media_type");
      }

      const contentLength = readContentLength(request.headers.get("content-length"));

      if (contentLength !== null && contentLength > MAX_REQUEST_BYTES) {
        return reject(413, "payload_too_large");
      }

      const rawBody = await readBodyWithinLimit(request);

      if (rawBody === null) {
        return reject(413, "payload_too_large");
      }

      const body = parseJsonRecord(rawBody);

      if (!body) {
        return reject(400, "invalid_request");
      }

      if (!isSameOrigin(request)) {
        return reject(400, "invalid_request");
      }

      const testCaseCode = validateBoundedString(body.testCaseCode, {
        maxBytes: MAX_SHORT_TEXT_BYTES,
        optional: true,
      });

      if (testCaseCode === null) {
        return reject(400, "invalid_request");
      }

      if (testCaseCode.trim() === "admin22") {
        if (!rateLimiter.consume(buildFingerprint(request))) {
          return reject(429, "rate_limited");
        }

        return {
          ok: true,
          skipped: true,
        };
      }

      const payload = validateAcceptedPayload(body, testCaseCode);

      if (!payload) {
        return reject(400, "invalid_request");
      }

      if (!rateLimiter.consume(buildFingerprint(request))) {
        return reject(429, "rate_limited");
      }

      return {
        ok: true,
        skipped: false,
        payload,
      };
    },
  };
}

function reject(status: ValidationFailure["status"], error: PublicRequestError): ValidationFailure {
  return {
    ok: false,
    status,
    error,
  };
}

function hasJsonContentType(contentType: string | null) {
  if (!contentType) return false;

  return contentType
    .split(";")[0]
    ?.trim()
    .toLowerCase() === "application/json";
}

function readContentLength(value: string | null) {
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseJsonRecord(rawBody: string) {
  try {
    const parsed = JSON.parse(rawBody) as unknown;

    return isPlainRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function readBodyWithinLimit(request: NextRequest) {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;

      if (totalBytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return null;
      }

      chunks.push(value);
    }

    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8");
  } catch {
    return "";
  } finally {
    reader.releaseLock();
  }
}

function isSameOrigin(request: NextRequest) {
  return isSameOriginRequest(request);
}

export function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");

  return typeof origin === "string" && origin === request.nextUrl.origin;
}

function buildFingerprint(request: NextRequest) {
  return buildRateLimitFingerprint(request, request.nextUrl.pathname);
}

export function buildRateLimitFingerprint(request: NextRequest, scope: string) {
  const clientAddress = readClientAddress(request);

  // This is only a best-effort in-process throttle bucket. The client address is
  // never used for authorization and can be absent or spoofed outside a trusted
  // deployment proxy, so it is not a substitute for platform rate limiting.
  // Without an address, use only the bounded process-wide limit to avoid making
  // unrelated visitors share a low origin-level bucket.
  return clientAddress ? `${scope}:${clientAddress}` : undefined;
}

function readClientAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedAddress = forwardedFor?.split(",")[0]?.trim();

  if (forwardedAddress && /^[0-9a-f:.]+$/i.test(forwardedAddress)) {
    return forwardedAddress;
  }

  const realAddress = request.headers.get("x-real-ip")?.trim();

  return realAddress && /^[0-9a-f:.]+$/i.test(realAddress) ? realAddress : "";
}

function validateAcceptedPayload(
  body: Record<string, unknown>,
  testCaseCode: string,
): AcceptedPublicTestLogPayload | null {
  if (!hasOnlyAllowedKeys(body, TOP_LEVEL_FIELDS)) {
    return null;
  }

  const createdAt = validateIsoString(body.createdAt);
  const birthDate = validateBirthDate(body.birthDate);
  const calendarType = validateEnum(body.calendarType, CALENDAR_TYPES);
  const birthTime = validateEnum(body.birthTime, BIRTH_TIMES);
  const gender = validateEnum(body.gender, GENDERS);
  const animalKey = validateRequiredString(body.animalKey, MAX_SHORT_TEXT_BYTES);
  const animalTitle = validateRequiredString(body.animalTitle, MAX_SHORT_TEXT_BYTES);
  const resultSummary = validateRequiredString(body.resultSummary, MAX_SUMMARY_BYTES);
  const firstImpressionSummary = validateRequiredString(body.firstImpressionSummary, MAX_LONG_TEXT_BYTES);
  const resultExplanationSnapshot = validateExplanationSnapshot(body.resultExplanationSnapshot);
  const dayStem = validateRequiredString(body.dayStem, MAX_SHORT_TEXT_BYTES);
  const element = validateRequiredString(body.element, MAX_SHORT_TEXT_BYTES);
  const salList = validateSalList(body.salList);
  const scoreSnapshot = validateScoreSnapshot(body.scoreSnapshot);
  const copyVersion = validateRequiredString(body.copyVersion, MAX_SHORT_TEXT_BYTES);
  const logicVersion = validateRequiredString(body.logicVersion, MAX_SHORT_TEXT_BYTES);
  const path = normalizeLogPath(body.path);
  if (
    !createdAt ||
    !birthDate ||
    !calendarType ||
    !birthTime ||
    !gender ||
    !animalKey ||
    !animalTitle ||
    !resultSummary ||
    !firstImpressionSummary ||
    !resultExplanationSnapshot ||
    !dayStem ||
    !element ||
    !salList ||
    !scoreSnapshot ||
    !copyVersion ||
    !logicVersion ||
    !path
  ) {
    return null;
  }

  return {
    createdAt,
    birthDate,
    calendarType,
    birthTime,
    gender,
    animalKey,
    animalTitle,
    resultSummary,
    firstImpressionSummary,
    resultExplanationSnapshot,
    dayStem,
    element,
    salList,
    scoreSnapshot,
    copyVersion,
    logicVersion,
    path,
    testCaseCode,
  };
}

function hasOnlyAllowedKeys(body: Record<string, unknown>, allowedKeys: Set<string>) {
  return Object.keys(body).every((key) => allowedKeys.has(key));
}

function validateIsoString(value: unknown) {
  const stringValue = validateRequiredString(value, MAX_SHORT_TEXT_BYTES);

  if (!stringValue) return null;
  if (!/^\d{4}-\d{2}-\d{2}T/.test(stringValue)) return null;

  return Number.isFinite(Date.parse(stringValue)) ? stringValue : null;
}

function validateBirthDate(value: unknown) {
  const stringValue = validateRequiredString(value, 10);

  if (!stringValue) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(stringValue);

  if (!match) return null;

  const [, year, month, day] = match;
  const parsed = new Date(`${stringValue}T00:00:00.000Z`);

  if (!Number.isFinite(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10) === `${year}-${month}-${day}` ? stringValue : null;
}

function validateEnum<T extends string>(value: unknown, allowedValues: Set<T>) {
  if (typeof value !== "string" || !allowedValues.has(value as T)) {
    return null;
  }

  return value as T;
}

function validateRequiredString(value: unknown, maxBytes: number) {
  return validateBoundedString(value, { maxBytes, optional: false });
}

function validateBoundedString(
  value: unknown,
  options: {
    maxBytes: number;
    optional: boolean;
  },
) {
  if (value === undefined) {
    return options.optional ? "" : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const bytes = Buffer.byteLength(value, "utf8");

  if (bytes > options.maxBytes) {
    return null;
  }

  if (!options.optional && value.trim().length === 0) {
    return null;
  }

  return value;
}

function validateExplanationSnapshot(value: unknown): TestLogExplanationSnapshot | null {
  if (!isPlainRecord(value) || !hasOnlyAllowedKeys(value, EXPLANATION_FIELDS)) {
    return null;
  }

  const title = validateRequiredString(value.title, MAX_LONG_TEXT_BYTES);
  const subtitle = validateRequiredString(value.subtitle, MAX_LONG_TEXT_BYTES);
  const firstImpression = validateRequiredString(value.firstImpression, MAX_LONG_TEXT_BYTES);
  const moneyPattern = validateRequiredString(value.moneyPattern, MAX_LONG_TEXT_BYTES);
  const elementText = validateRequiredString(value.elementText, MAX_LONG_TEXT_BYTES);
  const salText = validateBoundedString(value.salText, {
    maxBytes: MAX_LONG_TEXT_BYTES,
    optional: true,
  });
  const closingNote = validateRequiredString(value.closingNote, MAX_LONG_TEXT_BYTES);

  if (!title || !subtitle || !firstImpression || !moneyPattern || !elementText || salText === null || !closingNote) {
    return null;
  }

  return salText
    ? {
        title,
        subtitle,
        firstImpression,
        moneyPattern,
        elementText,
        salText,
        closingNote,
      }
    : {
        title,
        subtitle,
        firstImpression,
        moneyPattern,
        elementText,
        closingNote,
      };
}

function validateSalList(value: unknown) {
  if (!Array.isArray(value) || value.length > MAX_SAL_COUNT) {
    return null;
  }

  const salList: string[] = [];

  for (const item of value) {
    const sal = validateRequiredString(item, MAX_SAL_BYTES);

    if (!sal) {
      return null;
    }

    salList.push(sal);
  }

  return salList;
}

function validateScoreSnapshot(value: unknown) {
  if (!isPlainRecord(value)) {
    return null;
  }

  try {
    const serialized = JSON.stringify(value);

    if (!serialized || Buffer.byteLength(serialized, "utf8") > MAX_SCORE_BYTES) {
      return null;
    }
  } catch {
    return null;
  }

  const state = { nodes: 0 };

  return isSafeScoreValue(value, 0, state) ? value : null;
}

function isSafeScoreValue(
  value: unknown,
  depth: number,
  state: {
    nodes: number;
  },
): boolean {
  if (depth > MAX_SCORE_DEPTH) {
    return false;
  }

  state.nodes += 1;

  if (state.nodes > MAX_SCORE_NODES) {
    return false;
  }

  if (value === null) {
    return true;
  }

  if (typeof value === "string") {
    return Buffer.byteLength(value, "utf8") <= MAX_SCORE_STRING_BYTES;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isSafeScoreValue(item, depth + 1, state));
  }

  if (!isPlainRecord(value)) {
    return false;
  }

  return Object.entries(value).every(([key, nestedValue]) => {
    if (Buffer.byteLength(key, "utf8") > MAX_SCORE_KEY_BYTES) {
      return false;
    }

    return isSafeScoreValue(nestedValue, depth + 1, state);
  });
}

export function normalizeLogPath(value: unknown) {
  const path = validateRequiredString(value, MAX_PATH_BYTES);

  if (!path || !path.startsWith("/")) {
    return null;
  }

  try {
    const baseUrl = "https://money-saju.local";
    const url = new URL(path, baseUrl);

    return url.origin === baseUrl ? url.pathname : null;
  } catch {
    return null;
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

export const defaultTestLogRequestSecurity = createTestLogRequestSecurity();
