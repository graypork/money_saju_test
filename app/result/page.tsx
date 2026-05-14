"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateWealthResult,
  type ElementKey,
  type WealthProfile,
  type WealthResult,
} from "../../src/lib/score";
import { getPaidReportTemplate } from "../../src/lib/paidReportTemplates";
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
    ability: "성장력 · 아이디어 · 확장성",
    strong: "아이디어를 키우고 새 판을 여는 힘이 좋습니다.",
    weak: "시작과 확장을 미루면 좋은 흐름을 작게 쓰기 쉽습니다.",
    tone: "bg-[#7A9C62]",
  },
  fire: {
    label: "화",
    ability: "표현력 · 브랜딩 · 영향력",
    strong: "사람의 반응을 끌어내고 가치를 보여주는 힘이 좋습니다.",
    weak: "드러내고 팔아야 할 때 뒤로 물러나면 실력보다 작게 보일 수 있습니다.",
    tone: "bg-[#B46A3C]",
  },
  earth: {
    label: "토",
    ability: "안정성 · 축적 · 관리",
    strong: "수익을 오래 남기고 루틴으로 관리하는 힘이 좋습니다.",
    weak: "관리 구조가 약하면 벌어도 돈이 오래 머물지 않을 수 있습니다.",
    tone: "bg-[#C4A163]",
  },
  metal: {
    label: "금",
    ability: "판단력 · 정리 · 수익화 구조",
    strong: "기준을 세우고 가격, 상품, 손익을 정리하는 힘이 좋습니다.",
    weak: "좋은 아이디어를 가격과 결제 구조로 바꾸는 데 시간이 걸릴 수 있습니다.",
    tone: "bg-[#6F3F2A]",
  },
  water: {
    label: "수",
    ability: "정보력 · 분석력 · 흐름 읽기",
    strong: "정보와 타이밍을 읽고 방향을 바꾸는 힘이 좋습니다.",
    weak: "흐름을 바꿔야 할 때 한 박자 늦어질 수 있습니다.",
    tone: "bg-[#5E7C8B]",
  },
};

const PROFILE_LABELS: Record<keyof WealthProfile, string> = {
  moneySense: "돈 흐름 감지",
  executionPower: "실행 전환력",
  riskTaking: "기회 베팅력",
  consistency: "반복 지속력",
  impulsiveness: "즉흥 지출 경계",
  socialCapital: "관계 자본",
  creativity: "아이디어 수익화",
  businessPotential: "사업화 가능성",
  stability: "돈 관리 안정감",
  luckFlow: "타이밍 감각",
};

const PROFILE_STRENGTH_COPY: Record<keyof WealthProfile, string> = {
  moneySense: "돈이 될 만한 흐름과 아닌 흐름을 비교적 빨리 구분합니다.",
  executionPower: "생각에서 멈추지 않고 제안, 공개, 실행으로 넘기는 힘이 있습니다.",
  riskTaking: "기회가 보이면 작게라도 판을 열어보는 감각이 살아 있습니다.",
  consistency: "한 번 정한 루틴을 반복하면서 신뢰와 결과를 쌓을 수 있습니다.",
  impulsiveness: "순간 반응이 빠른 만큼 트렌드와 수요 변화에 민감하게 반응합니다.",
  socialCapital: "사람, 소개, 협업 속에서 수익 기회를 만들 가능성이 큽니다.",
  creativity: "아이디어와 감각을 콘텐츠나 상품의 출발점으로 바꾸기 쉽습니다.",
  businessPotential: "직접 판을 만들거나 작은 수익 모델을 실험할 때 힘이 납니다.",
  stability: "돈을 한 번에 쓰기보다 남기는 구조를 만들 수 있는 편입니다.",
  luckFlow: "정보와 타이밍을 읽고 흐름에 맞춰 방향을 조정하는 힘이 있습니다.",
};

