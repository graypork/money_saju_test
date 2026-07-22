"use client";

import {
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateWealthResult,
  type WealthResult,
} from "../../src/lib/score";
import AppVersionBadge from "../../src/components/AppVersionBadge";
import { buildResultCopy, type BuiltResultCopy } from "../../src/lib/copyEngine";
import {
  getAnimalImagePath,
  normalizeAnimalAssetKey,
  resolveAnimalImageGender,
} from "../../src/lib/animalAssets";
import {
  getFreeResultByAnimalKey,
  type FreeResultPreview,
} from "../../src/content/resultCopy/freeResultBank";
import { uiTokens } from "../../src/lib/uiTokens";

const PAGE_BASE_CLASS = `${uiTokens.page} break-keep px-5 pb-10 pt-4`;
const PRIMARY_BUTTON_CLASS =
  `flex min-h-14 w-full items-center justify-center rounded-full px-5 py-4 text-center text-[16px] font-bold text-[#FFF9ED] transition active:translate-y-0.5 ${uiTokens.greenButtonSurface}`;
const DARK_PANEL_CLASS =
  "rounded-[28px] border border-[rgba(32,32,32,0.18)] bg-[#EFE9DB] p-5 text-[#202020]";
const COPY_VERSION = "animalTypeBank-v0.10.1";
const LOGIC_VERSION = "score-v0.10.1";

function SiteHeader({
  onBack,
}: {
  onBack?: () => void;
}) {
  return (
    <header className={`${uiTokens.header} relative flex items-center justify-center`}>
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="absolute left-5 grid h-8 w-8 place-items-center rounded-full bg-[rgba(246,187,221,0.48)] text-lg font-bold text-[#202020]"
      >
        ←
      </button>
      <span className="text-[13px] font-semibold tracking-[-0.01em]">
        MONEY SAJU
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
  birthTime,
  calendarType,
  gender,
  testCaseCode,
}: {
  result: WealthResult;
  builtCopy: BuiltResultCopy;
  birthDate: string;
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
      path: window.location.pathname,
      testCaseCode,
    };

    fetch("/api/test-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (response.ok) {
          window.sessionStorage.setItem(logKey, "saved");
          console.log("[testLogs] append success");
          return;
        }

        window.sessionStorage.removeItem(logKey);
        let message = response.statusText || `HTTP ${response.status}`;

        try {
          const body = await response.json();

          if (body && typeof body === "object" && "error" in body) {
            message = String(body.error);
          }
        } catch {}

        console.warn("[testLogs] append failed", { message });
      })
      .catch((error) => {
        window.sessionStorage.removeItem(logKey);
        console.warn("[testLogs] append failed", {
          message: error instanceof Error ? error.message : "unknown",
        });
      });
  }, [
    birthDate,
    birthTime,
    builtCopy,
    calendarType,
    gender,
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
  gender,
  title,
}: {
  animalKey: string;
  gender: string;
  title: string;
}) {
  const imageGender = resolveAnimalImageGender(gender);
  const assetKey = normalizeAnimalAssetKey(animalKey);
  const [photo] = useState(() =>
    assetKey && imageGender ? getAnimalImagePath(assetKey, imageGender) : null
  );
  const [failed, setFailed] = useState(false);

  return (
    <div className="grid w-full place-items-center overflow-hidden rounded-[28px] border border-[#DDD6C8] bg-[rgba(186,204,236,0.28)] p-3">
      {photo && !failed ? (
        <img
          src={photo}
          alt={title}
          draggable={false}
          onError={() => setFailed(true)}
          className="w-full h-auto object-contain"
        />
      ) : (
        <div className="grid h-[200px] w-full place-items-center border border-dashed border-[rgba(0,0,0,0.2)] px-4 text-center text-[11px] font-bold leading-5 text-[#746F67]">
          성별을 선택한 뒤 동물 이미지를 보여드려요.
        </div>
      )}
    </div>
  );
}

function DecisionReason({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="border-t border-[#DDD6C8] py-4 first:border-t-0 first:pt-0">
      <p className="text-[12px] font-semibold tracking-[0.08em] text-[#746F67]">
        {label}
      </p>
      <p className="mt-2 text-[15px] font-semibold leading-6 text-[#202020]">
        {children}
      </p>
    </li>
  );
}

