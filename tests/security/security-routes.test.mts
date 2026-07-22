import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";

type RequestSecurityModule = typeof import("../../src/lib/testLogs/requestSecurity");
type CsvModule = typeof import("../../src/lib/testLogs/csv");
type StorageModule = typeof import("../../src/lib/testLogs/storage");
type NextConfigModule = typeof import("../../next.config");

const require = createRequire(import.meta.url);
const { normalizeLogPath } = require(
  "../../src/lib/testLogs/requestSecurity.ts",
) as RequestSecurityModule;
const { serializeCsvCell } = require("../../src/lib/testLogs/csv.ts") as CsvModule;
const { GOOGLE_SHEETS_VALUE_INPUT_OPTION } = require(
  "../../src/lib/testLogs/storage.ts",
) as StorageModule;
const { getSecurityHeaders } = require("../../next.config.ts") as NextConfigModule;

const HOST = "127.0.0.1";
const BUILD_TIMEOUT_MS = 180_000;
const STARTUP_TIMEOUT_MS = 90_000;
const SHUTDOWN_TIMEOUT_MS = 10_000;
const READY_PATH = "/api/test-logs?limit=1";
const MAX_LOG_LINES = 20;
const TEST_RUN_ID = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const TEST_DIST_DIR = `.next-security-test/${TEST_RUN_ID}`;
const TEST_TSCONFIG_PATH = "tsconfig.security.json";
const ROOT_TSCONFIG_PATH = "tsconfig.json";
const TEST_ADMIN_KEY = "security-test-admin-key";

type ServerHandle = {
  baseUrl: string;
  origin: string;
  stop: () => Promise<void>;
};

type FetchExpectation = {
  status: number;
  body?: unknown;
  contentTypeIncludes?: string;
  cacheControlIncludes?: string;
};

function rememberLine(lines: string[], chunk: string) {
  for (const line of chunk.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    lines.push(trimmed);

    if (lines.length > MAX_LOG_LINES) {
      lines.splice(0, lines.length - MAX_LOG_LINES);
    }
  }
}

async function getAvailablePort() {
  return await new Promise<number>((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);
    server.listen(0, HOST, () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        reject(new Error("Failed to allocate a TCP port for the security test server."));
        return;
      }

      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(port);
      });
    });
  });
}

function createStartupError(
  message: string,
  stdoutLines: string[],
  stderrLines: string[],
  exitSummary?: string,
) {
  const sections = [message];

  if (exitSummary) {
    sections.push(`process: ${exitSummary}`);
  }

  if (stdoutLines.length > 0) {
    sections.push(`stdout tail:\n${stdoutLines.join("\n")}`);
  }

  if (stderrLines.length > 0) {
    sections.push(`stderr tail:\n${stderrLines.join("\n")}`);
  }

  return new Error(sections.join("\n\n"));
}

function createSecurityTestEnvironment() {
  const safeEnvironment = { ...process.env };

  for (const key of [
    "GOOGLE_SERVICE_ACCOUNT_JSON",
    "GOOGLE_SHEETS_CLIENT_EMAIL",
    "GOOGLE_SHEETS_LOG_SHEET_NAME",
    "GOOGLE_SHEETS_PRIVATE_KEY",
    "GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON",
    "GOOGLE_SHEETS_SPREADSHEET_ID",
  ]) {
    delete safeEnvironment[key];
  }

  return safeEnvironment;
}

async function waitForExit(process: ChildProcess, timeoutMs: number) {
  if (process.exitCode !== null || process.signalCode !== null) {
    return;
  }

  await Promise.race([
    new Promise<void>((resolve) => process.once("exit", () => resolve())),
    delay(timeoutMs),
  ]);
}

async function stopProcess(process: ChildProcess) {
  if (process.exitCode !== null || process.signalCode !== null) {
    return;
  }

  process.kill("SIGTERM");
  await waitForExit(process, SHUTDOWN_TIMEOUT_MS);

  if (process.exitCode === null && process.signalCode === null) {
    process.kill("SIGKILL");
    await waitForExit(process, SHUTDOWN_TIMEOUT_MS);
  }
}

