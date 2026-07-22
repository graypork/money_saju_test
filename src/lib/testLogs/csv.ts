import type { TestLogRecord } from "./types";

const FORMULA_PREFIX = /^[\s]*[=+\-@＝＋－＠]/u;

function toCsvText(value: unknown) {
  if (Array.isArray(value)) return value.join(" / ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);

  return String(value ?? "");
}

export function serializeCsvCell(value: unknown) {
  const text = toCsvText(value);
  const safeText = FORMULA_PREFIX.test(text) ? `'${text}` : text;

  return `"${safeText.replace(/"/g, '""')}"`;
}

export function toTestLogCsv(logs: TestLogRecord[]) {
  const columns: Array<[string, keyof TestLogRecord]> = [
    ["저장 시간", "createdAt"],
    ["생년월일", "birthDate"],
    ["양/음력", "calendarType"],
    ["생시", "birthTime"],
    ["성별", "gender"],
    ["animalKey", "animalKey"],
    ["결과유형", "animalTitle"],
    ["결과요약", "resultSummary"],
    ["dayStem", "dayStem"],
    ["element", "element"],
    ["salList", "salList"],
    ["copyVersion", "copyVersion"],
    ["logicVersion", "logicVersion"],
    ["path", "path"],
  ];
  const header = columns.map(([label]) => serializeCsvCell(label)).join(",");
  const rows = logs.map((log) =>
    columns.map(([, key]) => serializeCsvCell(log[key])).join(","),
  );

  return `\uFEFF${[header, ...rows].join("\n")}`;
}
