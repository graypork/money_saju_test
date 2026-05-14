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
    ability: string;
    strong: string;
    weak: string;
    tone: string;
  }
> = {
  wood: {
    label: "목",
    ability: "성장",
    strong: "아이디어와 확장성이 살아납니다.",
    weak: "시작과 확장이 늦어질 수 있습니다.",
    tone: "bg-[#7A9C62]",
  },
  fire: {
    label: "화",
    ability: "표현",
    strong: "추진력과 표현력이 살아납니다.",
    weak: "드러내고 파는 힘이 약해질 수 있습니다.",
    tone: "bg-[#B46A3C]",
  },
  earth: {
    label: "토",
    ability: "축적",
    strong: "돈을 남기는 구조가 안정적입니다.",
    weak: "벌어도 머무는 힘이 약해질 수 있습니다.",
    tone: "bg-[#C4A163]",
  },
  metal: {
    label: "금",
    ability: "정리",
    strong: "판단과 수익화 구조가 선명합니다.",
    weak: "가격과 구조를 정하는 데 시간이 걸릴 수 있습니다.",
    tone: "bg-[#6F3F2A]",
  },
  water: {
    label: "수",
    ability: "흐름",
    strong: "정보와 타이밍을 읽는 힘이 살아납니다.",
    weak: "흐름을 조절하는 힘이 약해질 수 있습니다.",
    tone: "bg-[#5E7C8B]",
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
  "돈이 들어오는 방식",
  "돈이 새는 지점",
  "반복되는 선택 패턴",
];

type Toast = {
  message: string;
  tone: "success" | "error";
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

function getRankedElements(result: WealthResult) {
  return ELEMENT_KEYS.map((element) => ({
    element,
    value: result.elements[element],
  })).sort((a, b) => b.value - a.value);
}

function buildElementSummary(result: WealthResult) {
  const strong = result.interpretation.strongestElement;
  const weak = result.interpretation.weakestElement;

  return `${getElementLabel(strong)} 기운이 강하면 ${
    ELEMENT_META[strong].strong
  } 다만 ${getElementLabel(weak)} 기운이 약하면 ${ELEMENT_META[weak].weak}`;
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
    <div className="rounded-[18px] border border-[#E8D8C5] bg-[#FDF7EC] px-4 py-3">
      <p className="text-[12px] font-bold text-[#7A6754]">{label}</p>
      <p className="mt-1 text-[17px] font-extrabold text-[#241A12]">{value}</p>
    </div>
  );
}

function InvalidResult() {
  const router = useRouter();

  return (
    <main className={uiTokens.page}>
      <section className={uiTokens.shell}>
        <div className="rounded-[32px] bg-[#241A12] p-7 text-[#FFFDF8] shadow-[0_18px_50px_rgba(36,26,18,0.18)]">
          <p className="text-xs font-bold text-[#F7D8A7]">RESULT</p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.25]">
            아직 만들 결과가 없어요
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-[#FFFDF8]/70">
            생년월일과 태어난 시간을 먼저 선택하면 재물 동물 유형을 볼 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 w-full rounded-full bg-[#FFFDF8] px-[22px] py-4 text-base font-bold text-[#241A12] transition active:scale-[0.98]"
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
  const rankedElements = getRankedElements(result);
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
        <section className="rounded-[32px] bg-[#241A12] p-6 text-[#FFFDF8] shadow-[0_18px_50px_rgba(36,26,18,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <p className="rounded-full bg-[#FFFDF8]/10 px-4 py-2 text-xs font-bold text-[#F7D8A7]">
              MONEY ANIMAL RESULT
            </p>
            <span className="rounded-full bg-[#FFFDF8] px-3 py-1.5 text-xs font-extrabold text-[#241A12]">
              상위 {result.topPercent}%
            </span>
          </div>

          <h1 className="mt-6 text-[31px] font-extrabold leading-[1.25]">
            돈만 보면 눈을 뜨는
            <br />
            내 안의 동물은?
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-[#FFFDF8]/76">
            누군가는 바로 낚아채고,
            <br />
            누군가는 차곡차곡 모으고,
            <br />
            누군가는 잡기 직전에 망설입니다.
          </p>

          <p className="mt-5 text-[15px] leading-7 text-[#FFFDF8]/76">
            이번 결과는
            <br />
            돈을 버는 방식과
            <br />
            돈이 새기 쉬운 지점을
            <br />
            하나의 동물 유형으로 정리한 것입니다.
          </p>
        </section>

        <section className={`${uiTokens.card} mt-5`}>
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[24px] bg-[#FDF7EC] text-5xl">
              {getAnimalVisual(result)}
            </div>
            <div>
              <p className={uiTokens.caption}>동물 유형</p>
              <h2 className="mt-1 text-[28px] font-extrabold leading-[1.2] text-[#241A12]">
                {interpretation.animalTitle}
              </h2>
            </div>
          </div>

          <p className="mt-5 text-[18px] font-extrabold leading-7 text-[#241A12]">
            {interpretation.animalSummary}
          </p>
          <p className="mt-3 text-[15px] leading-7 text-[#7A6754]">
            {interpretation.moneyStrengthText}
          </p>
          <p className="mt-2 text-[15px] leading-7 text-[#7A6754]">
            {interpretation.moneyWeaknessText}
          </p>
        </section>

        <section className={`${uiTokens.card} mt-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[22px] font-extrabold text-[#241A12]">
              오행 요약
            </h2>
            <span className="rounded-full bg-[#FDF7EC] px-3 py-1 text-xs font-bold text-[#B46A3C]">
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
            {rankedElements.map(({ element, value }) => (
              <div key={element}>
                <div className="h-2 overflow-hidden rounded-full bg-[#F1E4D3]">
                  <div
                    className={`h-full rounded-full ${ELEMENT_META[element].tone}`}
                    style={{ width: `${Math.max(4, value)}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-[11px] font-bold text-[#7A6754]">
                  {getElementLabel(element)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 rounded-[18px] bg-[#FDF7EC] px-4 py-3 text-[14px] font-semibold leading-6 text-[#7A6754]">
            {buildElementSummary(result)}
          </p>
        </section>

        <section className={`${uiTokens.card} mt-5`}>
          <h2 className="text-[22px] font-extrabold text-[#241A12]">
            전체 리포트에서 더 볼 수 있는 것
          </h2>
          <div className="mt-4 grid gap-2.5">
            {LOCKED_REPORT_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-[18px] border border-[#E8D8C5] bg-[#FDF7EC] px-4 py-3"
              >
                <span className="text-[15px] font-bold text-[#241A12]">
                  {item}
                </span>
                <span className="rounded-full bg-[#241A12] px-3 py-1 text-xs font-bold text-[#FFFDF8]">
                  잠금
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[32px] bg-[#6F3F2A] p-6 text-[#FFFDF8] shadow-[0_18px_50px_rgba(36,26,18,0.22)]">
          <h2 className="text-[26px] font-extrabold leading-[1.25]">
            이 동물이 나온 이유에는
            <br />
            더 깊은 돈의 패턴이 숨어 있습니다.
          </h2>
          <div className="mt-4 space-y-3 text-[15px] leading-7 text-[#FFFDF8]/78">
            <p>겉으로 보이는 유형은 시작입니다.</p>
            <p>
              왜 이런 방식으로 돈이 들어오고, 어디서 자꾸 빠져나가는지까지 봐야 진짜 흐름이 보입니다.
            </p>
            <p>
              전체 리포트에서 오행 밸런스와 재물 흐름을 더 구체적으로 확인해보세요.
            </p>
          </div>

          <div className="mt-5 rounded-[24px] bg-[#FFFDF8] p-5 text-[#241A12]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-[#7A6754]">
                  전체 재물 리포트
                </p>
                <p className="mt-1 text-3xl font-extrabold">₩1,900</p>
              </div>
              <p className="text-right text-xs font-bold leading-5 text-[#7A6754]">
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
                  ? "bg-[#241A12] text-[#FFFDF8]"
                  : "bg-[#9f2d2d] text-[#FFFDF8]"
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
        <div className="min-h-screen bg-[#F8F2E8] p-10 text-sm font-bold text-[#7A6754]">
          결과를 불러오는 중입니다...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
