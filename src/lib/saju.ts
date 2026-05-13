export type ElementType = "wood" | "fire" | "earth" | "metal" | "water";
export type CalendarType = "solar" | "lunar";
export type KoreanBranch =
  | "자"
  | "축"
  | "인"
  | "묘"
  | "진"
  | "사"
  | "오"
  | "미"
  | "신"
  | "유"
  | "술"
  | "해";

export type TenGodCategory =
  | "peer"
  | "output"
  | "wealth"
  | "career"
  | "resource";

export type ElementScoreMap = Record<ElementType, number>;
export type RelationScoreMap = Record<TenGodCategory, number>;
export type DayStrengthLevel = "weak" | "balanced" | "strong";
export type SajuPillarRole = "year" | "month" | "day" | "hour";
export type SajuCharacterRole =
  | "yearStem"
  | "yearBranch"
  | "monthStem"
  | "monthBranch"
  | "dayStem"
  | "dayBranch"
  | "hourStem"
  | "hourBranch";

export type VisibleSajuCharacter = {
  role: SajuCharacterRole;
  pillar: SajuPillarRole;
  kind: "stem" | "branch";
  name: string;
  element: ElementType;
};

export type SajuContribution = {
  role: SajuPillarRole;
  kind: "stem" | "hiddenStem";
  name: string;
  element: ElementType;
  weight: number;
  relation: TenGodCategory;
  branch?: KoreanBranch;
};

export type SajuLikeInput = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  birthTime?: string;
  timeBranch?: KoreanBranch;
  gender?: "male" | "female";
  calendarType?: CalendarType;
  timezone?: "Asia/Seoul";
};

export type BirthInput = SajuLikeInput;

const heavenlyStems = [
  { name: "갑", element: "wood", yinYang: "yang" },
  { name: "을", element: "wood", yinYang: "yin" },
  { name: "병", element: "fire", yinYang: "yang" },
  { name: "정", element: "fire", yinYang: "yin" },
  { name: "무", element: "earth", yinYang: "yang" },
  { name: "기", element: "earth", yinYang: "yin" },
  { name: "경", element: "metal", yinYang: "yang" },
  { name: "신", element: "metal", yinYang: "yin" },
  { name: "임", element: "water", yinYang: "yang" },
  { name: "계", element: "water", yinYang: "yin" },
] as const;

const earthlyBranches = [
  { name: "자", element: "water" },
  { name: "축", element: "earth" },
  { name: "인", element: "wood" },
  { name: "묘", element: "wood" },
  { name: "진", element: "earth" },
  { name: "사", element: "fire" },
  { name: "오", element: "fire" },
  { name: "미", element: "earth" },
  { name: "신", element: "metal" },
  { name: "유", element: "metal" },
  { name: "술", element: "earth" },
  { name: "해", element: "water" },
] as const;

const branchHiddenStems: Array<
  Array<{ stemIndex: number; weight: number }>
> = [
  [{ stemIndex: 9, weight: 1 }],
  [
    { stemIndex: 5, weight: 0.6 },
    { stemIndex: 9, weight: 0.3 },
    { stemIndex: 7, weight: 0.1 },
  ],
  [
    { stemIndex: 0, weight: 0.6 },
    { stemIndex: 2, weight: 0.3 },
    { stemIndex: 4, weight: 0.1 },
  ],
  [{ stemIndex: 1, weight: 1 }],
  [
    { stemIndex: 4, weight: 0.6 },
    { stemIndex: 1, weight: 0.3 },
    { stemIndex: 9, weight: 0.1 },
  ],
  [
    { stemIndex: 2, weight: 0.6 },
    { stemIndex: 4, weight: 0.3 },
    { stemIndex: 6, weight: 0.1 },
  ],
  [
    { stemIndex: 3, weight: 0.7 },
    { stemIndex: 5, weight: 0.3 },
  ],
  [
    { stemIndex: 5, weight: 0.6 },
    { stemIndex: 3, weight: 0.3 },
    { stemIndex: 1, weight: 0.1 },
  ],
  [
    { stemIndex: 6, weight: 0.6 },
    { stemIndex: 8, weight: 0.3 },
    { stemIndex: 4, weight: 0.1 },
  ],
  [{ stemIndex: 7, weight: 1 }],
  [
    { stemIndex: 4, weight: 0.6 },
    { stemIndex: 7, weight: 0.3 },
    { stemIndex: 3, weight: 0.1 },
  ],
  [
    { stemIndex: 8, weight: 0.7 },
    { stemIndex: 0, weight: 0.3 },
  ],
];

