"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateWealthResult,
  type WealthResult,
} from "../../src/lib/score";
import AppVersionBadge from "../../src/components/AppVersionBadge";
import {
  getResultCopyById,
  resultCopyBank,
} from "../../src/lib/copyBank";
import { selectPrimarySalCopy } from "../../src/lib/salCopyBank";

const PAGE_BASE_CLASS =
  "min-h-screen break-keep px-5 pb-10 pt-4 text-[#191F28]";
const DEFAULT_PAGE_BACKGROUND = "#F1EADE";
const ELEMENT_BACKGROUND: Record<string, string> = {
  fire: "#F3C6C4",
  wood: "#E3F0DF",
  water: "#DDECF3",
  earth: "#E5D2BD",
  metal: "#F5E6A8",
};
const CARD_CLASS =
  "rounded-[28px] border border-[rgba(97,74,55,0.18)] bg-[#FFFDF8] p-6 shadow-[0_10px_28px_rgba(97,74,55,0.08)]";
const PRIMARY_BUTTON_CLASS =
  "min-h-14 w-full rounded-[18px] bg-[#779682] px-5 py-4 text-center text-[16px] font-extrabold text-[#FFFDF8] transition active:bg-[#6D8876]";
const SECONDARY_BUTTON_CLASS =
  "min-h-14 w-full rounded-[18px] border border-[rgba(97,74,55,0.18)] bg-[#FFFDF8] px-5 py-4 text-center text-[15px] font-extrabold text-[#614A37] transition active:bg-[#F1EADE]";

const ANIMAL_VISUALS: Record<string, string> = {
  거북: "🐢",
  여우: "🦊",
  곰: "🐻",
  매: "🦅",
  늑대: "🐺",
  부엉이: "🦉",
  치타: "🐆",
  낙타: "🐪",
  코끼리: "🐘",
  사자: "🦁",
  까마귀: "🐦",
  야생마: "🐎",
};

