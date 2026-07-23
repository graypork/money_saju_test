import type { NextRequest } from "next/server";
const MAX_REQUEST_BYTES = 32 * 1024;
const WINDOW_MS = 60_000;
const FINGERPRINT_LIMIT = 10;
const PROCESS_LIMIT = 600;
const MAX_TRACKED_FINGERPRINTS = 256;

const TOP_LEVEL_FIELDS = new Set([
  "birthDate",
  "calendarType",
  "birthTime",
  "gender",
  "testCaseCode",
]);

const CALENDAR_TYPES = new Set<"solar" | "lunar">(["solar", "lunar"]);
const GENDERS = new Set<"male" | "female" | "unknown">(["male", "female", "unknown"]);
const BIRTH_TIMES = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]);

const MAX_SHORT_TEXT_BYTES = 128;
const MAX_PATH_BYTES = 2_048;

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

export type AcceptedPublicTestLogSubmission = {
  birthDate: string;
  calendarType: "solar" | "lunar";
  birthTime: string;
  gender: "male" | "female" | "unknown";
  testCaseCode: string;
};

type ValidationSuccess = {
  ok: true;
  skipped: false;
  submission: AcceptedPublicTestLogSubmission;
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

      if (!hasSameOriginFetchMetadata(request)) {
        return reject(400, "invalid_request");
      }

      if (!hasOnlyAllowedKeys(body, TOP_LEVEL_FIELDS)) {
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

      const submission = validateAcceptedSubmission(body, testCaseCode);

      if (!submission) {
        return reject(400, "invalid_request");
      }

      if (!rateLimiter.consume(buildFingerprint(request))) {
        return reject(429, "rate_limited");
      }

      return {
        ok: true,
        skipped: false,
        submission,
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

function hasSameOriginFetchMetadata(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  const mode = request.headers.get("sec-fetch-mode");

  return site === "same-origin" && (mode === "cors" || mode === "same-origin");
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

function validateAcceptedSubmission(
  body: Record<string, unknown>,
  testCaseCode: string,
): AcceptedPublicTestLogSubmission | null {
  const birthDate = validateBirthDate(body.birthDate);
  const calendarType = validateEnum(body.calendarType, CALENDAR_TYPES);
  const birthTime = validateEnum(body.birthTime, BIRTH_TIMES);
  const gender = validateEnum(body.gender, GENDERS);
  if (
    !birthDate ||
    !calendarType ||
    !birthTime ||
    !gender
  ) {
    return null;
  }

  return {
    birthDate,
    calendarType,
    birthTime,
    gender,
    testCaseCode,
  };
}

function hasOnlyAllowedKeys(body: Record<string, unknown>, allowedKeys: Set<string>) {
  return Object.keys(body).every((key) => allowedKeys.has(key));
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
