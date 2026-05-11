// src/lib/score.ts

export type Gender = "male" | "female" | "unknown";

export type WealthElementScores = {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
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

export type WealthResult = {
  templateId: number;
  percentile: number;
  topPercent: number;
  wealthScore: number;
  title: string;
  elements: WealthElementScores;
  profile: WealthProfile;
  dominantElement: keyof WealthElementScores;
  weakElement: keyof WealthElementScores;
  logic: string[];
};

type CalculateInput = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  gender?: Gender;
};

const STEM_ELEMENTS = [
  "wood",
  "wood",
  "fire",
  "fire",
  "earth",
  "earth",
  "metal",
  "metal",
  "water",
  "water",
] as const;

const BRANCH_ELEMENTS = [
  "water",
  "earth",
  "wood",
  "wood",
  "earth",
  "fire",
  "fire",
  "earth",
  "metal",
  "metal",
  "earth",
  "water",
] as const;

const MONTH_ELEMENTS = [
  "earth",
  "wood",
  "wood",
  "earth",
  "fire",
  "fire",
  "earth",
  "metal",
  "metal",
  "earth",
  "water",
  "water",
] as const;

const ELEMENT_LABEL: Record<keyof WealthElementScores, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

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

function getDominantElement(elements: WealthElementScores): keyof WealthElementScores {
  return Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0] as keyof WealthElementScores;
}

function getWeakElement(elements: WealthElementScores): keyof WealthElementScores {
  return Object.entries(elements).sort((a, b) => a[1] - b[1])[0][0] as keyof WealthElementScores;
}

function getHourBranchIndex(hour?: number) {
  if (hour === undefined || Number.isNaN(hour)) return 0;

  if (hour >= 23 || hour < 1) return 0;
  if (hour < 3) return 1;
  if (hour < 5) return 2;
  if (hour < 7) return 3;
  if (hour < 9) return 4;
  if (hour < 11) return 5;
  if (hour < 13) return 6;
  if (hour < 15) return 7;
  if (hour < 17) return 8;
  if (hour < 19) return 9;
  if (hour < 21) return 10;
  return 11;
}

function calculateElements(input: CalculateInput): WealthElementScores {
  const { year, month, day, hour } = input;

  const yearStemIndex = (year - 4) % 10;
  const yearBranchIndex = (year - 4) % 12;

  const daySeed = year * 10000 + month * 100 + day;
  const dayStemIndex = Math.abs(daySeed) % 10;
  const dayBranchIndex = Math.abs(daySeed) % 12;

  const hourBranchIndex = getHourBranchIndex(hour);

  const raw: WealthElementScores = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  raw[STEM_ELEMENTS[yearStemIndex]] += 18;
  raw[BRANCH_ELEMENTS[yearBranchIndex]] += 18;

  raw[MONTH_ELEMENTS[month - 1]] += 24;

  raw[STEM_ELEMENTS[dayStemIndex]] += 22;
  raw[BRANCH_ELEMENTS[dayBranchIndex]] += 12;

  raw[BRANCH_ELEMENTS[hourBranchIndex]] += 10;

  return normalizeElements(raw);
}

