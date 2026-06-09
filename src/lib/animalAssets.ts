export type AnimalKey =
  | "fox"
  | "ox"
  | "squirrel"
  | "hawk"
  | "tiger"
  | "rabbit"
  | "deer"
  | "swan"
  | "whale"
  | "otter";

export type AnimalAssetKey = AnimalKey | "bull";

export type AnimalImageEntry = {
  candidates: string[];
  placeholder: string;
};

export type AnimalAsset = {
  animalKey: AnimalKey;
  displayName: string;
  mainPhoto: string | null;
  mainPhotoCandidates: string[];
  thumb: string | null;
  pawStamp: string | null;
  accentColor: string;
};

export type LandingAnimalPreview = {
  animalKey: AnimalKey;
  displayName: string;
  photo: string;
  accentColor: string;
};

const animalKeys: AnimalKey[] = [
  "fox",
  "ox",
  "squirrel",
  "hawk",
  "tiger",
  "rabbit",
  "deer",
  "swan",
  "whale",
  "otter",
];

function numberedMainPath(key: AnimalKey, index: number) {
  return `/assets/document-ui/animals/${key}-main-${index}.webp`;
}

function legacyMainPath(key: AnimalKey) {
  return `/assets/document-ui/animals/${key}-main.webp`;
}

function animalThumbPath(key: AnimalKey) {
  return `/assets/document-ui/animals/${key}-thumb.webp`;
}

function animalMarkPath(key: AnimalKey) {
  return `/assets/document-ui/marks/${key}-mark.png`;
}

function imageEntry(key: AnimalKey, extraCandidates: string[] = []): AnimalImageEntry {
  return {
    candidates: [
      numberedMainPath(key, 1),
      numberedMainPath(key, 2),
      numberedMainPath(key, 3),
      legacyMainPath(key),
      ...extraCandidates,
    ],
    placeholder: `${key}-main-1.webp`,
  };
}

export const animalMainImages: Record<AnimalKey, AnimalImageEntry> = {
  fox: imageEntry("fox"),
  ox: imageEntry("ox"),
  squirrel: imageEntry("squirrel"),
  hawk: imageEntry("hawk", [
    "/assets/document-ui/animals/hwak-main-1.webp",
    "/assets/document-ui/animals/hwak-main-2.webp",
  ]),
  tiger: imageEntry("tiger"),
  rabbit: imageEntry("rabbit"),
  deer: imageEntry("deer"),
  swan: imageEntry("swan"),
  whale: imageEntry("whale"),
  otter: imageEntry("otter"),
};

const existingAnimalMainImagePaths = [
  "/assets/document-ui/animals/deer-main-1.webp",
  "/assets/document-ui/animals/deer-main-2.webp",
  "/assets/document-ui/animals/fox-main.webp",
  "/assets/document-ui/animals/hwak-main-1.webp",
  "/assets/document-ui/animals/hwak-main-2.webp",
  "/assets/document-ui/animals/otter-main-1.webp",
  "/assets/document-ui/animals/ox-main-1.webp",
  "/assets/document-ui/animals/ox-main-2.webp",
  "/assets/document-ui/animals/rabbit-main-1.webp",
  "/assets/document-ui/animals/squirrel-main-1.webp",
  "/assets/document-ui/animals/squirrel-main-2.webp",
  "/assets/document-ui/animals/swan-main-1.webp",
  "/assets/document-ui/animals/swan-main-2.webp",
  "/assets/document-ui/animals/tiger-main.webp",
] as const;

export const existingAnimalDocumentAssetPaths = [...existingAnimalMainImagePaths];

const existingAnimalMainImageSet = new Set<string>(existingAnimalMainImagePaths);

const animalMeta: Record<
  AnimalKey,
  Pick<AnimalAsset, "displayName" | "accentColor">
