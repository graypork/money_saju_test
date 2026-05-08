export type ElementType = "wood" | "fire" | "earth" | "metal" | "water";

export type TenGodCategory =
  | "peer"
  | "output"
  | "wealth"
  | "career"
  | "resource";

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

function getMonthBranchIndex(month: number) {
  // MVP용 간단 매핑: 1월=축, 2월=인, ... 12월=자
  return month % 12;
}

export function analyzeSajuLikeProfile(birthDate: string, birthTime: string) {
  const [year, month, day] = birthDate.split("-").map(Number);

  const yearIndex = mod(year - 1984, 60);
  const monthBranchIndex = getMonthBranchIndex(month);
  const monthStemIndex = mod((yearIndex % 10) * 2 + month, 10);
  const monthIndex = mod(monthStemIndex - monthBranchIndex, 60);

  const referenceJdn = getJdn(1984, 2, 2);
  const currentJdn = getJdn(year, month, day);
  const dayIndex = mod(currentJdn - referenceJdn, 60);

  const hourBranchIndex =
    birthTime === "0" ? null : mod(Number(birthTime) - 1, 12);

  const dayStemIndex = dayIndex % 10;

  const hourIndex =
    hourBranchIndex === null
      ? null
      : mod((dayStemIndex % 5) * 2 + hourBranchIndex, 60);

  const yearPillar = getGanji(yearIndex);
  const monthPillar = getGanji(monthIndex);
  const dayPillar = getGanji(dayIndex);
  const hourPillar = hourIndex === null ? null : getGanji(hourIndex);

  const dayMaster = dayPillar.stem;
  const dayElement = dayMaster.element as ElementType;

  const elementCounts: Record<ElementType, number> = {
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

  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar].filter(
    Boolean
  ) as Array<ReturnType<typeof getGanji>>;

  pillars.forEach((pillar) => {
    const stemElement = pillar.stem.element as ElementType;
    const branchElement = pillar.branch.element as ElementType;

    elementCounts[stemElement] += 1;
    elementCounts[branchElement] += 1;

    relationCounts[getTenGodCategory(dayElement, stemElement)] += 1;
    relationCounts[getTenGodCategory(dayElement, branchElement)] += 1;
  });

  const values = Object.values(elementCounts);
  const maxElement = Math.max(...values);
  const minElement = Math.min(...values);
  const balanceScore = Math.max(0, 10 - (maxElement - minElement) * 2);

  return {
    dayMaster: dayMaster.name,
    dayElement,
    pillars: {
      year: `${yearPillar.stem.name}${yearPillar.branch.name}`,
      month: `${monthPillar.stem.name}${monthPillar.branch.name}`,
      day: `${dayPillar.stem.name}${dayPillar.branch.name}`,
      hour: hourPillar
        ? `${hourPillar.stem.name}${hourPillar.branch.name}`
        : "모름",
    },
    elementCounts,
    relationCounts,
    balanceScore,
  };
}