async function runProductionBuild(environment: NodeJS.ProcessEnv) {
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "build"],
    {
      cwd: process.cwd(),
      env: environment,
      stdio: ["ignore", "pipe", "pipe"] as const,
    },
  );

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => rememberLine(stdoutLines, chunk));
  child.stderr.on("data", (chunk: string) => rememberLine(stderrLines, chunk));

  const result = await Promise.race([
    new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
      child.once("exit", (code, signal) => resolve({ code, signal }));
    }),
    delay(BUILD_TIMEOUT_MS).then(() => null),
  ]);

  if (result === null) {
    await stopProcess(child);
    throw createStartupError(
      `Production Next build did not finish within ${BUILD_TIMEOUT_MS}ms.`,
      stdoutLines,
      stderrLines,
    );
  }

  if (result.code !== 0) {
    throw createStartupError(
      "Production Next build failed.",
      stdoutLines,
      stderrLines,
      `exitCode=${result.code ?? "null"}, signal=${result.signal ?? "null"}`,
    );
  }
}

async function startLocalNextApp(): Promise<ServerHandle> {
  const port = await getAvailablePort();
  const baseUrl = `http://${HOST}:${port}`;
  const origin = `http://localhost:${port}`;
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];
  const environment: NodeJS.ProcessEnv = {
    ...createSecurityTestEnvironment(),
    CI: "1",
    NODE_ENV: "production",
    NEXT_DIST_DIR: TEST_DIST_DIR,
    NEXT_TSCONFIG_PATH: TEST_TSCONFIG_PATH,
    TEST_LOG_ADMIN_KEY: TEST_ADMIN_KEY,
    TEST_LOG_COOKIE_SECRET: "security-test-cookie-secret",
  };

  await runProductionBuild(environment);

  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      HOST,
      "--port",
      String(port),
    ],
    {
      cwd: process.cwd(),
      env: environment,
      stdio: ["ignore", "pipe", "pipe"] as const,
    },
  );

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => rememberLine(stdoutLines, chunk));
  child.stderr.on("data", (chunk: string) => rememberLine(stderrLines, chunk));

  const startedAt = Date.now();

  try {
    while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
      if (child.exitCode !== null || child.signalCode !== null) {
        throw createStartupError(
          "Local Next app exited before becoming ready.",
          stdoutLines,
          stderrLines,
          `exitCode=${child.exitCode ?? "null"}, signal=${child.signalCode ?? "null"}`,
        );
      }

      try {
        const response = await fetch(`${baseUrl}${READY_PATH}`);

        if (response.status === 401) {
          await response.body?.cancel();

          return {
            baseUrl,
            origin,
            stop: async () => {
              await stopProcess(child);
            },
          };
        }

        await response.body?.cancel();
      } catch {
        // The production server is still booting.
      }

      await delay(500);
    }

    throw createStartupError(
      `Local Next app did not become ready within ${STARTUP_TIMEOUT_MS}ms.`,
      stdoutLines,
      stderrLines,
    );
  } catch (error) {
    await stopProcess(child);
    throw error;
  }
}

async function expectRouteResponse(
  server: ServerHandle,
  path: string,
  init: RequestInit,
  expectation: FetchExpectation,
) {
  const response = await fetch(`${server.baseUrl}${path}`, init);

  assert.equal(response.status, expectation.status);

  if (expectation.contentTypeIncludes) {
    assert.match(
      response.headers.get("content-type") || "",
      new RegExp(expectation.contentTypeIncludes, "i"),
    );
  }

  if (expectation.cacheControlIncludes) {
    assert.match(
      response.headers.get("cache-control") || "",
      new RegExp(expectation.cacheControlIncludes, "i"),
    );
  }

  if (expectation.body !== undefined) {
    assert.deepEqual(await response.json(), expectation.body);
    return;
  }

  await response.body?.cancel();
}