> = {
  fox: {
    displayName: "여우",
    accentColor: "#C96E41",
  },
  ox: {
    displayName: "황소",
    accentColor: "#8A6A3E",
  },
  squirrel: {
    displayName: "다람쥐",
    accentColor: "#A06C38",
  },
  hawk: {
    displayName: "매",
    accentColor: "#66707A",
  },
  tiger: {
    displayName: "호랑이",
    accentColor: "#B8792D",
  },
  rabbit: {
    displayName: "토끼",
    accentColor: "#7B9B67",
  },
  deer: {
    displayName: "사슴",
    accentColor: "#B8876E",
  },
  swan: {
    displayName: "백조",
    accentColor: "#8A98A6",
  },
  whale: {
    displayName: "고래",
    accentColor: "#3F7D9B",
  },
  otter: {
    displayName: "수달",
    accentColor: "#4F8D87",
  },
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function normalizeAnimalAssetKey(value: unknown): AnimalKey | null {
  const key = String(value ?? "").trim().toLowerCase();

  if (key === "bull") return "ox";
  if ((animalKeys as string[]).includes(key)) return key as AnimalKey;

  return null;
}

export function getAvailableAnimalMainPhotos(value: unknown): string[] {
  const key = normalizeAnimalAssetKey(value);
  if (!key) return [];

  return animalMainImages[key].candidates.filter((candidate) =>
    existingAnimalMainImageSet.has(candidate)
  );
}

export function getPreferredAnimalMainPhoto(value: unknown): string | null {
  const key = normalizeAnimalAssetKey(value);
  if (!key) return null;

  return (
    getAvailableAnimalMainPhotos(key)[0] ??
    animalMainImages[key].candidates[0] ??
    null
  );
}

export function getRandomAnimalMainPhoto(value: unknown): string | null {
  const key = normalizeAnimalAssetKey(value);
  if (!key) return null;

  const availableCandidates = getAvailableAnimalMainPhotos(key);
  const candidates =
    availableCandidates.length > 0
      ? availableCandidates
      : animalMainImages[key].candidates;

  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

export const animalAssetMap: Record<AnimalKey, AnimalAsset> = animalKeys.reduce(
  (assets, key) => {
    assets[key] = {
      animalKey: key,
      displayName: animalMeta[key].displayName,
      mainPhoto: getPreferredAnimalMainPhoto(key),
      mainPhotoCandidates: animalMainImages[key].candidates,
      thumb: animalThumbPath(key),
      pawStamp: animalMarkPath(key),
      accentColor: animalMeta[key].accentColor,
    };

    return assets;
  },
  {} as Record<AnimalKey, AnimalAsset>
);

export const fallbackAnimalAsset: AnimalAsset = {
  animalKey: "fox",
  displayName: "동물",
  mainPhoto: null,
  mainPhotoCandidates: [],
  thumb: null,
  pawStamp: null,
  accentColor: "#285C42",
};

export function getAnimalAsset(value: unknown): AnimalAsset {
  const key = normalizeAnimalAssetKey(value);

  return key ? animalAssetMap[key] : fallbackAnimalAsset;
}

export function getLandingAnimalPreviewOptions(): LandingAnimalPreview[] {
  return animalKeys.flatMap((animalKey) => {
    const asset = getAnimalAsset(animalKey);

    return getAvailableAnimalMainPhotos(animalKey).map((photo) => ({
      animalKey,
      displayName: asset.displayName,
      photo,
      accentColor: asset.accentColor,
    }));
  });
}

export function getRandomLandingAnimalPreviews(
  count = 3
): LandingAnimalPreview[] {
  const previewsByAnimal = new Map<AnimalKey, LandingAnimalPreview[]>();

  getLandingAnimalPreviewOptions().forEach((preview) => {
    const previews = previewsByAnimal.get(preview.animalKey) ?? [];
    previews.push(preview);
    previewsByAnimal.set(preview.animalKey, previews);
  });

  return shuffle(Array.from(previewsByAnimal.entries()))
    .slice(0, count)
    .map(([, previews]) => shuffle(previews)[0])
    .filter(Boolean);
}
