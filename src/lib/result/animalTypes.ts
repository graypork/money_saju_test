import type { ElementKey, TemplateId } from "../score";
import type {
  ActionStyle,
  BalanceType,
  EarningStyle,
  MoneyPattern,
  RiskPattern,
  WealthStrength,
} from "./deriveResultSignals";

type TriggerValue<T extends string> = T | T[];

export type AnimalType = {
  id: string;
  templateId: TemplateId;
  name: string;
  title: string;
  animal: string;
  trigger: {
    dominant?: TriggerValue<ElementKey>;
    weak?: TriggerValue<ElementKey>;
    balanceType?: TriggerValue<BalanceType>;
    pattern?: TriggerValue<MoneyPattern>;
    actionStyle?: TriggerValue<ActionStyle>;
    riskPattern?: TriggerValue<RiskPattern>;
    earningStyle?: TriggerValue<EarningStyle>;
    wealthStrength?: TriggerValue<WealthStrength>;
  };
  freeCopy: {
    hook: string;
    summary: string;
    strength: string;
    weakness: string;
    blurredTeaser: string;
  };
  paidSections: {
    moneyPattern: string;
    riskPattern: string;
    growthStrategy: string;
    relationshipWithMoney: string;
  };
};

export const animalTypes: AnimalType[] = [
  {
    id: "turtle-accumulator",
    templateId: 1,
    name: "거북형 축적가",
    title: "느리지만 돈을 오래 남기는 거북형",
    animal: "거북",
    trigger: {
      dominant: ["earth", "metal"],
      balanceType: ["balanced", "dominant-heavy"],
      pattern: "accumulate",
      actionStyle: "steady",
      earningStyle: "repeatTrust",
      wealthStrength: ["moderate", "strong"],
    },
    freeCopy: {
      hook: "돈이 한 번에 터지는 쪽은 아닙니다. 대신 구조가 잡히면 잘 무너지지 않습니다.",
      summary: "반응이 느려도 같은 루틴을 반복할수록 돈이 남는 타입입니다.",
      strength: "오래 붙잡고 쌓는 힘이 강합니다.",
      weakness: "성과가 늦게 보이면 너무 빨리 판을 접을 수 있습니다.",
      blurredTeaser: "전체 리포트에서는 어떤 루틴을 고정해야 돈이 쌓이는지 보여줍니다.",
    },
    paidSections: {
      moneyPattern: "반복 거래, 신뢰, 경력처럼 시간이 쌓일수록 돈이 되는 구조를 분석합니다.",
      riskPattern: "포기하기 쉬운 구간과 버텨야 하는 구간을 나눕니다.",
      growthStrategy: "하나의 수익 루틴을 30일 동안 고정하는 기준을 제안합니다.",
      relationshipWithMoney: "돈을 빠르게 좇기보다 오래 남기는 방식으로 다루는 편입니다.",
    },
  },
  {
    id: "fox-creator",
    templateId: 2,
    name: "여우형 크리에이터",
    title: "감각을 돈으로 바꾸는 여우형",
    animal: "여우",
    trigger: {
      dominant: ["wood", "fire"],
      weak: ["water", "metal"],
      pattern: "create",
      actionStyle: "expressive",
      earningStyle: "contentProduct",
      wealthStrength: "moderate",
    },
    freeCopy: {
      hook: "아이디어가 돈 냄새를 먼저 맡습니다. 문제는 팔기 전에 식어버리는 순간입니다.",
      summary: "감각, 콘텐츠, 기획을 작게라도 공개할 때 수익 실마리가 생깁니다.",
      strength: "사람들이 끌리는 포인트를 빠르게 잡습니다.",
      weakness: "완성도를 붙잡다가 출시 타이밍을 놓칠 수 있습니다.",
      blurredTeaser: "전체 리포트에서는 어떤 감각을 상품으로 잘라 팔지 좁혀줍니다.",
    },
    paidSections: {
      moneyPattern: "아이디어가 콘텐츠, 상품, 서비스로 바뀌는 지점을 찾습니다.",
      riskPattern: "완벽주의와 흥미 저하가 수익화를 막는 구간을 봅니다.",
      growthStrategy: "60% 완성도에서 반응을 보고 유료화하는 순서를 제안합니다.",
      relationshipWithMoney: "돈은 감각 자체보다 감각을 보여주는 순간부터 움직입니다.",
    },
  },
  {
    id: "bear-manager",
    templateId: 3,
    name: "곰형 관리자",
    title: "지키고 불리는 곰형 관리자",
    animal: "곰",
    trigger: {
      dominant: ["earth", "metal"],
      balanceType: ["balanced", "split-power"],
      pattern: "manage",
      actionStyle: "cautious",
      riskPattern: "overCaution",
      earningStyle: "operations",
      wealthStrength: ["moderate", "strong"],
    },
    freeCopy: {
      hook: "돈을 크게 잃을 확률은 낮습니다. 대신 기회까지 너무 작게 잡을 수 있습니다.",
      summary: "정리, 관리, 반복 시스템 안에서 돈이 남는 타입입니다.",
      strength: "지출과 흐름을 통제하는 힘이 좋습니다.",
      weakness: "안전만 고르면 수익의 크기도 같이 줄어듭니다.",
      blurredTeaser: "전체 리포트에서는 안정성을 깨지 않고 성장판을 여는 방식을 봅니다.",
    },
    paidSections: {
      moneyPattern: "관리력과 시스템화가 돈으로 남는 구조를 분석합니다.",
      riskPattern: "너무 신중해서 지나치는 기회와 선택 습관을 짚습니다.",
      growthStrategy: "손실 한도를 정한 작은 실험 예산을 설계합니다.",
      relationshipWithMoney: "돈을 모으는 데 강하지만, 불리는 쪽에는 의식적인 실험이 필요합니다.",
    },
  },
  {
    id: "hawk-opportunity",
    templateId: 4,
    name: "매형 기회 포착가",
    title: "기회를 먼저 낚아채는 매형",
    animal: "매",
    trigger: {
      dominant: ["wood", "fire"],
      pattern: "opportunity",
      actionStyle: "fast",
      riskPattern: "overExpansion",
      earningStyle: "fastTest",
      wealthStrength: "strong",
    },
    freeCopy: {
      hook: "기회는 빨리 봅니다. 다만 검증 없이 커지면 돈도 같이 샙니다.",
      summary: "시장의 빈틈을 보고 빠르게 실험할수록 돈이 열립니다.",
      strength: "남들보다 빨리 움직여 첫 반응을 잡습니다.",
      weakness: "초반 반응에 취하면 확장 비용이 먼저 커집니다.",
      blurredTeaser: "전체 리포트에서는 밀어붙여도 되는 신호와 멈춰야 할 신호를 나눕니다.",
    },
    paidSections: {
      moneyPattern: "빠른 실험과 시장 반응에서 돈의 실마리를 찾습니다.",
      riskPattern: "확신과 무모함이 섞이는 구간을 구분합니다.",
      growthStrategy: "10명 반응, 3건 결제처럼 작게 검증하는 기준을 제안합니다.",
      relationshipWithMoney: "돈은 기다릴 때보다 움직일 때 붙지만, 기준 없는 속도는 위험합니다.",
    },
  },
  {
    id: "wolf-networker",
    templateId: 5,
    name: "늑대형 딜메이커",
    title: "사람을 타고 돈길이 열리는 늑대형",
    animal: "늑대",
    trigger: {
      dominant: ["fire", "water"],
      pattern: "network",
      actionStyle: "relational",
      riskPattern: "peopleDrain",
      earningStyle: "relationshipDeal",
      wealthStrength: ["moderate", "strong"],
    },
    freeCopy: {
      hook: "돈이 사람을 타고 들어옵니다. 문제는 좋은 사람 역할만 하면 남는 게 적다는 점입니다.",
      summary: "소개, 협업, 제안 속에서 수익 기회가 커지는 타입입니다.",
      strength: "사람 사이의 흐름을 읽고 기회를 만듭니다.",
      weakness: "역할과 보상을 흐리면 에너지만 쓰고 돈은 남지 않습니다.",
      blurredTeaser: "전체 리포트에서는 돈 되는 관계와 소모되는 관계를 나눠봅니다.",
    },
    paidSections: {
      moneyPattern: "평판, 소개, 협업이 실제 수익으로 연결되는 방식을 봅니다.",
      riskPattern: "거절하지 못해서 시간과 돈이 새는 패턴을 짚습니다.",
      growthStrategy: "관계를 거래로 바꾸는 제안 문장과 정산 기준을 잡습니다.",
      relationshipWithMoney: "돈은 친밀함보다 조건이 선명한 관계에서 더 잘 남습니다.",
    },
  },
  {
    id: "owl-expert",
    templateId: 6,
    name: "부엉이형 전문가",
    title: "실력을 돈으로 바꾸는 부엉이형",
    animal: "부엉이",
    trigger: {
      dominant: ["metal", "earth"],
      pattern: "expertise",
      actionStyle: "studious",
      riskPattern: "underpricing",
      earningStyle: "expertService",
      wealthStrength: ["weak", "moderate"],
    },
    freeCopy: {
      hook: "능력이 부족한 게 아닙니다. 가격을 말하는 순간 작아지는 쪽에 가깝습니다.",
      summary: "기술, 지식, 문제 해결을 작게 팔기 시작할 때 돈이 움직입니다.",
      strength: "복잡한 문제를 정리하고 해결하는 힘이 있습니다.",
      weakness: "계속 준비만 하면 실력이 통장으로 옮겨가지 않습니다.",
      blurredTeaser: "전체 리포트에서는 지금 가진 능력을 어떤 단위로 팔지 정리합니다.",
    },
    paidSections: {
      moneyPattern: "전문성을 서비스, 강의, 템플릿으로 자르는 지점을 찾습니다.",
      riskPattern: "가격을 낮게 부르거나 제안을 미루는 습관을 봅니다.",
      growthStrategy: "작은 유료 제안을 보내는 30일 플랜을 제안합니다.",
      relationshipWithMoney: "돈은 더 배운 뒤가 아니라, 해결 가능한 문제를 팔 때 움직입니다.",
    },
  },
  {
    id: "cheetah-variable",
    templateId: 7,
    name: "치타형 변동 수익러",
    title: "벌기는 빠르지만 새기도 쉬운 치타형",
    animal: "치타",
    trigger: {
      dominant: ["fire", "wood"],
      balanceType: ["missing-one", "dominant-heavy"],
      pattern: "leaky",
      actionStyle: "adaptive",
      riskPattern: "impulseLeak",
      earningStyle: "variableIncome",
      wealthStrength: ["weak", "moderate"],
    },
    freeCopy: {
      hook: "못 버는 타입은 아닙니다. 문제는 들어온 돈이 오래 머물 구조입니다.",
      summary: "빠르게 반응하고 수입 기회를 만들지만, 즉흥 선택이 돈을 새게 만들 수 있습니다.",
      strength: "기회가 생기면 바로 몸을 움직입니다.",
      weakness: "수입 직후 소비나 충동 결제가 재물 체감을 낮춥니다.",
      blurredTeaser: "전체 리포트에서는 돈이 새는 순간과 막는 규칙을 구체적으로 봅니다.",
    },
    paidSections: {
      moneyPattern: "변동성 있는 수입 기회가 생기는 장면을 분석합니다.",
      riskPattern: "기분 소비, 즉흥 결제, 수입 직후 지출 패턴을 추적합니다.",
      growthStrategy: "돈이 들어온 뒤 바로 분리하는 현실적인 규칙을 제안합니다.",
      relationshipWithMoney: "돈을 버는 속도보다 남기는 장치가 더 중요합니다.",
    },
  },
  {
    id: "camel-late-growth",
    templateId: 8,
    name: "낙타형 대기만성가",
    title: "시행착오를 자산으로 바꾸는 낙타형",
    animal: "낙타",
    trigger: {
      dominant: ["water", "earth"],
      weak: ["metal", "fire"],
      pattern: "lateGrowth",
      actionStyle: "observing",
      riskPattern: "scatteredFocus",
      earningStyle: "experienceAsset",
      wealthStrength: ["weak", "moderate"],
    },
    freeCopy: {
      hook: "늦은 게 아닙니다. 겪은 일을 돈 되는 언어로 바꾸는 시간이 필요한 쪽입니다.",
      summary: "시행착오가 쌓일수록 나중에 팔 수 있는 경험 자산이 됩니다.",
      strength: "버티면서 관찰하고 방향을 다시 잡는 힘이 있습니다.",
      weakness: "방향을 너무 자주 바꾸면 경험이 계속 초기화됩니다.",
      blurredTeaser: "전체 리포트에서는 버린 줄 알았던 경험의 수익화 지점을 찾습니다.",
    },
    paidSections: {
      moneyPattern: "경험, 시행착오, 관찰력이 돈으로 바뀌는 구조를 봅니다.",
      riskPattern: "흔들릴 때마다 새로 시작해서 쌓이지 않는 패턴을 짚습니다.",
      growthStrategy: "30일 동안 한 방향을 고정하고 기록을 자산화하는 방식을 제안합니다.",
      relationshipWithMoney: "돈은 빠른 증명보다 경험을 편집하는 힘에서 열립니다.",
    },
  },
  {
    id: "tusk-knowledge",
    templateId: 9,
    name: "코끼리형 지식 설계자",
    title: "지식을 묵직하게 돈으로 바꾸는 코끼리형",
    animal: "코끼리",
    trigger: {
      dominant: ["metal", "earth"],
      pattern: "knowledge",
      actionStyle: "studious",
      riskPattern: "prepLoop",
      earningStyle: "knowledgeAsset",
      wealthStrength: ["weak", "moderate"],
    },
    freeCopy: {
      hook: "공부한 만큼 벌려면, 지식을 팔 수 있는 형태로 잘라야 합니다.",
      summary: "자격, 기록, 체크리스트, 설명력이 돈의 근거가 되는 타입입니다.",
      strength: "근거를 쌓고 신뢰를 만드는 힘이 좋습니다.",
      weakness: "더 준비해야 한다는 생각이 실전 판매를 밀어낼 수 있습니다.",
      blurredTeaser: "전체 리포트에서는 지식을 상담, 강의, 가이드로 바꾸는 순서를 봅니다.",
    },
    paidSections: {
      moneyPattern: "배운 내용이 상품과 신뢰로 바뀌는 연결점을 찾습니다.",
      riskPattern: "공부가 실행을 밀어내는 준비 과다 패턴을 분석합니다.",
      growthStrategy: "질문을 모아 유료 가이드로 바꾸는 30일 플랜을 제안합니다.",
      relationshipWithMoney: "돈은 지식의 양보다 지식을 꺼내 쓰는 방식에서 움직입니다.",
    },
  },
  {
    id: "lion-sales",
    templateId: 10,
    name: "사자형 설득가",
    title: "말과 제안으로 돈을 여는 사자형",
    animal: "사자",
    trigger: {
      dominant: "fire",
      pattern: "persuasion",
      actionStyle: "persuasive",
      riskPattern: "priceFear",
      earningStyle: "salesProposal",
      wealthStrength: ["moderate", "strong"],
    },
    freeCopy: {
      hook: "팔 수 있는 힘은 있습니다. 다만 가격을 말하는 순간 약해지면 기회가 지나갑니다.",
      summary: "말, 제안, 설득으로 사람의 결정을 움직일 때 돈이 열립니다.",
      strength: "상대가 원하는 포인트를 말로 잡아냅니다.",
      weakness: "거절이 두려우면 좋은 제안도 부탁처럼 들릴 수 있습니다.",
      blurredTeaser: "전체 리포트에서는 부담스럽지 않게 가격을 말하는 구조를 잡습니다.",
    },
    paidSections: {
      moneyPattern: "제안과 설득이 수익으로 이어지는 장면을 분석합니다.",
      riskPattern: "돈 얘기에서 약해지는 말투와 타이밍을 짚습니다.",
      growthStrategy: "제안 문장, 가격, 마감일을 짧게 말하는 훈련 플랜을 제안합니다.",
      relationshipWithMoney: "돈은 호감보다 명확한 제안에서 더 잘 움직입니다.",
    },
  },
  {
    id: "raven-analyst",
    templateId: 11,
    name: "까마귀형 분석가",
    title: "흐름을 읽고 선별하는 까마귀형",
    animal: "까마귀",
    trigger: {
      dominant: ["metal", "water"],
      pattern: "analysis",
      actionStyle: "analytical",
      riskPattern: "analysisParalysis",
      earningStyle: "marketTiming",
      wealthStrength: ["moderate", "strong"],
    },
    freeCopy: {
      hook: "돈 냄새를 맡는 감각은 있습니다. 오래 재다가 좋은 가격을 보내는 게 문제입니다.",
      summary: "정보를 비교하고 기준을 세울수록 돈 되는 선택을 잘 골라냅니다.",
      strength: "숫자와 흐름을 보고 아닌 것을 걸러냅니다.",
      weakness: "분석이 길어지면 실행 타이밍을 놓칠 수 있습니다.",
      blurredTeaser: "전체 리포트에서는 들어갈 조건과 빠질 조건을 나눠줍니다.",
    },
    paidSections: {
      moneyPattern: "정보, 타이밍, 비교 판단이 돈으로 연결되는 방식을 봅니다.",
      riskPattern: "확신 과잉과 분석 지연이 손실로 바뀌는 구간을 짚습니다.",
      growthStrategy: "진입 조건, 중단 조건, 손실 한도를 먼저 적는 기준표를 제안합니다.",
      relationshipWithMoney: "돈은 감정이 아니라 기준을 세운 뒤 움직일 때 덜 흔들립니다.",
    },
  },
  {
    id: "horse-independent",
    templateId: 12,
    name: "야생마형 독립 사업가",
    title: "직접 판을 만들어야 힘이 나는 야생마형",
    animal: "야생마",
    trigger: {
      dominant: ["wood", "fire", "metal"],
      pattern: "independent",
      actionStyle: "independent",
      riskPattern: "weakStructure",
      earningStyle: "selfOwnedSystem",
      wealthStrength: "strong",
    },
    freeCopy: {
      hook: "남이 만든 판에 오래 있으면 힘이 빠집니다. 직접 만들 때 돈의 크기가 커집니다.",
      summary: "기획, 실행, 실험을 직접 굴릴 때 수익 가능성이 살아납니다.",
      strength: "없는 판을 만들고 밀어붙이는 힘이 있습니다.",
      weakness: "운영 구조 없이 감으로 확장하면 바쁘기만 하고 남는 돈이 줄어듭니다.",
      blurredTeaser: "전체 리포트에서는 아이디어를 수익 모델과 운영 구조로 쪼갭니다.",
    },
    paidSections: {
      moneyPattern: "직접 만든 판에서 수익이 커지는 조건을 분석합니다.",
      riskPattern: "시스템 없이 혼자 밀어붙이다 지치는 패턴을 봅니다.",
      growthStrategy: "고객, 가격, 반복 운영을 기준으로 작은 사업 검증 순서를 제안합니다.",
      relationshipWithMoney: "돈은 자유롭게 움직일 때 붙지만, 오래 가려면 구조가 먼저입니다.",
    },
  },
];
