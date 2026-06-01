import type { TestLogPayload, TestLogQuery, TestLogRecord, TestLogStorage } from "./types";

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 1000;
const DEFAULT_TABLE = "test_logs";

export class TestLogStorageConfigError extends Error {
  constructor() {
    super(
      "Supabase test log storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
    this.name = "TestLogStorageConfigError";
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_TEST_LOG_TABLE || DEFAULT_TABLE;

  if (!url || !serviceRoleKey) {
    throw new TestLogStorageConfigError();
  }

  return { url, serviceRoleKey, table };
}

function getLimit(limit?: number) {
  if (!limit || !Number.isFinite(limit)) return DEFAULT_LIMIT;

  return Math.max(1, Math.min(MAX_LIMIT, Math.round(limit)));
}

function normalizeText(value: unknown) {
  return String(value ?? "").toLowerCase();
}

function matchesFilter(log: TestLogRecord, query: TestLogQuery) {
  if (query.animalKey && log.animalKey !== query.animalKey) return false;
  if (query.calendarType && log.calendarType !== query.calendarType) return false;
  if (query.birthTime && log.birthTime !== query.birthTime) return false;
  if (query.dayStem && log.dayStem !== query.dayStem) return false;

  const q = query.q?.trim().toLowerCase();

  if (!q) return true;

  return [
    log.birthDate,
    log.animalKey,
    log.animalTitle,
    log.resultSummary,
    log.dayStem,
    log.element,
    log.salList.join(" "),
  ]
    .map(normalizeText)
    .some((value) => value.includes(q));
}

class SupabaseTestLogStorage implements TestLogStorage {
  async create(log: TestLogPayload): Promise<TestLogRecord> {
    const { url, serviceRoleKey, table } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(log),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to save test log: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as TestLogRecord[];

    return data[0] ?? log;
  }

  async list(query: TestLogQuery = {}): Promise<TestLogRecord[]> {
    const { url, serviceRoleKey, table } = getSupabaseConfig();
    const limit = getLimit(query.limit);
    const params = new URLSearchParams({
      select: "*",
      order: "createdAt.desc",
      limit: String(limit),
    });
    const response = await fetch(`${url}/rest/v1/${table}?${params.toString()}`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to load test logs: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as TestLogRecord[];

    return data.filter((log) => matchesFilter(log, query));
  }
}

export function getTestLogStorage(): TestLogStorage {
  return new SupabaseTestLogStorage();
}

export function isStorageConfigError(error: unknown) {
  return error instanceof TestLogStorageConfigError;
}
