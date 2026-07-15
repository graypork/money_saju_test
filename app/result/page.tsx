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
  getPreferredAnimalMainPhoto,
  getRandomAnimalMainPhoto,
} from "../../src/lib/animalAssets";
import { uiTokens } from "../../src/lib/uiTokens";

const PAGE_BASE_CLASS =
  `${uiTokens.page} break-keep px-5 pb-10 pt-4`;
const PRIMARY_BUTTON_CLASS =
  `flex min-h-14 w-full items-center justify-center rounded-full px-5 py-4 text-center text-[16px] font-extrabold text-[#FFF8ED] transition active:translate-y-0.5 ${uiTokens.greenButtonSurface}`;
const SECONDARY_BUTTON_CLASS =
  `flex min-h-14 w-full items-center justify-center rounded-full px-5 py-4 text-center text-[16px] font-extrabold text-[#33241D] transition active:translate-y-0.5 ${uiTokens.secondaryButtonSurface}`;
const DARK_PANEL_CLASS =
  "rounded-[28px] border border-[rgba(217,142,115,0.18)] bg-[#FFF8ED] p-5 text-[#33241D]";
const DARK_LIST_ITEM_CLASS =
  "rounded-[20px] border border-[rgba(217,142,115,0.2)] bg-[rgba(231,197,184,0.42)] px-4 py-3 text-[14px] font-extrabold leading-6 text-[#33241D]";
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

function SiteHeader({
  label,
  onBack,
}: {
  label: string;
  onBack?: () => void;
}) {
  return (
    <header className={`${uiTokens.header} flex items-center justify-between`}>
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(231,197,184,0.48)] text-lg font-black text-[#33241D]"
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
  return path?.split("/").filter(Boolean).pop() ?? "animal-1.webp";
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
}: {
  animalKey: string;
  title: string;
}) {
  const [photo, setPhoto] = useState(() => getPreferredAnimalMainPhoto(animalKey));
  const [failed, setFailed] = useState(false);
  const basename = getAssetBasename(photo);

  useEffect(() => {
    setFailed(false);
    setPhoto(getRandomAnimalMainPhoto(animalKey));
  }, [animalKey]);

  return (
    <div className="relative overflow-visible bg-transparent">
      <span className="pointer-events-none absolute right-[22%] top-[30%] h-3 w-3 rounded-full bg-[#D98E73]" />
      <span className="pointer-events-none absolute right-[17%] top-[39%] h-1.5 w-1.5 rounded-full bg-[#E7C5B8]" />
      <span className="pointer-events-none absolute right-[27%] top-[45%] h-2.5 w-2 rotate-[-12deg] rounded-[60%_40%_55%_45%] bg-[#F3D58B]" />
      <div className="relative z-10 grid min-h-[380px] place-items-center overflow-visible">
        {photo && !failed ? (
          <img
            src={photo}
            alt={title}
            draggable={false}
            onError={() => setFailed(true)}
            className="h-[380px] max-h-[380px] max-w-full object-contain"
          />
        ) : (
          <div className="grid h-[320px] w-full place-items-center border border-dashed border-[rgba(217,142,115,0.24)] px-4 text-center font-mono text-[11px] font-bold leading-5 text-[rgba(130,104,93,0.78)]">
            {basename}
          </div>
        )}
      </div>
    </div>
  );
}

