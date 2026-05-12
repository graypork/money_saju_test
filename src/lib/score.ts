// src/lib/score.ts

import {
  analyzeSajuLikeProfile,
  type CalendarType,
  type TenGodCategory,
} from "./saju";

export type Gender = "male" | "female" | "unknown";

export type WealthElementScores = {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
};

export type ElementKey = keyof WealthElementScores;
export type TemplateId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type TypeScores = Record<TemplateId, number>;
type SajuAnalysis = ReturnType<typeof analyzeSajuLikeProfile>;

export type ResultSubtype = {
  title: string;
  description: string;
  strengthAngle: string;
  weaknessAngle: string;
};

export type WealthProfile = {
  moneySense: number;
  executionPower: number;
  riskTaking: number;
  consistency: number;
  impulsiveness: number;
  socialCapital: number;
  creativity: number;
  businessPotential: number;
  stability: number;
  luckFlow: number;
};

export type WealthSajuSummary = {
  dayMaster: string;
  dayElement: ElementKey;
  pillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  solarDate: {
    year: number;
    month: number;
    day: number;
    calendarType: CalendarType;
    convertedFromLunar: boolean;
  };
  relationScores: Record<TenGodCategory, number>;
  balanceScore: number;
};

export type WealthResult = {
  templateId: TemplateId;
  percentile: number;
  topPercent: number;
  rawWealthScore: number;
  displayWealthScore: number;
  wealthScore: number;
  title: string;
  elements: WealthElementScores;
  profile: WealthProfile;
  typeScores: TypeScores;
  subtype: ResultSubtype;
  saju: WealthSajuSummary;
  dominantElement: ElementKey;
  weakElement: ElementKey;
  logic: string[];
};

type CalculateInput = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  birthTime?: string;
  calendarType?: CalendarType;
  gender?: Gender;
};

const ELEMENT_LABEL: Record<ElementKey, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

const RELATION_LABEL: Record<TenGodCategory, string> = {
  peer: "비겁",
  output: "식상",
  wealth: "재성",
  career: "관성",
  resource: "인성",
};

const TYPE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalizeElements(raw: WealthElementScores): WealthElementScores {
  const total = raw.wood + raw.fire + raw.earth + raw.metal + raw.water;

  if (total <= 0) {
    return {
      wood: 20,
      fire: 20,
      earth: 20,
      metal: 20,
      water: 20,
    };
  }

  return {
    wood: Math.round((raw.wood / total) * 100),
    fire: Math.round((raw.fire / total) * 100),
    earth: Math.round((raw.earth / total) * 100),
    metal: Math.round((raw.metal / total) * 100),
    water: Math.round((raw.water / total) * 100),
  };
}

function getDominantElement(elements: WealthElementScores): ElementKey {
  return Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0] as ElementKey;
}

function getWeakElement(elements: WealthElementScores): ElementKey {
  return Object.entries(elements).sort((a, b) => a[1] - b[1])[0][0] as ElementKey;
}

function calculateElementsFromAnalysis(analysis: SajuAnalysis): WealthElementScores {
  return normalizeElements(analysis.elementScores);
}

function relationScore(analysis: SajuAnalysis, category: TenGodCategory) {
  return analysis.relationScores[category] ?? 20;
}

function applyDayElementBias(profile: WealthProfile, dayElement: ElementKey) {
  if (dayElement === "wood") {
    profile.creativity = clamp(profile.creativity + 4);
    profile.riskTaking = clamp(profile.riskTaking + 3);
    profile.businessPotential = clamp(profile.businessPotential + 3);
  }

  if (dayElement === "fire") {
    profile.socialCapital = clamp(profile.socialCapital + 4);
    profile.executionPower = clamp(profile.executionPower + 3);
    profile.impulsiveness = clamp(profile.impulsiveness + 3);
  }

  if (dayElement === "earth") {
    profile.consistency = clamp(profile.consistency + 4);
    profile.stability = clamp(profile.stability + 4);
    profile.riskTaking = clamp(profile.riskTaking - 2);
  }

  if (dayElement === "metal") {
    profile.moneySense = clamp(profile.moneySense + 4);
    profile.executionPower = clamp(profile.executionPower + 3);
    profile.stability = clamp(profile.stability + 2);
  }

  if (dayElement === "water") {
    profile.luckFlow = clamp(profile.luckFlow + 4);
    profile.moneySense = clamp(profile.moneySense + 2);
    profile.creativity = clamp(profile.creativity + 2);
  }
}