const branchHiddenElements: Array<Array<[ElementType, number]>> =
  branchHiddenStems.map((hiddenStems) =>
    hiddenStems.map(({ stemIndex, weight }) => [
      heavenlyStems[stemIndex].element as ElementType,
      weight,
    ])
  );

const creates: Record<ElementType, ElementType> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const controls: Record<ElementType, ElementType> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function getJdn(year: number, month: number, day: number) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const solarMonthStartTerms = [
  { name: "소한", longitude: 285, month: 1, day: 6, branchIndex: 1 },
  { name: "입춘", longitude: 315, month: 2, day: 4, branchIndex: 2 },
  { name: "경칩", longitude: 345, month: 3, day: 6, branchIndex: 3 },
  { name: "청명", longitude: 15, month: 4, day: 5, branchIndex: 4 },
  { name: "입하", longitude: 45, month: 5, day: 6, branchIndex: 5 },
  { name: "망종", longitude: 75, month: 6, day: 6, branchIndex: 6 },
  { name: "소서", longitude: 105, month: 7, day: 7, branchIndex: 7 },
  { name: "입추", longitude: 135, month: 8, day: 8, branchIndex: 8 },
  { name: "백로", longitude: 165, month: 9, day: 8, branchIndex: 9 },
  { name: "한로", longitude: 195, month: 10, day: 8, branchIndex: 10 },
  { name: "입동", longitude: 225, month: 11, day: 7, branchIndex: 11 },
  { name: "대설", longitude: 255, month: 12, day: 7, branchIndex: 0 },
] as const;

type SolarMonthStartTerm = (typeof solarMonthStartTerms)[number];

const solarTermCache = new Map<string, number>();

function normalizeDegrees(value: number) {
  return mod(value, 360);
}

function sinDeg(value: number) {
  return Math.sin((value * Math.PI) / 180);
}

function getJulianDayFromUtcMs(utcMs: number) {
  return utcMs / 86400000 + 2440587.5;
}

function getSolarLongitude(utcMs: number) {
  const jd = getJulianDayFromUtcMs(utcMs);
  const t = (jd - 2451545.0) / 36525;
  const meanLongitude = normalizeDegrees(
    280.46646 + 36000.76983 * t + 0.0003032 * t * t
  );
  const meanAnomaly = normalizeDegrees(
    357.52911 + 35999.05029 * t - 0.0001537 * t * t
  );
  const center =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * sinDeg(meanAnomaly) +
    (0.019993 - 0.000101 * t) * sinDeg(2 * meanAnomaly) +
    0.000289 * sinDeg(3 * meanAnomaly);
  const trueLongitude = meanLongitude + center;
  const omega = 125.04 - 1934.136 * t;

  return normalizeDegrees(trueLongitude - 0.00569 - 0.00478 * sinDeg(omega));
}

function unwrapLongitudeNearTarget(longitude: number, target: number) {
  let unwrapped = longitude;

  while (unwrapped - target > 180) unwrapped -= 360;
  while (unwrapped - target < -180) unwrapped += 360;

  return unwrapped;
}

function getUtcMsFromKst(
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0
) {
  return Date.UTC(year, month - 1, day, hour, minute) - KST_OFFSET_MS;
}