function LockedReportPreview({ teaser }: { teaser: string }) {
  const lockedItems = [
    "수익이 커지는 시점과 방식",
    "돈이 새는 반복 패턴",
    "지금 적용할 현실적인 전략",
  ];

  return (
    <section className="space-y-4 border-t border-[#DDD6C8] pt-6">
      <div>
        <h2 className="text-[24px] font-bold leading-[1.15] tracking-[-0.04em] text-[#202020]">
          상세 리포트에서 이어서 확인할 분석
        </h2>
        <p className="mt-3 text-[14px] font-semibold leading-6 text-[#202020]">
          {teaser}
        </p>
      </div>

      <ul className="overflow-hidden rounded-[24px] border border-[#DDD6C8] bg-[rgba(239,233,219,0.54)]">
        {lockedItems.map((item, index) => (
          <li
            key={item}
            className={`flex items-center justify-between gap-3 px-4 py-4 ${
              index > 0 ? "border-t border-[#DDD6C8]" : ""
            }`}
          >
            <span className="text-[14px] font-semibold text-[#746F67]">
              {item}
            </span>
            <svg
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#746F67]"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3.5" y="7" width="9" height="6" rx="1.25" />
              <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" />
            </svg>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CoreDecisionPreview({
  result,
  animalKey,
  gender,
  freeCopy,
  reportHref,
  onRestart,
}: {
  result: WealthResult;
  animalKey: string;
  gender: string;
  freeCopy: FreeResultPreview;
  reportHref: string;
  onRestart: () => void;
}) {
  return (
    <ResultCard className={`${uiTokens.heroPanel} space-y-7`}>
      <div>
        <h1 className="text-[38px] font-bold leading-[0.98] tracking-[-0.06em] text-[#202020]">
          핵심 판정
        </h1>
      </div>

      <div className="rounded-[28px] border border-[#DDD6C8] bg-[rgba(239,233,219,0.7)] p-5">
        <p className="text-[15px] font-semibold text-[#746F67]">
          {freeCopy.animalName}
        </p>
        <p className="mt-3 text-[22px] font-bold leading-8 tracking-[-0.04em] text-[#202020]">
          {freeCopy.oneLine}
        </p>
        <p className="mt-5 text-[22px] font-bold leading-none tracking-[-0.04em] text-[#202020]">
          재물 감각 상위 {result.topPercent}%
        </p>
      </div>

      <ResultAnimalImage
        animalKey={animalKey}
        gender={gender}
        title={freeCopy.animalName}
      />

      <section className="space-y-4 border-t border-[#DDD6C8] pt-6">
        <div>
          <h2 className="text-[24px] font-bold leading-[1.15] tracking-[-0.04em] text-[#202020]">
            판정의 근거
          </h2>
        </div>
        <ul>
          <DecisionReason label="돈이 되는 힘">{freeCopy.strength}</DecisionReason>
          <DecisionReason label="돈이 새는 지점">{freeCopy.moneyLeak}</DecisionReason>
          <DecisionReason label="지금 할 일">{freeCopy.firstAction}</DecisionReason>
        </ul>
      </section>

      <LockedReportPreview teaser={freeCopy.unlockTeaser} />

      <div className="space-y-4 pt-1">
        <a href={reportHref} className={PRIMARY_BUTTON_CLASS}>
          상세 리포트에서 분석 이어보기
        </a>
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-2 text-center text-[14px] font-semibold text-[#746F67] underline-offset-4 hover:underline"
        >
          다시 테스트하기
        </button>
        <p className="px-2 text-center text-[12px] font-semibold leading-5 text-[#746F67]">
          본 내용은 오락 및 자기이해 목적의 콘텐츠입니다.
        </p>
      </div>
    </ResultCard>
  );
}

function InvalidResult() {
  const router = useRouter();

  return (
    <main className={PAGE_BASE_CLASS}>
      <section className="relative z-10 mx-auto max-w-[430px] space-y-10 pt-1">
        <SiteHeader onBack={() => router.push("/")} />
        <ResultCard className={DARK_PANEL_CLASS}>
          <h1 className="text-[28px] font-bold leading-[1.25] text-[#202020]">
            아직 만들 결과가 없어요
          </h1>
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[#202020]">
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
  const freeCopy = getFreeResultByAnimalKey(builtCopy.animalKey);
  const reportHref = `/report?${searchParams.toString()}`;

  return (
    <main className={PAGE_BASE_CLASS}>
      <ResultDebugLogger debugKey={debugKey} debug={result.debug} />
      <ResultLogSaver
        result={result}
        builtCopy={builtCopy}
        birthDate={birthDate}
        birthTime={birthTime}
        calendarType={calendarTypeParam}
        gender={genderParam}
        testCaseCode={testCaseCode}
      />

      <section className="relative z-10 mx-auto max-w-[430px] space-y-8 pb-8">
        <SiteHeader onBack={() => router.back()} />
        <CoreDecisionPreview
          result={result}
          animalKey={builtCopy.animalKey}
          gender={genderParam}
          freeCopy={freeCopy}
          reportHref={reportHref}
          onRestart={() => router.push("/")}
        />
      </section>
      <AppVersionBadge />
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EFE9DB] p-10 text-sm font-bold text-[#746F67]">
          결과를 불러오는 중입니다...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
