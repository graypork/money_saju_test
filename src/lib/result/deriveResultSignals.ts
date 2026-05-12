import type {
  ElementKey,
  TemplateId,
  WealthElementScores,
  WealthProfile,
  WealthSajuSummary,
} from "../score";
import type { TenGodCategory } from "../saju";

export type BalanceType =
  | "balanced"
  | "missing-one"
  | "dominant-heavy"
  | "split-power"
  | "uneven";

export type MoneyPattern =
  | "accumulate"
  | "create"
  | "manage"
  | "opportunity"
  | "network"
  | "expertise"
  | "leaky"
  | "lateGrowth"
  | "knowledge"
  | "persuasion"
  | "analysis"
  | "independent";

export type ActionStyle =
  | "steady"
  | "expressive"
  | "cautious"
  | "fast"
  | "relational"
  | "studious"
  | "adaptive"
  | "observing"
  | "persuasive"
  | "analytical"
  | "independent";

export type RiskPattern =
  | "lateExecution"
  | "launchDelay"
  | "overCaution"
  | "overExpansion"
  | "peopleDrain"
  | "underpricing"
  | "impulseLeak"
  | "scatteredFocus"
  | "prepLoop"
  | "priceFear"
  | "analysisParalysis"
  | "weakStructure";

export type EarningStyle =
  | "repeatTrust"
  | "contentProduct"
  | "operations"
  | "fastTest"
  | "relationshipDeal"
  | "expertService"
  | "variableIncome"
  | "experienceAsset"
  | "knowledgeAsset"
  | "salesProposal"
  | "marketTiming"
  | "selfOwnedSystem";

export type ResultSignals = {
  templateId: TemplateId;
  dominantElement: ElementKey;
  weakElement: ElementKey;
  strongest: ElementKey;
  weakest: ElementKey;
  balanceType: BalanceType;
  elementGap: number;
  moneyPattern: MoneyPattern;
  actionStyle: ActionStyle;
  riskPattern: RiskPattern;
  earningStyle: EarningStyle;
  dominantRelation: TenGodCategory;
  dayStrengthLevel: WealthSajuSummary["dayStrength"]["level"];
  profileHighlights: Array<keyof WealthProfile>;
  profileWarnings: Array<keyof WealthProfile>;
};

export type ResultSignalSource = {
  templateId: TemplateId;
  elements: WealthElementScores;
  profile: WealthProfile;
  saju: WealthSajuSummary;
};

const ELEMENTS: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];

const PATTERN_BY_TEMPLATE: Record<TemplateId, MoneyPattern> = {
  1: "accumulate",
  2: "create",
  3: "manage",
  4: "opportunity",
  5: "network",
  6: "expertise",
  7: "leaky",
  8: "lateGrowth",
  9: "knowledge",
  10: "persuasion",
  11: "analysis",
  12: "independent",
};

const ACTION_BY_PATTERN: Record<MoneyPattern, ActionStyle> = {
  accumulate: "steady",
  create: "expressive",
  manage: "cautious",
  opportunity: "fast",
  network: "relational",
  expertise: "studious",
  leaky: "adaptive",
  lateGrowth: "observing",
  knowledge: "studious",
  persuasion: "persuasive",
  analysis: "analytical",
  independent: "independent",
};

const EARNING_BY_PATTERN: Record<MoneyPattern, EarningStyle> = {
  accumulate: "repeatTrust",
  create: "contentProduct",
  manage: "operations",
  opportunity: "fastTest",
  network: "relationshipDeal",
  expertise: "expertService",
  leaky: "variableIncome",
  lateGrowth: "experienceAsset",
  knowledge: "knowledgeAsset",
  persuasion: "salesProposal",
  analysis: "marketTiming",
  independent: "selfOwnedSystem",
};

const RISK_BY_PATTERN: Record<MoneyPattern, RiskPattern> = {
  accumulate: "lateExecution",
  create: "launchDelay",
  manage: "overCaution",
  opportunity: "overExpansion",
  network: "peopleDrain",
  expertise: "underpricing",
  leaky: "impulseLeak",
  lateGrowth: "scatteredFocus",
  knowledge: "prepLoop",
  persuasion: "priceFear",
  analysis: "analysisParalysis",
  independent: "weakStructure",
};

function getRankedElements(elements: WealthElementScores) {
  return ELEMENTS.map((element) => ({
    element,
    value: elements[element],
  })).sort((a, b) => b.value - a.value);
}