function formatKstDateTime(utcMs: number) {
  const date = new Date(utcMs + KST_OFFSET_MS);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function getSolarTermUtcMs(year: number, term: SolarMonthStartTerm) {
  const cacheKey = `${year}-${term.name}`;
  const cached = solarTermCache.get(cacheKey);

  if (cached !== undefined) return cached;

  let low = getUtcMsFromKst(year, term.month, term.day, 12) - 5 * DAY_MS;
  let high = getUtcMsFromKst(year, term.month, term.day, 12) + 5 * DAY_MS;

  for (let index = 0; index < 48; index += 1) {
    const mid = (low + high) / 2;
    const longitude = unwrapLongitudeNearTarget(
      getSolarLongitude(mid),
      term.longitude
    );

    if (longitude < term.longitude) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const value = Math.round(high / (60 * 1000)) * 60 * 1000;
  solarTermCache.set(cacheKey, value);

  return value;
}

function getLocalYearFromUtcMs(utcMs: number) {
  return new Date(utcMs + KST_OFFSET_MS).getUTCFullYear();
}

function getInputDateTime(input: SajuLikeInput, solarDate: ReturnType<typeof resolveSolarDate>) {
  const isBranchPickerValue =
    input.birthTime !== undefined &&
    /^\d+$/.test(input.birthTime) &&
    Number(input.birthTime) >= 1 &&
    Number(input.birthTime) <= 12;
  const isClockValue = input.birthTime?.includes(":");
  const fallbackHourByBranch = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

  if (isClockValue && input.birthTime) {
    const [hour, minute] = input.birthTime.split(":").map(Number);

    return {
      utcMs: getUtcMsFromKst(
        solarDate.year,
        solarDate.month,
        solarDate.day,
        Number.isFinite(hour) ? hour : 12,
        Number.isFinite(minute) ? minute : 0
      ),
      precision: "clock" as const,
    };
  }

  if (isBranchPickerValue && input.birthTime) {
    const branchIndex = Number(input.birthTime) - 1;

    return {
      utcMs: getUtcMsFromKst(
        solarDate.year,
        solarDate.month,
        solarDate.day,
        fallbackHourByBranch[branchIndex] ?? 12
      ),
      precision: "branch" as const,
    };
  }

  if (input.hour !== undefined && Number.isFinite(input.hour)) {
    return {
      utcMs: getUtcMsFromKst(
        solarDate.year,
        solarDate.month,
        solarDate.day,
        input.hour,
        Number.isFinite(input.minute) ? input.minute ?? 0 : 0
      ),
      precision: "clock" as const,
    };
  }

  return {
    utcMs: getUtcMsFromKst(solarDate.year, solarDate.month, solarDate.day),
    precision: "date" as const,
  };
}

function getSolarMonthInfo(utcMs: number) {
  const localYear = getLocalYearFromUtcMs(utcMs);
  const terms = [localYear - 1, localYear, localYear + 1]
    .flatMap((year) =>
      solarMonthStartTerms.map((term) => ({
        ...term,
        year,
        utcMs: getSolarTermUtcMs(year, term),
      }))
    )
    .sort((a, b) => a.utcMs - b.utcMs);
  const latestTerm =
    [...terms].reverse().find((term) => term.utcMs <= utcMs) ?? terms[0];

  return {
    branchIndex: latestTerm.branchIndex,
    termName: latestTerm.name,
    termKst: formatKstDateTime(latestTerm.utcMs),
  };
}

function getSajuYear(utcMs: number) {
  const localYear = getLocalYearFromUtcMs(utcMs);
  const lichun = solarMonthStartTerms[1];
  const lichunUtcMs = getSolarTermUtcMs(localYear, lichun);

  return utcMs < lichunUtcMs ? localYear - 1 : localYear;
}

function getGanji(index: number) {
  return {
    stemIndex: mod(index, 10),
    branchIndex: mod(index, 12),
    stem: heavenlyStems[mod(index, 10)],
    branch: earthlyBranches[mod(index, 12)],
  };
}

function getGanjiIndex(stemIndex: number, branchIndex: number) {
  for (let index = 0; index < 60; index += 1) {
    if (index % 10 === stemIndex && index % 12 === branchIndex) {
      return index;
    }
  }

  return 0;
}

function getTenGodCategory(
  dayElement: ElementType,
  targetElement: ElementType
): TenGodCategory {
  if (dayElement === targetElement) return "peer";
  if (creates[dayElement] === targetElement) return "output";
  if (controls[dayElement] === targetElement) return "wealth";
  if (controls[targetElement] === dayElement) return "career";
  return "resource";
}

function getChineseCalendarParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("ko-KR-u-ca-chinese", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });

  const parts = formatter.formatToParts(date);
  const relatedYear = Number(
    parts.find((part) => String(part.type) === "relatedYear")?.value
  );
  const monthText = parts.find((part) => part.type === "month")?.value ?? "";
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const month = Number(monthText.replace(/\D/g, ""));
  const isLeapMonth = monthText.includes("윤");

  return { relatedYear, month, day, isLeapMonth };
}