function parseBirthDate(birthDate: string) {
  const parts = birthDate.split("-").map(Number);

  return {
    year: parts[0] || 2000,
    month: parts[1] || 1,
    day: parts[2] || 1,
  };
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

function getAnimalVisual(result: WealthResult) {
  return ANIMAL_VISUALS[result.animalType.animal] ?? "•";
}

function getStrongestElement(result: WealthResult) {
  return (
    result.dominantElement ||
    result.debug?.strongestElement ||
    result.interpretation?.strongestElement ||
    ""
  );
}

function getResultTypeId(result: WealthResult) {
  const source = [
    result.animalType.id,
    result.animalType.animal,
    result.animalType.name,
    result.interpretation.animalTitle,
  ].join(" ");

  if (resultCopyBank[result.animalType.id]) return result.animalType.id;
  if (/fox|여우/i.test(source)) return "fox";
  if (/hawk|매/i.test(source)) return "hawk";
  if (/tiger|호랑이|lion|사자/i.test(source)) return "tiger";
  if (/ox|소/i.test(source)) return "ox";
  if (/squirrel|다람쥐/i.test(source)) return "squirrel";

  return "fox";
}

function getSalNames(result: WealthResult) {
  const optionalSals = (result as WealthResult & { sals?: string[] }).sals;

  if (optionalSals?.length) return optionalSals;

  return result.salList?.map((sal) => sal.name) ?? [];
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
    <div className="flex gap-4 rounded-[22px] bg-[#F1EADE] p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFFDF8] text-lg font-extrabold text-[#779682]">
        {icon}
      </span>
      <div>
        <h3 className="text-[16px] font-extrabold leading-6 text-[#191F28]">
          {title}
        </h3>
        <p className="mt-1 text-[14px] font-semibold leading-6 text-[rgba(97,74,55,0.72)]">
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
          <p className="text-[12px] font-extrabold tracking-[0.08em] text-[rgba(97,74,55,0.72)]">
            RESULT
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.25] text-[#614A37]">
            아직 만들 결과가 없어요
          </h1>
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[rgba(97,74,55,0.72)]">
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

  const birthDate = searchParams.get("birthDate") || "";
  const birthTime = searchParams.get("birthTime") || "0";
  const genderParam = searchParams.get("gender") || "unknown";
  const calendarTypeParam = searchParams.get("calendarType") || "solar";

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
  const resultTypeId = getResultTypeId(result);
  const resultCopy = getResultCopyById(resultTypeId);
  const salCopy = selectPrimarySalCopy(
    getSalNames(result),
    resultCopy.archetype,
  );
  const displayRankText = `재물 감각 상위 ${result.topPercent}%`;

  return (
    <main className={PAGE_BASE_CLASS} style={{ backgroundColor: pageBg }}>
      <ResultDebugLogger debugKey={debugKey} debug={result.debug} />

      <section className="mx-auto max-w-[430px] pb-8">
        <header className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로 가기"
            className="grid h-10 w-10 place-items-center rounded-full bg-[#FFFDF8] text-xl font-extrabold text-[#614A37] transition active:bg-[#F1EADE]"
          >
            ←
          </button>
          <p className="text-[14px] font-extrabold text-[rgba(97,74,55,0.72)]">
            결과 리포트
          </p>
          <div className="h-10 w-10" />
        </header>

        <div className="grid gap-5">
          <ResultCard className="p-7">
            <h1 className="text-[32px] font-extrabold leading-[1.18] text-[#614A37]">
              돈 앞에서 깨어나는
              <br />
              내 안의 동물은?
            </h1>
            <p className="mt-3 text-[15px] font-semibold leading-7 text-[rgba(97,74,55,0.72)]">
              {resultCopy.copy.firstImpression}
            </p>

            <div className="flex items-start gap-4">
              <div className="mt-6 grid h-[76px] w-[76px] shrink-0 place-items-center rounded-[26px] bg-[#F1EADE] text-4xl">
                {getAnimalVisual(result)}
              </div>
            </div>

            <p className="mt-5 text-[13px] font-extrabold text-[rgba(97,74,55,0.72)]">
              1. 동물 유형
            </p>
            <h2 className="mt-2 text-[34px] font-extrabold leading-[1.12] text-[#614A37]">
              {resultCopy.title}
            </h2>
            <p className="mt-5 text-[13px] font-extrabold text-[rgba(97,74,55,0.72)]">
              2. 상위 퍼센트
            </p>
            <p className="mt-1 text-[30px] font-extrabold leading-none text-[#779682]">
              {displayRankText}
            </p>
            <p className="mt-5 text-[13px] font-extrabold text-[rgba(97,74,55,0.72)]">
              3. 설명 및 분석
            </p>
            <p className="mt-2 text-[18px] font-extrabold leading-7 text-[#191F28]">
              {resultCopy.archetype}
            </p>
            <p className="mt-3 text-[15px] font-semibold leading-7 text-[rgba(97,74,55,0.72)]">
              {resultCopy.copy.elementReading}
            </p>
          </ResultCard>

          <ResultCard>
            <p className="text-[13px] font-extrabold text-[#779682]">
              핵심 진단
            </p>
            <h2 className="mt-2 text-[24px] font-extrabold leading-[1.25] text-[#614A37]">
              돈이 들어오는 문과
              <br />
              새는 구멍
            </h2>
            <p className="mt-3 text-[14px] font-semibold leading-6 text-[rgba(97,74,55,0.72)]">
              {resultCopy.copy.moneyFlow}
            </p>
            <div className="mt-5 grid gap-3">
              <InsightRow
                icon="근"
                title="사주에서 보이는 장면"
                body={resultCopy.copy.elementReading}
              />
              {salCopy ? (
                <InsightRow
                  icon="살"
                  title={`${salCopy.label} 보조 해석`}
                  body={salCopy.moneyText}
                />
              ) : null}
              <InsightRow
                icon="↗"
                title="돈이 들어오는 방식"
                body={resultCopy.copy.moneyFlow}
              />
              <div className="rounded-[22px] bg-[#F1EADE] p-4">
                <p className="text-[13px] font-extrabold text-[#779682]">
                  반복되기 쉬운 장면
                </p>
                <ul className="mt-2 grid gap-2">
                  {resultCopy.copy.repeatedPatterns.map((pattern) => (
                    <li
                      key={pattern}
                      className="text-[14px] font-semibold leading-6 text-[rgba(97,74,55,0.72)]"
                    >
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
              <InsightRow
                icon="↓"
                title="돈이 막히거나 새는 지점"
                body={resultCopy.copy.moneyFlow}
              />
            </div>
            <div className="mt-4 rounded-[22px] border border-[rgba(97,74,55,0.18)] bg-[#FFFDF8] p-4">
              <p className="text-[13px] font-extrabold text-[#779682]">
                지금 필요한 조언
              </p>
              <p className="mt-2 text-[15px] font-extrabold leading-6 text-[#191F28]">
                {resultCopy.copy.advice}
              </p>
            </div>
          </ResultCard>

          <ResultCard>
            <p className="text-[13px] font-extrabold text-[#779682]">
              실행 체크
            </p>
            <div className="mt-4 grid gap-3">
              <InsightRow
                icon="3"
                title={`3일 실천 · ${resultCopy.copy.threeDayAction.title}`}
                body={resultCopy.copy.threeDayAction.body}
              />
              <InsightRow
                icon="5"
                title={`5일 점검 · ${resultCopy.copy.fiveDayCheck.title}`}
                body={resultCopy.copy.fiveDayCheck.body}
              />
              <InsightRow
                icon="7"
                title={`1주 실험 · ${resultCopy.copy.oneWeekExperiment.title}`}
                body={resultCopy.copy.oneWeekExperiment.body}
              />
            </div>
            <p className="mt-4 rounded-[18px] bg-[#779682] px-4 py-3 text-center text-[15px] font-extrabold text-[#FFFDF8]">
              {resultCopy.copy.cta}
            </p>
          </ResultCard>
        </div>

        <p className="mt-6 text-center text-[13px] font-semibold leading-6 text-[rgba(97,74,55,0.72)]">
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
        <div className="min-h-screen bg-[#F1EADE] p-10 text-sm font-bold text-[rgba(97,74,55,0.72)]">
          결과를 불러오는 중입니다...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
