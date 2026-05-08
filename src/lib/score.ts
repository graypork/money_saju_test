import { resultTemplates } from "./resultTemplates";
import { analyzeSajuLikeProfile } from "./saju";

export type BirthInput = {
  birthDate: string;
  birthTime: string;
  gender: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pickTypeId(relationCounts: {
  peer: number;
  output: number;
  wealth: number;
  career: number;
  resource: number;
}, balanceScore: number) {
  const { peer, output, wealth, career, resource } = relationCounts;

  const typeScores = [
    { id: 1, score: resource * 2 + career + balanceScore },
    { id: 2, score: output * 3 + wealth + peer },
    { id: 3, score: career * 3 + wealth * 2 + balanceScore },
    { id: 4, score: wealth * 3 + output * 2 + peer },
    { id: 5, score: peer * 2 + output + career },
    { id: 6, score: resource * 2 + output + career },
    { id: 7, score: peer * 2 + output * 2 + Math.max(0, 10 - balanceScore) },
    { id: 8, score: balanceScore * 2 + resource + wealth },
    { id: 9, score: resource * 3 + career * 2 },
    { id: 10, score: output * 3 + career + peer },
    { id: 11, score: wealth * 3 + resource + balanceScore },
    { id: 12, score: peer * 3 + output * 2 + wealth },
  ];

  return typeScores.sort((a, b) => b.score - a.score)[0].id;
}

export function calculateWealthResult(input: BirthInput) {
  const saju = analyzeSajuLikeProfile(input.birthDate, input.birthTime);

  const { peer, output, wealth, career, resource } = saju.relationCounts;

  const rawPotential =
    58 +
    wealth * 5 +
    output * 4 +
    career * 3 +
    resource * 2 +
    peer * 2 +
    saju.balanceScore;

  const genderAdjustment =
    input.gender === "unknown" ? 0 : input.gender === "male" ? 1 : 1;

  const score = clamp(rawPotential + genderAdjustment, 55, 96);

  const topPercent = clamp(100 - score, 4, 45);

  const typeId = pickTypeId(saju.relationCounts, saju.balanceScore);
  const type = resultTemplates.find((item) => item.id === typeId) ?? resultTemplates[0];

  return {
    score,
    topPercent,
    type,
    saju,
  };
}