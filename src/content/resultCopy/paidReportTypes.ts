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
};

export type PaidReport = {
  animalKey: string;
  animalName: string;
  title: string;
  sections: PaidReportSection[];
};
