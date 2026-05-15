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

type TypePatternDetail = {
  label: string;
  text: string;
};

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
  symbolicTitle: string;
  sajuBasisText: string;
  realitySceneText: string;
  directAdviceText: string;
  actionPrescription: Array<{
    label: string;
    text: string;
  }>;
  typePatternDetails: TypePatternDetail[];
  coreTendency: string;
  moneyStrengthText: string;
  moneyWeaknessText: string;
  paidReportHookText: string;
  paidReportHookParagraphs: string[];
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

const ELEMENT_LABEL: Record<ElementKey, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

const EARNING_STYLE_TEXT: Record<EarningStyle, string> = {
  repeatTrust: "반복 거래와 신뢰가 쌓이는 구조",
  contentProduct: "아이디어를 콘텐츠나 상품으로 공개하는 방식",
  operations: "복잡한 흐름을 정리하고 운영으로 바꾸는 방식",
  fastTest: "작게 제안하고 빠르게 반응을 보는 방식",
  relationshipDeal: "소개, 협업, 제안처럼 사람 사이에서 열리는 방식",
  expertService: "해결 가능한 문제를 서비스 단위로 잘라 파는 방식",
  variableIncome: "시즌성 기회와 빠른 반응에서 생기는 변동 수입",
  experienceAsset: "겪은 시행착오를 기록과 작은 자료로 바꾸는 방식",
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

const SYMBOLIC_TITLE_BY_EARNING: Record<EarningStyle, string> = {
  repeatTrust: "돈밭은 천천히 넓어지고, 오래 지킬수록 힘이 나는 흐름입니다.",
  contentProduct: "돈 냄새는 빠르게 맡지만, 팔리는 구조가 필요한 흐름입니다.",
  operations: "계산은 단단하지만, 기회까지 너무 작게 잡을 수 있는 흐름입니다.",
  fastTest: "기회는 빨리 보지만, 출구 관리가 같이 필요한 흐름입니다.",
  relationshipDeal: "사람을 통해 돈길이 열리지만, 역할 경계가 필요한 흐름입니다.",
  expertService: "실력은 쌓여 있고, 이제 가격으로 꺼내는 연습이 필요한 흐름입니다.",
  variableIncome: "돈은 빨리 들어오지만, 빠져나가는 문도 같이 열리기 쉬운 흐름입니다.",
  experienceAsset: "늦어 보인 경험도 정리하면 돈이 되는 흐름입니다.",
  knowledgeAsset: "근거는 충분하지만, 출시 타이밍을 앞당겨야 하는 흐름입니다.",
  salesProposal: "설득력은 살아 있지만, 가격 앞에서 작아지지 않는 구조가 필요합니다.",
  marketTiming: "계산은 빠른데, 실행 타이밍이 늦어지기 쉬운 흐름입니다.",
  selfOwnedSystem: "직접 판을 만들 힘은 있지만, 운영 기준이 필요한 흐름입니다.",
};

const RELATION_BASIS_TEXT: Record<ResultSignals["dominantRelation"], string> = {
  peer: "비겁 흐름이 두드러져 관계, 경쟁, 협업 속에서 돈 감각이 살아납니다.",
  output: "식상 흐름이 두드러져 표현, 결과물, 상품화가 수익의 출발점이 됩니다.",
  wealth: "재성 흐름이 두드러져 거래, 계산, 현금화 감각이 비교적 직접적으로 작동합니다.",
  career: "관성 흐름이 두드러져 기준, 책임감, 압박감, 분석력이 돈의 흐름에 영향을 줍니다.",
  resource: "인성 흐름이 두드러져 학습, 회복, 레퍼런스가 수익의 기반이 됩니다.",
};

const ELEMENT_STRENGTH_BASIS: Record<ElementKey, string> = {
  wood: "아이디어와 확장 방향을 먼저 봅니다",
  fire: "표현, 노출, 브랜딩 반응을 먼저 봅니다",
  earth: "현실감각, 축적, 관리 기준을 먼저 봅니다",
  metal: "기준, 판단, 가격 구조를 먼저 봅니다",
  water: "정보, 회복, 타이밍의 흐름을 먼저 봅니다",
};

const WEAK_ELEMENT_BASIS: Record<ElementKey, string> = {
  wood: "목 기운이 약하면 시작과 확장 결정을 미루기 쉽습니다.",
  fire: "화 기운이 약하면 표현, 노출, 마케팅, 감정 배출이 늦어질 수 있습니다.",
  earth: "토 기운이 약하면 돈이 머무는 구조와 관리 루틴이 흔들리기 쉽습니다.",
  metal: "금 기운이 약하면 가격, 기준, 결제 구조를 정리하는 데 시간이 걸릴 수 있습니다.",
  water: "수 기운이 약하면 회복, 충전, 여유, 도움받는 힘이 부족해지기 쉽습니다.",
};

const DAY_STRENGTH_BASIS: Record<
  WealthSajuSummary["dayStrength"]["level"],
  string
> = {
  weak: "일간이 약한 편이라 돈과 책임을 오래 감당하는 체력 배분이 중요합니다.",
  balanced: "일간은 균형권에 있어 무리한 확장보다 일정한 리듬을 만들 때 안정적입니다.",
  strong: "일간이 받쳐주는 편이라 맡은 일과 돈의 압박을 밀고 가는 힘은 있습니다.",
};

const REALITY_SCENE_BY_RISK: Record<RiskPattern, string> = {
  lateExecution:
    "준비는 해두고도 결과가 바로 안 보이면 마음이 먼저 식을 수 있습니다. 몇 번만 더 반복하면 쌓일 흐름을 너무 빨리 접는 장면이 생기기 쉽습니다.",
  launchDelay:
    "돈 될 것 같은 아이디어는 보이는데, 공개 전에 계산과 수정이 길어질 수 있습니다. 준비는 오래 하지만 실제 출시가 늦어지는 장면이 반복되기 쉽습니다.",
  overCaution:
    "작은 결제도 오래 고민하고, 필요한 투자도 한 번 더 미루기 쉽습니다. 안전함은 장점이지만 돈이 움직일 통로까지 좁아질 수 있습니다.",
  overExpansion:
    "반응이 조금만 보여도 더 크게 키우고 싶어질 수 있습니다. 검증보다 비용이 먼저 커지면 벌기 전에 지출 압박이 생기기 쉽습니다.",
  peopleDrain:
    "사람을 챙기느라 시간과 감정을 먼저 쓰고, 정작 정산이나 보상 이야기는 뒤로 밀릴 수 있습니다. 좋은 관계가 돈의 흐름을 흐리게 만들 수 있습니다.",
  underpricing:
    "실력은 있는데 가격을 말하는 순간 작아질 수 있습니다. 도와주는 일처럼 시작했다가 돈으로 연결되지 않는 장면이 생기기 쉽습니다.",
  impulseLeak:
    "돈이 들어온 직후 사고 싶던 것들이 한꺼번에 떠오르기 쉽습니다. 스트레스가 쌓인 날에는 작은 결제가 반복되며 체감 잔액이 빨리 줄 수 있습니다.",
  scatteredFocus:
    "새로운 방향이 계속 보이지만 한곳에 쌓이기 전에 흩어질 수 있습니다. 해본 일은 많은데 돈으로 남는 기록이 적어지는 장면이 생기기 쉽습니다.",
  prepLoop:
    "더 배우고 더 준비하면 좋아질 것 같아 출시가 뒤로 밀릴 수 있습니다. 지식은 늘어나는데 판매 경험은 부족해지는 흐름입니다.",
  priceFear:
    "제안은 할 수 있는데 가격을 말하는 순간 말이 약해질 수 있습니다. 좋은 기회도 부탁처럼 들리면 수익으로 이어지기 어렵습니다.",
  analysisParalysis:
    "계산은 빠른데 실행 전 확인할 것이 계속 늘어날 수 있습니다. 확신이 생겼을 때 이미 가격이나 타이밍이 지나 있는 장면이 생기기 쉽습니다.",
  weakStructure:
    "하고 싶은 일은 크게 보이지만 운영 기준이 늦게 잡힐 수 있습니다. 바쁘게 움직였는데 남는 돈보다 피로가 먼저 커지는 흐름입니다.",
};

const DIRECT_ADVICE_BY_RISK: Record<RiskPattern, string> = {
  lateExecution: "방향을 자주 바꾸기보다, 작게 정한 루틴을 최소 일주일은 끌고 가야 합니다.",
  launchDelay: "완벽한 준비보다 작은 출시가 먼저입니다. 보여주고, 반응 보고, 다시 고치는 쪽이 맞습니다.",
  overCaution: "아끼는 것만으로는 부족합니다. 돈으로 바뀌는 작은 통로를 하나 만들어야 합니다.",
  overExpansion: "확장 전에 멈춤 기준이 필요합니다. 반응보다 비용이 먼저 커지는 순간을 잘라야 합니다.",
  peopleDrain: "좋은 사람 역할과 유료 역할을 분리해야 합니다. 조건을 말해야 돈도 관계도 덜 흐려집니다.",
  underpricing: "가격을 낮추기보다 해결 범위를 작게 자르는 편이 낫습니다. 작게 팔아봐야 기준이 생깁니다.",
  impulseLeak: "스트레스가 올라온 날의 결제는 하루 뒤로 미루는 규칙이 필요합니다.",
  scatteredFocus: "새 방향을 찾기 전에 지금 가진 경험을 하나의 판매 단위로 묶어야 합니다.",
  prepLoop: "더 배우기 전에 이미 아는 것을 작게 팔아봐야 합니다. 판매 경험도 실력입니다.",
  priceFear: "가격을 말하는 연습이 필요합니다. 설명보다 금액, 범위, 마감이 먼저 보여야 합니다.",
  analysisParalysis: "계산만 길게 하지 말고 작게 팔아봐야 합니다. 기준은 실전 반응 속에서 빨라집니다.",
  weakStructure: "감으로 확장하기보다 고객, 가격, 반복 업무를 먼저 적어야 합니다.",
};

const FIVE_DAY_ACTION_BY_RISK: Record<RiskPattern, string> = {
  lateExecution: "성과가 늦어도 유지할 기준 1개를 정하고 중간에 바꾸지 않습니다.",
  launchDelay: "60% 완성된 결과물 하나를 공개하거나 제안할 날짜를 잡습니다.",
  overCaution: "필요한 결제와 불필요한 결제를 나눠, 미뤄둔 성장 결제 1개만 판단합니다.",
  overExpansion: "새로 쓰기 전에 멈출 비용 한도를 먼저 적습니다.",
  peopleDrain: "무료로 도와주는 일과 유료로 받을 일을 문장으로 분리합니다.",
  underpricing: "제공 범위가 작은 유료 제안 하나에 가격을 붙여봅니다.",
  impulseLeak: "감정이 올라온 날 바로 사는 소비를 표시하고 하루 뒤 다시 봅니다.",
  scatteredFocus: "새 아이디어를 시작하지 말고, 이미 한 일 하나를 기록으로 정리합니다.",
  prepLoop: "새 자료를 더 보기 전에 이미 아는 내용을 체크리스트로 만듭니다.",
  priceFear: "가격, 범위, 마감이 들어간 제안 문장 1개를 써봅니다.",
  analysisParalysis: "들어갈 기준과 멈출 기준을 각각 한 줄로 정합니다.",
  weakStructure: "반복되는 업무, 결제 방식, 고객 응대 기준을 한 장에 적습니다.",
};

const WEEK_ACTION_BY_EARNING: Record<EarningStyle, string> = {
  repeatTrust: "반복해서 제공할 수 있는 작은 루틴 상품을 하나 정리합니다.",
  contentProduct: "지금 가진 아이디어를 게시물, 샘플, 작은 상품 중 하나로 공개합니다.",
  operations: "정리해줄 수 있는 업무를 서비스 이름과 가격 범위로 적어봅니다.",
  fastTest: "작은 제안 하나를 보내고 실제 문의나 결제 반응을 봅니다.",
  relationshipDeal: "도움, 소개, 협업 중 돈으로 이어질 역할을 하나만 선명하게 정합니다.",
  expertService: "해결 가능한 문제 하나를 골라 1회성 유료 서비스로 잘라봅니다.",
  variableIncome: "수입이 들어오면 바로 분리할 고정 비율과 계좌를 정합니다.",
  experienceAsset: "겪은 시행착오 하나를 다른 사람이 따라 할 수 있는 글로 정리합니다.",
  knowledgeAsset: "자주 받는 질문 5개를 모아 유료 자료의 목차로 바꿔봅니다.",
  salesProposal: "제안 문장, 가격, 마감일을 짧게 말하는 연습을 합니다.",
  marketTiming: "관심 있는 기회 하나에 진입 기준, 중단 기준, 손실 한도를 적습니다.",
  selfOwnedSystem: "고객, 가격, 전달 방식이 보이는 작은 판매 구조를 하나 그립니다.",
};

const TYPE_PATTERN_DETAILS_BY_EARNING: Record<EarningStyle, TypePatternDetail[]> = {
  repeatTrust: [
    {
      label: "돈 버는 방식",
      text: "반복 거래, 정기 고객, 관리형 부업처럼 신뢰가 쌓이는 구조에서 돈이 붙습니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "성과가 늦어 보이면 판을 너무 빨리 접고 새 방법으로 옮겨가며 흐름이 끊길 수 있습니다.",
    },
    {
      label: "자주 하는 생각",
      text: "오래 가는 게 맞지만, 이게 정말 돈이 될까 하는 의심이 자주 올라올 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "루틴과 관리는 잘 잡지만, 가격을 붙이고 제안하는 일은 뒤로 미루기 쉽습니다.",
    },
    {
      label: "주의할 패턴",
      text: "꾸준함만 남고 판매 단위가 없으면 좋은 습관이 수익으로 바뀌지 않습니다.",
    },
    {
      label: "바로 할 일",
      text: "한 달 반복할 작은 서비스나 관리형 상품 하나를 정하고 가격을 붙여봅니다.",
    },
  ],
  contentProduct: [
    {
      label: "돈 버는 방식",
      text: "아이디어, 감각, 취향을 콘텐츠나 작은 상품으로 보여줄 때 수익 실마리가 생깁니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "반응을 보기 전에 완성도만 붙잡으면 시간과 에너지가 먼저 빠져나갑니다.",
    },
    {
      label: "자주 하는 생각",
      text: "이건 돈 될 것 같은데, 아직 보여주기엔 부족하다는 생각이 길어질 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "메모와 기획은 빠르게 쌓이지만 게시, 출시, 판매 버튼 앞에서 속도가 느려집니다.",
    },
    {
      label: "주의할 패턴",
      text: "시장 반응 없이 혼자 고치기만 하면 좋은 감각도 수익으로 연결되기 어렵습니다.",
    },
    {
      label: "바로 할 일",
      text: "60% 완성된 샘플 하나를 공개하고 문의나 저장, 결제 반응을 먼저 봅니다.",
    },
  ],
  operations: [
    {
      label: "돈 버는 방식",
      text: "정리, 운영, 관리, 문서화처럼 복잡한 흐름을 깔끔하게 만드는 일에서 돈이 됩니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "안전한 선택만 반복하면 손실은 줄어도 수익이 커질 기회까지 작아질 수 있습니다.",
    },
    {
      label: "자주 하는 생각",
      text: "괜히 무리했다가 잃으면 어떡하지 하는 생각이 먼저 올라오기 쉽습니다.",
    },
    {
      label: "현실 행동",
      text: "비교, 정리, 체크는 꼼꼼하지만 제안이나 확장 결정은 오래 붙잡는 편입니다.",
    },
    {
      label: "주의할 패턴",
      text: "관리만 잘하고 성장 실험이 없으면 안정감은 있어도 수익 체감이 약해집니다.",
    },
    {
      label: "바로 할 일",
      text: "정리해줄 수 있는 업무 하나를 서비스 이름, 범위, 가격으로 적어봅니다.",
    },
  ],
  fastTest: [
    {
      label: "돈 버는 방식",
      text: "작은 제안, 빠른 테스트, 초기 반응을 잡는 일에서 돈의 흐름이 살아납니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "반응이 조금만 좋아도 비용과 규모를 먼저 키우면 벌기 전에 지출이 커집니다.",
    },
    {
      label: "자주 하는 생각",
      text: "이 타이밍은 놓치면 안 된다는 생각이 빨리 움직이게 만들 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "기회 포착은 빠르지만 검증표, 예산표, 중단 기준은 뒤늦게 챙기는 편입니다.",
    },
    {
      label: "주의할 패턴",
      text: "속도가 기준보다 앞서면 수익보다 피로와 카드값이 먼저 커질 수 있습니다.",
    },
    {
      label: "바로 할 일",
      text: "새로 키우기 전 결제 3건, 문의 10건 같은 작은 검증 기준을 먼저 정합니다.",
    },
  ],
  relationshipDeal: [
    {
      label: "돈 버는 방식",
      text: "소개, 협업, 커뮤니티, 제안처럼 사람 사이에서 역할이 선명할 때 돈이 들어옵니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "좋은 사람으로 남으려다 시간과 감정을 쓰고 정산 이야기를 미루기 쉽습니다.",
    },
    {
      label: "자주 하는 생각",
      text: "이 정도는 그냥 도와줘도 되지 않을까 하는 생각이 반복될 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "연결과 분위기 파악은 빠르지만 역할, 범위, 보상 조건은 흐려지기 쉽습니다.",
    },
    {
      label: "주의할 패턴",
      text: "관계가 좋아도 조건이 없으면 돈은 남지 않고 에너지만 빠질 수 있습니다.",
    },
    {
      label: "바로 할 일",
      text: "무료 도움과 유료 역할을 나누는 한 문장을 미리 써둡니다.",
    },
  ],
  expertService: [
    {
      label: "돈 버는 방식",
      text: "반복해서 해결해온 문제를 상담, 대행, 템플릿 같은 작은 서비스로 자를 때 돈이 됩니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "실력은 있는데 가격을 낮게 말하거나 무료 도움으로 넘기면 수익이 약해집니다.",
    },
    {
      label: "자주 하는 생각",
      text: "이 정도로 돈을 받아도 되나 하는 생각이 가격 앞에서 발목을 잡을 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "문제 해결은 잘하지만 제안서, 가격표, 서비스 이름을 만드는 일은 미루기 쉽습니다.",
    },
    {
      label: "주의할 패턴",
      text: "더 배운 뒤에 팔겠다는 생각이 길어지면 실력이 통장으로 옮겨가지 않습니다.",
    },
    {
      label: "바로 할 일",
      text: "해결 가능한 문제 하나를 골라 1회성 유료 제안으로 작게 만들어봅니다.",
    },
  ],
  variableIncome: [
    {
      label: "돈 버는 방식",
      text: "짧은 기회, 시즌성 일, 빠른 대응이 필요한 부업에서 수입 기회가 생깁니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "수입이 들어온 직후 보상 소비가 붙으면 번 돈이 머무는 시간이 짧아집니다.",
    },
    {
      label: "자주 하는 생각",
      text: "이번엔 좀 써도 되지 않나 하는 생각이 피곤한 날 더 쉽게 올라올 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "돈 벌 기회에는 빠르게 움직이지만, 들어온 돈을 분리하는 루틴은 늦어지기 쉽습니다.",
    },
    {
      label: "주의할 패턴",
      text: "버는 속도보다 쓰는 속도가 빨라지면 수입이 있어도 불안감이 남습니다.",
    },
    {
      label: "바로 할 일",
      text: "수입이 들어오면 저축, 세금, 생활비를 바로 나누는 고정 비율을 정합니다.",
    },
  ],
  experienceAsset: [
    {
      label: "돈 버는 방식",
      text: "겪어본 시행착오를 기록, 가이드, 후기, 체크리스트로 바꿀 때 돈이 됩니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "방향을 자주 바꾸면 경험이 쌓여도 판매 가능한 결과물로 남지 않습니다.",
    },
    {
      label: "자주 하는 생각",
      text: "아직 특별한 성과가 없는데 이걸 누가 필요로 할까 하는 생각이 들 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "관찰과 회고는 많지만 기록을 묶어 공개하거나 상품화하는 단계가 늦어집니다.",
    },
    {
      label: "주의할 패턴",
      text: "새 출발만 반복하면 지나온 경험이 돈 되는 언어로 정리되지 않습니다.",
    },
    {
      label: "바로 할 일",
      text: "최근 겪은 시행착오 하나를 다른 사람이 따라 할 수 있는 글로 정리합니다.",
    },
  ],
  knowledgeAsset: [
    {
      label: "돈 버는 방식",
      text: "지식, 근거, 설명력을 강의, 자료, 체크리스트, 컨설팅으로 바꿀 때 돈이 됩니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "공부와 준비가 계속 늘어나면 실행 경험이 부족해지고 출시가 뒤로 밀립니다.",
    },
    {
      label: "자주 하는 생각",
      text: "조금만 더 공부하면 더 완벽해질 텐데 하는 생각이 반복될 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "자료는 잘 모으지만 목차, 가격, 판매 페이지를 만드는 일은 늦어지기 쉽습니다.",
    },
    {
      label: "주의할 패턴",
      text: "지식의 양이 수익을 보장하지 않습니다. 꺼내 쓰는 형태가 필요합니다.",
    },
    {
      label: "바로 할 일",
      text: "자주 받는 질문 5개를 모아 작은 유료 자료의 목차로 바꿔봅니다.",
    },
  ],
  salesProposal: [
    {
      label: "돈 버는 방식",
      text: "말, 제안, 설득, 마감 조건을 선명하게 만들 때 돈이 움직입니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "가격을 말하는 순간 약해지면 좋은 제안도 부탁처럼 들릴 수 있습니다.",
    },
    {
      label: "자주 하는 생각",
      text: "거절당하면 어쩌지, 너무 세게 보이면 어쩌지 하는 생각이 올라올 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "상대가 원하는 포인트는 잘 잡지만 금액, 범위, 마감일은 흐리게 말하기 쉽습니다.",
    },
    {
      label: "주의할 패턴",
      text: "호감만 쌓고 결정을 요청하지 않으면 대화는 좋아도 매출은 남지 않습니다.",
    },
    {
      label: "바로 할 일",
      text: "제안 문장 하나에 가격, 제공 범위, 마감일을 반드시 넣어봅니다.",
    },
  ],
  marketTiming: [
    {
      label: "돈 버는 방식",
      text: "정보를 비교하고 들어갈 기준과 빠질 기준을 세울 때 돈 되는 선택을 잘 고릅니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "분석이 길어지면 좋은 가격, 좋은 타이밍, 좋은 제안이 먼저 지나갈 수 있습니다.",
    },
    {
      label: "자주 하는 생각",
      text: "근거가 하나만 더 있으면 움직일 수 있을 것 같다는 생각이 길어질 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "비교와 판단은 빠르지만 실제 결제, 제안, 실행 버튼 앞에서 한 번 더 멈춥니다.",
    },
    {
      label: "주의할 패턴",
      text: "틀리지 않으려는 마음이 커지면 맞출 기회보다 놓친 기회가 많아질 수 있습니다.",
    },
    {
      label: "바로 할 일",
      text: "관심 있는 기회 하나에 진입 기준, 중단 기준, 손실 한도를 한 줄씩 적습니다.",
    },
  ],
  selfOwnedSystem: [
    {
      label: "돈 버는 방식",
      text: "직접 만든 상품, 채널, 고객군, 운영 방식이 맞물릴 때 수익이 커집니다.",
    },
    {
      label: "돈이 새는 지점",
      text: "운영 기준 없이 감으로 확장하면 바쁘기만 하고 남는 돈이 줄어듭니다.",
    },
    {
      label: "자주 하는 생각",
      text: "남이 만든 틀보다 직접 해보는 게 빠르겠다는 생각이 강하게 올라올 수 있습니다.",
    },
    {
      label: "현실 행동",
      text: "아이디어와 실행은 빠르지만 고객 응대, 가격, 반복 업무 기준은 늦게 잡힙니다.",
    },
    {
      label: "주의할 패턴",
      text: "자유롭게 움직이는 힘이 구조 없이 커지면 매출보다 피로가 먼저 쌓입니다.",
    },
    {
      label: "바로 할 일",
      text: "고객, 가격, 전달 방식, 반복 업무를 한 장짜리 운영표로 정리합니다.",
    },
  ],
};

function getMoneyStrengthText(
  earningStyle: EarningStyle
) {
  return `현실에서는 ${EARNING_STYLE_TEXT[earningStyle]}에서 돈의 흐름이 살아나는 편입니다.`;
}

function getMoneyWeaknessText(
  riskPattern: RiskPattern
) {
  return `반대로 ${SPENDING_RISK_TEXT[riskPattern]}이 반복되면 벌어도 체감이 약해질 수 있습니다.`;
}

function getSajuBasisText(
  saju: WealthSajuSummary,
  signals: ResultSignals,
  wealthElement: ElementKey,
  wealthStrengthText: string
) {
  return `${RELATION_BASIS_TEXT[signals.dominantRelation]} ${ELEMENT_LABEL[signals.strongest]} 기운은 ${ELEMENT_STRENGTH_BASIS[signals.strongest]}. ${WEAK_ELEMENT_BASIS[signals.weakest]} 재성은 ${ELEMENT_LABEL[wealthElement]}이고 현재 재물 흐름은 ${wealthStrengthText}으로 보입니다. ${DAY_STRENGTH_BASIS[saju.dayStrength.level]}`;
}

function getActionPrescription(signals: ResultSignals) {
  return [
    {
      label: "3일",
      text: "작은 결제와 자동결제를 점검하고, 계속 새는 항목 1개만 멈춥니다.",
    },
    {
      label: "5일",
      text: FIVE_DAY_ACTION_BY_RISK[signals.riskPattern],
    },
    {
      label: "1주",
      text: WEEK_ACTION_BY_EARNING[signals.earningStyle],
    },
  ];
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
  const symbolicTitle = SYMBOLIC_TITLE_BY_EARNING[signals.earningStyle];
  const sajuBasisText = getSajuBasisText(
    saju,
    signals,
    wealthElement,
    wealthStrengthText
  );
  const realitySceneText = REALITY_SCENE_BY_RISK[signals.riskPattern];
  const directAdviceText = DIRECT_ADVICE_BY_RISK[signals.riskPattern];
  const actionPrescription = getActionPrescription(signals);
  const typePatternDetails = TYPE_PATTERN_DETAILS_BY_EARNING[signals.earningStyle];
  const moneyStrengthText = getMoneyStrengthText(
    signals.earningStyle
  );
  const moneyWeaknessText = getMoneyWeaknessText(
    signals.riskPattern
  );
  const paidReportHookParagraphs = [
    `${animalTitle}에 숨어 있는 돈의 반복 패턴이 있습니다.`,
    `${ELEMENT_LABEL[signals.weakest]} 기운이 약하게 드러나는 지점과 ${wealthStrengthText}인 재물 흐름이 어디서 연결되는지 봐야 합니다.`,
    "월급, 카드값, 작은 결제, 좋은 기회 앞에서 비슷한 선택이 반복되는 이유를 더 구체적으로 확인합니다.",
    "전체 리포트에서는 돈이 들어오는 방식과 새어나가는 지점을 오행 밸런스 기준으로 정리합니다.",
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
    symbolicTitle,
    sajuBasisText,
    realitySceneText,
    directAdviceText,
    actionPrescription,
    typePatternDetails,
    coreTendency,
    moneyStrengthText,
    moneyWeaknessText,
    paidReportHookText: paidReportHookParagraphs.join(" "),
    paidReportHookParagraphs,
  };
}