const PROFILE_WARNING_COPY: Record<keyof WealthProfile, string> = {
  moneySense: "기준 없이 움직이면 좋은 제안과 그럴듯한 유혹을 헷갈릴 수 있습니다.",
  executionPower: "팔 수 있는 형태로 내놓기 전까지 준비가 길어질 수 있습니다.",
  riskTaking: "검증 없이 키우면 수익보다 비용이 먼저 커질 수 있습니다.",
  consistency: "방향을 자주 바꾸면 경험이 쌓이기 전에 계속 초기화됩니다.",
  impulsiveness: "수입 직후의 소비나 즉흥 결제가 재물 체감을 낮출 수 있습니다.",
  socialCapital: "좋은 사람 역할만 하면 시간은 쓰고 돈은 남지 않을 수 있습니다.",
  creativity: "아이디어가 많아도 마감과 판매 구조가 없으면 취미로 남기 쉽습니다.",
  businessPotential: "직접 만들 힘은 있지만 운영 구조 없이 확장하면 피로가 먼저 옵니다.",
  stability: "돈이 들어오는 속도에 비해 머물게 하는 장치가 부족할 수 있습니다.",
  luckFlow: "분석이 길어지면 결정해야 할 타이밍을 놓칠 수 있습니다.",
};

const MONEY_MOMENT_COPY: Record<
  WealthResult["resultSignals"]["earningStyle"],
  string
> = {
  repeatTrust: "반복 거래, 정기 고객, 신뢰가 쌓이는 루틴에서 돈이 안정적으로 붙습니다.",
  contentProduct: "아이디어를 콘텐츠, 상품, 서비스로 작게 공개할 때 돈의 실마리가 생깁니다.",
  operations: "흐름을 정리하고 남들이 번거로워하는 운영을 맡을 때 수익으로 바뀝니다.",
  fastTest: "작은 제안으로 시장 반응을 빠르게 확인할 때 돈 되는 방향이 보입니다.",
  relationshipDeal: "소개, 협업, 제안처럼 사람 사이의 연결이 선명할 때 수익 기회가 커집니다.",
  expertService: "이미 해결할 수 있는 문제를 서비스나 템플릿으로 잘라 팔 때 돈이 움직입니다.",
  variableIncome: "단기 프로젝트, 시즌성 기회, 빠른 반응이 필요한 일에서 수입이 열립니다.",
  experienceAsset: "겪은 시행착오를 기록, 상담, 가이드로 바꿀 때 경험이 자산이 됩니다.",
  knowledgeAsset: "지식과 근거를 문서화해 설명 가능한 상품으로 만들 때 신뢰가 돈이 됩니다.",
  salesProposal: "호감보다 조건이 선명한 제안, 가격, 마감일을 말할 때 돈이 움직입니다.",
  marketTiming: "정보를 비교하고 들어갈 기준과 빠질 기준을 세울 때 손실을 줄입니다.",
  selfOwnedSystem: "직접 만든 판에서 고객, 가격, 반복 운영이 맞물릴 때 수익 크기가 커집니다.",
};

