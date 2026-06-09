"use client";

import { Suspense, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateWealthResult,
  type WealthResult,
} from "../../src/lib/score";
import AppVersionBadge from "../../src/components/AppVersionBadge";
import { buildResultCopy, type BuiltResultCopy } from "../../src/lib/copyEngine";
import { uiTokens } from "../../src/lib/uiTokens";

const PAGE_BASE_CLASS =
  "min-h-screen break-keep bg-white px-5 pb-10 pt-4 text-[#191F28]";
const PRIMARY_BUTTON_CLASS =
  `min-h-14 w-full rounded-full px-5 py-4 text-center text-[16px] font-extrabold text-[#F7FFF9] transition active:translate-y-0.5 ${uiTokens.glassGreenButton}`;
const SECONDARY_BUTTON_CLASS =
  `min-h-14 w-full rounded-full px-5 py-4 text-center text-[15px] font-extrabold text-[#374151] transition active:translate-y-0.5 ${uiTokens.glassControl}`;

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

function textParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function ReportSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 border-t border-[#E5E7EB] pt-10">
      <div>
        <p className="text-[12px] font-black tracking-[0.1em] text-[#1E6A48]">
          {label}
        </p>
        <h2 className="mt-2 text-[24px] font-black leading-[1.2] text-[#111827]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function CopyText({ value }: { value: string }) {
  return (
    <div className="grid gap-4">
      {textParagraphs(value).map((paragraph, index) => (
        <p
          key={`${paragraph.slice(0, 18)}-${index}`}
          className="whitespace-pre-line text-[15px] font-semibold leading-7 text-[#4B5563]"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function ActionItem({
  label,
  item,
}: {
  label: string;
  item: BuiltResultCopy["threeDayAction"];
}) {
  return (
    <div className="rounded-[24px] bg-[#F7F8F5] p-5">
      <p className="text-[13px] font-black text-[#1E6A48]">{label}</p>
      <h3 className="mt-2 text-[16px] font-black leading-6 text-[#111827]">
        {item.title}
      </h3>
      <div className="mt-3">
        <CopyText value={item.body} />
      </div>
    </div>
  );
}

function InvalidReport() {
  const router = useRouter();

  return (
    <main className={PAGE_BASE_CLASS}>
      <section className="mx-auto max-w-[430px] pt-16">
        <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
          <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#1E6A48]">
            REPORT
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.25] text-[#111827]">
            상세 리포트를 만들 결과가 없어요
          </h1>
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[#4B5563]">
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

function ReportHeader({
  result,
  builtCopy,
}: {
  result: WealthResult;
  builtCopy: BuiltResultCopy;
}) {
  return (
    <header className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] font-black text-[#1E6A48]">
            상세 리포트
          </p>
          <h1 className="mt-3 text-[34px] font-black leading-[1.12] tracking-[-0.03em] text-[#111827]">
            {builtCopy.title}
          </h1>
        </div>
        <div className="grid h-[64px] w-[64px] shrink-0 place-items-center rounded-[24px] bg-[#F3F8F4] text-[34px]">
          {builtCopy.emoji}
        </div>
      </div>

      <div className="rounded-[28px] bg-[#F3F8F4] p-5">
        <p className="text-[13px] font-black text-[#1E6A48]">
          재물 감각 상위 {result.topPercent}%
        </p>
        <p className="mt-2 text-[18px] font-black leading-7 text-[#111827]">
          {builtCopy.archetype} · {builtCopy.rankText}
        </p>
      </div>
    </header>
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
  const builtCopy = buildResultCopy(result);
  const resultHref = `/result?${searchParams.toString()}`;
  const moneyLeakPatterns = builtCopy.repeatedPatterns.slice(0, 3);
  const missedPatterns = builtCopy.repeatedPatterns.slice(3);

  return (
    <main className={PAGE_BASE_CLASS}>
      <section className="mx-auto max-w-[430px] space-y-12 pb-8">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(resultHref)}
            aria-label="무료 결과로 돌아가기"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#E5E7EB] bg-white text-xl font-extrabold text-[#374151] transition active:translate-y-0.5"
          >
            ←
          </button>
          <p className="text-[14px] font-extrabold text-[#6B7280]">
            상세 리포트
          </p>
          <div className="h-10 w-10" />
        </div>

        <ReportHeader result={result} builtCopy={builtCopy} />

        <ReportSection label="FULL READING" title="상세 재물 성향">
          <CopyText value={builtCopy.firstImpression} />
        </ReportSection>

        <ReportSection label="GROWTH CONDITION" title="돈이 커지는 조건">
          <CopyText value={builtCopy.moneyFlow} />
        </ReportSection>

        <ReportSection label="LEAK POINT" title="돈이 새는 지점">
          <CopyText value={builtCopy.elementReading} />
          <ul className="grid gap-2">
            {moneyLeakPatterns.map((pattern) => (
              <li
                key={pattern}
                className="rounded-[20px] bg-[#FFF7F2] px-4 py-3 text-[14px] font-extrabold leading-6 text-[#111827]"
              >
                {pattern}
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection label="ABILITY" title="강하게 써야 할 능력">
          <CopyText value={builtCopy.advice} />
        </ReportSection>

        {missedPatterns.length > 0 ? (
          <ReportSection label="PATTERN" title="놓치기 쉬운 패턴">
            <ul className="grid gap-2">
              {missedPatterns.map((pattern) => (
                <li
                  key={pattern}
                  className="rounded-[20px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] font-extrabold leading-6 text-[#111827]"
                >
                  {pattern}
                </li>
              ))}
            </ul>
          </ReportSection>
        ) : null}

        {builtCopy.salText ? (
          <ReportSection label="SAL READING" title="신살 해석">
            <CopyText value={builtCopy.salText} />
          </ReportSection>
        ) : null}

        <ReportSection label="ACTION PLAN" title="실천 계획">
          <div className="grid gap-3">
            <ActionItem label="3일 실천" item={builtCopy.threeDayAction} />
            <ActionItem label="5일 점검" item={builtCopy.fiveDayCheck} />
            <ActionItem label="1주 실험" item={builtCopy.oneWeekExperiment} />
          </div>
        </ReportSection>

        <ReportSection label="CLOSING NOTE" title="마무리 노트">
          <CopyText value={builtCopy.closingNote} />
          <div className="rounded-[24px] bg-[#F3F8F4] p-5">
            <CopyText value={builtCopy.cta} />
          </div>
        </ReportSection>

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
        <div className="min-h-screen bg-white p-10 text-sm font-bold text-[#6B7280]">
          상세 리포트를 불러오는 중입니다...
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
