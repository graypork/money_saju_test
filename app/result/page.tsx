"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateWealthResult,
  type WealthResult,
} from "../../src/lib/score";

const PAGE_CLASS =
  "min-h-screen break-keep bg-[#F2F4F6] px-5 pb-36 pt-4 text-[#191F28]";
const CARD_CLASS =
  "rounded-[28px] bg-[#FFFFFF] p-6 shadow-[0_8px_24px_rgba(25,31,40,0.04)]";
const PRIMARY_BUTTON_CLASS =
  "min-h-14 w-full rounded-[18px] bg-[#3182F6] px-5 py-4 text-center text-[16px] font-extrabold text-[#FFFFFF] transition active:bg-[#1B64DA]";
const SECONDARY_BUTTON_CLASS =
  "min-h-14 w-full rounded-[18px] bg-[#FFFFFF] px-5 py-4 text-center text-[15px] font-extrabold text-[#4E5968] transition active:bg-[#E5E8EB]";

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

const LOCKED_REPORT_ITEMS = [
  {
    title: "돈이 들어오는 방식",
    body: "어떤 환경에서 수입 흐름이 살아나는지 구체적으로 봅니다.",
  },
  {
    title: "돈이 새는 반복 패턴",
    body: "작은 소비, 망설임, 충동 중 어디서 반복되는지 정리합니다.",
  },
  {
    title: "돈이 막히는 정확한 지점",
    body: "무료 결과에서 보인 장면이 왜 반복되는지 핵심 지점을 엽니다.",
  },
  {
    title: "3일/5일/1주 재정 체크",
    body: "이번 주에 바로 확인할 소비와 수익화 행동을 순서대로 봅니다.",
  },
  {
    title: "현재 유형에게 맞는 수익화 방식",
    body: "지금 가진 능력을 어떤 형태로 작게 팔 수 있는지 좁힙니다.",
  },
  {
    title: "바로 고쳐야 할 행동",
    body: "돈 흐름을 막는 행동을 하나씩 바꿀 수 있게 정리합니다.",
  },
  {
    title: "주의해야 할 소비 패턴",
    body: "스트레스성 소비와 반복 결제를 놓치지 않게 체크합니다.",
  },
];

const PAID_REPORT_CHECKLIST = [
  "돈이 막히는 정확한 지점",
  "반복되는 소비/수익화 패턴",
  "7일 행동 처방",
  "유형별 수익화 방향",
];

const WEEKLY_MONEY_CHECK_ITEMS = [
  {
    label: "3일 체크",
    title: "작은 지출부터 보기",
    body: "작은 결제, 자동결제, 미뤄둔 지출을 먼저 확인해보세요. 큰돈보다 작은 지출이 반복될 때 돈이 새는 느낌이 커질 수 있습니다.",
  },
  {
    label: "5일 체크",
    title: "지친 상태의 결제 멈추기",
    body: "스트레스가 쌓인 날에는 결제가 필요한 소비처럼 느껴지기 쉽습니다. 바로 결제하기보다 하루 뒤에도 필요한지 다시 보는 편이 좋습니다.",
  },
  {
    label: "1주 체크",
    title: "작게 팔 수 있는 형태 만들기",
    body: "아끼는 것만으로는 흐름이 바뀌지 않습니다. 지금 가진 능력 하나를 작게 팔 수 있는 형태로 정리해보세요.",
  },
];

type Toast = {
  message: string;
  tone: "success" | "error";
};

type LifePattern = {
  title: string;
  body: string;
};

type LifePatternKey =
  | "leakage"
  | "hesitation"
  | "impulse"
  | "overSaving"
  | "opportunityLoss"
  | "imbalance";

const LIFE_PATTERN_BY_RISK: Record<
  WealthResult["resultSignals"]["riskPattern"],
  LifePatternKey
> = {
  lateExecution: "opportunityLoss",
  launchDelay: "hesitation",
  overCaution: "overSaving",
  overExpansion: "impulse",
  peopleDrain: "leakage",
  underpricing: "hesitation",
  impulseLeak: "impulse",
  scatteredFocus: "imbalance",
  prepLoop: "hesitation",
  priceFear: "hesitation",
  analysisParalysis: "opportunityLoss",
  weakStructure: "imbalance",
};

