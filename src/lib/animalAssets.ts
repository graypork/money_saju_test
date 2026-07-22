export type AnimalKey =
  | "fox"
  | "ox"
  | "squirrel"
  | "hawk"
  | "tiger"
  | "rabbit"
  | "deer"
  | "swan"
  | "otter";

export type AnimalImageGender = "f" | "m";

export type LandingAnimalPreview = {
  animalKey: AnimalKey;
  gender: AnimalImageGender;
  photo: string;
};

export const animalKeys: readonly AnimalKey[] = [
  "fox",
  "ox",
  "squirrel",
  "hawk",
  "tiger",
  "rabbit",
  "deer",
  "swan",
  "otter",
];

const animalImagePaths: Record<AnimalKey, Record<AnimalImageGender, string>> = {
  deer: {
    f: "/assets/document-ui/animals/deer-f.webp",
    m: "/assets/document-ui/animals/deer-m.webp",
  },
  tiger: {
    f: "/assets/document-ui/animals/tiger-f.webp",
    m: "/assets/document-ui/animals/tiger-m.webp",
  },
  squirrel: {
    f: "/assets/document-ui/animals/squirrel-f.webp",
    m: "/assets/document-ui/animals/squirrel-m.webp",
  },
  fox: {
    f: "/assets/document-ui/animals/fox-f.webp",
    m: "/assets/document-ui/animals/fox-m.webp",
  },
  ox: {
    f: "/assets/document-ui/animals/ox-f.webp",
    m: "/assets/document-ui/animals/ox-m.webp",
  },
  otter: {
    f: "/assets/document-ui/animals/otter-f.webp",
    m: "/assets/document-ui/animals/otter-m.webp",
  },
  rabbit: {
    f: "/assets/document-ui/animals/rabbit-f.webp",
    m: "/assets/document-ui/animals/rabbit-m.webp",
  },
  hawk: {
    f: "/assets/document-ui/animals/hwak-f.webp",
    m: "/assets/document-ui/animals/hwak-m.webp",
  },
  swan: {
    f: "/assets/document-ui/animals/swan-f.webp",
    m: "/assets/document-ui/animals/swan-m.webp",
  },
};

export function normalizeAnimalAssetKey(value: unknown): AnimalKey | null {
  const key = String(value ?? "").trim().toLowerCase();

  if (key === "bull") return "ox";
  if ((animalKeys as readonly string[]).includes(key)) return key as AnimalKey;

  return null;
}

export function resolveAnimalImageGender(value: unknown): AnimalImageGender {
  const gender = String(value ?? "").trim().toLowerCase();
  const genderMap: Record<string, AnimalImageGender> = {
    female: "f",
    male: "m",
    f: "f",
    m: "m",
    unknown: "f",
  };

  return genderMap[gender] ?? "f";
}

export function getAnimalImagePath(
  animalKey: AnimalKey,
  gender: AnimalImageGender
): string {
  return animalImagePaths[animalKey][gender];
}

function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function getRandomLandingAnimalPreviews(
  random = Math.random
): LandingAnimalPreview[] {
  const selectedAnimals = shuffle(animalKeys, random).slice(0, 3);
  const genderMix: readonly AnimalImageGender[] =
    random() < 0.5 ? ["f", "f", "m"] : ["f", "m", "m"];
  const selectedGenders = shuffle(genderMix, random);

  return selectedAnimals.map((animalKey, index) => {
    const gender = selectedGenders[index] ?? "f";

    return {
      animalKey,
      gender,
      photo: getAnimalImagePath(animalKey, gender),
    };
  });
}
