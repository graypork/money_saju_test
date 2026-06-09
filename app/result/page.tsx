"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateWealthResult,
  type WealthResult,
} from "../../src/lib/score";
import AppVersionBadge from "../../src/components/AppVersionBadge";
import { buildResultCopy, type BuiltResultCopy } from "../../src/lib/copyEngine";
import { getRandomAnimalMainPhoto } from "../../src/lib/animalAssets";
import { uiTokens } from "../../src/lib/uiTokens";

const PAGE_BASE_CLASS =
  "min-h-screen break-keep bg-white px-5 pb-10 pt-4 text-[#191F28]";
const PRIMARY_BUTTON_CLASS =
  `min-h-14 w-full rounded-full px-5 py-4 text-center text-[16px] font-extrabold text-[#F7FFF9] transition active:translate-y-0.5 ${uiTokens.glassGreenButton}`;
const SECONDARY_BUTTON_CLASS =
  `min-h-14 w-full rounded-full px-5 py-4 text-center text-[15px] font-extrabold text-[#374151] transition active:translate-y-0.5 ${uiTokens.glassControl}`;
const COPY_VERSION = "animalTypeBank-v0.10.1";
const LOGIC_VERSION = "score-v0.10.1";
const ELEMENT_ORDER = ["wood", "fire", "earth", "metal", "water"] as const;
const ELEMENT_LABEL: Record<(typeof ELEMENT_ORDER)[number], string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

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

function sentenceSummary(value: string, maxLength = 180) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const sentences = normalized
    .split(/(?<=[.!?。요다니다습니다])\s+/)
    .filter(Boolean);
  const summary = sentences.slice(0, 3).join(" ") || normalized;

  return summaryText(summary, maxLength);
}

function getAssetBasename(path: string | null) {
  return path?.split("/").filter(Boolean).pop() ?? "animal-main-1.webp";
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
  return <section className={className}>{children}</section>;
}

function ResultAnimalImage({
  animalKey,
  title,
  emoji,
}: {
  animalKey: string;
  title: string;
  emoji: string;
}) {
  const [photo] = useState(() => getRandomAnimalMainPhoto(animalKey));
  const [failed, setFailed] = useState(false);
  const basename = getAssetBasename(photo);

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#F4F7F2]">
      <div className="aspect-[4/3]">
        {photo && !failed ? (
          <img
            src={photo}
            alt={title}
            draggable={false}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center border border-dashed border-[#D5DBD2] px-4 text-center font-mono text-[11px] font-bold leading-5 text-[#8A9288]">
            {basename}
          </div>
        )}
      </div>
      <div className="absolute bottom-3 right-3 grid h-[52px] w-[52px] place-items-center rounded-full bg-white/82 text-[28px] shadow-[0_10px_24px_rgba(15,23,42,0.12)] [backdrop-filter:blur(10px)]">
        {emoji}
      </div>
    </div>
  );
}

