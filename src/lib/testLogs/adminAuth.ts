import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "money_saju_admin";

const SESSION_TTL_SECONDS = 60 * 60 * 12;

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getCookieSecret() {
  return process.env.TEST_LOG_COOKIE_SECRET || process.env.TEST_LOG_ADMIN_KEY || "";
}

function sign(payload: string) {
  const secret = getCookieSecret();

  if (!secret) return "";

  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isAdminKeyValid(key: string) {
  const expected = process.env.TEST_LOG_ADMIN_KEY;

  if (!expected) return false;

  const input = Buffer.from(key);
  const target = Buffer.from(expected);

  if (input.length !== target.length) return false;

  return timingSafeEqual(input, target);
}

export function createAdminSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = base64Url(JSON.stringify({ v: 1, expiresAt }));
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  const expectedSignature = sign(payload);

  if (!payload || !signature || !expectedSignature) return false;

  const input = Buffer.from(signature);
  const target = Buffer.from(expectedSignature);

  if (input.length !== target.length || !timingSafeEqual(input, target)) {
    return false;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as { expiresAt?: number };

    return typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function readCookieFromHeader(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const target = `${name}=`;
  const found = cookies.find((cookie) => cookie.startsWith(target));

  return found ? decodeURIComponent(found.slice(target.length)) : null;
}
