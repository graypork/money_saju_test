"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateWealthResult,
  type ElementKey,
  type WealthResult,
} from "../../src/lib/score";
import { uiTokens } from "../../src/lib/uiTokens";

const ELEMENT_KEYS = ["wood", "fire", "earth", "metal", "water"] as const;

const ELEMENT_META: Record<
  ElementKey,
  {
    label: string;
    strong: string;
    weak: string;
  }
> = {
  wood: {
    label: "목",
    strong: "새로운 아이디어가 잘 떠오르지만",
    weak: "시작하는 힘은 늦어질 수 있습니다.",
  },
  fire: {
    label: "화",
    strong: "드러내고 밀어붙이는 힘은 살아나지만",
    weak: "보여주고 파는 힘은 약해질 수 있습니다.",
  },
  earth: {
    label: "토",
    strong: "쌓아두고 버티는 힘은 안정적이지만",
    weak: "돈이 머무는 구조는 약해질 수 있습니다.",
  },
  metal: {
    label: "금",
    strong: "정리하고 판단하는 힘은 선명하지만",
    weak: "가격과 기준을 잡는 데 시간이 걸릴 수 있습니다.",
  },
  water: {
    label: "수",
    strong: "흐름과 타이밍을 읽는 힘은 살아나지만",
    weak: "흐름을 조절하는 힘은 약해질 수 있습니다.",
  },
};

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
    body: "어떤 환경에서 돈의 흐름이 살아나는지 확인합니다.",
  },
  {
    title: "돈이 새는 지점",
    body: "작은 소비, 망설임, 충동 중 어디서 반복되는지 봅니다.",
  },
  {
    title: "반복되는 선택 패턴",
    body: "비슷한 돈 문제를 반복하는 이유를 정리합니다.",
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

const WEAK_ELEMENT_PATTERN_COPY: Record<ElementKey, string> = {
  wood: "시작할 일과 멈출 일을 가르는 기준이 흐려질 수 있습니다.",
  fire: "필요한 순간에 드러내거나 제안하는 힘이 약해질 수 있습니다.",
  earth: "들어온 돈이 머무는 구조를 놓치기 쉽습니다.",
  metal: "가격, 한도, 결제 기준을 늦게 정하기 쉽습니다.",
  water: "흐름을 조절하고 빠져나가는 구멍을 늦게 알아차릴 수 있습니다.",
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

function getElementLabel(element: ElementKey) {
  return ELEMENT_META[element].label;
}

function getAnimalVisual(result: WealthResult) {
  return ANIMAL_VISUALS[result.animalType.animal] ?? "•";
}

function buildElementSummary(result: WealthResult) {
  const strong = result.interpretation.strongestElement;
  const weak = result.interpretation.weakestElement;

  return `${ELEMENT_META[strong].strong}, ${ELEMENT_META[weak].weak}`;
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

function PrimaryCta({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={uiTokens.button}>
      {children}
    </button>
  );
}

function CompactStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#D8E1D1] bg-[#F4F7EF] px-4 py-3">
      <p className="text-[12px] font-bold text-[#667568]">{label}</p>
      <p className="mt-1 text-[17px] font-extrabold text-[#1F2A22]">{value}</p>
    </div>
  );
}

function InvalidResult() {
  const router = useRouter();

  return (
    <main className={uiTokens.page}>
      <section className={uiTokens.shell}>
        <div className={uiTokens.card}>
          <p className={uiTokens.eyebrow}>RESULT</p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.25] text-[#1F2A22]">
            아직 만들 결과가 없어요
          </h1>
          <p className={`${uiTokens.body} mt-4`}>
            생년월일과 태어난 시간을 먼저 선택하면 재물 동물 유형을 볼 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className={`${uiTokens.button} mt-6`}
          >
            테스트 시작하기
          </button>
        </div>
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
  const strongElement = interpretation.strongestElement;
  const weakElement = interpretation.weakestElement;
  const lifePattern = getLifePattern(result);
  const debugKey = `${birthDate}-${birthTime}-${calendarTypeParam}-${genderParam}`;

  const showToast = (message: string, tone: Toast["tone"] = "success") => {
    setToast({ message, tone });
  };

  const handlePaidCta = () => {
    // TODO: 실제 결제 플로우가 생기면 checkout 또는 유료 리포트 해금 경로로 연결합니다.
    showToast("전체 리포트 결제 흐름을 곧 연결할 예정입니다.");
  };

  return (
    <main className={`${uiTokens.page} py-6`}>
      <ResultDebugLogger debugKey={debugKey} debug={result.debug} />

      <section className="mx-auto max-w-md pb-8">
        <section className="rounded-[32px] border border-[#D8E1D1] bg-[#FFFFFF] p-6 shadow-[0_8px_24px_rgba(31,42,34,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <p className="rounded-full bg-[#DDE8D2] px-4 py-2 text-xs font-bold text-[#2F6B4F]">
              MONEY ANIMAL RESULT
            </p>
            <span className="rounded-full bg-[#F4F7EF] px-3 py-1.5 text-xs font-extrabold text-[#2F6B4F]">
              상위 {result.topPercent}%
            </span>
          </div>

          <h1 className="mt-7 text-[32px] font-extrabold leading-[1.22] text-[#1F2A22]">
            돈만 보면 눈을 뜨는
            <br />
            내 안의 동물은?
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-[#667568]">
            누군가는 바로 낚아채고,
            <br />
            누군가는 차곡차곡 모으고,
            <br />
            누군가는 잡기 직전에 망설입니다.
          </p>

          <p className="mt-5 text-[15px] font-semibold leading-7 text-[#1F2A22]">
            이번 결과는
            <br />
            돈을 대하는 방식과
            <br />
            반복되기 쉬운 돈의 패턴을
            <br />
            하나의 동물 유형으로 정리한 것입니다.
          </p>
        </section>

        <section className={`${uiTokens.card} mt-4`}>
          <div className="flex items-center gap-4">
            <div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-[24px] bg-[#DDE8D2] text-4xl">
              {getAnimalVisual(result)}
            </div>
            <div>
              <p className={uiTokens.caption}>동물 유형</p>
              <h2 className="mt-1 text-[28px] font-extrabold leading-[1.2] text-[#1F2A22]">
                {interpretation.animalTitle}
              </h2>
            </div>
          </div>

          <p className="mt-5 text-[18px] font-extrabold leading-7 text-[#1F2A22]">
            {interpretation.animalSummary}
          </p>
          <p className="mt-3 text-[15px] leading-7 text-[#667568]">
            {interpretation.moneyStrengthText}
          </p>
          <p className="mt-2 text-[15px] leading-7 text-[#667568]">
            {interpretation.moneyWeaknessText}
          </p>
        </section>

        <section className={`${uiTokens.card} mt-4`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[22px] font-extrabold text-[#1F2A22]">
              오행 요약
            </h2>
            <span className="rounded-full bg-[#DDE8D2] px-3 py-1 text-xs font-bold text-[#2F6B4F]">
              {interpretation.balanceLevel}
            </span>
          </div>

          <div className="mt-4 grid gap-2">
            <CompactStat
              label="강하게 드러난 기운"
              value={`${getElementLabel(strongElement)} · ${result.elements[strongElement]}%`}
            />
            <CompactStat
              label="부족하게 나타난 기운"
              value={`${getElementLabel(weakElement)} · ${result.elements[weakElement]}%`}
            />
            <CompactStat
              label="재물 흐름"
              value={`${interpretation.wealthStrengthText} · ${getElementLabel(
                interpretation.wealthElement
              )}`}
            />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-1.5" aria-label="오행 점수">
            {ELEMENT_KEYS.map((element) => {
              const value = result.elements[element];

              return (
                <div key={element}>
                  <div className="h-2 overflow-hidden rounded-full bg-[#DDE8D2]">
                    <div
                      className="h-full rounded-full bg-[#2F6B4F]"
                      style={{ width: `${Math.max(4, value)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-center text-[11px] font-bold text-[#667568]">
                    {getElementLabel(element)}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-4 rounded-[18px] bg-[#F4F7EF] px-4 py-3 text-[14px] font-semibold leading-6 text-[#667568]">
            {buildElementSummary(result)}
          </p>
        </section>

        <section className={`${uiTokens.card} mt-4`}>
          <p className={uiTokens.eyebrow}>MONEY PATTERN</p>
          <h2 className="mt-2 text-[22px] font-extrabold text-[#1F2A22]">
            돈이 새는 장면
          </h2>
          <div className="mt-4 rounded-[22px] bg-[#DDE8D2] p-5">
            <h3 className="text-[19px] font-extrabold leading-7 text-[#1F2A22]">
              {lifePattern.title}
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#1F2A22]/80">
              {lifePattern.body}
            </p>
          </div>
          <p className="mt-4 text-[14px] font-semibold leading-6 text-[#667568]">
            사주 흐름상 {getElementLabel(weakElement)} 기운이 약하게 나타나면{" "}
            {WEAK_ELEMENT_PATTERN_COPY[weakElement]}
          </p>
        </section>

        <section className={`${uiTokens.card} mt-4`}>
          <h2 className="text-[22px] font-extrabold text-[#1F2A22]">
            전체 리포트에서 더 보는 것
          </h2>
          <div className="mt-4 grid gap-2.5">
            {LOCKED_REPORT_ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-[18px] border border-[#D8E1D1] bg-[#F4F7EF] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-extrabold text-[#1F2A22]">
                    {item.title}
                  </span>
                  <span className="rounded-full bg-[#DDE8D2] px-3 py-1 text-xs font-bold text-[#2F6B4F]">
                    잠금
                  </span>
                </div>
                <p className="mt-2 text-[13px] font-semibold leading-5 text-[#667568]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-[32px] bg-[#2F6B4F] p-6 text-[#FFFFFF]">
          <h2 className="text-[26px] font-extrabold leading-[1.25]">
            이 동물이 나온 이유에는
            <br />
            돈이 반복되는 방식이 숨어 있습니다.
          </h2>
          <div className="mt-5 space-y-3 text-[15px] leading-7 text-[#FFFFFF]/82">
            <p>
              월급이 들어와도 금방 불안해지는 이유, 카드값 앞에서 매번 비슷한 생각을 하는 이유.
            </p>
            <p>
              좋은 기회 앞에서 망설이거나 반대로 너무 빨리 움직이는 이유.
            </p>
            <p>
              전체 리포트에서는 오행 밸런스와 재물 흐름을 바탕으로 돈이 들어오는 방식과 새어나가는 지점을 더 구체적으로 확인합니다.
            </p>
          </div>

          <div className="mt-5 rounded-[24px] bg-[#FFFFFF] p-5 text-[#1F2A22]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-[#667568]">
                  전체 재물 리포트
                </p>
                <p className="mt-1 text-3xl font-extrabold">₩1,900</p>
              </div>
              <p className="text-right text-xs font-bold leading-5 text-[#667568]">
                회원가입 없이
                <br />
                바로 확인
              </p>
            </div>
            <div className="mt-5">
              <PrimaryCta onClick={handlePaidCta}>
                돈 새는 지점 확인하기
              </PrimaryCta>
            </div>
          </div>
        </section>

        <p className={`${uiTokens.caption} mt-6 text-center font-semibold`}>
          본 테스트는 오락 및 자기이해 목적의 콘텐츠입니다. 금융, 투자, 법률, 직업 선택에 대한 전문 조언이 아닙니다.
        </p>

        <button
          type="button"
          onClick={() => router.push("/")}
          className={`${uiTokens.secondaryButton} mt-4`}
        >
          다시 테스트하기
        </button>

        {toast && (
          <div
            aria-live="polite"
            className="fixed inset-x-0 bottom-6 z-30 px-5"
          >
            <p
              className={`mx-auto max-w-md rounded-2xl px-4 py-3 text-center text-sm font-bold shadow-2xl ${
                toast.tone === "success"
                  ? "bg-[#1F2A22] text-[#FFFFFF]"
                  : "bg-[#9f2d2d] text-[#FFFFFF]"
              }`}
            >
              {toast.message}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F7EF] p-10 text-sm font-bold text-[#667568]">
          결과를 불러오는 중입니다...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
