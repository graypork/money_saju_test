"use client";

import {
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateWealthResult } from "../../src/lib/score";
import AppVersionBadge from "../../src/components/AppVersionBadge";
import { buildResultCopy } from "../../src/lib/copyEngine";
import { uiTokens } from "../../src/lib/uiTokens";
import { PaidReportView } from "../../src/components/PaidReportSectionNavigator";
import { samplePaidReport } from "../../src/content/resultCopy/paidReportSample";

const PAGE_BASE_CLASS =
  `${uiTokens.page} break-keep px-4 pb-10 pt-4`;
const PRIMARY_BUTTON_CLASS =
  `min-h-14 w-full rounded-full px-5 py-4 text-center text-[16px] font-extrabold text-[#FFF8ED] transition active:translate-y-0.5 ${uiTokens.greenButtonSurface}`;
const SECONDARY_BUTTON_CLASS =
  `min-h-14 w-full rounded-full px-5 py-4 text-center text-[16px] font-extrabold text-[#33241D] transition active:translate-y-0.5 ${uiTokens.secondaryButtonSurface}`;
const DARK_PANEL_CLASS =
  "rounded-[28px] border border-[rgba(217,142,115,0.18)] bg-[#FFF8ED] p-5 text-[#33241D]";

function SiteHeader({
  label,
  onBack,
}: {
  label: string;
  onBack: () => void;
}) {
  return (
    <header className={`${uiTokens.header} flex items-center justify-between`}>
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(231,197,184,0.46)] text-lg font-black text-[#33241D]"
      >
        ←
      </button>
      <span className="text-[13px] font-black tracking-[-0.01em]">
        MONEY SAJU
      </span>
      <span className="text-[11px] font-black tracking-[0.12em] text-[#D98E73]">
        {label}
      </span>
    </header>
  );
}

function parseBirthDate(birthDate: string) {
  const parts = birthDate.split("-").map(Number);

  return {
    year: parts[0] || 2000,
    month: parts[1] || 1,
    day: parts[2] || 1,
  };
}

function formatBirthDate(birthDate: string) {
  return `${birthDate.slice(0, 4)}-${birthDate.slice(4, 6)}-${birthDate.slice(6, 8)}`;
}

function parseBirthTime(birthTime: string) {
  if (!birthTime || birthTime === "0") return undefined;

  if (birthTime.includes(":")) {
    const [hour] = birthTime.split(":").map(Number);
    return Number.isFinite(hour) ? hour : undefined;
  }

  const hour = Number(birthTime);
  return Number.isFinite(hour) ? hour : undefined;
}

function InvalidReport() {
  const router = useRouter();

  return (
    <main className={PAGE_BASE_CLASS}>
      <section className="relative z-10 mx-auto max-w-[430px] space-y-10 pt-1">
        <SiteHeader label="REPORT" onBack={() => router.push("/")} />
        <div className={DARK_PANEL_CLASS}>
          <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#D98E73]">
            REPORT
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.25] text-[#33241D]">
            상세 리포트를 만들 결과가 없어요
          </h1>
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[rgba(130,104,93,0.86)]">
            먼저 테스트 결과를 만든 뒤 상세 리포트를 확인할 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className={`${PRIMARY_BUTTON_CLASS} mt-6`}
          >
            테스트 시작하기
          </button>
        </div>
      </section>
    </main>
  );
}

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawBirthDate = searchParams.get("birthDate") || "";
  const normalizedBirthDate = rawBirthDate.replace(/\D/g, "");
  const birthDate =
    normalizedBirthDate.length === 8
      ? formatBirthDate(normalizedBirthDate)
      : "";
  const birthTime = searchParams.get("birthTime") || "0";
  const genderParam = searchParams.get("gender") || "unknown";
  const calendarTypeParam = searchParams.get("calendarType") || "solar";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return <InvalidReport />;
  }

  const { year, month, day } = parseBirthDate(birthDate);
  const hour = parseBirthTime(birthTime);
  const result = calculateWealthResult({
    year,
    month,
    day,
    hour,
    birthTime,
    calendarType: calendarTypeParam === "lunar" ? "lunar" : "solar",
    gender:
      genderParam === "male" || genderParam === "female"
        ? genderParam
        : "unknown",
  });
  void buildResultCopy(result);
  const resultHref = `/result?${searchParams.toString()}`;

  return (
    <main className={PAGE_BASE_CLASS}>
      <section className="relative z-10 mx-auto max-w-[430px] space-y-12 pb-8">
        <SiteHeader label="REPORT" onBack={() => router.push(resultHref)} />

        {/* Temporary: render the swan paid-report sample for UI structure validation. */}
        {/* Do not connect to result.animalKey until the full paid report bank is added. */}
        <PaidReportView report={samplePaidReport} />

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className={PRIMARY_BUTTON_CLASS}
          >
            다시 테스트하기
          </button>
          <button
            type="button"
            onClick={() => router.push(resultHref)}
            className={SECONDARY_BUTTON_CLASS}
          >
            무료 결과로 돌아가기
          </button>
        </div>
      </section>
      <AppVersionBadge />
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF8ED] p-10 text-sm font-bold text-[rgba(130,104,93,0.72)]">
          상세 리포트를 불러오는 중입니다...
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
