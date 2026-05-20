export {
  animalTypeBank,
  elementFallbackAnimalKeyMap,
  getAnimalTypeByElement,
  getAnimalTypeByStem,
  getFallbackAnimalType,
  moneyPatternBank,
  stemElementBank,
  stemToAnimalKeyMap,
} from "./animalTypeBank";
export type {
  ActionCopy,
  AnimalResultCopy,
  AnimalTypeKey,
  AnimalTypeProfile,
  ElementKey,
  HeavenlyStemKey,
  MoneyPatternId,
  MoneyPatternProfile,
  StemElementProfile,
} from "./animalTypeBank";
export {
  buildResultCopy,
  normalizeElementKey,
  normalizeStemKey,
  resolveAnimalTypeFromResult,
} from "./copyEngine";
export type { BuiltResultCopy } from "./copyEngine";
