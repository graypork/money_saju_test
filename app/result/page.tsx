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
  "min-h-screen break-keep px-5 pb-10 pt-4 text-[#171C18]";
const DEFAULT_PAGE_BACKGROUND = "#F8F4EC";
const ELEMENT_BACKGROUND: Record<string, string> = {
  fire: "#F3C6C4",
  wood: "#E3F0DF",
  water: "#DDECF3",
  earth: "#E5D2BD",
  metal: "#F5E6A8",
};
const ELEMENT_META: Record<
  keyof WealthResult["elements"],
  { label: string; color: string; bg: string; meaning: string }
> = {
  wood: {
    label: "목",
    color: "#4E8F61",
    bg: "#E3F0DF",
    meaning: "아이디어와 확장성",
  },
  fire: {
    label: "화",
    color: "#D97964",
    bg: "#F3C6C4",
    meaning: "표현력과 추진력",
  },
  earth: {
    label: "토",
    color: "#A9855C",
    bg: "#E5D2BD",
    meaning: "축적과 관리력",
  },
  metal: {
    label: "금",
    color: "#B9A558",
    bg: "#F5E6A8",
    meaning: "판단력과 수익 구조",
  },
  water: {
    label: "수",
    color: "#5D9AB8",
    bg: "#DDECF3",
    meaning: "정보력과 흐름 읽기",
  },
};
const CARD_CLASS =
  "rounded-[28px] border border-black/10 bg-[#FFFDF8] p-6 shadow-[0_12px_32px_rgba(31,42,34,0.07)]";
const PRIMARY_BUTTON_CLASS =
  "min-h-14 w-full rounded-full bg-[#285C42] px-5 py-4 text-center text-[16px] font-extrabold text-[#FFFDF8] shadow-[0_10px_24px_rgba(40,92,66,0.18)] transition active:bg-[#214B36]";
const SECONDARY_BUTTON_CLASS =
  "min-h-14 w-full rounded-full border border-black/10 bg-[#FFFDF8] px-5 py-4 text-center text-[15px] font-extrabold text-[#5E4936] transition active:bg-[#F8F4EC]";

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

