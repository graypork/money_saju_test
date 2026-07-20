import type { PaidReport, PaidReportAnimalKey } from "./paidReportTypes";
import { paidReportWeeklyPlans } from "./paidReportWeeklyPlans";
import { deerReport } from "./paidReports/deer";
import { foxReport } from "./paidReports/fox";
import { hawkReport } from "./paidReports/hawk";
import { otterReport } from "./paidReports/otter";
import { oxReport } from "./paidReports/ox";
import { rabbitReport } from "./paidReports/rabbit";
import { squirrelReport } from "./paidReports/squirrel";
import { swanReport } from "./paidReports/swan";
import { tigerReport } from "./paidReports/tiger";

function withWeeklyPlan(report: PaidReport): PaidReport {
  return {
    ...report,
    sections: report.sections.map((section) =>
      section.order === 12
        ? {
            ...section,
            blocks: [],
            weeklyPlan: paidReportWeeklyPlans[report.animalKey as PaidReportAnimalKey],
          }
        : section
    ),
  };
}

const REPORTS: Record<PaidReportAnimalKey, PaidReport> = {
  fox: withWeeklyPlan(foxReport),
  ox: withWeeklyPlan(oxReport),
  squirrel: withWeeklyPlan(squirrelReport),
  hawk: withWeeklyPlan(hawkReport),
  tiger: withWeeklyPlan(tigerReport),
  rabbit: withWeeklyPlan(rabbitReport),
  deer: withWeeklyPlan(deerReport),
  swan: withWeeklyPlan(swanReport),
  otter: withWeeklyPlan(otterReport),
};

export const paidReportsByAnimalKey = REPORTS;

export function getPaidReportByAnimalKey(animalKey: string): PaidReport | null {
  return REPORTS[animalKey as PaidReportAnimalKey] ?? null;
}
