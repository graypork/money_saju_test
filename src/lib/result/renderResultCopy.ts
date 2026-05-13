import type { ElementKey } from "../score";
import type { AnimalType } from "./animalTypes";
import type { ResultSignals } from "./deriveResultSignals";

export type ResultPaidPreviewSection = {
  title: string;
  teaser: string;
  blurredKeyword: string;
};

export type RenderedResultCopy = {
  title: string;
  subtitle: string;
  hook: string;
  oneLineDiagnosis: string;
  summary: string;
  moneyAttitude: string;
  strength: string;
  weakness: string;
  polarity: {
    modifier: string;
    badge: string;
    summary: string;
    strength: string;
    caution: string;
  };
  paidPreview: string;
  paidSections: ResultPaidPreviewSection[];
  cautions: string[];
  logic: string[];
  shareText: string;
};

const ELEMENT_LABEL: Record<ElementKey, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

const DOMINANT_TRANSLATION: Record<ElementKey, string> = {
  wood: "새 판을 열고 키우는 쪽으로 먼저 반응합니다",
  fire: "사람의 시선, 반응, 설득 포인트에 먼저 꽂힙니다",
  earth: "돈을 남길 구조와 안정감을 먼저 봅니다",
  metal: "숫자, 기준, 손익 계산에 먼저 손이 갑니다",
  water: "정보 흐름과 타이밍을 먼저 읽습니다",
};

const WEAK_TRANSLATION: Record<ElementKey, string> = {
  wood: "시작과 확장을 미루면 기회가 작아질 수 있습니다",
  fire: "드러내고 팔아야 할 때 뒤로 물러날 수 있습니다",
  earth: "관리 구조가 약하면 번 돈이 오래 머물지 않습니다",
  metal: "기준 없이 움직이면 좋은 기회와 착각을 구분하기 어렵습니다",
  water: "흐름을 바꿔야 할 때 한 박자 늦어질 수 있습니다",
};

const BALANCE_COPY: Record<ResultSignals["balanceType"], string> = {
  balanced: "한쪽으로 크게 무너지지는 않지만, 강점도 일부러 키워야 선명해집니다.",
  "missing-one": "비어 있는 기운이 있어 돈의 흐름이 한 구간에서 끊기기 쉽습니다.",
  "dominant-heavy": "강한 쪽은 확실하지만, 약한 쪽을 방치하면 결과가 흔들립니다.",
  "split-power": "두 방향의 힘이 같이 살아 있어 선택 기준을 좁히는 게 중요합니다.",
  uneven: "강약 차이가 있어 잘되는 장면과 막히는 장면이 꽤 뚜렷합니다.",
};

const RISK_COPY: Record<ResultSignals["riskPattern"], string> = {
  lateExecution: "성과가 느리다고 방향을 바꾸는 순간이 가장 아깝습니다.",
  launchDelay: "팔 수 있는 형태로 내놓기 전에 식어버리는 패턴을 조심해야 합니다.",
  overCaution: "안전만 고르면 손실은 줄어도 수익의 크기도 같이 줄어듭니다.",
  overExpansion: "초반 반응이 좋을수록 검증 없이 돈을 더 넣기 쉽습니다.",
  peopleDrain: "좋은 사람 역할만 하면 시간은 쓰고 돈은 남지 않을 수 있습니다.",
  underpricing: "실력이 있어도 가격을 낮게 부르면 돈의 체감이 늦습니다.",
  impulseLeak: "수입 직후의 충동 결제가 재물 체감을 가장 크게 낮춥니다.",
  scatteredFocus: "방향을 자주 바꾸면 경험이 쌓이지 못하고 계속 초기화됩니다.",
  prepLoop: "준비가 길어질수록 실전 판매가 뒤로 밀릴 수 있습니다.",
  priceFear: "가격을 말하는 순간 약해지면 좋은 제안도 부탁처럼 들립니다.",
  analysisParalysis: "분석이 길어지면 좋은 가격과 타이밍이 먼저 지나갑니다.",
  weakStructure: "운영 구조 없이 확장하면 바쁘기만 하고 남는 돈이 줄어듭니다.",
};

const MONEY_ATTITUDE: Record<ResultSignals["moneyPattern"], string> = {
  accumulate: "돈을 빠르게 잡기보다 오래 남기는 쪽에서 힘이 납니다.",
  create: "돈은 아이디어가 남에게 보이는 결과물로 바뀔 때 움직입니다.",
  manage: "돈은 정리된 시스템 안에서 가장 안정적으로 남습니다.",
  opportunity: "돈은 기다릴 때보다 작게 검증하고 움직일 때 붙습니다.",
  network: "돈은 혼자보다 사람, 소개, 협업을 타고 들어오기 쉽습니다.",
  expertise: "돈은 더 배우는 순간보다 배운 것을 팔기 시작할 때 움직입니다.",
  leaky: "돈을 버는 감각보다 들어온 돈을 붙잡는 장치가 더 중요합니다.",
  lateGrowth: "돈은 시행착오를 그냥 넘기지 않고 경험 자산으로 바꿀 때 열립니다.",
  knowledge: "돈은 지식의 양보다 지식을 꺼내 쓸 수 있는 형태에서 움직입니다.",
  persuasion: "돈은 호감보다 명확한 제안과 가격에서 움직입니다.",
  analysis: "돈은 감이 아니라 들어갈 기준과 빠질 기준을 세울 때 덜 흔들립니다.",
  independent: "돈은 직접 만든 판에서 커지지만, 오래 가려면 구조가 먼저입니다.",
};

const POLARITY_COPY: Record<
  ResultSignals["polarityStyle"],
  RenderedResultCopy["polarity"]