function calculateProfile(
  elements: WealthElementScores,
  analysis: SajuAnalysis
): WealthProfile {
  const { wood, fire, earth, metal, water } = elements;
  const peer = relationScore(analysis, "peer");
  const output = relationScore(analysis, "output");
  const wealth = relationScore(analysis, "wealth");
  const career = relationScore(analysis, "career");
  const resource = relationScore(analysis, "resource");

  const balancePenalty =
    Math.abs(wood - 20) +
    Math.abs(fire - 20) +
    Math.abs(earth - 20) +
    Math.abs(metal - 20) +
    Math.abs(water - 20);

  const balanceBonus = clamp(30 - balancePenalty * 0.35, 0, 30);
  const sajuBalanceBonus = analysis.balanceScore * 1.8;

  const profile: WealthProfile = {
    moneySense: clamp(
      36 +
        metal * 0.45 +
        earth * 0.18 +
        water * 0.15 +
        wealth * 0.32 +
        resource * 0.12 -
        output * 0.08
    ),
    executionPower: clamp(
      36 +
        fire * 0.24 +
        metal * 0.28 +
        wood * 0.18 +
        career * 0.24 +
        output * 0.12 -
        resource * 0.06
    ),
    riskTaking: clamp(
      32 + wood * 0.32 + fire * 0.24 + wealth * 0.2 + peer * 0.1 - earth * 0.2
    ),
    consistency: clamp(
      34 +
        earth * 0.45 +
        metal * 0.15 +
        resource * 0.24 +
        career * 0.12 -
        output * 0.08 +
        sajuBalanceBonus
    ),
    impulsiveness: clamp(
      26 +
        fire * 0.42 +
        wood * 0.14 +
        output * 0.18 +
        peer * 0.1 -
        earth * 0.18 -
        resource * 0.08
    ),
    socialCapital: clamp(
      32 + fire * 0.34 + water * 0.2 + wood * 0.1 + output * 0.16 + peer * 0.12
    ),
    creativity: clamp(
      32 + wood * 0.32 + fire * 0.22 + water * 0.14 + output * 0.28
    ),
    businessPotential: clamp(
      32 +
        wood * 0.22 +
        fire * 0.18 +
        metal * 0.16 +
        water * 0.1 +
        wealth * 0.22 +
        output * 0.12
    ),
    stability: clamp(
      34 +
        earth * 0.48 +
        metal * 0.18 +
        resource * 0.18 +
        career * 0.12 -
        fire * 0.12 +
        sajuBalanceBonus
    ),
    luckFlow: clamp(
      32 + water * 0.34 + wood * 0.16 + resource * 0.14 + balanceBonus
    ),
  };

  applyDayElementBias(profile, analysis.dayElement as ElementKey);

  if (metal >= 35) {
    profile.moneySense = clamp(profile.moneySense + 8);
    profile.executionPower = clamp(profile.executionPower + 5);
  }

  if (fire >= 35) {
    profile.socialCapital = clamp(profile.socialCapital + 8);
    profile.impulsiveness = clamp(profile.impulsiveness + 10);
    profile.stability = clamp(profile.stability - 5);
  }

  if (earth >= 35) {
    profile.consistency = clamp(profile.consistency + 8);
    profile.stability = clamp(profile.stability + 8);
    profile.riskTaking = clamp(profile.riskTaking - 7);
  }

  if (wood >= 35) {
    profile.creativity = clamp(profile.creativity + 8);
    profile.businessPotential = clamp(profile.businessPotential + 7);
  }

  if (water >= 35) {
    profile.luckFlow = clamp(profile.luckFlow + 8);
    profile.moneySense = clamp(profile.moneySense + 4);
  }

  if (metal <= 10) profile.moneySense = clamp(profile.moneySense - 10);
  if (earth <= 10) profile.consistency = clamp(profile.consistency - 10);
  if (water <= 10) profile.luckFlow = clamp(profile.luckFlow - 8);
  if (fire <= 10) profile.socialCapital = clamp(profile.socialCapital - 8);
  if (wood <= 10) profile.creativity = clamp(profile.creativity - 8);

  return profile;
}

