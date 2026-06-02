import { createSign } from "crypto";
import type { TestLogPayload, TestLogQuery, TestLogRecord, TestLogStorage } from "./types";

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 1000;
const DEFAULT_SHEET_NAME = "test_logs";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

const SHEET_HEADERS: Array<keyof TestLogPayload> = [
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
  "userAgent",
  "referrer",
  "path",
];

type GoogleSheetsConfig = {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  sheetName: string;
};

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

export class TestLogStorageConfigError extends Error {
  constructor() {
    super(
      "Google Sheets test log storage is not configured. Set GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL, and GOOGLE_SHEETS_PRIVATE_KEY.",
    );
    this.name = "TestLogStorageConfigError";
  }
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

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n");
}

function parseServiceAccountJson() {
  const raw =
    process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      client_email?: string;
      private_key?: string;
    };

    if (!parsed.client_email || !parsed.private_key) return null;

    return {
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  } catch {
    return null;
  }
}

function getGoogleSheetsConfig(): GoogleSheetsConfig {
  const serviceAccount = parseServiceAccountJson();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || serviceAccount?.clientEmail;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
    ? normalizePrivateKey(process.env.GOOGLE_SHEETS_PRIVATE_KEY)
    : serviceAccount?.privateKey;
  const sheetName = process.env.GOOGLE_SHEETS_LOG_SHEET_NAME || DEFAULT_SHEET_NAME;

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new TestLogStorageConfigError();
  }

  return { spreadsheetId, clientEmail, privateKey, sheetName };
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createJwt(config: GoogleSheetsConfig) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: config.clientEmail,
      scope: GOOGLE_SHEETS_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      exp: issuedAt + 3600,
      iat: issuedAt,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(config.privateKey);

  return `${unsignedToken}.${base64Url(signature)}`;
}

async function getAccessToken(config: GoogleSheetsConfig) {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: createJwt(config),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate Google Sheets: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data.access_token) {
    throw new Error("Failed to authenticate Google Sheets: missing access token");
  }

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return tokenCache.accessToken;
}

function escapeSheetName(sheetName: string) {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

function sheetsUrl(config: GoogleSheetsConfig, suffix = "") {
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}${suffix}`;
}

async function googleSheetsFetch(
  config: GoogleSheetsConfig,
  suffix: string,
  init: RequestInit = {},
) {
  const accessToken = await getAccessToken(config);
  const response = await fetch(sheetsUrl(config, suffix), {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google Sheets request failed: ${response.status} ${await response.text()}`);
  }

  return response;
}

async function ensureSheetExists(config: GoogleSheetsConfig) {
  const metadataResponse = await googleSheetsFetch(config, "?fields=sheets.properties.title");
  const metadata = (await metadataResponse.json()) as {
    sheets?: Array<{ properties?: { title?: string } }>;
  };
  const exists = metadata.sheets?.some((sheet) => sheet.properties?.title === config.sheetName);

  if (exists) return;

  await googleSheetsFetch(config, ":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title: config.sheetName } } }],
    }),
  });
}

async function ensureHeaders(config: GoogleSheetsConfig) {
  await ensureSheetExists(config);

  const range = `${escapeSheetName(config.sheetName)}!A1:${columnName(SHEET_HEADERS.length)}1`;
  const response = await googleSheetsFetch(config, `/values/${encodeURIComponent(range)}`);
  const data = (await response.json()) as { values?: string[][] };
  const existingHeader = data.values?.[0] ?? [];
  const hasHeaders = SHEET_HEADERS.every((header, index) => existingHeader[index] === header);

  if (hasHeaders) return;

  await googleSheetsFetch(config, `/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [SHEET_HEADERS] }),
  });
}

function columnName(index: number) {
  let column = "";
  let value = index;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    value = Math.floor((value - 1) / 26);
  }

  return column;
}

function serializeCell(value: unknown) {
  if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
    return JSON.stringify(value);
  }

  return String(value ?? "");
}

function parseJsonCell<T>(value: string, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toSheetRow(log: TestLogPayload) {
  return SHEET_HEADERS.map((header) => serializeCell(log[header]));
}

function fromSheetRow(row: string[], index: number): TestLogRecord {
  const cell = (header: keyof TestLogPayload) => {
    const columnIndex = SHEET_HEADERS.indexOf(header);

    return row[columnIndex] ?? "";
  };

  return {
    id: index + 2,
    createdAt: cell("createdAt"),
    birthDate: cell("birthDate"),
    calendarType: cell("calendarType"),
    birthTime: cell("birthTime"),
    gender: cell("gender"),
    animalKey: cell("animalKey"),
    animalTitle: cell("animalTitle"),
    resultSummary: cell("resultSummary"),
    firstImpressionSummary: cell("firstImpressionSummary"),
    resultExplanationSnapshot: parseJsonCell(cell("resultExplanationSnapshot"), {
      title: "",
      subtitle: "",
      firstImpression: "",
      moneyPattern: "",
      elementText: "",
      closingNote: "",
    }),
    dayStem: cell("dayStem"),
    element: cell("element"),
    salList: parseJsonCell<string[]>(cell("salList"), []),
    scoreSnapshot: parseJsonCell<Record<string, unknown>>(cell("scoreSnapshot"), {}),
    copyVersion: cell("copyVersion"),
    logicVersion: cell("logicVersion"),
    userAgent: cell("userAgent"),
    referrer: cell("referrer"),
    path: cell("path"),
  };
}

class GoogleSheetsTestLogStorage implements TestLogStorage {
  async create(log: TestLogPayload): Promise<TestLogRecord> {
    const config = getGoogleSheetsConfig();

    await ensureHeaders(config);

    const range = `${escapeSheetName(config.sheetName)}!A:${columnName(SHEET_HEADERS.length)}`;
    await googleSheetsFetch(
      config,
      `/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: JSON.stringify({ values: [toSheetRow(log)] }),
      },
    );

    return log;
  }

  async list(query: TestLogQuery = {}): Promise<TestLogRecord[]> {
    const config = getGoogleSheetsConfig();

    await ensureHeaders(config);

    const limit = getLimit(query.limit);
    const range = `${escapeSheetName(config.sheetName)}!A2:${columnName(SHEET_HEADERS.length)}`;
    const response = await googleSheetsFetch(config, `/values/${encodeURIComponent(range)}`);
    const data = (await response.json()) as { values?: string[][] };
    const rows = data.values ?? [];

    return rows
      .map(fromSheetRow)
      .reverse()
      .filter((log) => matchesFilter(log, query))
      .slice(0, limit);
  }
}

export function getTestLogStorage(): TestLogStorage {
  return new GoogleSheetsTestLogStorage();
}

export function isStorageConfigError(error: unknown) {
  return error instanceof TestLogStorageConfigError;
}