function getBranchIndexByName(branch: KoreanBranch) {
  return earthlyBranches.findIndex((item) => item.name === branch);
}

function resolveSolarDate(input: SajuLikeInput) {
  const calendarType = input.calendarType ?? "solar";

  if (calendarType !== "lunar") {
    return {
      year: input.year,
      month: input.month,
      day: input.day,
      calendarType,
      convertedFromLunar: false,
    };
  }

  const start = Date.UTC(input.year - 1, 11, 15);
  const end = Date.UTC(input.year + 1, 1, 15);
  const oneDay = 24 * 60 * 60 * 1000;

  for (let time = start; time <= end; time += oneDay) {
    const date = new Date(time);
    const lunarParts = getChineseCalendarParts(date);

    if (
      lunarParts.relatedYear === input.year &&
      lunarParts.month === input.month &&
      lunarParts.day === input.day &&
      !lunarParts.isLeapMonth
    ) {
      return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        calendarType,
        convertedFromLunar: true,
      };
    }
  }

  return {
    year: input.year,
    month: input.month,
    day: input.day,
    calendarType,
    convertedFromLunar: false,
  };
}

const seasonalElementSupport: Record<number, Partial<ElementScoreMap>> = {
  0: { water: 14, metal: 5 },
  1: { earth: 11, water: 6, metal: 4 },
  2: { wood: 14, fire: 5 },
  3: { wood: 16, fire: 4 },
  4: { earth: 10, wood: 6, water: 3 },
  5: { fire: 14, earth: 5 },
  6: { fire: 16, earth: 4 },
  7: { earth: 10, fire: 6, wood: 3 },
  8: { metal: 14, water: 5 },
  9: { metal: 16, water: 4 },
  10: { earth: 10, metal: 6, fire: 3 },
  11: { water: 14, wood: 5 },
};

function getSeasonalSupport(monthBranchIndex: number): ElementScoreMap {
  const support = seasonalElementSupport[monthBranchIndex] ?? {};

  return {
    wood: support.wood ?? 0,
    fire: support.fire ?? 0,
    earth: support.earth ?? 0,
    metal: support.metal ?? 0,
    water: support.water ?? 0,
  };
}

function getMonthStemIndex(yearStemIndex: number, monthBranchIndex: number) {
  const yinMonthStemByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const offsetFromYin = mod(monthBranchIndex - 2, 12);

  return mod(yinMonthStemByYearStem[yearStemIndex] + offsetFromYin, 10);
}

function getDayGanjiIndex(year: number, month: number, day: number) {
  // 2000-01-01 is widely listed as 戊午 day; this offset aligns JDN with that 60-day cycle.
  return mod(getJdn(year, month, day) + 49, 60);
}