function calculateWealthScore(profile: WealthProfile) {
  const raw =
    profile.moneySense * 0.18 +
    profile.executionPower * 0.15 +
    profile.consistency * 0.13 +
    profile.businessPotential * 0.15 +
    profile.luckFlow * 0.13 +
    profile.socialCapital * 0.1 +
    profile.creativity * 0.08 +
    profile.stability * 0.05 +
    profile.riskTaking * 0.08 -
    profile.impulsiveness * 0.05;

  return clamp(raw);
}

function calculateDisplayWealthScore(rawScore: number) {
  const score = clamp(rawScore);

  // 표시 점수는 낮은 결과의 이탈감을 줄이되, 고득점 구간으로 과하게 몰리지 않게 보정한다.
  if (score < 60) return clamp(70 + (score - 50) * 0.25, 68, 72);
  if (score < 70) return clamp(70 + (score - 60) * 0.45, 70, 74);
  if (score < 80) return clamp(score + 5);
  if (score < 90) return clamp(Math.min(Math.max(score + 3, 84), 90));

  return score;
}

function interpolateTopPercent(
  score: number,
  minScore: number,
  maxScore: number,
  worstPercent: number,
  bestPercent: number
) {
  const ratio = (score - minScore) / (maxScore - minScore);

  return clamp(
    worstPercent - (worstPercent - bestPercent) * ratio,
    bestPercent,
    worstPercent
  );
}

function scoreToTopPercent(score: number) {
  const safeScore = clamp(score);

  if (safeScore >= 90) return interpolateTopPercent(safeScore, 90, 100, 5, 3);
  if (safeScore >= 85) return interpolateTopPercent(safeScore, 85, 89, 10, 7);
  if (safeScore >= 80) return interpolateTopPercent(safeScore, 80, 84, 15, 12);
  if (safeScore >= 75) return 18;
  if (safeScore >= 70) return interpolateTopPercent(safeScore, 70, 74, 31, 24);
  if (safeScore >= 65) return interpolateTopPercent(safeScore, 65, 69, 39, 31);
  if (safeScore >= 60) return interpolateTopPercent(safeScore, 60, 64, 45, 39);

  return interpolateTopPercent(safeScore, 0, 59, 55, 45);
}

function weightedScore(factors: Array<[number, number]>) {
  const totalWeight = factors.reduce((sum, [, weight]) => sum + weight, 0);

  if (totalWeight <= 0) return 0;

  return factors.reduce((sum, [value, weight]) => sum + value * weight, 0) / totalWeight;
}

function lowScore(value: number) {
  return 100 - value;
}

function elementBonus(element: ElementKey, matches: ElementKey[], bonus: number) {
  return matches.includes(element) ? bonus : 0;
}

function weakElementPenalty(element: ElementKey, weakElement: ElementKey, penalty: number) {
  return element === weakElement ? penalty : 0;
}

