import {
  type AnimalTypeProfile,
  type ElementKey,
  type HeavenlyStemKey,
  animalClosingNoteBank,
  getAnimalTypeByElement,
  getAnimalTypeByStem,
  getFallbackAnimalType,
} from "./animalTypeBank";
import { selectPrimarySalCopy } from "./salCopyBank";

export type BuiltResultCopy = {
  animalKey: string;
  title: string;
  emoji: string;
  rankText: string;
  archetype: string;
  firstImpression: string;
  moneyFlow: string;
  elementReading: string;
  salText?: string;
  repeatedPatterns: string[];
  advice: string;
  threeDayAction: {
    title: string;
    body: string;
  };
  fiveDayCheck: {
    title: string;
    body: string;
  };
  oneWeekExperiment: {
    title: string;
    body: string;
  };
  cta: string;
  closingNote: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readPath(source: unknown, path: string[]) {
  return path.reduce<unknown>((current, key) => {
    if (!isRecord(current)) return undefined;

    return current[key];
  }, source);
}

export function normalizeStemKey(value: unknown): HeavenlyStemKey | null {
  const text = String(value ?? "").trim();

  if (["갑", "갑목", "甲", "甲木", "gap"].includes(text)) return "gap";
  if (["을", "을목", "乙", "乙木", "eul"].includes(text)) return "eul";
  if (["병", "병화", "丙", "丙火", "byeong"].includes(text)) {
    return "byeong";
  }
  if (["정", "정화", "丁", "丁火", "jeong"].includes(text)) {
    return "jeong";
  }
  if (["무", "무토", "戊", "戊土", "mu"].includes(text)) return "mu";
  if (["기", "기토", "己", "己土", "gi"].includes(text)) return "gi";
  if (["경", "경금", "庚", "庚金", "gyeong"].includes(text)) {
    return "gyeong";
  }
  if (["신", "신금", "辛", "辛金", "sin"].includes(text)) return "sin";
  if (["임", "임수", "壬", "壬水", "im"].includes(text)) return "im";
  if (["계", "계수", "癸", "癸水", "gye"].includes(text)) return "gye";

  return null;
}

export function normalizeElementKey(value: unknown): ElementKey | null {
  const text = String(value ?? "").trim();

  if (["목", "木", "wood"].includes(text)) return "wood";
  if (["화", "火", "fire"].includes(text)) return "fire";
  if (["토", "土", "earth"].includes(text)) return "earth";
  if (["금", "金", "metal"].includes(text)) return "metal";
  if (["수", "水", "water"].includes(text)) return "water";

  return null;
}

function findStemKey(result: unknown) {
  const candidates = [
    readPath(result, ["stem"]),
    readPath(result, ["dayStem"]),
    readPath(result, ["dominantStem"]),
    readPath(result, ["primaryStem"]),
    readPath(result, ["strongestStem"]),
    readPath(result, ["saju", "dayStem"]),
    readPath(result, ["saju", "dominantStem"]),
    readPath(result, ["saju", "dayMaster"]),
    readPath(result, ["debug", "dayMaster"]),
  ];

  for (const candidate of candidates) {
    const stemKey = normalizeStemKey(candidate);

    if (stemKey) return stemKey;
  }

  return null;
}

function findElementKey(result: unknown) {
  const candidates = [
    readPath(result, ["element"]),
    readPath(result, ["dominantElement"]),
    readPath(result, ["primaryElement"]),
    readPath(result, ["strongestElement"]),
    readPath(result, ["saju", "dominantElement"]),
    readPath(result, ["saju", "dayElement"]),
    readPath(result, ["debug", "strongestElement"]),
  ];

  for (const candidate of candidates) {
    const elementKey = normalizeElementKey(candidate);

    if (elementKey) return elementKey;
  }

  return null;
}

function parsePercent(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value === "string") {
    const match = value.match(/\d+/);

    if (match) return Number(match[0]);
  }

  return null;
}

function buildRankText(result: unknown, animalType: AnimalTypeProfile) {
  const candidates = [
    readPath(result, ["topPercent"]),
    readPath(result, ["rankPercent"]),
    readPath(result, ["percentile"]),
    readPath(result, ["wealthRank"]),
    readPath(result, ["displayTopPercent"]),
  ];

  const rank = candidates.map(parsePercent).find((value) => value !== null);

  if (rank === null || rank === undefined) {
    return animalType.rankTextTemplate.replace("{rank}%", "분석 중");
  }

  return animalType.rankTextTemplate.replace("{rank}", String(rank));
}

function readSalName(sal: unknown) {
  if (typeof sal === "string") return sal;
  if (!isRecord(sal)) return null;

  const name = sal.name;

  return typeof name === "string" ? name : null;
}

function getSalNames(result: unknown) {
  const candidates = [
    readPath(result, ["sals"]),
    readPath(result, ["salList"]),
    readPath(result, ["saju", "salList"]),
    readPath(result, ["specialStars"]),
    readPath(result, ["stars"]),
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate) || candidate.length === 0) continue;

    return candidate.map(readSalName).filter((name): name is string => Boolean(name));
  }

  return [];
}

export function resolveAnimalTypeFromResult(result: unknown): AnimalTypeProfile {
  const stemKey = findStemKey(result);
  const elementKey = findElementKey(result);

  return (
    getAnimalTypeByStem(stemKey ?? undefined) ??
    getAnimalTypeByElement(elementKey ?? undefined) ??
    getFallbackAnimalType()
  );
}

export function buildResultCopy(result: unknown): BuiltResultCopy {
  const animalType = resolveAnimalTypeFromResult(result);
  const salCopy = selectPrimarySalCopy(getSalNames(result), animalType.archetype);

  return {
    animalKey: animalType.animalKey,
    title: animalType.title,
    emoji: animalType.emoji,
    rankText: buildRankText(result, animalType),
    archetype: animalType.archetype,
    firstImpression: animalType.copy.firstImpression,
    moneyFlow: animalType.copy.moneyFlow,
    elementReading: animalType.copy.elementReading,
    salText: salCopy?.moneyText,
    repeatedPatterns: animalType.copy.repeatedPatterns,
    advice: animalType.copy.advice,
    threeDayAction: animalType.copy.threeDayAction,
    fiveDayCheck: animalType.copy.fiveDayCheck,
    oneWeekExperiment: animalType.copy.oneWeekExperiment,
    cta: animalType.copy.cta,
    closingNote:
      animalClosingNoteBank[animalType.animalKey] ?? animalType.copy.cta,
  };
}