function createSameOriginInit(origin: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("origin", origin);

  return {
    ...init,
    headers,
  };
}

function createCrossOriginInit(init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("origin", "https://cross-origin.example");

  return {
    ...init,
    headers,
  };
}

function createBasePublicPayload() {
  return {
    createdAt: "2026-07-22T00:00:00.000Z",
    birthDate: "2000-01-01",
    calendarType: "solar",
    birthTime: "1",
    gender: "female",
    animalKey: "rat",
    animalTitle: "쥐",
    resultSummary: "요약",
    firstImpressionSummary: "첫인상",
    resultExplanationSnapshot: {
      title: "제목",
      subtitle: "부제",
      firstImpression: "첫인상 설명",
      moneyPattern: "재물 패턴",
      elementText: "오행 설명",
      salText: "살 설명",
      closingNote: "마무리",
    },
    dayStem: "갑",
    element: "wood",
    salList: ["겁살"],
    scoreSnapshot: {
      total: 87,
      sections: {
        wealth: 42,
      },
    },
    copyVersion: "copy-v1",
    logicVersion: "logic-v1",
    path: "/result?shared=1",
    testCaseCode: "case-2",
  };
}

async function createAdminSession(server: ServerHandle, clientAddress = "198.51.100.30") {
  const response = await fetch(
    `${server.baseUrl}/api/admin/login`,
    createSameOriginInit(server.origin, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "x-forwarded-for": clientAddress,
      },
      body: new URLSearchParams({ adminKey: TEST_ADMIN_KEY }),
      redirect: "manual",
    }),
  );

  assert.equal(response.status, 303);
  const sessionCookie = response.headers.get("set-cookie");
  assert.ok(sessionCookie);

  return sessionCookie.split(";", 1)[0];
}

async function expectSecurityHeaders(server: ServerHandle, path: string) {
  const response = await fetch(`${server.baseUrl}${path}`);

  assert.match(
    response.headers.get("cache-control") || "",
    /no-store/i,
    `${path} must use no-store`,
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
  assert.match(response.headers.get("permissions-policy") || "", /camera=\(\)/i);
  assert.match(response.headers.get("content-security-policy-report-only") || "", /default-src 'self'/i);

  await response.body?.cancel();
}

let server: ServerHandle | undefined;
let rootTsconfigBeforeSecurityTest = "";

test("normalizes logged paths without query strings or external origins", () => {
  assert.equal(
    normalizeLogPath("/result?birthDate=20000101&gender=female#details"),
    "/result",
  );
  assert.equal(normalizeLogPath("//external.example/result?birthDate=20000101"), null);
});

test("neutralizes spreadsheet formula prefixes in CSV cells", () => {
  const formulaFixtures = [
    "=SUM(A1:A2)",
    "+1+1",
    "-1+1",
    "@SUM(A1:A2)",
    " =SUM(A1:A2)",
    "\t=SUM(A1:A2)",
    "\n=SUM(A1:A2)",
    "＝SUM(A1:A2)",
    "＋1+1",
    "－1+1",
    "＠SUM(A1:A2)",
  ];

  for (const fixture of formulaFixtures) {
    assert.equal(serializeCsvCell(fixture), `"'${fixture}"`);
  }

  assert.equal(serializeCsvCell('plain "text"'), '"plain ""text"""');
});

test("keeps Google Sheets writes in RAW mode", () => {
  assert.equal(GOOGLE_SHEETS_VALUE_INPUT_OPTION, "RAW");
});

test("enables HSTS only for production headers", () => {
  assert.equal(
    getSecurityHeaders(true).find((header) => header.key === "Strict-Transport-Security")?.value,
    "max-age=31536000",
  );
  assert.equal(
    getSecurityHeaders(false).some((header) => header.key === "Strict-Transport-Security"),
    false,
  );
});

test.before(async () => {
  rootTsconfigBeforeSecurityTest = await readFile(ROOT_TSCONFIG_PATH, "utf8");
  server = await startLocalNextApp();
});

test.after(async () => {
  await server?.stop();
  server = undefined;
  assert.equal(await readFile(ROOT_TSCONFIG_PATH, "utf8"), rootTsconfigBeforeSecurityTest);
  await rm(TEST_DIST_DIR, { force: true, recursive: true });
});

test("public test log POST skips admin22 submissions without Sheets access", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/test-logs",
    createSameOriginInit(server.origin, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ testCaseCode: "admin22" }),
    }),
    {
      status: 200,
      body: {
        ok: true,
        skipped: true,
        reason: "test-case-code",
      },
      contentTypeIncludes: "application/json",
      cacheControlIncludes: "no-store",
    },
  );

  await expectRouteResponse(
    server,
    "/api/test-logs",
    createCrossOriginInit({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ testCaseCode: "admin22" }),
    }),
    {
      status: 400,
      body: {
        ok: false,
        error: "invalid_request",
      },
      contentTypeIncludes: "application/json",
      cacheControlIncludes: "no-store",
    },
  );
});