function calculateTypeScores(
  profile: WealthProfile,
  elements: WealthElementScores,
  displayWealthScore: number,
  analysis: SajuAnalysis
): TypeScores {
  const {
    moneySense,
    executionPower,
    riskTaking,
    consistency,
    impulsiveness,
    socialCapital,
    creativity,
    businessPotential,
    stability,
    luckFlow,
  } = profile;

  const dominant = getDominantElement(elements);
  const weak = getWeakElement(elements);
  const { wood, fire, earth, metal, water } = elements;
  const lowImpulsiveness = lowScore(impulsiveness);
  const weakStability = lowScore(stability);
  const weakEarth = lowScore(earth);
  const weakExecution = lowScore(executionPower);
  const eliteAdjustment = displayWealthScore >= 85 ? 1 : 0;
  const averageAdjustment = displayWealthScore < 72 ? 1 : 0;
  const peer = relationScore(analysis, "peer");
  const output = relationScore(analysis, "output");
  const wealth = relationScore(analysis, "wealth");
  const career = relationScore(analysis, "career");
  const resource = relationScore(analysis, "resource");

  const rawScores: TypeScores = {
    1:
      weightedScore([
        [consistency, 0.3],
        [stability, 0.24],
        [earth, 0.16],
        [lowImpulsiveness, 0.12],
        [metal, 0.08],
        [displayWealthScore, 0.1],
      ]) +
      elementBonus(dominant, ["earth", "metal"], 6) -
      weakElementPenalty("earth", weak, 8),
    2:
      weightedScore([
        [creativity, 0.3],
        [socialCapital, 0.18],
        [fire, 0.15],
        [wood, 0.15],
        [businessPotential, 0.09],
        [executionPower, 0.07],
        [displayWealthScore, 0.06],
      ]) +
      elementBonus(dominant, ["fire", "wood"], 7) -
      weakElementPenalty("fire", weak, 5),
    3:
      weightedScore([
        [consistency, 0.3],
        [stability, 0.26],
        [earth, 0.16],
        [metal, 0.12],
        [moneySense, 0.09],
        [lowImpulsiveness, 0.07],
      ]) +
      elementBonus(dominant, ["earth", "metal"], 7) -
      weakElementPenalty("earth", weak, 8),
    4:
      weightedScore([
        [executionPower, 0.24],
        [riskTaking, 0.2],
        [businessPotential, 0.22],
        [wood, 0.12],
        [fire, 0.1],
        [displayWealthScore, 0.07],
        [socialCapital, 0.05],
      ]) +
      elementBonus(dominant, ["wood", "fire"], 7) -
      averageAdjustment * 4,
    5:
      weightedScore([
        [socialCapital, 0.34],
        [fire, 0.16],
        [water, 0.14],
        [luckFlow, 0.12],
        [creativity, 0.09],
        [executionPower, 0.08],
        [displayWealthScore, 0.07],
      ]) +
      elementBonus(dominant, ["fire", "water"], 7) -
      weakElementPenalty("fire", weak, 5),
    6:
      weightedScore([
        [moneySense, 0.25],
        [executionPower, 0.17],
        [metal, 0.17],
        [consistency, 0.15],
        [stability, 0.08],
        [lowImpulsiveness, 0.08],
        [displayWealthScore, 0.1],
      ]) +
      elementBonus(dominant, ["metal", "earth"], 7) -
      weakElementPenalty("metal", weak, 7),
    7:
      weightedScore([
        [impulsiveness, 0.28],
        [creativity, 0.16],
        [weakStability, 0.17],
        [weakEarth, 0.13],
        [fire, 0.08],
        [wood, 0.08],
        [businessPotential, 0.05],
        [socialCapital, 0.05],
      ]) +
      elementBonus(dominant, ["fire", "wood"], 4) -
      eliteAdjustment * 5,
    8:
      weightedScore([
        [luckFlow, 0.22],
        [consistency, 0.15],
        [weakExecution, 0.17],
        [water, 0.14],
        [earth, 0.12],
        [stability, 0.1],
        [displayWealthScore, 0.1],
      ]) +
      elementBonus(dominant, ["water", "earth"], 6) -
      eliteAdjustment * 7,
    9:
      weightedScore([
        [consistency, 0.25],
        [moneySense, 0.22],
        [metal, 0.18],
        [earth, 0.16],
        [stability, 0.08],
        [lowImpulsiveness, 0.06],
        [displayWealthScore, 0.05],
      ]) +
      elementBonus(dominant, ["metal", "earth"], 9) +
      elementBonus(weak, ["fire"], 4) -
      weakElementPenalty("metal", weak, 6),
    10:
      weightedScore([
        [socialCapital, 0.3],
        [fire, 0.22],
        [executionPower, 0.2],
        [creativity, 0.1],
        [businessPotential, 0.08],
        [riskTaking, 0.05],
        [displayWealthScore, 0.05],
      ]) +
      elementBonus(dominant, ["fire"], 8) -
      weakElementPenalty("fire", weak, 7),
    11:
      weightedScore([
        [moneySense, 0.28],
        [luckFlow, 0.2],
        [metal, 0.18],
        [water, 0.15],
        [consistency, 0.07],
        [lowImpulsiveness, 0.05],
        [displayWealthScore, 0.07],
      ]) +
      elementBonus(dominant, ["metal", "water"], 7) -
      weakElementPenalty("water", weak, 5),
    12:
      weightedScore([
        [businessPotential, 0.28],
        [executionPower, 0.22],
        [riskTaking, 0.18],
        [wood, 0.1],
        [fire, 0.08],
        [metal, 0.08],
        [displayWealthScore, 0.06],
      ]) +
      elementBonus(dominant, ["wood", "fire", "metal"], 7) -
      averageAdjustment * 4,
  };

  rawScores[1] += resource * 0.08 + career * 0.03 - output * 0.03;
  rawScores[2] += output * 0.1 + peer * 0.03 - resource * 0.02;
  rawScores[3] += resource * 0.09 + career * 0.05 - wealth * 0.02;
  rawScores[4] += wealth * 0.08 + output * 0.05 - resource * 0.03;
  rawScores[5] += peer * 0.08 + output * 0.05;
  rawScores[6] += resource * 0.08 + career * 0.05 + wealth * 0.03;
  rawScores[7] += output * 0.08 + peer * 0.05 - resource * 0.04;
  rawScores[8] += resource * 0.06 + water * 0.03 - career * 0.02;
  rawScores[9] += resource * 0.12 + career * 0.04;
  rawScores[10] += output * 0.08 + peer * 0.06 + career * 0.02;
  rawScores[11] += wealth * 0.1 + resource * 0.04 + water * 0.03;
  rawScores[12] += wealth * 0.08 + output * 0.05 + career * 0.03;

  return TYPE_IDS.reduce((scores, typeId) => {
    scores[typeId] = clamp(rawScores[typeId]);
    return scores;
  }, {} as TypeScores);
}

