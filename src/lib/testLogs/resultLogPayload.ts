import { buildResultCopy } from "../copyEngine";
import { calculateWealthResult } from "../score";
import type { AcceptedPublicTestLogSubmission } from "./requestSecurity";
import type { TestLogPayload } from "./types";

const COPY_VERSION = "animalTypeBank-v0.10.1";
const LOGIC_VERSION = "score-v0.10.1";

function parseBirthDate(birthDate: string) {
  const [year, month, day] = birthDate.split("-").map(Number);

  return { year, month, day };
}

function parseBirthTime(birthTime: string) {
  return birthTime === "0" ? undefined : Number(birthTime);
}

function summaryText(value: string, maxLength = 140) {
  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1)}…`
    : normalized;
}

export function createTrustedTestLogPayload(
  submission: AcceptedPublicTestLogSubmission,
): TestLogPayload {
  const { year, month, day } = parseBirthDate(submission.birthDate);
  const birthTime = parseBirthTime(submission.birthTime);
  const result = calculateWealthResult({
    year,
    month,
    day,
    hour: birthTime,
    birthTime: submission.birthTime,
    calendarType: submission.calendarType,
    gender: submission.gender,
  });
  const builtCopy = buildResultCopy(result);

  return {
    createdAt: new Date().toISOString(),
    birthDate: submission.birthDate,
    calendarType: submission.calendarType,
    birthTime: submission.birthTime,
    gender: submission.gender,
    animalKey: builtCopy.animalKey,
    animalTitle: builtCopy.title,
    resultSummary: `${builtCopy.title} · ${builtCopy.archetype} · ${builtCopy.rankText}`,
    firstImpressionSummary: summaryText(builtCopy.firstImpression),
    resultExplanationSnapshot: {
      title: builtCopy.title,
      subtitle: `${builtCopy.archetype} · ${builtCopy.rankText}`,
      firstImpression: builtCopy.firstImpression,
      moneyPattern: builtCopy.moneyFlow,
      elementText: builtCopy.elementReading,
      salText: builtCopy.salText,
      closingNote: builtCopy.closingNote,
    },
    dayStem: result.saju.dayMaster,
    element: result.saju.dayElement,
    salList: result.salList?.map((sal) => sal.name) ?? [],
    scoreSnapshot: {
      topPercent: result.topPercent,
      percentile: result.percentile,
      rawWealthScore: result.rawWealthScore,
      displayWealthScore: result.displayWealthScore,
      wealthScore: result.wealthScore,
      baseWealthScore: result.baseWealthScore,
      sajuAdjustmentScore: result.sajuAdjustmentScore,
      adjustedWealthScore: result.adjustedWealthScore,
      baseTopPercent: result.baseTopPercent,
      adjustedTopPercent: result.adjustedTopPercent,
      dominantElement: result.dominantElement,
      weakElement: result.weakElement,
      usefulGod: result.usefulGod,
      favorableElements: result.favorableElements,
      unfavorableElements: result.unfavorableElements,
      strengthType: result.strengthType,
    },
    copyVersion: COPY_VERSION,
    logicVersion: LOGIC_VERSION,
    userAgent: "",
    referrer: "",
    path: "/result",
  };
}
