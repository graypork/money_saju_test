"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateWealthResult,
  type WealthResult,
} from "../../src/lib/score";
import AppVersionBadge from "../../src/components/AppVersionBadge";
import { buildResultCopy, type BuiltResultCopy } from "../../src/lib/copyEngine";

const PAGE_BASE_CLASS =
  "min-h-screen break-keep px-5 pb-10 pt-4 text-[#171C18]";
const DEFAULT_PAGE_BACKGROUND = "#F8F4EC";
const ELEMENT_BACKGROUND: Record<string, string> = {
  fire: "#F3C6C4",
  wood: "#E3F0DF",
  water: "#DDECF3",
  earth: "#E5D2BD",
  metal: "#F5E6A8",
};
const CARD_CLASS =
  "rounded-[28px] border border-black/10 bg-[#FFFDF8] p-6 shadow-[0_12px_32px_rgba(31,42,34,0.07)]";
const PRIMARY_BUTTON_CLASS =
  "min-h-14 w-full rounded-full bg-[#285C42] px-5 py-4 text-center text-[16px] font-extrabold text-[#FFFDF8] shadow-[0_10px_24px_rgba(40,92,66,0.18)] transition active:bg-[#214B36]";
const SECONDARY_BUTTON_CLASS =
  "min-h-14 w-full rounded-full border border-black/10 bg-[#FFFDF8] px-5 py-4 text-center text-[15px] font-extrabold text-[#5E4936] transition active:bg-[#F8F4EC]";
const COPY_VERSION = "animalTypeBank-v0.10.1";
const LOGIC_VERSION = "score-v0.10.1";

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

function getStrongestElement(result: WealthResult) {
  return (
    result.dominantElement ||
    result.debug?.strongestElement ||
    result.interpretation?.strongestElement ||
    ""
  );
}

function ResultDebugLogger({
  debugKey,
  debug,
}: {
  debugKey: string;
  debug: WealthResult["debug"];
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[money-saju result debug]", debug);
    }
  }, [debugKey, debug]);

  return null;
}