function selectTemplateId(typeScores: TypeScores): TemplateId {
  return TYPE_IDS.reduce((bestTypeId, typeId) =>
    typeScores[typeId] > typeScores[bestTypeId] ? typeId : bestTypeId
  );
}

function getTemplateTitle(templateId: TemplateId) {
  const titles: Record<TemplateId, string> = {
    1: "늦게 터지는 축적형 자산가",
    2: "감각으로 버는 크리에이터형",
    3: "안정적으로 쌓는 관리자형",
    4: "기회 포착형 사업가",
    5: "네트워크 수익형",
    6: "전문성 수익화형",
    7: "돈은 벌지만 새기 쉬운 변동형",
    8: "후반부 대기만성형",
    9: "지식/자격 기반 수익형",
    10: "영업/설득 수익형",
    11: "투자/분석 감각형",
    12: "독립 사업가형",
  };

  return titles[templateId] ?? "후반부 대기만성형";
}

const SUBTYPE_BASE_NAME: Record<TemplateId, string> = {
  1: "축적형",
  2: "크리에이터",
  3: "관리자형",
  4: "기회 포착형",
  5: "네트워크형",
  6: "전문성형",
  7: "변동형",
  8: "대기만성형",
  9: "지식/자격형",
  10: "영업/설득형",
  11: "투자/분석형",
  12: "독립 사업가",
};

const DOMINANT_SUBTYPE_TRAITS: Record<
  ElementKey,
  {
    prefix: string;
    description: string;
    strengthAngle: string;
  }
> = {
  wood: {
    prefix: "확장형",
    description: "확장, 성장, 기획과 시작 감각이 결과의 앞쪽에 서 있습니다.",
    strengthAngle: "아이디어를 작게라도 시장에 던지면 돈이 될 실마리를 빨리 잡는 편입니다.",
  },
  fire: {
    prefix: "감각형",
    description: "표현, 노출, 설득과 사람을 끌어당기는 힘이 강하게 작동합니다.",
    strengthAngle: "말과 이미지, 분위기를 통해 가치를 팔 때 수익 가능성이 커집니다.",
  },
  earth: {
    prefix: "축적형",
    description: "안정, 축적, 관리와 현실감각이 결과의 중심을 잡고 있습니다.",
    strengthAngle: "한 번 정한 구조를 꾸준히 유지하면서 돈을 남기는 힘이 강합니다.",
  },
  metal: {
    prefix: "계산형",
    description: "판단, 계산, 분석과 구조화 감각이 재물 성향의 중심에 있습니다.",
    strengthAngle: "숫자와 기준을 세우면 감으로 움직이는 사람보다 손실을 줄이기 쉽습니다.",
  },
  water: {
    prefix: "타이밍형",
    description: "흐름, 정보, 타이밍과 적응력이 결과의 중요한 축으로 보입니다.",
    strengthAngle: "상황이 바뀔 때 빠르게 읽고 방향을 바꾸는 감각이 수익 기회가 됩니다.",
  },
};

const WEAK_SUBTYPE_TRAITS: Record<ElementKey, string> = {
  wood: "다만 시작과 확장성이 약해, 기회를 봐도 판을 키우기 전에 멈출 수 있습니다.",
  fire: "다만 드러내고 팔아야 할 때 소극적이면 실력보다 작게 보일 수 있습니다.",
  earth: "다만 유지력과 관리력이 약해, 벌어도 돈이 오래 머무는 구조가 흔들릴 수 있습니다.",
  metal: "다만 계산과 선별이 약하면 좋은 기회와 아닌 기회를 구분하는 데 시간이 걸릴 수 있습니다.",
  water: "다만 흐름과 타이밍 감지가 약하면 움직여야 할 때 한 박자 늦어질 수 있습니다.",
};

