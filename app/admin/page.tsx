import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppVersionBadge from "../../src/components/AppVersionBadge";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "../../src/lib/testLogs/adminAuth";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const isLoggedIn = verifyAdminSessionToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
  );

  if (isLoggedIn) redirect("/admin/logs");

  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-5 py-8 text-[#171C18]">
      <section className="mx-auto max-w-[430px] pt-16">
        <div className="rounded-[28px] border border-black/10 bg-[#FFFDF8] p-6 shadow-[0_12px_32px_rgba(31,42,34,0.07)]">
          <p className="text-xs font-extrabold tracking-[0.08em] text-[#285C42]">
            ADMIN
          </p>
          <h1 className="mt-3 text-[32px] font-black leading-tight">
            테스트 로그 확인
          </h1>
          <p className="mt-3 text-[14px] font-semibold leading-6 text-[#6F6253]">
            관리자 키를 입력하면 저장된 결과 로그를 확인할 수 있습니다.
          </p>

          <form action="/api/admin/login" method="post" className="mt-6">
            <label className="block text-[13px] font-extrabold text-[#5E4936]">
              Admin key
              <input
                name="adminKey"
                type="password"
                autoComplete="current-password"
                className="mt-2 h-14 w-full rounded-2xl border border-black/10 bg-[#F8F4EC] px-4 text-[16px] font-bold outline-none focus:border-[#285C42]"
                required
              />
            </label>
            {hasError ? (
              <p className="mt-3 rounded-2xl bg-[#F8E4DF] px-4 py-3 text-[13px] font-bold text-[#9A3F2C]">
                관리자 키가 맞지 않습니다.
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-5 flex min-h-14 w-full items-center justify-center rounded-full bg-[#285C42] px-5 py-4 text-[16px] font-extrabold text-[#FFFDF8] shadow-[0_10px_24px_rgba(40,92,66,0.18)]"
            >
              로그 보기
            </button>
          </form>
        </div>
      </section>
      <AppVersionBadge />
    </main>
  );
}