> = {
  masculine: {
    modifier: "돌파형",
    badge: "사람의 성별이 아니라 사주의 작동 방식",
    summary:
      "돈을 볼 때 먼저 밀고 들어가 확인하는 흐름입니다. 기회가 보이면 생각만 오래 하기보다 행동으로 판을 여는 쪽에 가깝습니다.",
    strength: "속도, 결단, 제안, 확장처럼 밖으로 밀어내는 힘이 강합니다.",
    caution: "속도가 기준보다 앞서면 수익보다 지출과 피로가 먼저 커질 수 있습니다.",
  },
  feminine: {
    modifier: "축적형",
    badge: "사람의 성별이 아니라 사주의 작동 방식",
    summary:
      "돈을 바로 밀어붙이기보다 상황을 읽고, 관계와 정보를 모아 구조로 바꾸는 흐름입니다. 겉으로 느려 보여도 쌓이면 오래 갑니다.",
    strength: "관찰, 축적, 관리, 회복처럼 돈을 머물게 하는 힘이 강합니다.",
    caution: "너무 오래 지켜보면 팔아야 할 타이밍이나 제안해야 할 순간을 놓칠 수 있습니다.",
  },
  mixed: {
    modifier: "전환형",
    badge: "두 방향 에너지가 같이 작동",
    summary:
      "밀고 나가는 힘과 쌓아두는 힘이 같이 보입니다. 돈을 벌 때는 속도가 필요하지만, 오래 남기려면 중간에 구조를 세워야 합니다.",
    strength: "상황에 따라 공격적으로 움직이다가도 다시 정리하는 전환력이 있습니다.",
    caution: "기준이 없으면 밀어붙일 때와 기다릴 때가 섞여 선택 피로가 커질 수 있습니다.",
  },
};

function getPaidSections(animalType: AnimalType): ResultPaidPreviewSection[] {
  const getBlurredKeyword = (teaser: string, candidates: string[]) =>
    candidates.find((candidate) => teaser.includes(candidate)) ??
    teaser.split(/[ ,,.]/).find((word) => word.length >= 2) ??
    teaser.slice(0, 2);

  return [
    {
      title: "돈 버는 패턴",
      teaser: animalType.paidSections.moneyPattern,
      blurredKeyword: getBlurredKeyword(animalType.paidSections.moneyPattern, [
        "돈으로",
        "수익",
        "기회",
        "구조",
        "돈",
      ]),
    },
    {
      title: "돈 놓치는 패턴",
      teaser: animalType.paidSections.riskPattern,
      blurredKeyword: getBlurredKeyword(animalType.paidSections.riskPattern, [
        "패턴",
        "습관",
        "구간",
        "지점",
        "돈",
      ]),
    },
    {
      title: "성장 전략",
      teaser: animalType.paidSections.growthStrategy,
      blurredKeyword: getBlurredKeyword(animalType.paidSections.growthStrategy, [
        "제안",
        "기준",
        "순서",
        "플랜",
        "방식",
      ]),
    },
    {
      title: "돈과의 관계",
      teaser: animalType.paidSections.relationshipWithMoney,
      blurredKeyword: getBlurredKeyword(animalType.paidSections.relationshipWithMoney, [
        "돈",
        "관계",
        "구조",
        "방식",
        "기준",
      ]),
    },
  ];
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

function withInstrumentParticle(value: string) {
  return `${value}${hasFinalConsonant(value) ? "으로" : "로"}`;
}

function buildLogic(animalType: AnimalType, signals: ResultSignals) {
  return [
    `계산된 오행에서 ${ELEMENT_LABEL[signals.dominantElement]} 기운이 가장 강하고 ${ELEMENT_LABEL[signals.weakElement]} 기운이 가장 약합니다. 그래서 ${DOMINANT_TRANSLATION[signals.dominantElement]}.`,
    BALANCE_COPY[signals.balanceType],
    MONEY_ATTITUDE[signals.moneyPattern],
    RISK_COPY[signals.riskPattern],
    `${withInstrumentParticle(animalType.name)} 나온 이유는 강한 오행, 약한 오행, 균형 차이, 실행 패턴이 이 유형의 기준과 가장 많이 겹쳤기 때문입니다.`,
  ];
}

export function renderResultCopy(
  animalType: AnimalType,
  signals: ResultSignals
): RenderedResultCopy {
  const weakTranslation = WEAK_TRANSLATION[signals.weakElement];
  const polarity = POLARITY_COPY[signals.polarityStyle];

  return {
    title: `${polarity.modifier} ${animalType.name}`,
    subtitle: `${animalType.title} · ${ELEMENT_LABEL[signals.dominantElement]} 강세 / ${ELEMENT_LABEL[signals.weakElement]} 약세`,
    hook: animalType.freeCopy.hook,
    oneLineDiagnosis: `${animalType.freeCopy.summary} ${weakTranslation}.`,
    summary: `${MONEY_ATTITUDE[signals.moneyPattern]} ${BALANCE_COPY[signals.balanceType]}`,
    moneyAttitude: MONEY_ATTITUDE[signals.moneyPattern],
    strength: animalType.freeCopy.strength,
    weakness: animalType.freeCopy.weakness,
    polarity,
    paidPreview: `${animalType.freeCopy.blurredTeaser} 능력 부족보다 반복되는 선택 패턴에 가까운 지점을 소비, 일, 인간관계에서 더 구체적으로 보여줍니다.`,
    paidSections: getPaidSections(animalType),
    cautions: [animalType.freeCopy.weakness, RISK_COPY[signals.riskPattern]],
    logic: buildLogic(animalType, signals),
    shareText: `나는 ${polarity.modifier} ${animalType.name} 재물 타입이 나왔어요. ${animalType.freeCopy.hook}`,
  };
}