function calculateProfile(elements: WealthElementScores): WealthProfile {
  const { wood, fire, earth, metal, water } = elements;

  const balancePenalty =
    Math.abs(wood - 20) +
    Math.abs(fire - 20) +
    Math.abs(earth - 20) +
    Math.abs(metal - 20) +
    Math.abs(water - 20);

  const balanceBonus = clamp(30 - balancePenalty * 0.35, 0, 30);

  const profile: WealthProfile = {
    moneySense: clamp(42 + metal * 0.65 + earth * 0.25 + water * 0.2 - fire * 0.15),
    executionPower: clamp(40 + fire * 0.35 + metal * 0.35 + wood * 0.25 - water * 0.1),
    riskTaking: clamp(35 + wood * 0.45 + fire * 0.35 - earth * 0.25),
    consistency: clamp(38 + earth * 0.65 + metal * 0.2 - fire * 0.15),
    impulsiveness: clamp(30 + fire * 0.6 + wood * 0.2 - earth * 0.25 - metal * 0.1),
    socialCapital: clamp(35 + fire * 0.5 + water * 0.3 + wood * 0.15),
    creativity: clamp(35 + wood * 0.45 + fire * 0.35 + water * 0.2),
    businessPotential: clamp(35 + wood * 0.35 + fire * 0.25 + metal * 0.25 + water * 0.15),
    stability: clamp(35 + earth * 0.7 + metal * 0.25 - fire * 0.2),
    luckFlow: clamp(35 + water * 0.45 + wood * 0.25 + balanceBonus),
  };

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

function applyDisplayBoost(score: number) {
  if (score < 60) return clamp(score + 12);
  if (score < 70) return clamp(score + 7);
  if (score < 80) return clamp(score + 5);
  if (score < 90) return clamp(score + 2);
  return clamp(score);
}

function scoreToTopPercent(score: number) {
  if (score >= 88) return 3;
  if (score >= 82) return 7;
  if (score >= 76) return 12;
  if (score >= 70) return 18;
  if (score >= 64) return 24;
  if (score >= 58) return 31;
  if (score >= 52) return 39;
  if (score >= 46) return 48;
  return 57;
}

function decideTemplateId(profile: WealthProfile, elements: WealthElementScores): number {
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

  if (businessPotential >= 68 && executionPower >= 62 && riskTaking >= 58) return 12;
  if (moneySense >= 68 && luckFlow >= 60) return 11;
  if (creativity >= 68 && socialCapital >= 58) return 2;
  if (socialCapital >= 68) return 5;
  if (executionPower >= 68 && riskTaking >= 62) return 4;
  if (consistency >= 70 && stability >= 66) return 3;
  if (moneySense >= 62 && consistency >= 58 && stability >= 58) return 1;
  if (impulsiveness >= 65 && moneySense < 62) return 7;
  if (luckFlow >= 64 && consistency < 58) return 8;
  if (moneySense >= 60 && executionPower >= 56) return 6;
  if (dominant === "earth" && weak === "fire") return 9;
  if (socialCapital >= 60 && executionPower >= 55) return 10;

  return 8;
}

function getTemplateTitle(templateId: number) {
  const titles: Record<number, string> = {
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

function buildLogic(
  elements: WealthElementScores,
  profile: WealthProfile,
  templateId: number
): string[] {
  const dominant = getDominantElement(elements);
  const weak = getWeakElement(elements);

  const logic: string[] = [];

  logic.push(
    `${ELEMENT_LABEL[dominant]} 기운이 가장 강하게 잡혀 재물 성향의 중심축이 '${ELEMENT_LABEL[dominant]}' 쪽으로 기울어져 있습니다.`
  );

  logic.push(
    `${ELEMENT_LABEL[weak]} 기운은 상대적으로 약해, 이 부분이 돈을 벌거나 지키는 과정에서 약점으로 드러날 수 있습니다.`
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

  logic.push(`이 흐름을 종합하면 '${getTemplateTitle(templateId)}' 결과가 가장 가깝습니다.`);

  return logic;
}

export function calculateWealthResult(input: CalculateInput): WealthResult {
  const safeInput: CalculateInput = {
    year: Number(input.year),
    month: Number(input.month),
    day: Number(input.day),
    hour: input.hour === undefined ? undefined : Number(input.hour),
    gender: input.gender ?? "unknown",
  };

  const elements = calculateElements(safeInput);
  const profile = calculateProfile(elements);
  const rawWealthScore = calculateWealthScore(profile);
const wealthScore = applyDisplayBoost(rawWealthScore);
const topPercent = scoreToTopPercent(wealthScore);
  const templateId = decideTemplateId(profile, elements);

  return {
    templateId,
    percentile: topPercent,
    topPercent,
    wealthScore,
    title: getTemplateTitle(templateId),
    elements,
    profile,
    dominantElement: getDominantElement(elements),
    weakElement: getWeakElement(elements),
    logic: buildLogic(elements, profile, templateId),
  };
}