function ElementBalanceSummary({ result }: { result: WealthResult }) {
  const dominant = result.dominantElement;
  const weak = result.weakElement;

  return (
    <ResultCard className={`${uiTokens.sectionRule} space-y-5`}>
      <div>
        <p className="text-[12px] font-black tracking-[0.1em] text-[#33241D]">
          ELEMENT BALANCE
        </p>
        <h2 className="mt-2 text-[32px] font-black leading-[1.06] tracking-[-0.035em] text-[#33241D]">
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
                <span className="text-[rgba(130,104,93,0.86)]">{ELEMENT_LABEL[element]}</span>
                <span className={isDominant ? "text-[#D98E73]" : "text-[rgba(130,104,93,0.72)]"}>
                  {Math.round(value)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(231,197,184,0.46)]">
                <div
                  className={`h-full rounded-full ${
                    isDominant ? "bg-[#D98E73]" : "bg-[#E7C5B8]"
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={DARK_PANEL_CLASS}>
        <p className="text-[14px] font-extrabold text-[#33241D]">
          강한 기운: {ELEMENT_LABEL[dominant]} · 약한 기운:{" "}
          {ELEMENT_LABEL[weak]}
        </p>
        <p className="mt-2 text-[14px] font-semibold leading-6 text-[rgba(130,104,93,0.86)]">
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
    <ResultCard className={`${uiTokens.sectionRule} space-y-4`}>
      <div>
        <p className="text-[12px] font-black tracking-[0.1em] text-[#33241D]">
          {label}
        </p>
        <h2 className="mt-2 text-[32px] font-black leading-[1.06] tracking-[-0.035em] text-[#33241D]">
          {title}
        </h2>
      </div>
      {children}
    </ResultCard>
  );
}

function LockedPreviewItem({ title }: { title: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-[20px] border border-[rgba(217,142,115,0.2)] bg-[rgba(231,197,184,0.42)] px-4 py-3">
      <span className="text-[14px] font-extrabold text-[#33241D]">{title}</span>
      <span className="rounded-full bg-[rgba(231,197,184,0.46)] px-3 py-1 text-[12px] font-black text-[#D98E73]">
        잠금
      </span>
    </li>
  );
}

function DetailPreview({ reportHref }: { reportHref: string }) {
  const lockedItems = [
    "월급 밖 수익을 키우는 방식",
    "내 통장에 구멍 나는 순간",
    "강하게 써야 할 능력",
    "놓치기 쉬운 패턴",
    "신살 보조 해석",
    "현실적인 실천 계획",
    "유형별 마무리 노트",
  ];

  return (
    <SummaryBlock label="DETAIL REPORT" title="상세 리포트에서 더 보는 것">
      <p className="text-[15px] font-semibold leading-7 text-[rgba(130,104,93,0.86)]">
        무료 결과는 큰 방향만 보여줍니다. 상세 리포트에서는 재물 흐름이
        막히는 지점과 바로 바꿔볼 행동을 더 좁혀봅니다.
      </p>
      <div className={DARK_PANEL_CLASS}>
        <ul className="grid gap-2">
          {lockedItems.map((item) => (
            <LockedPreviewItem key={item} title={item} />
          ))}
        </ul>
      </div>
      <div className="grid gap-4">
        <a href={reportHref} className={PRIMARY_BUTTON_CLASS}>
          상세 리포트 확인하기
        </a>
        <p className="px-2 text-center text-[13px] font-semibold leading-6 text-[rgba(130,104,93,0.72)]">
          월급 밖 수익을 키우는 방식과 돈이 빠져나가는 구멍을 한 번 더
          구체적으로 확인합니다.
        </p>
      </div>
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
        <div className={DARK_PANEL_CLASS}>
          <p className="text-[13px] font-black text-[#D98E73]">
            잘 쓰면 강한 점
          </p>
          <h3 className="mt-2 text-[18px] font-black text-[#33241D]">
            {builtCopy.archetype}
          </h3>
          <p className="mt-2 text-[14px] font-semibold leading-6 text-[rgba(130,104,93,0.86)]">
            {strength}
          </p>
        </div>
        <div className={DARK_PANEL_CLASS}>
          <p className="text-[13px] font-black text-[#D98E73]">
            내 통장에 구멍 나는 순간
          </p>
          <p className="mt-2 text-[15px] font-extrabold leading-6 text-[#33241D]">
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
    <SummaryBlock label="MONEY FLOW" title="수익을 키우는 방식">
      <p className="text-[15px] font-semibold leading-7 text-[rgba(130,104,93,0.86)]">
        {sentenceSummary(builtCopy.moneyFlow, 260)}
      </p>
      {scene ? (
        <div className={DARK_PANEL_CLASS}>
          <p className="text-[13px] font-black text-[#D98E73]">
            자주 보이는 장면
          </p>
          <p className="mt-2 text-[15px] font-extrabold leading-6 text-[#33241D]">
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
      <section className="relative z-10 mx-auto max-w-[430px] space-y-10 pt-1">
        <SiteHeader label="RESULT" onBack={() => router.push("/")} />
        <ResultCard className={DARK_PANEL_CLASS}>
          <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#D98E73]">
            RESULT
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.25] text-[#33241D]">
            아직 만들 결과가 없어요
          </h1>
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[rgba(130,104,93,0.86)]">
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

      <section className="relative z-10 mx-auto max-w-[430px] space-y-12 pb-8">
        <SiteHeader label="RESULT" onBack={() => router.back()} />

        <ResultCard className={`${uiTokens.heroPanel} space-y-6`}>
          <div>
            <p className="text-[12px] font-black tracking-[0.14em] text-[#D98E73]">
              FREE RESULT
            </p>
            <h1 className="mt-4 text-[50px] font-black leading-[0.92] tracking-[-0.06em] text-[#33241D]">
              {builtCopy.title}
            </h1>
            <p className="mt-5 text-[32px] font-black leading-none tracking-[-0.04em] text-[#D98E73]">
              재물 감각 상위 {result.topPercent}%
            </p>
            <p className="mt-5 text-[17px] font-bold leading-7 text-[rgba(130,104,93,0.86)]">
              {heroSummary}
            </p>
          </div>

          <ResultAnimalImage
            animalKey={builtCopy.animalKey}
            title={builtCopy.title}
          />

          <div className="rounded-[28px] bg-[rgba(231,197,184,0.42)] p-5">
            <p className="text-[18px] font-black leading-7 text-[#33241D]">
              {builtCopy.archetype} · {builtCopy.rankText}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a href={reportHref} className={PRIMARY_BUTTON_CLASS}>
              상세 보기
            </a>
            <button
              type="button"
              onClick={() => router.push("/")}
              className={SECONDARY_BUTTON_CLASS}
            >
              다시 하기
            </button>
          </div>
        </ResultCard>

        <ElementBalanceSummary result={result} />
        <MoneyFlowSummary builtCopy={builtCopy} />
        <StrengthCaution builtCopy={builtCopy} />
        <DetailPreview reportHref={reportHref} />

        <div className="grid gap-3">
          <p className="text-center text-[13px] font-semibold leading-6 text-[rgba(130,104,93,0.72)]">
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
        <div className="min-h-screen bg-[#FFF8ED] p-10 text-sm font-bold text-[rgba(130,104,93,0.72)]">
          결과를 불러오는 중입니다...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