function ElementBalanceSummary({ result }: { result: WealthResult }) {
  const dominant = result.dominantElement;
  const weak = result.weakElement;

  return (
    <ResultCard className="space-y-5 border-t border-[#E5E7EB] pt-10">
      <div>
        <p className="text-[12px] font-black tracking-[0.1em] text-[#1E6A48]">
          ELEMENT BALANCE
        </p>
        <h2 className="mt-2 text-[24px] font-black leading-[1.2] text-[#111827]">
          오행 밸런스 요약
        </h2>
      </div>

      <div className="grid gap-3">
        {ELEMENT_ORDER.map((element) => {
          const value = Math.max(0, Math.min(100, result.elements[element]));
          const isDominant = element === dominant;

          return (
            <div key={element} className="grid gap-1.5">
              <div className="flex items-center justify-between text-[13px] font-black">
                <span className="text-[#374151]">{ELEMENT_LABEL[element]}</span>
                <span className={isDominant ? "text-[#F26B3A]" : "text-[#6B7280]"}>
                  {Math.round(value)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF3EA]">
                <div
                  className={`h-full rounded-full ${
                    isDominant ? "bg-[#F26B3A]" : "bg-[#1E6A48]"
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-2 rounded-[24px] bg-[#F7F8F5] p-4">
        <p className="text-[14px] font-extrabold text-[#111827]">
          강한 기운: {ELEMENT_LABEL[dominant]} · 약한 기운:{" "}
          {ELEMENT_LABEL[weak]}
        </p>
        <p className="text-[14px] font-semibold leading-6 text-[#4B5563]">
          {ELEMENT_LABEL[dominant]} 기운이 가장 또렷하고,{" "}
          {ELEMENT_LABEL[weak]} 기운은 보완이 필요한 흐름으로 나타납니다.
          무료 결과에서는 방향만 짧게 보여드립니다.
        </p>
      </div>
    </ResultCard>
  );
}

function SummaryBlock({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <ResultCard className="space-y-4 border-t border-[#E5E7EB] pt-10">
      <div>
        <p className="text-[12px] font-black tracking-[0.1em] text-[#1E6A48]">
          {label}
        </p>
        <h2 className="mt-2 text-[24px] font-black leading-[1.2] text-[#111827]">
          {title}
        </h2>
      </div>
      {children}
    </ResultCard>
  );
}

function LockedPreviewItem({ title }: { title: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-[20px] border border-[#E5E7EB] bg-white px-4 py-3">
      <span className="text-[14px] font-extrabold text-[#111827]">{title}</span>
      <span className="rounded-full bg-[#F3F8F4] px-3 py-1 text-[12px] font-black text-[#1E6A48]">
        잠금
      </span>
    </li>
  );
}

function DetailPreview({ reportHref }: { reportHref: string }) {
  const lockedItems = [
    "돈이 커지는 조건",
    "돈이 새는 지점",
    "강하게 써야 할 능력",
    "놓치기 쉬운 패턴",
    "신살 보조 해석",
    "현실적인 실천 계획",
    "유형별 마무리 노트",
  ];

  return (
    <SummaryBlock label="DETAIL REPORT" title="상세 리포트에서 더 보는 것">
      <p className="text-[15px] font-semibold leading-7 text-[#4B5563]">
        무료 결과는 큰 방향만 보여줍니다. 상세 리포트에서는 막히는 지점과
        바로 바꿔볼 행동을 더 좁혀봅니다.
      </p>
      <ul className="grid gap-2">
        {lockedItems.map((item) => (
          <LockedPreviewItem key={item} title={item} />
        ))}
      </ul>
      <a href={reportHref} className={PRIMARY_BUTTON_CLASS}>
        상세 리포트 확인하기
      </a>
      <p className="text-center text-[13px] font-semibold leading-5 text-[#6B7280]">
        돈이 커지는 조건과 새는 패턴을 한 번 더 구체적으로 확인합니다.
      </p>
    </SummaryBlock>
  );
}

function StrengthCaution({
  builtCopy,
}: {
  builtCopy: BuiltResultCopy;
}) {
  const strength = sentenceSummary(builtCopy.firstImpression, 96);
  const caution = builtCopy.repeatedPatterns[0] ?? sentenceSummary(builtCopy.elementReading, 96);

  return (
    <SummaryBlock label="CORE POINT" title="강점과 주의 패턴">
      <div className="grid gap-3">
        <div className="rounded-[24px] bg-[#F3F8F4] p-5">
          <p className="text-[13px] font-black text-[#1E6A48]">
            잘 쓰면 강한 점
          </p>
          <h3 className="mt-2 text-[18px] font-black text-[#111827]">
            {builtCopy.archetype}
          </h3>
          <p className="mt-2 text-[14px] font-semibold leading-6 text-[#4B5563]">
            {strength}
          </p>
        </div>
        <div className="rounded-[24px] bg-[#FFF7F2] p-5">
          <p className="text-[13px] font-black text-[#F26B3A]">
            돈이 새기 쉬운 지점
          </p>
          <p className="mt-2 text-[15px] font-extrabold leading-6 text-[#111827]">
            {caution}
          </p>
        </div>
      </div>
    </SummaryBlock>
  );
}

function MoneyFlowSummary({ builtCopy }: { builtCopy: BuiltResultCopy }) {
  const scene = builtCopy.repeatedPatterns[1] ?? builtCopy.repeatedPatterns[0];

  return (
    <SummaryBlock label="MONEY FLOW" title="돈을 버는 기본 방식">
      <p className="text-[15px] font-semibold leading-7 text-[#4B5563]">
        {sentenceSummary(builtCopy.moneyFlow, 260)}
      </p>
      {scene ? (
        <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-4">
          <p className="text-[13px] font-black text-[#F26B3A]">
            자주 보이는 장면
          </p>
          <p className="mt-2 text-[15px] font-extrabold leading-6 text-[#111827]">
            {scene}
          </p>
        </div>
      ) : null}
    </SummaryBlock>
  );
}

function InvalidResult() {
  const router = useRouter();

  return (
    <main className={PAGE_BASE_CLASS}>
      <section className="mx-auto max-w-[430px] pt-16">
        <ResultCard className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
          <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#1E6A48]">
            RESULT
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.25] text-[#111827]">
            아직 만들 결과가 없어요
          </h1>
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[#4B5563]">
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
  const builtCopy = buildResultCopy(result);
  const heroSummary = sentenceSummary(builtCopy.firstImpression, 96);
  const reportHref = `/report?${searchParams.toString()}`;

  return (
    <main className={PAGE_BASE_CLASS}>
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

      <section className="mx-auto max-w-[430px] space-y-12 pb-8">
        <header className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로 가기"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#E5E7EB] bg-white text-xl font-extrabold text-[#374151] transition active:translate-y-0.5"
          >
            ←
          </button>
          <p className="text-[14px] font-extrabold text-[#6B7280]">
            무료 결과
          </p>
          <div className="h-10 w-10" />
        </header>

        <ResultCard className="space-y-6">
          <div>
            <p className="text-[14px] font-black text-[#1E6A48]">
              결과가 나왔어요
            </p>
            <h1 className="mt-3 text-[34px] font-black leading-[1.12] tracking-[-0.03em] text-[#111827]">
              {builtCopy.title}
            </h1>
            <p className="mt-3 text-[18px] font-black text-[#1E6A48]">
              재물 감각 상위 {result.topPercent}%
            </p>
            <p className="mt-4 text-[16px] font-semibold leading-7 text-[#4B5563]">
              {heroSummary}
            </p>
          </div>

          <ResultAnimalImage
            animalKey={builtCopy.animalKey}
            title={builtCopy.title}
            emoji={builtCopy.emoji}
          />

          <div className="rounded-[26px] bg-[#F3F8F4] p-5">
            <p className="text-[12px] font-black tracking-[0.1em] text-[#1E6A48]">
              핵심 한 줄
            </p>
            <p className="mt-2 text-[17px] font-black leading-7 text-[#111827]">
              {builtCopy.archetype} · {builtCopy.rankText}
            </p>
          </div>
        </ResultCard>

        <ElementBalanceSummary result={result} />
        <MoneyFlowSummary builtCopy={builtCopy} />
        <StrengthCaution builtCopy={builtCopy} />
        <DetailPreview reportHref={reportHref} />

        <div className="grid gap-3">
          <p className="text-center text-[13px] font-semibold leading-6 text-[#6B7280]">
            본 테스트는 오락 및 자기이해 목적의 콘텐츠입니다. 금융, 투자,
            법률, 직업 선택에 대한 전문 조언이 아닙니다.
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className={SECONDARY_BUTTON_CLASS}
          >
            다시 테스트하기
          </button>
        </div>
      </section>
      <AppVersionBadge />
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white p-10 text-sm font-bold text-[#6B7280]">
          결과를 불러오는 중입니다...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