function summaryText(value: string, maxLength = 140) {
  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1)}…`
    : normalized;
}

function ResultLogSaver({
  result,
  builtCopy,
  birthDate,
  rawBirthDate,
  birthTime,
  calendarType,
  gender,
  testCaseCode,
}: {
  result: WealthResult;
  builtCopy: BuiltResultCopy;
  birthDate: string;
  rawBirthDate: string;
  birthTime: string;
  calendarType: string;
  gender: string;
  testCaseCode: string;
}) {
  useEffect(() => {
    if (testCaseCode.trim() === "admin22") {
      console.log("[testLogs] save skipped", { reason: "test-case-code" });
      return;
    }

    const logKey = [
      "money-saju-test-log",
      birthDate,
      birthTime,
      calendarType,
      gender,
      builtCopy.animalKey,
    ].join(":");

    if (window.sessionStorage.getItem(logKey)) return;

    window.sessionStorage.setItem(logKey, "pending");
    console.log("[testLogs] save requested");

    const salList = result.salList?.map((sal) => sal.name) ?? [];
    const payload = {
      createdAt: new Date().toISOString(),
      birthDate,
      rawBirthDate,
      calendarType,
      birthTime,
      gender,
      animalKey: builtCopy.animalKey,
      animalTitle: builtCopy.title,
      resultSummary: `${builtCopy.title} · ${builtCopy.archetype} · ${builtCopy.rankText}`,
      firstImpressionSummary: summaryText(builtCopy.firstImpression),
      resultExplanationSnapshot: {
        title: builtCopy.title,
        subtitle: `${builtCopy.archetype} · ${builtCopy.rankText}`,
        firstImpression: builtCopy.firstImpression,
        moneyPattern: builtCopy.moneyFlow,
        elementText: builtCopy.elementReading,
        salText: builtCopy.salText,
        closingNote: builtCopy.closingNote,
      },
      dayStem: result.saju.dayMaster,
      element: result.saju.dayElement,
      salList,
      scoreSnapshot: {
        topPercent: result.topPercent,
        percentile: result.percentile,
        rawWealthScore: result.rawWealthScore,
        displayWealthScore: result.displayWealthScore,
        wealthScore: result.wealthScore,
        baseWealthScore: result.baseWealthScore,
        sajuAdjustmentScore: result.sajuAdjustmentScore,
        adjustedWealthScore: result.adjustedWealthScore,
        baseTopPercent: result.baseTopPercent,
        adjustedTopPercent: result.adjustedTopPercent,
        dominantElement: result.dominantElement,
        weakElement: result.weakElement,
        usefulGod: result.usefulGod,
        favorableElements: result.favorableElements,
        unfavorableElements: result.unfavorableElements,
        strengthType: result.strengthType,
      },
      copyVersion: COPY_VERSION,
      logicVersion: LOGIC_VERSION,
      userAgent: window.navigator.userAgent,
      referrer: document.referrer,
      path: `${window.location.pathname}${window.location.search}`,
      testCaseCode,
    };

    fetch("/api/test-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          window.sessionStorage.setItem(logKey, "saved");
          console.log("[testLogs] append success");
          return;
        }

        window.sessionStorage.removeItem(logKey);
        console.error("[testLogs] append failed", { message: response.statusText });
      })
      .catch((error) => {
        window.sessionStorage.removeItem(logKey);
        console.error("[testLogs] append failed", {
          message: error instanceof Error ? error.message : "unknown",
        });
      });
  }, [
    birthDate,
    birthTime,
    builtCopy,
    calendarType,
    gender,
    rawBirthDate,
    result,
    testCaseCode,
  ]);

  return null;
}

function ResultCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`${CARD_CLASS} ${className}`}>{children}</section>;
}

function InsightRow({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 rounded-[22px] bg-[#F8F4EC] p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFFDF8] text-sm font-black text-[#285C42]">
        {icon}
      </span>
      <div>
        <h3 className="text-[16px] font-extrabold leading-6 text-[#171C18]">
          {title}
        </h3>
        <p className="mt-1 whitespace-pre-line text-[14px] font-semibold leading-6 text-[#6F6253]">
          {body}
        </p>
      </div>
    </div>
  );
}

function InvalidResult() {
  const router = useRouter();

  return (
    <main
      className={PAGE_BASE_CLASS}
      style={{ backgroundColor: DEFAULT_PAGE_BACKGROUND }}
    >
      <section className="mx-auto max-w-[430px] pt-16">
        <ResultCard>
          <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#6F6253]">
            RESULT
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.25] text-[#171C18]">
            아직 만들 결과가 없어요
          </h1>
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[#6F6253]">
            생년월일과 태어난 시간을 먼저 선택하면 재물 동물 유형을 볼 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className={`${PRIMARY_BUTTON_CLASS} mt-6`}
          >
            테스트 시작하기
          </button>
        </ResultCard>
      </section>
    </main>
  );
}

function ResultContent() {
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
  const testCaseCode = searchParams.get("testCaseCode") || "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return <InvalidResult />;
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
  const debugKey = `${birthDate}-${birthTime}-${calendarTypeParam}-${genderParam}`;
  const strongestElement = getStrongestElement(result);
  const pageBg = ELEMENT_BACKGROUND[strongestElement] ?? DEFAULT_PAGE_BACKGROUND;
  const builtCopy = buildResultCopy(result);

  return (
    <main className={PAGE_BASE_CLASS} style={{ backgroundColor: pageBg }}>
      <ResultDebugLogger debugKey={debugKey} debug={result.debug} />
      <ResultLogSaver
        result={result}
        builtCopy={builtCopy}
        birthDate={birthDate}
        rawBirthDate={rawBirthDate}
        birthTime={birthTime}
        calendarType={calendarTypeParam}
        gender={genderParam}
        testCaseCode={testCaseCode}
      />

      <section className="mx-auto max-w-[430px] pb-8">
        <header className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로 가기"
            className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-[#FFFDF8] text-xl font-extrabold text-[#5E4936] shadow-[0_8px_20px_rgba(31,42,34,0.05)] transition active:bg-[#F8F4EC]"
          >
            ←
          </button>
          <p className="text-[14px] font-extrabold text-[#6F6253]">
            결과 리포트
          </p>
          <div className="h-10 w-10" />
        </header>

        <div className="grid gap-5">
          <ResultCard className="overflow-hidden p-0">
            <div className="p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-extrabold tracking-[0.08em] text-[#285C42]">
                    RESULT ANIMAL
                  </p>
                  <h1 className="mt-3 text-[34px] font-black leading-[1.12] text-[#171C18]">
                    {builtCopy.title}
                  </h1>
                  <p className="mt-3 text-[15px] font-extrabold leading-6 text-[#6F6253]">
                    {builtCopy.archetype}
                  </p>
                </div>
                <div className="grid h-[78px] w-[78px] shrink-0 place-items-center rounded-[26px] bg-[#F8F4EC] text-4xl">
                  {builtCopy.emoji}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-4 rounded-[24px] bg-[#EEF3EA] p-5">
                <div>
                  <p className="text-[12px] font-black tracking-[0.08em] text-[#285C42]">
                    MONEY SENSE
                  </p>
                  <p className="mt-1 text-[16px] font-extrabold text-[#6F6253]">
                    {builtCopy.rankText}
                  </p>
                </div>
                <p className="text-[42px] font-black leading-none text-[#285C42]">
                  {result.topPercent}%
                </p>
              </div>
            </div>
          </ResultCard>

          <ResultCard>
            <p className="text-[13px] font-extrabold tracking-[0.08em] text-[#285C42]">
              FIRST IMPRESSION
            </p>
            <h2 className="mt-2 text-[24px] font-black leading-[1.25] text-[#171C18]">
              첫 인상
            </h2>
            <p className="mt-4 whitespace-pre-line text-[15px] font-semibold leading-7 text-[#6F6253]">
              {builtCopy.firstImpression}
            </p>
          </ResultCard>

          <ResultCard>
            <p className="text-[13px] font-extrabold tracking-[0.08em] text-[#285C42]">
              MONEY PATTERN
            </p>
            <h2 className="mt-2 text-[24px] font-black leading-[1.25] text-[#171C18]">
              돈이 들어오는 문과
              <br />
              새는 구멍
            </h2>
            <p className="mt-4 whitespace-pre-line text-[15px] font-semibold leading-7 text-[#6F6253]">
              {builtCopy.moneyFlow}
            </p>
            <div className="mt-5 grid gap-3">
              <InsightRow
                icon="벌"
                title="돈이 들어오는 방식"
                body={builtCopy.moneyFlow}
              />
              <InsightRow
                icon="새"
                title="돈이 막히거나 새는 지점"
                body={builtCopy.elementReading}
              />
              <div className="rounded-[22px] bg-[#F8F4EC] p-4">
                <p className="text-[13px] font-extrabold text-[#285C42]">
                  반복되기 쉬운 장면
                </p>
                <ul className="mt-3 grid gap-2">
                  {builtCopy.repeatedPatterns.map((pattern) => (
                    <li
                      key={pattern}
                      className="flex gap-2 text-[14px] font-semibold leading-6 text-[#6F6253]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#285C42]" />
                      <span>{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ResultCard>

          {builtCopy.salText ? (
            <ResultCard>
              <p className="text-[13px] font-extrabold tracking-[0.08em] text-[#285C42]">
                SAJU SUPPORT
              </p>
              <h2 className="mt-2 text-[24px] font-black leading-[1.25] text-[#171C18]">
                신살 보조 해석
              </h2>
              <div className="mt-5 grid gap-3">
                <InsightRow
                  icon="살"
                  title="신살 보조 해석"
                  body={builtCopy.salText}
                />
              </div>
            </ResultCard>
          ) : null}

          <ResultCard>
            <p className="text-[13px] font-extrabold tracking-[0.08em] text-[#285C42]">
              ADVICE
            </p>
            <h2 className="mt-2 text-[24px] font-black leading-[1.25] text-[#171C18]">
              지금 바로 볼 지점
            </h2>
            <p className="mt-4 whitespace-pre-line text-[15px] font-semibold leading-7 text-[#6F6253]">
              {builtCopy.advice}
            </p>
          </ResultCard>

          <ResultCard>
            <p className="text-[13px] font-extrabold tracking-[0.08em] text-[#285C42]">
              ACTION CHECK
            </p>
            <h2 className="mt-2 text-[24px] font-black leading-[1.25] text-[#171C18]">
              이번 주 실행 체크
            </h2>
            <div className="mt-5 grid gap-3">
              <InsightRow
                icon="3"
                title={`3일 실천 · ${builtCopy.threeDayAction.title}`}
                body={builtCopy.threeDayAction.body}
              />
              <InsightRow
                icon="5"
                title={`5일 점검 · ${builtCopy.fiveDayCheck.title}`}
                body={builtCopy.fiveDayCheck.body}
              />
              <InsightRow
                icon="7"
                title={`1주 실험 · ${builtCopy.oneWeekExperiment.title}`}
                body={builtCopy.oneWeekExperiment.body}
              />
            </div>
          </ResultCard>

          <ResultCard className="border-[#285C42]/20 bg-[#F7FBF5]">
            <p className="text-[13px] font-extrabold tracking-[0.08em] text-[#285C42]">
              CLOSING NOTE
            </p>
            <p className="mt-5 whitespace-pre-line text-[14px] font-semibold leading-6 text-[#6F6253]">
              {builtCopy.closingNote}
            </p>
          </ResultCard>
        </div>

        <p className="mt-6 text-center text-[13px] font-semibold leading-6 text-[#7D7469]">
          본 테스트는 오락 및 자기이해 목적의 콘텐츠입니다. 금융, 투자, 법률, 직업 선택에 대한 전문 조언이 아닙니다.
        </p>

        <button
          type="button"
          onClick={() => router.push("/")}
          className={`${SECONDARY_BUTTON_CLASS} mt-4`}
        >
          다시 테스트하기
        </button>

      </section>
      <AppVersionBadge />
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F4EC] p-10 text-sm font-bold text-[#6F6253]">
          결과를 불러오는 중입니다...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
