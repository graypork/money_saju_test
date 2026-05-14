import type {
  ElementKey,
  WealthElementScores,
  WealthSajuSummary,
} from "../score";
import type { AnimalType } from "./animalTypes";
import type {
  EarningStyle,
  ResultSignals,
  RiskPattern,
  WealthStrength,
} from "./deriveResultSignals";

export type WealthInterpretation = {
  dayMaster: string;
  elementScores: WealthElementScores;
  strongestElement: ElementKey;
  weakestElement: ElementKey;
  balanceLevel: string;
  wealthElement: ElementKey;
  wealthScore: number;
  wealthStrength: WealthStrength;
  wealthStrengthText: string;
  earningStyle: string;
  spendingRisk: string;
  opportunityStyle: string;
  animalType: string;
  animalTitle: string;
  animalSummary: string;
  coreTendency: string;
  moneyStrengthText: string;
  moneyWeaknessText: string;
  paidReportHookText: string;
  paidReportHookParagraphs: string[];
};

const ELEMENT_LABEL: Record<ElementKey, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

const WEALTH_ELEMENT_BY_DAY_ELEMENT: Record<ElementKey, ElementKey> = {
  wood: "earth",
  fire: "metal",
  earth: "water",
  metal: "wood",
  water: "fire",
};

const BALANCE_LEVEL: Record<ResultSignals["balanceType"], string> = {
  balanced: "오행 균형이 비교적 안정적인 흐름",
  "missing-one": "한 오행이 약해 병목이 생기기 쉬운 흐름",
  "dominant-heavy": "강한 기운이 선명하게 앞서는 흐름",
  "split-power": "두 기운이 함께 강하게 드러나는 흐름",
  uneven: "강약 차이가 뚜렷하게 나타나는 흐름",
};

const WEALTH_STRENGTH_TEXT: Record<WealthStrength, string> = {
  strong: "재성이 강하게 드러나는 편",
  moderate: "재성이 보통 범위에서 작동하는 편",
  weak: "재성이 약하게 드러나 보완이 필요한 편",
};

const EARNING_STYLE_TEXT: Record<EarningStyle, string> = {
  repeatTrust: "반복 거래와 신뢰가 쌓이는 구조",
  contentProduct: "아이디어를 콘텐츠나 상품으로 공개하는 방식",
  operations: "복잡한 흐름을 정리하고 운영으로 바꾸는 방식",
  fastTest: "작게 제안하고 빠르게 반응을 보는 방식",
  relationshipDeal: "소개, 협업, 제안처럼 사람 사이에서 열리는 방식",
  expertService: "해결 가능한 문제를 서비스 단위로 잘라 파는 방식",
  variableIncome: "시즌성 기회와 빠른 반응에서 생기는 변동 수입",
  experienceAsset: "겪은 시행착오를 기록과 가이드로 바꾸는 방식",
  knowledgeAsset: "지식과 근거를 설명 가능한 상품으로 만드는 방식",
  salesProposal: "명확한 제안, 가격, 마감으로 결정을 끌어내는 방식",
  marketTiming: "정보를 비교하고 들어갈 기준과 빠질 기준을 세우는 방식",
  selfOwnedSystem: "직접 만든 판에서 고객, 가격, 운영을 연결하는 방식",
};

const OPPORTUNITY_STYLE_TEXT: Record<EarningStyle, string> = {
  repeatTrust: "꾸준한 재구매와 소개가 보일 때",
  contentProduct: "작게 공개한 콘텐츠나 상품에 반응이 붙을 때",
  operations: "남들이 번거로워하는 정리와 운영을 맡을 때",
  fastTest: "작은 제안으로 첫 결제나 문의가 들어올 때",
  relationshipDeal: "관계 안에서 역할과 보상이 선명해질 때",
  expertService: "반복해서 해결해온 문제가 유료 서비스로 잘릴 때",
  variableIncome: "짧은 기회에 빠르게 움직여야 할 때",
  experienceAsset: "지나온 경험이 누군가의 시행착오를 줄여줄 때",
  knowledgeAsset: "배운 내용을 체크리스트나 설명 자료로 만들 때",
  salesProposal: "상대가 원하는 조건을 가격과 제안으로 말할 때",
  marketTiming: "데이터와 분위기가 같은 방향을 가리킬 때",
  selfOwnedSystem: "작은 고객군, 가격, 반복 운영이 맞물릴 때",
};

const SPENDING_RISK_TEXT: Record<RiskPattern, string> = {
  lateExecution: "성과가 느리면 돈이 되기 직전 판을 접는 흐름",
  launchDelay: "팔 수 있는 형태로 내놓기 전에 준비가 길어지는 흐름",
  overCaution: "안전한 선택만 남기다 수익의 크기도 같이 줄이는 흐름",
  overExpansion: "초반 반응을 확신으로 보고 비용을 먼저 키우는 흐름",
  peopleDrain: "관계와 역할은 많아지지만 보상 기준이 흐려지는 흐름",
  underpricing: "실력을 낮은 가격으로 내놓아 피로가 먼저 쌓이는 흐름",
  impulseLeak: "수입 직후 즉흥 소비와 결제가 붙는 흐름",
  scatteredFocus: "방향을 자주 바꿔 경험이 축적되기 전에 초기화되는 흐름",
  prepLoop: "공부와 준비가 실전 판매를 계속 밀어내는 흐름",
  priceFear: "가격을 말하는 순간 제안의 힘이 약해지는 흐름",
  analysisParalysis: "분석이 길어져 좋은 가격과 타이밍을 보내는 흐름",
  weakStructure: "고객, 가격, 운영 기준 없이 바쁘게만 굴러가는 흐름",
};