const RELATION_SUBTYPE_TRAITS: Record<TenGodCategory, string> = {
  peer: "비겁 흐름이 살아 있어 혼자만의 능력보다 경쟁, 동료, 커뮤니티 속에서 돈의 자극을 받습니다.",
  output: "식상 흐름이 살아 있어 표현, 결과물, 콘텐츠처럼 밖으로 내보내는 행동이 수익과 연결됩니다.",
  wealth: "재성 흐름이 살아 있어 돈, 거래, 고객, 시장 반응을 직접 의식할 때 감각이 선명해집니다.",
  career: "관성 흐름이 살아 있어 규칙, 책임, 직함, 시스템 안에서 신뢰를 돈으로 바꾸기 쉽습니다.",
  resource: "인성 흐름이 살아 있어 지식, 자격, 학습, 레퍼런스를 쌓을수록 돈의 기반이 단단해집니다.",
};

function getSubtypeTitle(templateId: TemplateId, dominant: ElementKey, weak: ElementKey) {
  if (templateId === 12 && dominant === "metal") return "계산형 독립 사업가";
  if (templateId === 12 && dominant === "fire") return "감각형 독립 사업가";
  if (templateId === 2 && weak === "water") return "감은 있는데 타이밍을 놓치는 크리에이터";
  if (templateId === 1 && weak === "fire") return "실력은 쌓지만 드러내는 힘이 약한 축적형";
  if (templateId === 1 && dominant === "earth") return "현실형 축적형 자산가";
  if (templateId === 3 && dominant === "earth") return "관리형 안정 자산가";
  if (templateId === 7 && dominant === "fire") return "수입 감각은 빠른데 새는 구멍도 큰 변동형";
  if (templateId === 11 && dominant === "metal") return "계산이 빠른 투자/분석형";

  return `${DOMINANT_SUBTYPE_TRAITS[dominant].prefix} ${SUBTYPE_BASE_NAME[templateId]}`;
}

function buildSubtype(
  templateId: TemplateId,
  dominant: ElementKey,
  weak: ElementKey,
  analysis: SajuAnalysis
): ResultSubtype {
  const dominantTrait = DOMINANT_SUBTYPE_TRAITS[dominant];
  const dominantRelation = getDominantRelation(analysis);

  return {
    title: getSubtypeTitle(templateId, dominant, weak),
    description: `${dominantTrait.description} ${RELATION_SUBTYPE_TRAITS[dominantRelation]} ${WEAK_SUBTYPE_TRAITS[weak]}`,
    strengthAngle: dominantTrait.strengthAngle,
    weaknessAngle: WEAK_SUBTYPE_TRAITS[weak],
  };
}

function getDominantRelation(analysis: SajuAnalysis) {
  return Object.entries(analysis.relationScores).sort(
    (a, b) => b[1] - a[1]
  )[0][0] as TenGodCategory;
}

function getWeakRelation(analysis: SajuAnalysis) {
  return Object.entries(analysis.relationScores).sort(
    (a, b) => a[1] - b[1]
  )[0][0] as TenGodCategory;
}

function buildSajuSummary(analysis: SajuAnalysis): WealthSajuSummary {
  return {
    dayMaster: analysis.dayMaster,
    dayElement: analysis.dayElement as ElementKey,
    pillars: analysis.pillars,
    solarDate: analysis.solarDate,
    relationScores: analysis.relationScores,
    balanceScore: analysis.balanceScore,
  };
}

