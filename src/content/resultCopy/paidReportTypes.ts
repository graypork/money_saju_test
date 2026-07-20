export type PaidReportParagraphBlock = {
  type: "paragraph";
  text: string;
};

export type PaidReportHighlightBlock = {
  type: "highlight";
  label?: string;
  text: string;
};

export type PaidReportListBlock = {
  type: "list";
  title?: string;
  items: string[];
};

export type PaidReportTableBlock = {
  type: "table";
  headers: string[];
  rows: string[][];
};

export type PaidReportWeeklyAction = {
  title: string;
  description: string;
};

export type PaidReportWeeklyDay = {
  day: "월" | "화" | "수" | "목" | "금" | "토" | "일";
  action: string;
};

export type PaidReportWeeklyPlan = {
  focus: string;
  actions: [PaidReportWeeklyAction, PaidReportWeeklyAction, PaidReportWeeklyAction];
  days: [
    PaidReportWeeklyDay,
    PaidReportWeeklyDay,
    PaidReportWeeklyDay,
    PaidReportWeeklyDay,
    PaidReportWeeklyDay,
    PaidReportWeeklyDay,
    PaidReportWeeklyDay,
  ];
  caution?: string;
};

export type PaidReportBlock =
  | PaidReportParagraphBlock
  | PaidReportHighlightBlock
  | PaidReportListBlock
  | PaidReportTableBlock;

export type PaidReportSection = {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  blocks: PaidReportBlock[];
  weeklyPlan?: PaidReportWeeklyPlan;
};

export type PaidReport = {
  animalKey: string;
  animalName: string;
  title: string;
  sections: PaidReportSection[];
};

export const PAID_REPORT_ANIMAL_KEYS = [
  "fox",
  "ox",
  "squirrel",
  "hawk",
  "tiger",
  "rabbit",
  "deer",
  "swan",
  "otter",
] as const;

export type PaidReportAnimalKey = (typeof PAID_REPORT_ANIMAL_KEYS)[number];