const RISK_PATTERN_COPY: Record<WealthResult["resultSignals"]["riskPattern"], string> = {
  lateExecution: "성과가 느리다는 이유로 돈이 되기 직전에 판을 접는 패턴입니다.",
  launchDelay: "팔 수 있는 형태로 공개하기 전에 완성도와 흥미 사이에서 멈추기 쉽습니다.",
  overCaution: "검토는 충분한데 실행의 크기가 작아 결과도 작게 남을 수 있습니다.",
  overExpansion: "초반 반응을 확신으로 오해하면 비용과 에너지가 먼저 커집니다.",
  peopleDrain: "역할, 보상, 시간을 정하지 않으면 관계는 많아도 수익이 흐려집니다.",
  underpricing: "실력이 있어도 가격을 낮게 부르면 수익보다 피로가 먼저 쌓입니다.",
  impulseLeak: "돈이 들어온 직후 즉흥 소비가 붙으면 재물 감각이 체감으로 남지 않습니다.",
  scatteredFocus: "방향을 자주 바꾸면 배운 것들이 쌓이지 못하고 계속 처음으로 돌아갑니다.",
  prepLoop: "공부와 준비가 길어지면 실전 판매가 계속 뒤로 밀릴 수 있습니다.",
  priceFear: "가격을 말하는 순간 약해지면 좋은 제안도 부탁처럼 들릴 수 있습니다.",
  analysisParalysis: "분석이 길어지면 좋은 가격과 타이밍이 먼저 지나갑니다.",
  weakStructure: "고객, 가격, 운영 기준 없이 밀면 바쁘기만 하고 남는 돈이 줄어듭니다.",
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

type ShareToast = {
  message: string;
  tone: "success" | "error";
};

type SummaryCard = {
  title: string;
  value: string;
  body: string;
};

type LockedPreview = {
  title: string;
  teaser: string;
  blurredKeyword: string;
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

function copyTextWithTextarea(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

async function copyTextToClipboard(text: string) {
  if (copyTextWithTextarea(text)) return true;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 일부 인앱 브라우저에서는 사용자 클릭 안에서도 Clipboard API가 막힐 수 있습니다.
    }
  }

  return false;
}

function getAnimalVisual(result: WealthResult) {
  return ANIMAL_VISUALS[result.animalType.animal] ?? "✨";
}

function getElementLabel(element: ElementKey) {
  return ELEMENT_META[element].label;
}

function hasFinalConsonant(value: string) {
  const chars = Array.from(value);
  const lastHangul = chars.reverse().find((char) => {
    const code = char.charCodeAt(0);
    return code >= 0xac00 && code <= 0xd7a3;
  });

  if (!lastHangul) return false;

  return (lastHangul.charCodeAt(0) - 0xac00) % 28 !== 0;
}

function withSubjectParticle(value: string) {
  return `${value}${hasFinalConsonant(value) ? "이" : "가"}`;
}

function getRankedElements(result: WealthResult) {
  return ELEMENT_KEYS.map((element) => ({
    element,
    value: result.elements[element],
  })).sort((a, b) => b.value - a.value);
}

function getTopProfileLabels(result: WealthResult) {
  return result.resultSignals.profileHighlights
    .map((key) => PROFILE_LABELS[key])
    .join(" · ");
}

function getSummaryCards(result: WealthResult): SummaryCard[] {
  const strong = result.dominantElement;
  const weak = result.weakElement;
  const instinctLabel = getTopProfileLabels(result);

  return [
    {
      title: "돈 버는 본능",
      value: instinctLabel,
      body: `${result.copy.moneyAttitude} ${PROFILE_STRENGTH_COPY[result.resultSignals.profileHighlights[0]]}`,
    },
    {
      title: "돈이 들어오는 순간",
      value: `${ELEMENT_META[strong].ability}`,
      body: MONEY_MOMENT_COPY[result.resultSignals.earningStyle],
    },
    {
      title: "돈이 새는 구멍",
      value: `${getElementLabel(weak)} 보완 필요`,
      body: RISK_PATTERN_COPY[result.resultSignals.riskPattern],
    },
  ];
}

function uniqueItems(items: string[], limit: number) {
  const seen = new Set<string>();
  const unique: string[] = [];

  items.forEach((item) => {
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    unique.push(trimmed);
  });

  return unique.slice(0, limit);
}

function getFreeStrengths(result: WealthResult) {
  return uniqueItems(
    [
      result.copy.strength,
      result.subtype.strengthAngle,
      ...result.resultSignals.profileHighlights.map(
        (key) => PROFILE_STRENGTH_COPY[key]
      ),
    ],
    3
  );
}

function getFreeWeaknesses(result: WealthResult) {
  const warnings = result.resultSignals.profileWarnings;
  const warningCopies =
    warnings.length > 0
      ? warnings.map((key) => PROFILE_WARNING_COPY[key])
      : [PROFILE_WARNING_COPY[result.resultSignals.profileHighlights[0]]];

  return uniqueItems(
    [result.copy.weakness, result.subtype.weaknessAngle, ...warningCopies],
    2
  );
}

function getPaidPreviewSections(result: WealthResult): LockedPreview[] {
  const paidReport = getPaidReportTemplate(result.templateId);
  const weakLabel = getElementLabel(result.weakElement);
  const strongLabel = getElementLabel(result.dominantElement);

  const sections: LockedPreview[] = [
    {
      title: "나에게 맞는 수익화 방식 TOP 3",
      teaser: `${paidReport.earningStyle} 특히 ${strongLabel} 기운이 강한 사람은 먼저 팔아볼 수 있는 순서를 좁히는 게 중요합니다.`,
      blurredKeyword: "순서",
    },
    {
      title: "피해야 할 돈버는 방식",
      teaser: paidReport.warning,
      blurredKeyword: "주의",
    },
    {
      title: "오행 부족분 보완 전략",
      teaser: `${weakLabel} 기운이 약한 구간을 보완하면 ${ELEMENT_META[result.weakElement].ability}이 수익화 병목을 줄여줍니다.`,
      blurredKeyword: "수익화 병목",
    },
    {
      title: "돈이 막히는 반복 패턴",
      teaser: paidReport.moneyLeakPattern,
      blurredKeyword: "반복 패턴",
    },
    {
      title: "잘 맞는 일/부업/사업 방향",
      teaser: paidReport.careerAndBusinessFit,
      blurredKeyword: "사업 방향",
    },
    {
      title: "3개월 돈버는 행동 가이드",
      teaser: `${paidReport.actionPlan.thirtyDays[0]} 이후에는 결제, 제안, 기록 루틴을 3개월 단위로 정리합니다.`,
      blurredKeyword: "3개월",
    },
    {
      title: "올해 돈 흐름 요약",
      teaser: paidReport.timingAdvice,
      blurredKeyword: "돈 흐름",
    },
  ];

  return sections.map((section) => ({
    ...section,
    blurredKeyword: section.teaser.includes(section.blurredKeyword)
      ? section.blurredKeyword
      : pickBlurredKeyword(section.teaser),
  }));
}

function pickBlurredKeyword(text: string) {
  return (
    text
      .split(/[ ,,.]/)
      .find((word) => word.replace(/[^\w가-힣]/g, "").length >= 3) ??
    text.slice(0, 3)
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

function BlurredKeywordText({
  text,
  keyword,
}: {
  text: string;
  keyword: string;
}) {
  const keywordIndex = text.indexOf(keyword);

  if (!keyword || keywordIndex < 0) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, keywordIndex)}
      <span className="select-none rounded-md bg-[#E8D8C5] px-1 text-[#6F3F2A] blur-[3px]">
        {keyword}
      </span>
      {text.slice(keywordIndex + keyword.length)}
    </>
  );
}

function ScorePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#E8D8C5] bg-[#FFFDF8] px-4 py-3 text-[#241A12]">
      <p className="text-[11px] font-bold text-[#7A6754]">{label}</p>
      <p className="mt-1 text-sm font-extrabold leading-5">{value}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className={uiTokens.eyebrow}>
        {eyebrow}
      </p>
      <h2 className={`${uiTokens.sectionTitle} mt-2`}>
        {title}
      </h2>
      {description && (
        <p className={`${uiTokens.body} mt-2`}>
          {description}
        </p>
      )}
    </div>
  );
}

function PrimaryCta({
  children,
  onClick,
  dark = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-full px-[22px] py-4 text-base font-bold shadow-[0_12px_30px_rgba(36,26,18,0.16)] transition active:scale-[0.98] ${
        dark
          ? "bg-[#241A12] text-[#FFFDF8]"
          : "bg-[#241A12] text-[#FFFDF8]"
      }`}
    >
      {children}
    </button>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shareToast, setShareToast] = useState<ShareToast | null>(null);

  const birthDate = searchParams.get("birthDate") || "";
  const birthTime = searchParams.get("birthTime") || "0";
  const genderParam = searchParams.get("gender") || "unknown";
  const calendarTypeParam = searchParams.get("calendarType") || "solar";

  useEffect(() => {
    if (!shareToast) return;

    const timeoutId = window.setTimeout(() => {
      setShareToast(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shareToast]);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return (
      <main className={uiTokens.page}>
        <section className={uiTokens.shell}>
          <div className="rounded-[32px] bg-[#241A12] p-7 text-[#FFFDF8] shadow-[0_18px_50px_rgba(36,26,18,0.18)]">
            <div className="mb-5 inline-flex rounded-full bg-[#FFFDF8]/10 px-4 py-2 text-xs font-bold text-[#F7D8A7]">
              RESULT
            </div>
            <h1 className="text-[28px] font-extrabold leading-[1.25]">
              아직 만들 결과가 없어요
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-[#FFFDF8]/70">
              생년월일과 태어난 시간을 먼저 선택하면 재물 성향 결과를 만들 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 w-full rounded-full bg-[#FFFDF8] px-[22px] py-4 text-base font-bold text-[#241A12] shadow-lg transition active:scale-[0.98]"
            >
              테스트 시작하기
            </button>
          </div>
        </section>
      </main>
    );
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

  const copy = result.copy;
  const rankedElements = getRankedElements(result);
  const dominant = result.dominantElement;
  const weak = result.weakElement;
  const summaryCards = getSummaryCards(result);
  const freeStrengths = getFreeStrengths(result);
  const freeWeaknesses = getFreeWeaknesses(result);
  const lockedSections = getPaidPreviewSections(result);
  const paidReport = getPaidReportTemplate(result.templateId);
  const interpretation = result.interpretation;
  const animalVisual = getAnimalVisual(result);
  const isPaid = false;
  const debugKey = `${birthDate}-${birthTime}-${calendarTypeParam}-${genderParam}`;
  const shareLine = `${interpretation.animalTitle} · 재물 감각 상위 ${result.topPercent}% · ${getElementLabel(dominant)} 강세 / ${getElementLabel(weak)} 보완`;

  const showToast = (message: string, tone: ShareToast["tone"] = "success") => {
    setShareToast({ message, tone });
  };

  const handlePaidCta = () => {
    // TODO: 실제 결제 플로우가 생기면 이 버튼을 checkout 또는 유료 리포트 해금 경로로 연결합니다.
    showToast("전체 재물 해석 결제 흐름을 곧 연결할 예정입니다.");
  };

  const handleSaveImage = () => {
    // TODO: 결과 카드 캡처/이미지 저장 기능을 연결합니다.
    showToast("결과 이미지 저장 기능을 준비 중입니다.");
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${copy.shareText} ${shareLine}`;
    const textWithUrl = `${text}\n${url}`;

    try {
      const copied = await copyTextToClipboard(textWithUrl);
      let shared = false;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "내 돈버는 동물 테스트 결과",
            text,
            url,
          });
          shared = true;
        } catch {
          // 공유 시트를 닫아도 클립보드 복사는 유지합니다.
        }
      }

      if (copied) {
        showToast("공유 내용과 링크를 복사했어요.");
        return;
      }

      if (!shared) {
        throw new Error("Share and clipboard unavailable");
      }

      showToast("공유 시트를 열었어요.");
    } catch {
      showToast("공유에 실패했어요. 다시 시도해주세요.", "error");
    }
  };

  return (
    <main className={`${uiTokens.page} py-6`}>
      <ResultDebugLogger debugKey={debugKey} debug={result.debug} />

      <section className="mx-auto max-w-md pb-28">
        <section className="overflow-hidden rounded-[32px] bg-[#241A12] text-[#FFFDF8] shadow-[0_18px_50px_rgba(36,26,18,0.18)]">
          <div className="px-6 pb-7 pt-7">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-full bg-[#FFFDF8]/10 px-4 py-2 text-xs font-bold text-[#F7D8A7] ring-1 ring-[#FFFDF8]/10">
                MONEY ANIMAL RESULT
              </div>
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
              돈을 버는 방식,
              <br />
              돈이 새는 지점,
              <br />
              놓치기 쉬운 기회의 패턴을
              <br />
              하나의 동물 유형으로 정리한 것입니다.
            </p>
          </div>

          <div className="grid grid-cols-3 border-t border-[#FFFDF8]/10 text-center">
            <div className="px-3 py-4">
              <p className="text-lg font-extrabold">{result.wealthScore}</p>
              <p className="mt-1 text-[11px] font-bold text-[#FFFDF8]/48">
                재물 점수
              </p>
            </div>
            <div className="border-x border-[#FFFDF8]/10 px-3 py-4">
              <p className="text-lg font-extrabold">{result.animalType.animal}</p>
              <p className="mt-1 text-[11px] font-bold text-[#FFFDF8]/48">
                동물 판정
              </p>
            </div>
            <div className="px-3 py-4">
              <p className="text-lg font-extrabold">
                {calendarTypeParam === "lunar" ? "음력" : "양력"}
              </p>
              <p className="mt-1 text-[11px] font-bold text-[#FFFDF8]/48">
                입력 기준
              </p>
            </div>
          </div>
        </section>

        <section className={`${uiTokens.card} mt-5`}>
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[28px] bg-[#FDF7EC] text-6xl shadow-[0_12px_30px_rgba(36,26,18,0.08)]">
              {animalVisual}
            </div>
            <div>
              <p className={uiTokens.caption}>재물 동물 유형</p>
              <h2 className="mt-2 text-[28px] font-extrabold leading-[1.25] text-[#241A12]">
                {interpretation.animalTitle} 유형
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-[15px] leading-7 text-[#7A6754]">
            <p>
              돈 앞에서 {interpretation.coreTendency}이 강하게 드러나는 타입입니다.
            </p>
            <p>
              사주와 오행 밸런스를 보면 {getElementLabel(dominant)}의 흐름이 두드러지고,
              {getElementLabel(weak)}은 상대적으로 약하게 나타납니다.
            </p>
            <p>
              그래서 돈을 벌 때는 {interpretation.earningStyle}에 강하지만,
              {interpretation.spendingRisk}에서 반복적으로 흔들릴 수 있습니다.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <ScorePill
              label="대표 오행"
              value={`${getElementLabel(dominant)} · ${ELEMENT_META[dominant].ability}`}
            />
            <ScorePill
              label="부족 오행"
              value={`${getElementLabel(weak)} · ${ELEMENT_META[weak].ability}`}
            />
            <ScorePill
              label="재성"
              value={`${getElementLabel(interpretation.wealthElement)} · ${interpretation.wealthScore}%`}
            />
            <ScorePill
              label="균형"
              value={interpretation.balanceLevel}
            />
          </div>

          <div className="mt-6">
            <PrimaryCta onClick={handlePaidCta}>
              내 돈이 새는 지점 확인하기
            </PrimaryCta>
            <p className="mt-3 text-center text-xs font-bold text-[#7A6754]">
              회원가입 없이 바로 확인 가능
            </p>
          </div>
        </section>

        <section className="mt-7">
          <SectionHeading
            eyebrow="FREE SUMMARY"
            title="무료 결과 핵심 3가지"
            description="좋은 말만 모으지 않고, 돈으로 바뀌는 장면과 막히는 지점을 같이 정리했습니다."
          />

          <div className="mt-4 space-y-3">
            {summaryCards.map((card, index) => (
              <article
                key={card.title}
                className={uiTokens.card}
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#241A12] text-sm font-extrabold text-[#FFFDF8]">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#B46A3C]">
                      {card.title}
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold leading-6 text-[#241A12]">
                      {card.value}
                    </h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#7A6754]">
                      {card.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`${uiTokens.card} mt-8`}>
          <SectionHeading
            eyebrow="FIVE ELEMENTS"
            title="오행 밸런스로 보는 돈버는 능력"
            description="계산된 오행 점수를 성장, 브랜딩, 관리, 구조화, 분석 능력으로 번역했습니다."
          />

          <div className="mt-6 space-y-4">
            {rankedElements.map(({ element, value }) => (
              <div key={element}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-[#241A12]">
                      {getElementLabel(element)}
                    </p>
                    <p className="text-xs font-bold text-[#7A6754]">
                      {ELEMENT_META[element].ability}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-[#241A12]">
                    {value}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#F1E4D3]">
                  <div
                    className={`h-full rounded-full ${ELEMENT_META[element].tone}`}
                    style={{ width: `${Math.max(4, value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-[18px] border border-[#E8D8C5] bg-[#FDF7EC] p-4">
              <p className="text-xs font-extrabold text-[#B46A3C]">가장 강함</p>
              <h3 className="mt-1 text-xl font-extrabold text-[#241A12]">
                {getElementLabel(dominant)}
              </h3>
              <p className="mt-2 text-xs font-semibold leading-5 text-[#7A6754]">
                {ELEMENT_META[dominant].strong}
              </p>
            </div>
            <div className="rounded-[18px] border border-[#E8D8C5] bg-[#FDF7EC] p-4">
              <p className="text-xs font-extrabold text-[#B46A3C]">보완 필요</p>
              <h3 className="mt-1 text-xl font-extrabold text-[#241A12]">
                {getElementLabel(weak)}
              </h3>
              <p className="mt-2 text-xs font-semibold leading-5 text-[#7A6754]">
                {ELEMENT_META[weak].weak}
              </p>
            </div>
          </div>

          <p className="mt-5 rounded-[18px] bg-[#FDF7EC] px-4 py-3 text-sm font-semibold leading-6 text-[#7A6754]">
            {withSubjectParticle(getElementLabel(dominant))} 강하면{" "}
            {ELEMENT_META[dominant].strong} 하지만{" "}
            {withSubjectParticle(getElementLabel(weak))} 약하면{" "}
            {ELEMENT_META[weak].weak}
          </p>
        </section>

        <section className="mt-8">
          <SectionHeading
            eyebrow="FREE DETAIL"
            title="무료 상세 해석"
            description="여기서는 성향 확인까지만 보여드립니다. 실제 수익화 순서와 행동 가이드는 전체 해석에서 열립니다."
          />

          <div className="mt-4 space-y-4">
            <article className={uiTokens.card}>
              <h3 className="text-lg font-extrabold text-[#241A12]">
                돈으로 바뀌기 쉬운 강점 3개
              </h3>
              <ul className="mt-4 space-y-3">
                {freeStrengths.map((item) => (
                  <li
                    key={item}
                    className="rounded-[18px] bg-[#FDF7EC] px-4 py-3 text-sm font-bold leading-6 text-[#241A12]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className={uiTokens.card}>
              <h3 className="text-lg font-extrabold text-[#241A12]">
                수익화를 막는 약점 2개
              </h3>
              <ul className="mt-4 space-y-3">
                {freeWeaknesses.map((item) => (
                  <li
                    key={item}
                    className="rounded-[18px] bg-[#FDF7EC] px-4 py-3 text-sm font-bold leading-6 text-[#7A6754]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className={uiTokens.card}>
              <h3 className="text-lg font-extrabold text-[#241A12]">
                돈버는 패턴
              </h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#7A6754]">
                {paidReport.moneyPattern} {interpretation.moneyStrengthText}
              </p>
            </article>

            <article className={uiTokens.card}>
              <h3 className="text-lg font-extrabold text-[#241A12]">
                실패 패턴
              </h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#7A6754]">
                {RISK_PATTERN_COPY[result.resultSignals.riskPattern]} {interpretation.moneyWeaknessText}
              </p>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] bg-[#241A12] p-6 text-[#FFFDF8] shadow-[0_18px_50px_rgba(36,26,18,0.18)]">
          <p className="text-xs font-extrabold uppercase text-[#F7D8A7]">
            NEXT QUESTION
          </p>
          <h2 className="mt-3 text-[24px] font-extrabold leading-[1.25]">
            이 동물이 보여주는 재물 신호는 아직 끝이 아닙니다.
          </h2>
          <div className="mt-4 space-y-3 text-[15px] leading-7 text-[#FFFDF8]/72">
            <p>
              {interpretation.animalTitle} 유형 안에는 반복해서 돈이 붙는 장면과 빠져나가는 지점이 같이 숨어 있습니다.
            </p>
            <p>
              무료 결과는 성향 확인까지입니다. 전체 리포트에서는 이 동물이 왜 나왔는지, 어떤 오행 흐름이 돈을 끌어오는지, 어디서 돈이 새기 쉬운지까지 이어서 봅니다.
            </p>
          </div>
          <div className="mt-5">
            <PrimaryCta onClick={handlePaidCta}>
              내 돈이 새는 지점 확인하기
            </PrimaryCta>
            <p className="mt-3 text-center text-xs font-bold text-[#FFFDF8]/50">
              회원가입 없이 바로 확인
            </p>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading
            eyebrow="LOCKED REPORT"
            title="전체 해석 미리보기"
            description="동물 유형이 보여주는 돈의 패턴을 제목과 일부 문장으로 먼저 엽니다."
          />

          {isPaid ? (
            <div className={`${uiTokens.card} mt-4`}>
              <h3 className="text-lg font-extrabold text-[#241A12]">
                {paidReport.title}
              </h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#7A6754]">
                {paidReport.overview}
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {lockedSections.map((section) => (
                <article
                  key={section.title}
                  className={uiTokens.card}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-extrabold leading-6 text-[#241A12]">
                      {section.title}
                    </h3>
                    <span className="shrink-0 rounded-full bg-[#241A12] px-3 py-1 text-xs font-extrabold text-[#FFFDF8]">
                      잠금
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#7A6754]">
                    <BlurredKeywordText
                      text={section.teaser}
                      keyword={section.blurredKeyword}
                    />
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[32px] bg-[#6F3F2A] p-6 text-[#FFFDF8] shadow-[0_18px_50px_rgba(36,26,18,0.22)]">
          <div className="rounded-full bg-[#FFFDF8] px-4 py-2 text-center text-xs font-extrabold text-[#241A12]">
            전체 재물 해석 · ₩1,900
          </div>
          <h2 className="mt-5 text-[28px] font-extrabold leading-[1.25]">
            전체 재물 해석 열기
          </h2>
          <div className="mt-4 space-y-3 text-sm font-semibold leading-7 text-[#FFFDF8]/76">
            {interpretation.paidReportHookParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <ul className="mt-5 space-y-3 text-sm font-bold leading-6 text-[#FFFDF8]/90">
            {[
              "나에게 맞는 수익화 방식 TOP 3",
              "피해야 할 돈버는 방식",
              "오행 부족분 보완 전략",
              "돈이 막히는 반복 패턴",
              "3개월 실행 가이드",
              "올해 돈 흐름 요약",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-[#FFFDF8] text-center text-xs font-extrabold leading-5 text-[#6F3F2A]">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-[24px] bg-[#FFFDF8] p-5 text-[#241A12]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-[#7A6754]">출시 기념가</p>
                <p className="mt-1 text-3xl font-extrabold">₩1,900</p>
              </div>
              <p className="text-right text-xs font-bold leading-5 text-[#7A6754]">
                결제 후 바로
                <br />
                결과 확인 가능
              </p>
            </div>
            <div className="mt-5">
              <PrimaryCta onClick={handlePaidCta} dark>
                내 돈이 새는 지점 확인하기
              </PrimaryCta>
              <p className="mt-3 text-center text-xs font-bold text-[#7A6754]">
                회원가입 없이 바로 확인
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading
            eyebrow="SHARE"
            title="결과 공유하기"
            description="캡처하고 싶은 핵심만 모아 친구에게 보여줄 수 있게 정리했습니다."
          />

          <div className={`${uiTokens.card} mt-4`}>
            <p className={uiTokens.eyebrow}>
              MONEY ANIMAL CARD
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-[#241A12] text-4xl">
                {animalVisual}
              </div>
              <div>
                <p className="text-sm font-bold text-[#7A6754]">
                  나는 {interpretation.animalTitle}
                </p>
                <h3 className="mt-1 text-xl font-extrabold leading-7 text-[#241A12]">
                  재물 감각 상위 {result.topPercent}%
                </h3>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-[#FDF7EC] p-4">
                <p className="text-xs font-extrabold text-[#B46A3C]">강한 오행</p>
                <p className="mt-1 text-lg font-extrabold text-[#241A12]">
                  {getElementLabel(dominant)}
                </p>
              </div>
              <div className="rounded-[18px] bg-[#FDF7EC] p-4">
                <p className="text-xs font-extrabold text-[#B46A3C]">부족 오행</p>
                <p className="mt-1 text-lg font-extrabold text-[#241A12]">
                  {getElementLabel(weak)}
                </p>
              </div>
            </div>
            <p className="mt-4 rounded-[18px] bg-[#FDF7EC] px-4 py-3 text-sm font-bold leading-6 text-[#7A6754]">
              {interpretation.moneyStrengthText}
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={handleSaveImage}
              className={uiTokens.secondaryButton}
            >
              결과 이미지 저장하기
            </button>
            <button
              type="button"
              onClick={handleShare}
              className={uiTokens.secondaryButton}
            >
              친구에게 공유하기
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className={uiTokens.button}
            >
              다시 테스트하기
            </button>
          </div>
        </section>

        <p className={`${uiTokens.caption} mt-7 text-center font-semibold`}>
          본 테스트는 정통 만세력 감정이 아닌 오락 및 자기이해 목적의 콘텐츠형 변환입니다.
          실제 금융, 투자, 법률, 직업 선택에 대한 전문 조언이 아닙니다.
        </p>

        <div className="fixed inset-x-0 bottom-0 z-20 bg-[#FFFDF8]/92 px-5 py-4 shadow-[0_-10px_30px_rgba(36,26,18,0.12)] backdrop-blur">
          <div className="mx-auto flex max-w-md gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-1/3 rounded-full border border-[#E8D8C5] bg-[#FFFDF8] px-3 py-4 text-sm font-extrabold text-[#241A12]"
            >
              다시
            </button>
            <button
              type="button"
              onClick={handlePaidCta}
              className="w-2/3 rounded-full bg-[#241A12] px-3 py-4 text-sm font-extrabold text-[#FFFDF8]"
            >
              내 돈이 새는 지점 확인하기
            </button>
          </div>
        </div>

        {shareToast && (
          <div
            aria-live="polite"
            className="fixed inset-x-0 bottom-24 z-30 px-5"
          >
            <p
              className={`mx-auto max-w-md rounded-2xl px-4 py-3 text-center text-sm font-bold shadow-2xl ${
                shareToast.tone === "success"
                  ? "bg-[#241A12] text-[#FFFDF8]"
                  : "bg-[#9f2d2d] text-[#FFFDF8]"
              }`}
            >
              {shareToast.message}
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
