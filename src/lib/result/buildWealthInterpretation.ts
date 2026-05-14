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
  balanced: "균형",
  "missing-one": "보완 필요",
  "dominant-heavy": "쏠림",
  "split-power": "양강",
  uneven: "불균형",
};

const WEALTH_STRENGTH_TEXT: Record<WealthStrength, string> = {
  strong: "강함",
  moderate: "보통",
  weak: "약함",
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
  lateExecution: "판을 너무 빨리 접는 흐름",
  launchDelay: "내놓기 전 준비가 길어지는 흐름",
  overCaution: "안전만 고르다 기회를 줄이는 흐름",
  overExpansion: "반응보다 비용이 먼저 커지는 흐름",
  peopleDrain: "관계에 에너지가 새는 흐름",
  underpricing: "가격을 낮게 잡는 흐름",
  impulseLeak: "수입 직후 소비가 붙는 흐름",
  scatteredFocus: "방향이 자주 바뀌는 흐름",
  prepLoop: "준비가 실행을 밀어내는 흐름",
  priceFear: "가격을 말할 때 약해지는 흐름",
  analysisParalysis: "분석하다 타이밍을 보내는 흐름",
  weakStructure: "운영 기준 없이 바빠지는 흐름",
};

const CORE_TENDENCY_BY_EARNING: Record<EarningStyle, string> = {
  repeatTrust: "차곡차곡 모으는 힘이 강한",
  contentProduct: "감각을 결과물로 바꾸는",
  operations: "정리하고 관리하는 힘이 강한",
  fastTest: "기회를 빠르게 낚아채는",
  relationshipDeal: "관계 속 기회를 읽는",
  expertService: "지식을 돈으로 바꾸는",
  variableIncome: "빠르게 벌지만 새기도 쉬운",
  experienceAsset: "천천히 흐름을 쌓는",
  knowledgeAsset: "근거를 모아 신뢰를 만드는",
  salesProposal: "말과 제안으로 움직이는",
  marketTiming: "흐름을 읽고 선별하는",
  selfOwnedSystem: "직접 판을 만드는",
};

const TITLE_MODIFIER_BY_PATTERN: Record<ResultSignals["moneyPattern"], string> = {
  accumulate: "축적형",
  create: "감각형",
  manage: "관리형",
  opportunity: "사냥형",
  network: "관계형",
  expertise: "지식형",
  leaky: "누수형",
  lateGrowth: "신중형",
  knowledge: "지식형",
  persuasion: "설득형",
  analysis: "흐름형",
  independent: "개척형",
};

function getElementLabel(element: ElementKey) {
  return ELEMENT_LABEL[element];
}

function getMoneyStrengthText(
  strongestElement: ElementKey,
  earningStyle: EarningStyle
) {
  return `${getElementLabel(strongestElement)} 기운이 ${EARNING_STYLE_TEXT[earningStyle]}으로 이어지는 흐름이 보입니다.`;
}

function getMoneyWeaknessText(
  weakestElement: ElementKey,
  riskPattern: RiskPattern
) {
  return `다만 ${getElementLabel(weakestElement)} 기운이 약해 ${SPENDING_RISK_TEXT[riskPattern]}이 반복될 수 있습니다.`;
}

export function buildWealthInterpretation({
  elements,
  saju,
  signals,
  animalType,
}: {
  elements: WealthElementScores;
  saju: WealthSajuSummary;
  signals: ResultSignals;
  animalType: AnimalType;
}): WealthInterpretation {
  const wealthElement = WEALTH_ELEMENT_BY_DAY_ELEMENT[saju.dayElement];
  const wealthStrengthText = WEALTH_STRENGTH_TEXT[signals.wealthStrength];
  const coreTendency = CORE_TENDENCY_BY_EARNING[signals.earningStyle];
  const animalTitle = `${TITLE_MODIFIER_BY_PATTERN[signals.moneyPattern]} ${animalType.animal}`;
  const animalSummary = `${coreTendency} 타입입니다.`;
  const moneyStrengthText = getMoneyStrengthText(
    signals.strongest,
    signals.earningStyle
  );
  const moneyWeaknessText = getMoneyWeaknessText(
    signals.weakest,
    signals.riskPattern
  );
  const paidReportHookParagraphs = [
    "이 동물이 나온 이유에는 더 깊은 돈의 패턴이 숨어 있습니다.",
    "겉으로 보이는 유형은 시작입니다.",
    "왜 이런 방식으로 돈이 들어오고, 어디서 자꾸 빠져나가는지까지 봐야 진짜 흐름이 보입니다.",
    "전체 리포트에서 오행 밸런스와 재물 흐름을 더 구체적으로 확인해보세요.",
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