function ElementBalanceCard({ result }: { result: WealthResult }) {
  const entries = Object.entries(result.elements) as Array<
    [keyof WealthResult["elements"], number]
  >;
  const dominant = result.dominantElement;
  const weak = result.weakElement;

  return (
    <ResultCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-extrabold tracking-[0.08em] text-[#285C42]">
            FIVE ELEMENTS
          </p>
          <h2 className="mt-2 text-[24px] font-black leading-[1.25] text-[#171C18]">
            오행 밸런스
          </h2>
        </div>
        <div className="rounded-2xl bg-[#EEF3EA] px-3 py-2 text-right">
          <p className="text-[11px] font-black text-[#285C42]">강한 기운</p>
          <p className="text-[16px] font-black text-[#171C18]">
            {ELEMENT_META[dominant].label}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {entries.map(([key, value]) => {
          const meta = ELEMENT_META[key];
          const score = Math.round(value);

          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-sm font-black text-[#171C18]">
                    {meta.label}
                  </span>
                  {key === dominant ? (
                    <span className="rounded-full bg-[#EEF3EA] px-2 py-0.5 text-[11px] font-black text-[#285C42]">
                      강함
                    </span>
                  ) : null}
                  {key === weak ? (
                    <span className="rounded-full bg-[#F8E8D8] px-2 py-0.5 text-[11px] font-black text-[#9A633C]">
                      부족
                    </span>
                  ) : null}
                </div>
                <span className="text-sm font-extrabold text-[#7D7469]">
                  {score}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#EDE7DD]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(4, Math.min(100, score))}%`,
                    backgroundColor: meta.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 rounded-[20px] bg-[#F8F4EC] p-4 text-[14px] font-semibold leading-6 text-[#6F6253]">
        {ELEMENT_META[dominant].label} 기운은 {ELEMENT_META[dominant].meaning} 쪽을
        키우고, {ELEMENT_META[weak].label} 기운은 {ELEMENT_META[weak].meaning} 쪽에서
        보완이 필요하게 나타납니다.
      </p>
    </ResultCard>
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
  const usefulGodLabel = ELEMENT_META[result.usefulGod]?.label ?? "";
  const favorableLabels = result.favorableElements
    .map((element) => ELEMENT_META[element]?.label)
    .filter(Boolean)
    .join(" · ");
  const reportItems = [
    "내 돈이 막히는 지점",
    "잘 맞는 수익화 방식",
    "피해야 할 소비 패턴",
    "돈이 모이는 환경",
  ];

  return (
    <main className={PAGE_BASE_CLASS} style={{ backgroundColor: pageBg }}>
      <ResultDebugLogger debugKey={debugKey} debug={result.debug} />

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
                    {resultCopy.title}
                  </h1>
                  <p className="mt-3 text-[15px] font-extrabold leading-6 text-[#6F6253]">
                    {resultCopy.archetype}
                  </p>
                </div>
                <div className="grid h-[78px] w-[78px] shrink-0 place-items-center rounded-[26px] bg-[#F8F4EC] text-4xl">
                  {getAnimalVisual(result)}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-4 rounded-[24px] bg-[#EEF3EA] p-5">
                <div>
                  <p className="text-[12px] font-black tracking-[0.08em] text-[#285C42]">
                    MONEY SENSE
                  </p>
                  <p className="mt-1 text-[16px] font-extrabold text-[#6F6253]">
                    {displayRankText}
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
              {resultCopy.copy.firstImpression}
            </p>
          </ResultCard>

          <ElementBalanceCard result={result} />

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
              {resultCopy.copy.moneyFlow}
            </p>
            <div className="mt-5 grid gap-3">
              <InsightRow
                icon="벌"
                title="돈이 들어오는 방식"
                body={resultCopy.copy.moneyFlow}
              />
              <InsightRow
                icon="새"
                title="돈이 막히거나 새는 지점"
                body={resultCopy.copy.elementReading}
              />
              <div className="rounded-[22px] bg-[#F8F4EC] p-4">
                <p className="text-[13px] font-extrabold text-[#285C42]">
                  반복되기 쉬운 장면
                </p>
                <ul className="mt-3 grid gap-2">
                  {resultCopy.copy.repeatedPatterns.map((pattern) => (
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

          {salCopy ? (
            <ResultCard>
              <p className="text-[13px] font-extrabold tracking-[0.08em] text-[#285C42]">
                SAJU SUPPORT
              </p>
              <h2 className="mt-2 text-[24px] font-black leading-[1.25] text-[#171C18]">
                용신·신살 보조 해석
              </h2>
              <div className="mt-5 grid gap-3">
                <InsightRow
                  icon="용"
                  title={`도움 되는 기운 ${usefulGodLabel}`}
                  body={
                    favorableLabels
                      ? `${favorableLabels} 흐름이 돈의 균형을 잡는 데 도움 되는 쪽으로 표시됩니다.`
                      : "도움 되는 오행 흐름을 기준으로 돈의 균형을 보완합니다."
                  }
                />
                <InsightRow
                  icon="살"
                  title={`${salCopy.label} 보조 해석`}
                  body={salCopy.moneyText}
                />
              </div>
            </ResultCard>
          ) : null}

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
          </ResultCard>

          <ResultCard className="border-[#285C42]/20 bg-[#F7FBF5]">
            <p className="text-[13px] font-extrabold tracking-[0.08em] text-[#285C42]">
              DEEP REPORT
            </p>
            <h2 className="mt-2 text-[25px] font-black leading-[1.25] text-[#171C18]">
              더 깊게 보면
              <br />
              돈의 반복 패턴이 보입니다
            </h2>
            <div className="mt-5 grid gap-2">
              {reportItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-[#FFFDF8] px-4 py-3 text-[14px] font-extrabold text-[#171C18]"
                >
                  <span className="h-2 w-2 rounded-full bg-[#285C42]" />
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-5 whitespace-pre-line text-[14px] font-semibold leading-6 text-[#6F6253]">
              {resultCopy.copy.cta}
            </p>
            <button type="button" className={`${PRIMARY_BUTTON_CLASS} mt-5`}>
              내 돈 패턴 자세히 보기
            </button>
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