function getHourBranchIndex(input: SajuLikeInput) {
  if (input.timeBranch) {
    const branchIndex = getBranchIndexByName(input.timeBranch);
    return branchIndex >= 0 ? branchIndex : null;
  }

  if (input.birthTime === "0") return null;

  if (input.birthTime && input.birthTime !== "0") {
    const selectedBranch = Number(input.birthTime);
    if (Number.isFinite(selectedBranch) && selectedBranch >= 1 && selectedBranch <= 12) {
      return selectedBranch - 1;
    }
  }

  if (input.hour === undefined || Number.isNaN(input.hour)) return null;

  const minute = Number.isFinite(input.minute) ? input.minute ?? 0 : 0;
  const totalMinutes = input.hour * 60 + minute;

  if (totalMinutes >= 23 * 60 || totalMinutes < 60) return 0;
  if (totalMinutes < 3 * 60) return 1;
  if (totalMinutes < 5 * 60) return 2;
  if (totalMinutes < 7 * 60) return 3;
  if (totalMinutes < 9 * 60) return 4;
  if (totalMinutes < 11 * 60) return 5;
  if (totalMinutes < 13 * 60) return 6;
  if (totalMinutes < 15 * 60) return 7;
  if (totalMinutes < 17 * 60) return 8;
  if (totalMinutes < 19 * 60) return 9;
  if (totalMinutes < 21 * 60) return 10;
  return 11;
}

function getHourStemIndex(dayStemIndex: number, hourBranchIndex: number) {
  return mod((dayStemIndex % 5) * 2 + hourBranchIndex, 10);
}

function addElementScore(
  scores: Record<ElementType, number>,
  element: ElementType,
  value: number
) {
  scores[element] += value;
}

function addRelationScore(
  scores: RelationScoreMap,
  dayElement: ElementType,
  targetElement: ElementType,
  value: number
) {
  scores[getTenGodCategory(dayElement, targetElement)] += value;
}

function getRelationStrengthImpact(category: TenGodCategory) {
  const impact: Record<TenGodCategory, number> = {
    peer: 1,
    resource: 0.82,
    output: -0.36,
    wealth: -0.62,
    career: -0.72,
  };

  return impact[category];
}

function getDayStrengthLevel(score: number): DayStrengthLevel {
  if (score >= 64) return "strong";
  if (score <= 45) return "weak";
  return "balanced";
}

function getDayStrengthLabel(level: DayStrengthLevel) {
  if (level === "strong") return "기준 기운이 받쳐주는 편";
  if (level === "weak") return "기준 기운을 보완해야 하는 편";
  return "기준 기운이 균형권에 있는 편";
}

function getRoleLabel(role: SajuPillarRole) {
  const labels = {
    year: "연",
    month: "월",
    day: "일",
    hour: "시",
  };

  return labels[role];
}

function buildDayStrengthAnalysis(
  dayElement: ElementType,
  monthBranchIndex: number,
  pillars: Array<{
    role: SajuPillarRole;
    pillar: ReturnType<typeof getGanji>;
  }>
) {
  let score = 50;
  const rootBranches = new Set<string>();
  const monthElement = earthlyBranches[monthBranchIndex].element as ElementType;
  const monthRelation = getTenGodCategory(dayElement, monthElement);

  score += getRelationStrengthImpact(monthRelation) * 18;

  branchHiddenElements[monthBranchIndex].forEach(([element, ratio]) => {
    const relation = getTenGodCategory(dayElement, element);
    score += getRelationStrengthImpact(relation) * 7 * ratio;
  });

  pillars.forEach(({ role, pillar }) => {
    if (role !== "day") {
      const stemRelation = getTenGodCategory(
        dayElement,
        pillar.stem.element as ElementType
      );
      score += getRelationStrengthImpact(stemRelation) * 4;
    }

    const branchRelation = getTenGodCategory(
      dayElement,
      pillar.branch.element as ElementType
    );
    const branchWeight = role === "month" ? 8 : 4;
    score += getRelationStrengthImpact(branchRelation) * branchWeight;

    if (pillar.branch.element === dayElement) {
      rootBranches.add(`${getRoleLabel(role)}지 ${pillar.branch.name}`);
    }

    branchHiddenElements[pillar.branchIndex].forEach(([element, ratio]) => {
      const hiddenRelation = getTenGodCategory(dayElement, element);
      score += getRelationStrengthImpact(hiddenRelation) * 3 * ratio;

      if (element === dayElement) {
        rootBranches.add(`${getRoleLabel(role)}지 ${pillar.branch.name}`);
      }
    });
  });

  const clampedScore = clamp(score);
  const level = getDayStrengthLevel(clampedScore);

  return {
    score: clampedScore,
    level,
    label: getDayStrengthLabel(level),
    rootBranches: Array.from(rootBranches),
    monthRelation,
  };
}