const LIFE_PATTERNS: Record<LifePatternKey, LifePattern> = {
  leakage: {
    title: "어디로 나갔는지 모르는 돈",
    body: "큰돈을 쓴 기억은 없는데, 통장 잔액은 생각보다 빨리 줄어듭니다. 작은 구독료, 배달비, 택시비처럼 반복되는 지출에서 돈이 새기 쉬운 흐름입니다.",
  },
  hesitation: {
    title: "기회 앞에서 길어지는 고민",
    body: "필요한 결제도 오래 미루고, 좋은 기회 앞에서도 한 번 더 계산하게 됩니다. 신중함은 장점이지만 타이밍이 중요한 순간에는 기회를 놓치기 쉽습니다.",
  },
  impulse: {
    title: "월급날에 강해지는 소비 욕구",
    body: "돈이 들어오는 순간 사고 싶던 것들이 한꺼번에 떠오릅니다. 기분이 올라올 때 지출도 함께 커지기 쉬운 흐름입니다.",
  },
  overSaving: {
    title: "아껴도 줄지 않는 불안",
    body: "돈을 쓰지 않아도 마음이 편하지 않고, 작은 결제에도 오래 멈칫합니다. 모으는 힘은 있지만 돈을 움직이는 경험이 부족해질 수 있습니다.",
  },
  opportunityLoss: {
    title: "잡기 직전에 놓치는 타이밍",
    body: "좋은 제안이나 기회가 보여도 확신이 생길 때까지 기다리는 편입니다. 문제는 확신이 생겼을 때 이미 타이밍이 지나 있을 수 있다는 점입니다.",
  },
  imbalance: {
    title: "벌 때와 쓸 때의 온도 차이",
    body: "돈을 벌 때는 의욕이 있지만, 관리 단계에서는 흐름이 흐트러지기 쉽습니다. 수입보다 중요한 건 들어온 돈이 머무는 구조입니다.",
  },
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

function getLifePattern(result: WealthResult) {
  const key = LIFE_PATTERN_BY_RISK[result.resultSignals.riskPattern];
  return LIFE_PATTERNS[key];
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
    <div className="flex gap-4 rounded-[22px] bg-[#F2F4F6] p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E8F3FF] text-lg font-extrabold text-[#3182F6]">
        {icon}
      </span>
      <div>
        <h3 className="text-[16px] font-extrabold leading-6 text-[#191F28]">
          {title}
        </h3>
        <p className="mt-1 text-[14px] font-semibold leading-6 text-[#4E5968]">
          {body}
        </p>
      </div>
    </div>
  );
}

