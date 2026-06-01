import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminCookieOptions,
  isAdminKeyValid,
} from "../../../../src/lib/testLogs/adminAuth";

export const runtime = "nodejs";

async function readAdminKey(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as { adminKey?: string };

    return body.adminKey || "";
  }

  const formData = await request.formData();

  return String(formData.get("adminKey") || "");
}

export async function POST(request: NextRequest) {
  const adminKey = await readAdminKey(request);

  if (!isAdminKeyValid(adminKey)) {
    return NextResponse.redirect(new URL("/admin?error=1", request.url), {
      status: 303,
    });
  }

  const response = NextResponse.redirect(new URL("/admin/logs", request.url), {
    status: 303,
  });

  response.cookies.set(
    ADMIN_COOKIE_NAME,
    createAdminSessionToken(),
    getAdminCookieOptions(),
  );

  return response;
}
