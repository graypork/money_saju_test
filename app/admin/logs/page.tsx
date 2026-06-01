import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppVersionBadge from "../../../src/components/AppVersionBadge";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "../../../src/lib/testLogs/adminAuth";
import AdminLogsClient from "./AdminLogsClient";

export default async function AdminLogsPage() {
  const cookieStore = await cookies();
  const isLoggedIn = verifyAdminSessionToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
  );

  if (!isLoggedIn) redirect("/admin");

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-5 py-6 text-[#171C18]">
      <section className="mx-auto max-w-[1180px] pb-10">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-[0.08em] text-[#285C42]">
              ADMIN LOGS
            </p>
            <h1 className="mt-2 text-[30px] font-black leading-tight">
              테스트 결과 로그
            </h1>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-black/10 bg-[#FFFDF8] px-5 py-3 text-sm font-extrabold text-[#5E4936]"
            >
              로그아웃
            </button>
          </form>
        </header>
        <AdminLogsClient />
      </section>
      <AppVersionBadge />
    </main>
  );
}