function MissionRow({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  const badge = label.replace(" 체크", "");

  return (
    <div className="flex gap-4 rounded-[22px] bg-[#F2F4F6] p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E8F3FF] text-[13px] font-extrabold text-[#3182F6]">
        {badge}
      </span>
      <div>
        <p className="text-[13px] font-extrabold text-[#8B95A1]">{label}</p>
        <h3 className="mt-1 text-[16px] font-extrabold leading-6 text-[#191F28]">
          {title}
        </h3>
        <p className="mt-1 text-[14px] font-semibold leading-6 text-[#4E5968]">
          {body}
        </p>
      </div>
    </div>
  );
}

function LockedReportRow({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[20px] bg-[#F2F4F6] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-extrabold text-[#191F28]">
          {title}
        </span>
        <span className="rounded-full bg-[#E8F3FF] px-2.5 py-1 text-[11px] font-extrabold text-[#3182F6]">
          잠금
        </span>
      </div>
      <p className="mt-2 text-[13px] font-semibold leading-5 text-[#4E5968]">
        {body}
      </p>
    </div>
  );
}

function PrimaryCta({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={PRIMARY_BUTTON_CLASS}>
      {children}
    </button>
  );
}

function InvalidResult() {
  const router = useRouter();

  return (
    <main className={PAGE_CLASS}>
      <section className="mx-auto max-w-[430px] pt-16">
        <ResultCard>
          <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#8B95A1]">
            RESULT
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.25] text-[#191F28]">
            아직 만들 결과가 없어요
          </h1>
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[#4E5968]">
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
  const [toast, setToast] = useState<Toast | null>(null);

  const birthDate = searchParams.get("birthDate") || "";
  const birthTime = searchParams.get("birthTime") || "0";
  const genderParam = searchParams.get("gender") || "unknown";
  const calendarTypeParam = searchParams.get("calendarType") || "solar";

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

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
  const interpretation = result.interpretation;
  const lifePattern = getLifePattern(result);
  const debugKey = `${birthDate}-${birthTime}-${calendarTypeParam}-${genderParam}`;
  const earningPattern =
    interpretation.typePatternDetails.find(
      (detail) => detail.label === "돈 버는 방식",
    ) ?? interpretation.typePatternDetails[0];
  const leakingPattern =
    interpretation.typePatternDetails.find(
      (detail) => detail.label === "돈이 새는 지점",
    ) ??
    interpretation.typePatternDetails[1] ??
    earningPattern;
  const earningText = earningPattern?.text ?? interpretation.animalSummary;
  const leakingText = leakingPattern?.text ?? interpretation.realitySceneText;

  const showToast = (message: string, tone: Toast["tone"] = "success") => {
    setToast({ message, tone });
  };

  const handlePaidCta = () => {
    // TODO: 실제 결제 플로우가 생기면 checkout 또는 유료 리포트 해금 경로로 연결합니다.
    showToast("전체 리포트 결제 흐름을 곧 연결할 예정입니다.");
  };

  return (
    <main className={PAGE_CLASS}>
      <ResultDebugLogger debugKey={debugKey} debug={result.debug} />

      <section className="mx-auto max-w-[430px] pb-8">
        <header className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로 가기"
            className="grid h-10 w-10 place-items-center rounded-full bg-[#FFFFFF] text-xl font-extrabold text-[#191F28] transition active:bg-[#E5E8EB]"
          >
            ←
          </button>
          <p className="text-[14px] font-extrabold text-[#4E5968]">
            결과 리포트
          </p>
          <div className="h-10 w-10" />
        </header>

        <section className="mb-5 px-1">
          <h1 className="text-[32px] font-extrabold leading-[1.18] text-[#191F28]">
            돈만 보면 눈을 뜨는
            <br />
            내 안의 동물은?
          </h1>
          <p className="mt-3 text-[15px] font-semibold leading-7 text-[#4E5968]">
            돈을 대하는 방식과 반복되기 쉬운 패턴을 하나의 유형으로 정리했습니다.
          </p>
        </section>

        <div className="grid gap-5">
          <ResultCard className="p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-[26px] bg-[#F2F4F6] text-4xl">
                {getAnimalVisual(result)}
              </div>
              <span className="rounded-full bg-[#E8F3FF] px-3 py-1.5 text-[13px] font-extrabold text-[#3182F6]">
                상위 {result.topPercent}%
              </span>
            </div>

            <p className="mt-6 text-[13px] font-extrabold text-[#8B95A1]">
              돈버는 동물 유형
            </p>
            <h2 className="mt-2 text-[34px] font-extrabold leading-[1.12] text-[#191F28]">
              {interpretation.animalTitle}
            </h2>
            <p className="mt-4 text-[18px] font-extrabold leading-7 text-[#191F28]">
              {interpretation.symbolicTitle}
            </p>
            <p className="mt-3 text-[15px] font-semibold leading-7 text-[#4E5968]">
              {interpretation.animalSummary}
            </p>
          </ResultCard>

          <ResultCard>
            <p className="text-[13px] font-extrabold text-[#3182F6]">
              핵심 진단
            </p>
            <h2 className="mt-2 text-[24px] font-extrabold leading-[1.25] text-[#191F28]">
              돈이 들어오고
              <br />
              새는 방식
            </h2>
            <div className="mt-5 grid gap-3">
              <InsightRow
                icon="↗"
                title="돈이 들어오는 방식"
                body={earningText}
              />
              <InsightRow
                icon="↓"
                title={lifePattern.title}
                body={interpretation.realitySceneText || leakingText}
              />
            </div>
            <div className="mt-4 rounded-[22px] bg-[#E8F3FF] p-4">
              <p className="text-[13px] font-extrabold text-[#3182F6]">
                지금 필요한 조언
              </p>
              <p className="mt-2 text-[15px] font-extrabold leading-6 text-[#191F28]">
                {interpretation.directAdviceText}
              </p>
            </div>
          </ResultCard>

          <ResultCard>
            <p className="text-[13px] font-extrabold text-[#3182F6]">
              이번 주 체크
            </p>
            <h2 className="mt-2 text-[24px] font-extrabold leading-[1.25] text-[#191F28]">
              3일/5일/1주
              <br />
              재정 체크
            </h2>
            <p className="mt-3 text-[14px] font-semibold leading-6 text-[#4E5968]">
              예측보다 중요한 건 이번 주에 실제로 확인할 수 있는 돈의 흐름입니다.
            </p>
            <div className="mt-5 grid gap-3">
              {WEEKLY_MONEY_CHECK_ITEMS.map((item) => (
                <MissionRow
                  key={item.label}
                  label={item.label}
                  title={item.title}
                  body={item.body}
                />
              ))}
            </div>
          </ResultCard>

          <ResultCard className="border border-[#E8F3FF]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#E8F3FF] px-3 py-1.5 text-[12px] font-extrabold text-[#3182F6]">
                유료 상세 해석
              </span>
              <span className="text-[12px] font-extrabold text-[#8B95A1]">
                회원가입 없이 확인
              </span>
            </div>

            <h2 className="mt-5 text-[26px] font-extrabold leading-[1.22] text-[#191F28]">
              내 돈이 막히는 지점을
              <br />
              더 좁혀봅니다.
            </h2>
            <p className="mt-3 text-[15px] font-semibold leading-7 text-[#4E5968]">
              무료 결과에서는 돈이 새기 쉬운 장면까지 확인했습니다. 상세 해석에서는 그 장면이 반복되는 이유와 막히는 지점을 더 구체적으로 봅니다.
            </p>

            <div className="mt-5 grid gap-2">
              {PAID_REPORT_CHECKLIST.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[18px] bg-[#F2F4F6] px-4 py-3 text-[14px] font-extrabold text-[#191F28]"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#E8F3FF] text-[12px] font-extrabold text-[#3182F6]">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] bg-[#F2F4F6] p-5">
              <p className="text-[13px] font-extrabold text-[#8B95A1]">
                출시가
              </p>
              <div className="mt-1 flex items-end gap-2">
                <span className="pb-1 text-[14px] font-bold text-[#8B95A1] line-through">
                  정가 ₩8,900
                </span>
                <span className="text-[34px] font-extrabold leading-none text-[#3182F6]">
                  ₩1,900
                </span>
              </div>
              <p className="mt-2 text-[13px] font-bold text-[#8B95A1]">
                결제 후 바로 결과 확인 가능
              </p>
              <div className="mt-5">
                <PrimaryCta onClick={handlePaidCta}>
                  내 돈이 막히는 지점 확인하기
                </PrimaryCta>
              </div>
            </div>
          </ResultCard>

          <ResultCard>
            <p className="text-[13px] font-extrabold text-[#3182F6]">
              상세 해석에서 열리는 것
            </p>
            <h2 className="mt-2 text-[24px] font-extrabold leading-[1.25] text-[#191F28]">
              무료 결과 다음에
              <br />
              더 보는 항목
            </h2>
            <div className="mt-5 grid gap-3">
              {LOCKED_REPORT_ITEMS.map((item) => (
                <LockedReportRow
                  key={item.title}
                  title={item.title}
                  body={item.body}
                />
              ))}
            </div>
          </ResultCard>
        </div>

        <p className="mt-6 text-center text-[13px] font-semibold leading-6 text-[#8B95A1]">
          본 테스트는 오락 및 자기이해 목적의 콘텐츠입니다. 금융, 투자, 법률, 직업 선택에 대한 전문 조언이 아닙니다.
        </p>

        <button
          type="button"
          onClick={() => router.push("/")}
          className={`${SECONDARY_BUTTON_CLASS} mt-4`}
        >
          다시 테스트하기
        </button>

        {toast && (
          <div
            aria-live="polite"
            className="fixed inset-x-0 bottom-24 z-30 px-5"
          >
            <p
              className={`mx-auto max-w-md rounded-[20px] px-4 py-3 text-center text-sm font-bold shadow-[0_8px_24px_rgba(25,31,40,0.16)] ${
                toast.tone === "success"
                  ? "bg-[#191F28] text-[#FFFFFF]"
                  : "bg-[#D92D20] text-[#FFFFFF]"
              }`}
            >
              {toast.message}
            </p>
          </div>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-[#F2F4F6] px-5 pb-4 pt-3">
        <div className="mx-auto max-w-[430px]">
          <PrimaryCta onClick={handlePaidCta}>
            내 돈이 막히는 지점 확인하기
          </PrimaryCta>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F2F4F6] p-10 text-sm font-bold text-[#4E5968]">
          결과를 불러오는 중입니다...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