function normalizeElementScores(raw: Record<ElementType, number>) {
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

  const rounded = {
    wood: clamp((raw.wood / total) * 100),
    fire: clamp((raw.fire / total) * 100),
    earth: clamp((raw.earth / total) * 100),
    metal: clamp((raw.metal / total) * 100),
    water: clamp((raw.water / total) * 100),
  };

  const diff =
    100 -
    (rounded.wood + rounded.fire + rounded.earth + rounded.metal + rounded.water);

  if (diff !== 0) {
    const strongest = (Object.entries(rounded).sort(
      (a, b) => b[1] - a[1]
    )[0][0] ?? "earth") as ElementType;
    rounded[strongest] += diff;
  }

  return rounded;
}

function normalizeRelationScores(raw: RelationScoreMap) {
  const total = raw.peer + raw.output + raw.wealth + raw.career + raw.resource;

  if (total <= 0) {
    return {
      peer: 20,
      output: 20,
      wealth: 20,
      career: 20,
      resource: 20,
    };
  }

  const rounded: RelationScoreMap = {
    peer: clamp((raw.peer / total) * 100),
    output: clamp((raw.output / total) * 100),
    wealth: clamp((raw.wealth / total) * 100),
    career: clamp((raw.career / total) * 100),
    resource: clamp((raw.resource / total) * 100),
  };

  const diff =
    100 -
    (rounded.peer +
      rounded.output +
      rounded.wealth +
      rounded.career +
      rounded.resource);

  if (diff !== 0) {
    const strongest = (Object.entries(rounded).sort(
      (a, b) => b[1] - a[1]
    )[0][0] ?? "resource") as TenGodCategory;
    rounded[strongest] += diff;
  }

  return rounded;
}

function getCharacterRole(role: SajuPillarRole, kind: "stem" | "branch") {
  return `${role}${kind === "stem" ? "Stem" : "Branch"}` as SajuCharacterRole;
}

function buildVisibleCharacters(
  pillars: Array<{
    role: SajuPillarRole;
    pillar: ReturnType<typeof getGanji>;
  }>
): VisibleSajuCharacter[] {
  return pillars.flatMap(({ role, pillar }) => [
    {
      role: getCharacterRole(role, "stem"),
      pillar: role,
      kind: "stem" as const,
      name: pillar.stem.name,
      element: pillar.stem.element as ElementType,
    },
    {
      role: getCharacterRole(role, "branch"),
      pillar: role,
      kind: "branch" as const,
      name: pillar.branch.name,
      element: pillar.branch.element as ElementType,
    },
  ]);
}

function buildSajuContributions(
  dayElement: ElementType,
  pillars: Array<{
    role: SajuPillarRole;
    pillar: ReturnType<typeof getGanji>;
  }>
): SajuContribution[] {
  return pillars.flatMap(({ role, pillar }) => {
    const stemElement = pillar.stem.element as ElementType;
    const stemContribution: SajuContribution = {
      role,
      kind: "stem",
      name: pillar.stem.name,
      element: stemElement,
      weight: 1,
      relation: getTenGodCategory(dayElement, stemElement),
    };
    const hiddenStemContributions = branchHiddenStems[pillar.branchIndex].map(
      ({ stemIndex, weight }) => {
        const stem = heavenlyStems[stemIndex];
        const element = stem.element as ElementType;

        return {
          role,
          kind: "hiddenStem" as const,
          name: stem.name,
          element,
          weight,
          relation: getTenGodCategory(dayElement, element),
          branch: pillar.branch.name as KoreanBranch,
        };
      }
    );

    return [stemContribution, ...hiddenStemContributions];
  });
}