test("sends security headers and no-store for sensitive routes", async () => {
  assert.ok(server);

  for (const path of ["/api/test-logs?limit=1", "/admin", "/result", "/report"]) {
    await expectSecurityHeaders(server, path);
  }
});

test("public test log POST rejects unsupported content types", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/test-logs",
    createSameOriginInit(server.origin, {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: JSON.stringify({ testCaseCode: "admin22" }),
    }),
    {
      status: 415,
      body: {
        ok: false,
        error: "unsupported_media_type",
      },
      contentTypeIncludes: "application/json",
      cacheControlIncludes: "no-store",
    },
  );
});

test("public test log POST rejects payloads over 32 KiB", async () => {
  assert.ok(server);

  const oversizedBody = JSON.stringify({
    testCaseCode: "admin22",
    padding: "x".repeat(33_000),
  });

  await expectRouteResponse(
    server,
    "/api/test-logs",
    createSameOriginInit(server.origin, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: oversizedBody,
    }),
    {
      status: 413,
      body: {
        ok: false,
        error: "payload_too_large",
      },
      contentTypeIncludes: "application/json",
      cacheControlIncludes: "no-store",
    },
  );
});

test("public test log POST rejects unknown fields before storage", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/test-logs",
    createSameOriginInit(server.origin, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ...createBasePublicPayload(),
        unexpectedField: "should-not-pass",
      }),
    }),
    {
      status: 400,
      body: {
        ok: false,
        error: "invalid_request",
      },
      contentTypeIncludes: "application/json",
      cacheControlIncludes: "no-store",
    },
  );
});

test("public test log POST rejects discontinued personal-data fields", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/test-logs",
    createSameOriginInit(server.origin, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ...createBasePublicPayload(),
        rawBirthDate: "20000101",
        userAgent: "Mozilla/5.0",
        referrer: "https://money-saju.example/result?birthDate=20000101",
      }),
    }),
    {
      status: 400,
      body: {
        ok: false,
        error: "invalid_request",
      },
      contentTypeIncludes: "application/json",
      cacheControlIncludes: "no-store",
    },
  );
});

test("public test log POST rate limits repeated submissions", async () => {
  assert.ok(server);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await expectRouteResponse(
        server,
        "/api/test-logs",
        createSameOriginInit(server.origin, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "198.51.100.22",
          },
          body: JSON.stringify({ testCaseCode: "admin22" }),
        }),
        {
          status: 200,
          body: {
            ok: true,
            skipped: true,
            reason: "test-case-code",
          },
          contentTypeIncludes: "application/json",
          cacheControlIncludes: "no-store",
        },
      );
  }

  await expectRouteResponse(
      server,
      "/api/test-logs",
      createSameOriginInit(server.origin, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.22",
        },
        body: JSON.stringify({ testCaseCode: "admin22" }),
      }),
      {
        status: 429,
        body: {
          ok: false,
          error: "rate_limited",
        },
        contentTypeIncludes: "application/json",
        cacheControlIncludes: "no-store",
      },
  );
});

