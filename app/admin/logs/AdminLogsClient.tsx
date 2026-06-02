"use client";

import { useEffect, useMemo, useState } from "react";
import type { TestLogRecord } from "../../../src/lib/testLogs/types";

type LogsResponse =
  | { ok: true; logs: TestLogRecord[] }
  | { ok: false; error: string };

const FILTER_KEYS = ["animalKey", "calendarType", "birthTime", "dayStem"] as const;

function formatDate(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function uniqueOptions(logs: TestLogRecord[], key: (typeof FILTER_KEYS)[number]) {
  return Array.from(new Set(logs.map((log) => String(log[key] || "")).filter(Boolean))).sort();
}

function jsonBlock(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function AdminLogsClient() {
  const [logs, setLogs] = useState<TestLogRecord[]>([]);
  const [selected, setSelected] = useState<TestLogRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    animalKey: "",
    calendarType: "",
    birthTime: "",
    dayStem: "",
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ limit: "300" });

    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
    });

    return params.toString();
  }, [filters]);

  const loadLogs = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/test-logs?${queryString}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as LogsResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.ok ? "load_failed" : data.error);
      }

      setLogs(data.logs);
      setUpdatedAt(new Date().toLocaleTimeString("ko-KR"));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "load_failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const timer = window.setInterval(loadLogs, 7000);

    return () => window.clearInterval(timer);
  }, [queryString]);

  const exportUrl = `/api/test-logs/export?${queryString}`;

  return (
    <div className="grid gap-4">
      <section className="rounded-[26px] border border-black/10 bg-[#FFFDF8] p-5 shadow-[0_12px_32px_rgba(31,42,34,0.07)]">
        <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(4,1fr)_auto_auto]">
          <input
            value={filters.q}
            onChange={(event) =>
              setFilters((current) => ({ ...current, q: event.target.value }))
            }
            placeholder="생년월일, 결과유형, animalKey 검색"
            className="h-12 rounded-2xl border border-black/10 bg-[#F8F4EC] px-4 text-sm font-bold outline-none focus:border-[#285C42]"
          />
          {FILTER_KEYS.map((key) => (
            <select
              key={key}
              value={filters[key]}
              onChange={(event) =>
                setFilters((current) => ({ ...current, [key]: event.target.value }))
              }
              className="h-12 rounded-2xl border border-black/10 bg-[#F8F4EC] px-3 text-sm font-bold outline-none"
            >
              <option value="">{key}</option>
              {uniqueOptions(logs, key).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ))}
          <button
            type="button"
            onClick={loadLogs}
            className="h-12 rounded-2xl bg-[#285C42] px-4 text-sm font-extrabold text-[#FFFDF8]"
          >
            새로고침
          </button>
          <a
            href={exportUrl}
            className="flex h-12 items-center justify-center rounded-2xl border border-black/10 bg-[#F8F4EC] px-4 text-sm font-extrabold text-[#5E4936]"
          >
            CSV
          </a>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#7D7469]">
          <span>마지막 갱신: {updatedAt || "-"}</span>
          <span>{isLoading ? "불러오는 중" : `총 ${logs.length}건`}</span>
        </div>
        {error ? (
          <p className="mt-3 rounded-2xl bg-[#F8E4DF] px-4 py-3 text-sm font-bold text-[#9A3F2C]">
            {error === "storage_config_missing"
              ? "Google Sheets 저장 env가 아직 설정되지 않았습니다."
              : error}
          </p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-[26px] border border-black/10 bg-[#FFFDF8] shadow-[0_12px_32px_rgba(31,42,34,0.07)]">
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
            <thead className="bg-[#F8F4EC] text-xs font-extrabold text-[#5E4936]">
              <tr>
                {[
                  "저장 시간",
                  "생년월일",
                  "양/음력",
                  "생시",
                  "성별",
                  "결과유형",
                  "결과요약",
                  "dayStem",
                  "element",
                  "salList",
                  "",
                ].map((column) => (
                  <th key={column} className="border-b border-black/10 px-3 py-3">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={`${log.createdAt}-${index}`} className="border-b border-black/5">
                  <td className="px-3 py-3 font-bold">{formatDate(log.createdAt)}</td>
                  <td className="px-3 py-3">{log.birthDate}</td>
                  <td className="px-3 py-3">{log.calendarType}</td>
                  <td className="px-3 py-3">{log.birthTime}</td>
                  <td className="px-3 py-3">{log.gender}</td>
                  <td className="px-3 py-3 font-extrabold">{log.animalTitle}</td>
                  <td className="max-w-[260px] truncate px-3 py-3">{log.resultSummary}</td>
                  <td className="px-3 py-3">{log.dayStem}</td>
                  <td className="px-3 py-3">{log.element}</td>
                  <td className="px-3 py-3">{log.salList?.join(", ")}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(log)}
                      className="rounded-full bg-[#285C42] px-3 py-2 text-xs font-extrabold text-[#FFFDF8]"
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center font-bold text-[#7D7469]" colSpan={11}>
                    표시할 로그가 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {selected ? (
        <section className="rounded-[26px] border border-black/10 bg-[#FFFDF8] p-5 shadow-[0_12px_32px_rgba(31,42,34,0.07)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold tracking-[0.08em] text-[#285C42]">
                DETAIL
              </p>
              <h2 className="mt-2 text-2xl font-black">{selected.animalTitle}</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-extrabold"
            >
              닫기
            </button>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <pre className="overflow-auto rounded-2xl bg-[#F8F4EC] p-4 text-xs leading-5">
{jsonBlock({
  birthDate: selected.birthDate,
  calendarType: selected.calendarType,
  birthTime: selected.birthTime,
  gender: selected.gender,
  animalKey: selected.animalKey,
  animalTitle: selected.animalTitle,
  firstImpressionSummary: selected.firstImpressionSummary,
})}
            </pre>
            <pre className="overflow-auto rounded-2xl bg-[#F8F4EC] p-4 text-xs leading-5">
{jsonBlock({
  userAgent: selected.userAgent,
  referrer: selected.referrer,
  path: selected.path,
})}
            </pre>
            <pre className="overflow-auto rounded-2xl bg-[#F8F4EC] p-4 text-xs leading-5 lg:col-span-2">
{jsonBlock(selected.resultExplanationSnapshot)}
            </pre>
            <pre className="overflow-auto rounded-2xl bg-[#F8F4EC] p-4 text-xs leading-5 lg:col-span-2">
{jsonBlock(selected.scoreSnapshot)}
            </pre>
          </div>
        </section>
      ) : null}
    </div>
  );
}
