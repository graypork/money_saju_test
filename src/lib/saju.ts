export type ElementType = "wood" | "fire" | "earth" | "metal" | "water";
export type CalendarType = "solar" | "lunar";

export type TenGodCategory =
  | "peer"
  | "output"
  | "wealth"
  | "career"
  | "resource";

export type ElementScoreMap = Record<ElementType, number>;
export type RelationScoreMap = Record<TenGodCategory, number>;

export type SajuLikeInput = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  birthTime?: string;
  calendarType?: CalendarType;
};

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

const branchHiddenElements: Array<Array<[ElementType, number]>> = [
  [["water", 1]],
  [
    ["earth", 0.6],
    ["water", 0.25],
    ["metal", 0.15],
  ],
  [
    ["wood", 0.6],
    ["fire", 0.25],
    ["earth", 0.15],
  ],
  [["wood", 1]],
  [
    ["earth", 0.6],
    ["wood", 0.25],
    ["water", 0.15],
  ],
  [
    ["fire", 0.6],
    ["earth", 0.25],
    ["metal", 0.15],
  ],
  [
    ["fire", 0.7],
    ["earth", 0.3],
  ],
  [
    ["earth", 0.6],
    ["fire", 0.25],
    ["wood", 0.15],
  ],
  [
    ["metal", 0.6],
    ["water", 0.25],
    ["earth", 0.15],
  ],
  [["metal", 1]],
  [
    ["earth", 0.6],
    ["metal", 0.25],
    ["fire", 0.15],
  ],
  [
    ["water", 0.7],
    ["wood", 0.3],
  ],
];

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

function getSajuYear(solarYear: number, solarMonth: number, solarDay: number) {
  if (solarMonth < 2) return solarYear - 1;
  if (solarMonth === 2 && solarDay < 4) return solarYear - 1;
  return solarYear;
}

function getMonthBranchIndex(month: number, day: number) {
  const starts = [
    { month: 1, day: 6, branchIndex: 1 },
    { month: 2, day: 4, branchIndex: 2 },
    { month: 3, day: 6, branchIndex: 3 },
    { month: 4, day: 5, branchIndex: 4 },
    { month: 5, day: 6, branchIndex: 5 },
    { month: 6, day: 6, branchIndex: 6 },
    { month: 7, day: 7, branchIndex: 7 },
    { month: 8, day: 8, branchIndex: 8 },
    { month: 9, day: 8, branchIndex: 9 },
    { month: 10, day: 8, branchIndex: 10 },
    { month: 11, day: 7, branchIndex: 11 },
    { month: 12, day: 7, branchIndex: 0 },
  ];

  let branchIndex = 0;

  starts.forEach((start) => {
    if (month > start.month || (month === start.month && day >= start.day)) {
      branchIndex = start.branchIndex;
    }
  });

  return branchIndex;
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
  if (input.birthTime === "0") return null;

  if (input.birthTime && input.birthTime !== "0") {
    const selectedBranch = Number(input.birthTime);
    if (Number.isFinite(selectedBranch) && selectedBranch >= 1 && selectedBranch <= 12) {
      return selectedBranch - 1;
    }
  }

  if (input.hour === undefined || Number.isNaN(input.hour)) return null;

  if (input.hour >= 23 || input.hour < 1) return 0;
  if (input.hour < 3) return 1;
  if (input.hour < 5) return 2;
  if (input.hour < 7) return 3;
  if (input.hour < 9) return 4;
  if (input.hour < 11) return 5;
  if (input.hour < 13) return 6;
  if (input.hour < 15) return 7;
  if (input.hour < 17) return 8;
  if (input.hour < 19) return 9;
  if (input.hour < 21) return 10;
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

function addBranchScore(
  scores: Record<ElementType, number>,
  branchIndex: number,
  mainWeight: number,
  hiddenWeight: number
) {
  const branchElement = earthlyBranches[branchIndex].element as ElementType;
  addElementScore(scores, branchElement, mainWeight);

  branchHiddenElements[branchIndex].forEach(([element, ratio]) => {
    addElementScore(scores, element, hiddenWeight * ratio);
  });
}

function addRelationScore(
  scores: RelationScoreMap,
  dayElement: ElementType,
  targetElement: ElementType,
  value: number
) {
  scores[getTenGodCategory(dayElement, targetElement)] += value;
}

function addBranchRelationScore(
  scores: RelationScoreMap,
  dayElement: ElementType,
  branchIndex: number,
  mainWeight: number,
  hiddenWeight: number
) {
  const branchElement = earthlyBranches[branchIndex].element as ElementType;
  addRelationScore(scores, dayElement, branchElement, mainWeight);

  branchHiddenElements[branchIndex].forEach(([element, ratio]) => {
    addRelationScore(scores, dayElement, element, hiddenWeight * ratio);
  });
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

export function analyzeSajuLikeProfile(input: SajuLikeInput) {
  const solarDate = resolveSolarDate(input);
  const sajuYear = getSajuYear(solarDate.year, solarDate.month, solarDate.day);
  const yearIndex = mod(sajuYear - 1984, 60);
  const yearPillar = getGanji(yearIndex);

  const monthBranchIndex = getMonthBranchIndex(solarDate.month, solarDate.day);
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

  const elementRawScores: Record<ElementType, number> = {
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
    { pillar: yearPillar, stemWeight: 12, branchWeight: 8, hiddenWeight: 2 },
    { pillar: monthPillar, stemWeight: 20, branchWeight: 16, hiddenWeight: 4 },
    { pillar: dayPillar, stemWeight: 22, branchWeight: 10, hiddenWeight: 2 },
    hourPillar
      ? { pillar: hourPillar, stemWeight: 14, branchWeight: 8, hiddenWeight: 2 }
      : null,
  ].filter(Boolean) as Array<{
    pillar: ReturnType<typeof getGanji>;
    stemWeight: number;
    branchWeight: number;
    hiddenWeight: number;
  }>;

  pillars.forEach(({ pillar, stemWeight, branchWeight, hiddenWeight }) => {
    const stemElement = pillar.stem.element as ElementType;
    const branchElement = pillar.branch.element as ElementType;

    addElementScore(elementRawScores, stemElement, stemWeight);
    addBranchScore(
      elementRawScores,
      pillar.branchIndex,
      branchWeight,
      hiddenWeight
    );

    addRelationScore(relationRawScores, dayElement, stemElement, stemWeight);
    addBranchRelationScore(
      relationRawScores,
      dayElement,
      pillar.branchIndex,
      branchWeight,
      hiddenWeight
    );

    relationCounts[getTenGodCategory(dayElement, stemElement)] += 1;
    relationCounts[getTenGodCategory(dayElement, branchElement)] += 1;
  });

  const seasonalSupport = getSeasonalSupport(monthBranchIndex);
  (Object.entries(seasonalSupport) as Array<[ElementType, number]>).forEach(
    ([element, value]) => {
      addElementScore(elementRawScores, element, value);
      addRelationScore(relationRawScores, dayElement, element, value);
    }
  );

  const elementScores = normalizeElementScores(elementRawScores);
  const relationScores = normalizeRelationScores(relationRawScores);
  const values = Object.values(elementScores);
  const maxElement = Math.max(...values);
  const minElement = Math.min(...values);
  const balanceScore = Math.max(0, 10 - (maxElement - minElement) * 0.4);

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
    elementRawScores,
    relationCounts,
    relationScores,
    relationRawScores,
    seasonalSupport,
    balanceScore,
  };
}