const CORE_TENDENCY_BY_EARNING: Record<EarningStyle, string> = {
  repeatTrust: "천천히 신뢰를 쌓아 돈을 오래 남기는 성향",
  contentProduct: "감각과 아이디어를 눈에 보이는 결과물로 바꾸는 성향",
  operations: "흐름을 정리해 돈이 머물 구조를 만드는 성향",
  fastTest: "기회를 보면 작게라도 먼저 던져보는 성향",
  relationshipDeal: "사람 사이의 연결에서 수익 기회를 읽는 성향",
  expertService: "알고 있는 것을 문제 해결 단위로 바꾸는 성향",
  variableIncome: "빠른 반응과 변동성 속에서 기회를 잡는 성향",
  experienceAsset: "시행착오를 나중에 팔 수 있는 자산으로 바꾸는 성향",
  knowledgeAsset: "지식과 근거를 신뢰의 언어로 쌓는 성향",
  salesProposal: "말과 제안으로 돈의 문을 여는 성향",
  marketTiming: "정보와 타이밍을 읽고 선별하는 성향",
  selfOwnedSystem: "직접 판을 만들 때 힘이 살아나는 성향",
};

function getElementLabel(element: ElementKey) {
  return ELEMENT_LABEL[element];
}

function getMoneyStrengthText(
  animalTitle: string,
  strongestElement: ElementKey,
  earningStyle: EarningStyle
) {
  return `${animalTitle} 안에서는 ${getElementLabel(
    strongestElement
  )} 기운이 ${EARNING_STYLE_TEXT[earningStyle]}으로 이어질 때 돈이 붙는 경향이 있습니다.`;
}

function getMoneyWeaknessText(
  weakestElement: ElementKey,
  riskPattern: RiskPattern,
  wealthStrength: WealthStrength
) {
  return `${getElementLabel(
    weakestElement
  )} 기운이 약하게 나타나는 지점에서는 ${SPENDING_RISK_TEXT[
    riskPattern
  ]}이 반복될 수 있습니다. 특히 ${WEALTH_STRENGTH_TEXT[
    wealthStrength
  ]}이라 수입과 소비의 연결 방식을 따로 확인해야 합니다.`;
}

export function buildWealthInterpretation({
  elements,
  saju,
  signals,
  animalType,
  animalTitle,
}: {
  elements: WealthElementScores;
  saju: WealthSajuSummary;
  signals: ResultSignals;
  animalType: AnimalType;
  animalTitle: string;
}): WealthInterpretation {
  const wealthElement = WEALTH_ELEMENT_BY_DAY_ELEMENT[saju.dayElement];
  const wealthStrengthText = WEALTH_STRENGTH_TEXT[signals.wealthStrength];
  const coreTendency = CORE_TENDENCY_BY_EARNING[signals.earningStyle];
  const animalSummary = `${animalType.name}은 ${coreTendency}을 시각적으로 보여주는 동물 유형입니다.`;
  const moneyStrengthText = getMoneyStrengthText(
    animalTitle,
    signals.strongest,
    signals.earningStyle
  );
  const moneyWeaknessText = getMoneyWeaknessText(
    signals.weakest,
    signals.riskPattern,
    signals.wealthStrength
  );
  const paidReportHookParagraphs = [
    "이 동물이 나온 이유에는 더 깊은 돈의 패턴이 숨어 있습니다.",
    "겉으로 보이는 유형은 시작입니다.",
    `진짜 확인해야 할 건 이 유형이 왜 나왔는지, 어떤 오행 흐름이 돈을 끌어오고, 어디서 돈이 새기 쉬운지입니다.`,
    `전체 리포트에서는 ${animalTitle} 유형의 재물 흐름, ${getElementLabel(
      signals.weakest
    )} 기운이 돈의 흐름에 미치는 영향, ${wealthStrengthText} 재성 상태가 수입과 소비 패턴에 연결되는 방식, 그리고 지금 바꿔야 할 돈 습관까지 확인할 수 있습니다.`,
  ];

  return {
    dayMaster: saju.dayMaster,
    elementScores: elements,
    strongestElement: signals.strongest,
    weakestElement: signals.weakest,
    balanceLevel: BALANCE_LEVEL[signals.balanceType],
    wealthElement,
    wealthScore: signals.wealthScore,
    wealthStrength: signals.wealthStrength,
    wealthStrengthText,
    earningStyle: EARNING_STYLE_TEXT[signals.earningStyle],
    spendingRisk: SPENDING_RISK_TEXT[signals.riskPattern],
    opportunityStyle: OPPORTUNITY_STYLE_TEXT[signals.earningStyle],
    animalType: animalType.name,
    animalTitle,
    animalSummary,
    coreTendency,
    moneyStrengthText,
    moneyWeaknessText,
    paidReportHookText: paidReportHookParagraphs.join(" "),
    paidReportHookParagraphs,
  };
}