function getBalanceType(elements: WealthElementScores, elementGap: number): BalanceType {
  const values = ELEMENTS.map((element) => elements[element]);
  const missingCount = values.filter((value) => value <= 5).length;
  const strongCount = values.filter((value) => value >= 30).length;

  if (missingCount > 0) return "missing-one";
  if (elementGap <= 15) return "balanced";
  if (strongCount >= 2) return "split-power";
  if (Math.max(...values) >= 35) return "dominant-heavy";
  return "uneven";
}

function getDominantRelation(saju: WealthSajuSummary) {
  return Object.entries(saju.relationScores).sort(
    (a, b) => b[1] - a[1]
  )[0][0] as TenGodCategory;
}

function getProfileHighlights(profile: WealthProfile) {
  return (Object.entries(profile) as Array<[keyof WealthProfile, number]>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);
}

function getProfileWarnings(profile: WealthProfile) {
  const warnings: Array<keyof WealthProfile> = [];

  if (profile.impulsiveness >= 62) warnings.push("impulsiveness");
  if (profile.stability <= 48) warnings.push("stability");
  if (profile.executionPower <= 48) warnings.push("executionPower");
  if (profile.moneySense <= 48) warnings.push("moneySense");
  if (profile.consistency <= 48) warnings.push("consistency");

  return warnings.slice(0, 3);
}

function getMoneyPattern(
  source: ResultSignalSource,
  dominantElement: ElementKey,
  weakElement: ElementKey,
  balanceType: BalanceType
): MoneyPattern {
  const { profile, saju, templateId } = source;
  const relation = getDominantRelation(saju);
  const basePattern = PATTERN_BY_TEMPLATE[templateId];

  if (profile.impulsiveness >= 66 && profile.stability <= 58) return "leaky";
  if ([6, 7, 9, 10, 11, 12].includes(templateId)) return basePattern;
  if (profile.businessPotential >= 65 && profile.riskTaking >= 58) return "independent";
  if (profile.socialCapital >= 64 && ["peer", "output"].includes(relation)) {
    return "network";
  }
  if (profile.moneySense >= 64 && ["metal", "water"].includes(dominantElement)) {
    return "analysis";
  }
  if (profile.creativity >= 64 && ["wood", "fire"].includes(dominantElement)) {
    return "create";
  }
  if (profile.consistency >= 64 && ["earth", "metal"].includes(dominantElement)) {
    return "accumulate";
  }
  if (profile.stability >= 64 && balanceType !== "missing-one") return "manage";
  if (relation === "resource" && weakElement !== "water") return "knowledge";

  return basePattern;
}

function getRiskPattern(
  profile: WealthProfile,
  moneyPattern: MoneyPattern,
  balanceType: BalanceType
): RiskPattern {
  if (profile.impulsiveness >= 66) return "impulseLeak";
  if (profile.businessPotential >= 65 && profile.stability <= 55) return "weakStructure";
  if (profile.moneySense >= 64 && profile.executionPower <= 52) return "analysisParalysis";
  if (profile.socialCapital >= 64 && profile.consistency <= 55) return "peopleDrain";
  if (profile.creativity >= 64 && profile.executionPower <= 55) return "launchDelay";
  if (balanceType === "missing-one") return "scatteredFocus";

  return RISK_BY_PATTERN[moneyPattern];
}

export function deriveResultSignals(source: ResultSignalSource): ResultSignals {
  const rankedElements = getRankedElements(source.elements);
  const strongest = rankedElements[0];
  const weakest = rankedElements[rankedElements.length - 1];
  const elementGap = strongest.value - weakest.value;
  const balanceType = getBalanceType(source.elements, elementGap);
  const dominantRelation = getDominantRelation(source.saju);
  const moneyPattern = getMoneyPattern(
    source,
    strongest.element,
    weakest.element,
    balanceType
  );
  const riskPattern = getRiskPattern(source.profile, moneyPattern, balanceType);

  return {
    templateId: source.templateId,
    dominantElement: strongest.element,
    weakElement: weakest.element,
    strongest: strongest.element,
    weakest: weakest.element,
    balanceType,
    elementGap,
    moneyPattern,
    actionStyle: ACTION_BY_PATTERN[moneyPattern],
    riskPattern,
    earningStyle: EARNING_BY_PATTERN[moneyPattern],
    dominantRelation,
    dayStrengthLevel: source.saju.dayStrength.level,
    profileHighlights: getProfileHighlights(source.profile),
    profileWarnings: getProfileWarnings(source.profile),
  };
}