function buildLogic(
  elements: WealthElementScores,
  profile: WealthProfile,
  templateId: TemplateId,
  analysis: SajuAnalysis
): string[] {
  const dominant = getDominantElement(elements);
  const weak = getWeakElement(elements);
  const dominantRelation = getDominantRelation(analysis);
  const weakRelation = getWeakRelation(analysis);
  const monthPillar = analysis.pillars.month;
  const dayElement = analysis.dayElement as ElementKey;

  const logic: string[] = [];

  logic.push(
    `일간은 ${analysis.dayMaster}(${ELEMENT_LABEL[dayElement]})로 잡히고, 월주는 ${monthPillar} 흐름이라 계절감이 오행 점수에 크게 반영됩니다.`
  );

  logic.push(
    `${ELEMENT_LABEL[dominant]} 기운이 가장 강하게 잡혀 재물 성향의 중심축이 '${ELEMENT_LABEL[dominant]}' 쪽으로 기울어져 있습니다.`
  );

  logic.push(
    `${ELEMENT_LABEL[weak]} 기운은 상대적으로 약해, 이 부분이 돈을 벌거나 지키는 과정에서 약점으로 드러날 수 있습니다.`
  );

  logic.push(
    `십성 흐름은 ${RELATION_LABEL[dominantRelation]}이 가장 두드러지고 ${RELATION_LABEL[weakRelation]}은 약해, 단순 오행 비율보다 '${RELATION_LABEL[dominantRelation]}' 성향을 더 크게 보정했습니다.`
  );

  if (profile.moneySense >= 65) {
    logic.push("돈의 흐름을 계산하고 판단하는 감각은 평균보다 강한 편입니다.");
  } else if (profile.moneySense <= 45) {
    logic.push("돈을 크게 벌 기회보다, 돈이 새는 구조를 먼저 잡는 것이 중요합니다.");
  }

  if (profile.executionPower >= 65) {
    logic.push("생각보다 실행 쪽으로 옮기는 힘이 강해, 작은 시도에서 돈의 흐름이 열릴 가능성이 큽니다.");
  } else if (profile.executionPower <= 45) {
    logic.push("가능성은 있어도 실행이 늦어지면 결과 체감이 약해지는 구조입니다.");
  }

  if (profile.impulsiveness >= 65) {
    logic.push("다만 감정적 선택과 즉흥 소비가 재물운을 깎아먹는 패턴으로 나타날 수 있습니다.");
  }

  if (profile.consistency >= 65) {
    logic.push("꾸준히 쌓는 힘이 있어 단기 수익보다 누적형 수익 구조에 강합니다.");
  }

  if (analysis.balanceScore <= 3) {
    logic.push("오행 균형이 한쪽으로 몰린 편이라 강점은 선명하지만, 약한 영역을 보완하지 않으면 결과가 들쭉날쭉해질 수 있습니다.");
  } else if (analysis.balanceScore >= 7) {
    logic.push("오행 균형이 비교적 고르게 잡혀 있어 큰 한 방보다 안정적인 누적과 조율에 강점이 있습니다.");
  }

  logic.push(`이 흐름을 종합하면 '${getTemplateTitle(templateId)}' 결과가 가장 가깝습니다.`);

  return logic;
}

export function calculateWealthResult(input: CalculateInput): WealthResult {
  const safeInput: CalculateInput = {
    year: Number(input.year),
    month: Number(input.month),
    day: Number(input.day),
    hour: input.hour === undefined ? undefined : Number(input.hour),
    birthTime: input.birthTime,
    calendarType: input.calendarType ?? "solar",
    gender: input.gender ?? "unknown",
  };

  const analysis = analyzeSajuLikeProfile({
    year: safeInput.year,
    month: safeInput.month,
    day: safeInput.day,
    hour: safeInput.hour,
    birthTime: safeInput.birthTime,
    calendarType: safeInput.calendarType,
  });
  const elements = calculateElementsFromAnalysis(analysis);
  const profile = calculateProfile(elements, analysis);
  const rawWealthScore = calculateWealthScore(profile);
  const displayWealthScore = calculateDisplayWealthScore(rawWealthScore);
  const topPercent = scoreToTopPercent(displayWealthScore);
  const typeScores = calculateTypeScores(
    profile,
    elements,
    displayWealthScore,
    analysis
  );
  const templateId = selectTemplateId(typeScores);
  const dominantElement = getDominantElement(elements);
  const weakElement = getWeakElement(elements);
  const subtype = buildSubtype(templateId, dominantElement, weakElement, analysis);

  return {
    templateId,
    percentile: topPercent,
    topPercent,
    rawWealthScore,
    displayWealthScore,
    wealthScore: displayWealthScore,
    title: getTemplateTitle(templateId),
    elements,
    profile,
    typeScores,
    subtype,
    saju: buildSajuSummary(analysis),
    dominantElement,
    weakElement,
    logic: buildLogic(elements, profile, templateId, analysis),
  };
}