test("public test log POST reaches storage only after accepting a valid payload", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/test-logs",
    createSameOriginInit(server.origin, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.10",
      },
      body: JSON.stringify(createBasePublicPayload()),
    }),
    {
      status: 503,
      body: {
        ok: false,
        error: "server_error",
      },
      contentTypeIncludes: "application/json",
      cacheControlIncludes: "no-store",
    },
  );
});

test("admin login rejects cross-origin credential submissions", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/admin/login",
    createCrossOriginInit({
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ adminKey: TEST_ADMIN_KEY }),
      redirect: "manual",
    }),
    {
      status: 400,
      cacheControlIncludes: "no-store",
    },
  );
});

test("admin login rate limits repeated invalid credentials", async () => {
  assert.ok(server);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await expectRouteResponse(
      server,
      "/api/admin/login",
      createSameOriginInit(server.origin, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "x-forwarded-for": "198.51.100.31",
        },
        body: new URLSearchParams({ adminKey: "wrong-key" }),
        redirect: "manual",
      }),
      {
        status: 303,
      },
    );
  }

  await expectRouteResponse(
    server,
    "/api/admin/login",
    createSameOriginInit(server.origin, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "x-forwarded-for": "198.51.100.31",
      },
      body: new URLSearchParams({ adminKey: "wrong-key" }),
      redirect: "manual",
    }),
    {
      status: 429,
      cacheControlIncludes: "no-store",
    },
  );
});

test("admin mutation routes require a valid same-origin session", async () => {
  assert.ok(server);
  const sessionCookie = await createAdminSession(server);

  await expectRouteResponse(
    server,
    "/api/admin/sheets-test",
    createCrossOriginInit({
      method: "POST",
      headers: {
        cookie: sessionCookie,
      },
    }),
    {
      status: 400,
      cacheControlIncludes: "no-store",
    },
  );

  await expectRouteResponse(
    server,
    "/api/admin/logout",
    createCrossOriginInit({
      method: "POST",
      headers: {
        cookie: sessionCookie,
      },
      redirect: "manual",
    }),
    {
      status: 400,
      cacheControlIncludes: "no-store",
    },
  );
});

test("protected test log GET returns unauthorized without admin auth", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/test-logs?limit=5",
    createSameOriginInit(server.baseUrl),
    {
      status: 401,
      body: {
        ok: false,
        error: "unauthorized",
      },
    },
  );
});

test("protected test log GET rejects a tampered admin session", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/test-logs?limit=5",
    createSameOriginInit(server.origin, {
      headers: {
        cookie: "money_saju_admin=tampered.session",
      },
    }),
    {
      status: 401,
      body: {
        ok: false,
        error: "unauthorized",
      },
      cacheControlIncludes: "no-store",
    },
  );
});

test("protected test log export GET returns unauthorized without admin auth", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/test-logs/export?limit=10",
    createCrossOriginInit(),
    {
      status: 401,
      body: {
        ok: false,
        error: "unauthorized",
      },
    },
  );
});

test("protected sheets debug GET is never a mutation", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/admin/sheets-test",
    createSameOriginInit(server.origin),
    {
      status: 405,
      body: {
        ok: false,
        error: "method_not_allowed",
      },
      cacheControlIncludes: "no-store",
    },
  );
});

test("protected sheets debug POST returns unauthorized without admin auth", async () => {
  assert.ok(server);

  await expectRouteResponse(
    server,
    "/api/admin/sheets-test",
    createCrossOriginInit({
      method: "POST",
    }),
    {
      status: 401,
      body: {
        ok: false,
        error: "unauthorized",
      },
    },
  );
});