export function analyzeSajuLikeProfile(input: SajuLikeInput) {
  const solarDate = resolveSolarDate(input);
  const inputDateTime = getInputDateTime(input, solarDate);
  const sajuYear = getSajuYear(inputDateTime.utcMs);
  const yearIndex = mod(sajuYear - 1984, 60);
  const yearPillar = getGanji(yearIndex);

  const solarMonthInfo = getSolarMonthInfo(inputDateTime.utcMs);
  const monthBranchIndex = solarMonthInfo.branchIndex;
  const monthStemIndex = getMonthStemIndex(
    yearPillar.stemIndex,
    monthBranchIndex
  );
  const monthPillar = getGanji(
    getGanjiIndex(monthStemIndex, monthBranchIndex)
  );

  const dayIndex = getDayGanjiIndex(
    solarDate.year,
    solarDate.month,
    solarDate.day
  );
  const dayPillar = getGanji(dayIndex);

  const hourBranchIndex = getHourBranchIndex(input);
  const hourStemIndex =
    hourBranchIndex === null
      ? null
      : getHourStemIndex(dayPillar.stemIndex, hourBranchIndex);
  const hourPillar =
    hourBranchIndex === null || hourStemIndex === null
      ? null
      : getGanji(getGanjiIndex(hourStemIndex, hourBranchIndex));

  const visibleElementRawScores: Record<ElementType, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  const relationCounts: Record<TenGodCategory, number> = {
    peer: 0,
    output: 0,
    wealth: 0,
    career: 0,
    resource: 0,
  };
  const relationRawScores: RelationScoreMap = {
    peer: 0,
    output: 0,
    wealth: 0,
    career: 0,
    resource: 0,
  };

  const dayElement = dayPillar.stem.element as ElementType;
  const pillars = [
    { role: "year" as const, pillar: yearPillar },
    { role: "month" as const, pillar: monthPillar },
    { role: "day" as const, pillar: dayPillar },
    hourPillar
      ? { role: "hour" as const, pillar: hourPillar }
      : null,
  ].filter(Boolean) as Array<{
    role: SajuPillarRole;
    pillar: ReturnType<typeof getGanji>;
  }>;
  const visibleCharacters = buildVisibleCharacters(pillars);
  const sajuContributions = buildSajuContributions(dayElement, pillars);

  sajuContributions.forEach(({ element, weight, relation }) => {
    addElementScore(visibleElementRawScores, element, weight);
    addRelationScore(relationRawScores, dayElement, element, weight);
    relationCounts[relation] += weight;
  });

  const seasonalSupport = getSeasonalSupport(monthBranchIndex);

  const elementScores = normalizeElementScores(visibleElementRawScores);
  const relationScores = normalizeRelationScores(relationRawScores);
  const values = Object.values(elementScores);
  const maxElement = Math.max(...values);
  const minElement = Math.min(...values);
  const balanceScore = Math.max(0, 10 - (maxElement - minElement) * 0.4);
  const dayStrength = buildDayStrengthAnalysis(
    dayElement,
    monthBranchIndex,
    pillars
  );

  return {
    dayMaster: dayPillar.stem.name,
    dayElement,
    solarDate,
    pillars: {
      year: `${yearPillar.stem.name}${yearPillar.branch.name}`,
      month: `${monthPillar.stem.name}${monthPillar.branch.name}`,
      day: `${dayPillar.stem.name}${dayPillar.branch.name}`,
      hour: hourPillar
        ? `${hourPillar.stem.name}${hourPillar.branch.name}`
        : "모름",
    },
    elementScores,
    elementRawScores: visibleElementRawScores,
    visibleElementRawScores,
    relationCounts,
    relationScores,
    relationRawScores,
    visibleCharacters,
    sajuContributions,
    visibleCharacterCount: visibleCharacters.length,
    seasonalSupport,
    balanceScore,
    dayStrength,
    monthSeason: {
      branch: earthlyBranches[monthBranchIndex].name,
      element: earthlyBranches[monthBranchIndex].element as ElementType,
      relationToDayMaster: dayStrength.monthRelation,
      termName: solarMonthInfo.termName,
      termKst: solarMonthInfo.termKst,
      timePrecision: inputDateTime.precision,
    },
  };
}
