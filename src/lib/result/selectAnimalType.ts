import { animalTypes, type AnimalType } from "./animalTypes";
import type { ResultSignals } from "./deriveResultSignals";

function toArray<T extends string>(value?: T | T[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function includes<T extends string>(value: T, candidates?: T | T[]) {
  return toArray(candidates).includes(value);
}

function getAnimalScore(animalType: AnimalType, signals: ResultSignals) {
  const { trigger } = animalType;
  let score = 0;

  if (animalType.templateId === signals.templateId) score += 28;
  if (includes(signals.moneyPattern, trigger.pattern)) score += 34;
  if (includes(signals.dominantElement, trigger.dominant)) score += 22;
  if (includes(signals.weakElement, trigger.weak)) score += 12;
  if (includes(signals.balanceType, trigger.balanceType)) score += 14;
  if (includes(signals.actionStyle, trigger.actionStyle)) score += 12;
  if (includes(signals.riskPattern, trigger.riskPattern)) score += 12;
  if (includes(signals.earningStyle, trigger.earningStyle)) score += 12;

  return score;
}

export function selectAnimalType(signals: ResultSignals) {
  return animalTypes.reduce(
    (best, animalType, index) => {
      const score = getAnimalScore(animalType, signals);

      if (score > best.score) {
        return { animalType, score, index };
      }

      if (score === best.score && index < best.index) {
        return { animalType, score, index };
      }

      return best;
    },
    { animalType: animalTypes[0], score: -1, index: 0 }
  ).animalType;
}
