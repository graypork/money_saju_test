import { resultTemplates } from "./resultTemplates";

export type BirthInput = {
  birthDate: string;
  birthTime: string;
  gender: string;
};

function sumDigits(value: string) {
  return value
    .replace(/\D/g, "")
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);
}

export function calculateWealthResult(input: BirthInput) {
  const dateScore = sumDigits(input.birthDate);
  const timeScore = Number(input.birthTime || 0);
  const genderScore =
    input.gender === "male" ? 7 : input.gender === "female" ? 11 : 3;

  const rawScore = dateScore * 7 + timeScore * 11 + genderScore * 5;

  const wealthScore = 52 + (rawScore % 46);
  const topPercent = Math.max(1, 100 - wealthScore);

  const typeIndex = rawScore % resultTemplates.length;
  const template = resultTemplates[typeIndex];

  return {
    score: wealthScore,
    topPercent,
    type: template,
  };
}