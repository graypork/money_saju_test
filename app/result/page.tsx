"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { calculateWealthResult, type WealthResult } from "../../src/lib/score";

const ELEMENT_LABELS: Record<string, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

type ShareToast = {
  message: string;
  tone: "success" | "error";
};

function parseBirthDate(birthDate: string) {
  const parts = birthDate.split("-").map(Number);

  return {
    year: parts[0] || 2000,
    month: parts[1] || 1,
    day: parts[2] || 1,
  };
}

function parseBirthTime(birthTime: string) {
  if (!birthTime || birthTime === "0") return undefined;

  if (birthTime.includes(":")) {
    const [hour] = birthTime.split(":").map(Number);
    return Number.isFinite(hour) ? hour : undefined;
  }

  const hour = Number(birthTime);
  return Number.isFinite(hour) ? hour : undefined;
}

function copyTextWithTextarea(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

async function copyTextToClipboard(text: string) {
  if (copyTextWithTextarea(text)) return true;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 일부 인앱 브라우저에서는 사용자 클릭 안에서도 Clipboard API가 막힐 수 있습니다.
    }
  }

  return false;
}

function ResultDebugLogger({
  debugKey,
  debug,
}: {
  debugKey: string;
  debug: WealthResult["debug"];
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[money-saju result debug]", debug);
    }
  }, [debugKey, debug]);

  return null;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shareToast, setShareToast] = useState<ShareToast | null>(null);

  const birthDate = searchParams.get("birthDate") || "";
  const birthTime = searchParams.get("birthTime") || "0";
  const genderParam = searchParams.get("gender") || "unknown";
  const calendarTypeParam = searchParams.get("calendarType") || "solar";

  useEffect(() => {
    if (!shareToast) return;

    const timeoutId = window.setTimeout(() => {
      setShareToast(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shareToast]);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return (
      <main className="min-h-screen bg-[#f7f1e8] px-5 py-8 [word-break:keep-all]">
        <section className="mx-auto max-w-md">
          <div className="rounded-[2rem] bg-[#21160f] p-7 text-white shadow-2xl">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#f6d58b]">
              RESULT
            </div>
            <h1 className="text-3xl font-black leading-tight">
              아직 만들 결과가 없어요
            </h1>
            <p className="mt-4 text-sm font-semibold leading-7 text-white/70">
              생년월일과 태어난 시간을 먼저 선택하면 재물 성향 결과를 만들 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 w-full rounded-2xl bg-[#f6d58b] px-5 py-4 text-base font-black text-[#21160f] shadow-lg transition active:scale-[0.98]"
            >
              테스트 시작하기
            </button>
          </div>
        </section>
      </main>
    );
  }

  const { year, month, day } = parseBirthDate(birthDate);
  const hour = parseBirthTime(birthTime);

  const result = calculateWealthResult({
    year,
    month,
    day,
    hour,
    birthTime,
    calendarType:
      calendarTypeParam === "lunar"
        ? "lunar"
        : "solar",
    gender:
      genderParam === "male" || genderParam === "female"
        ? genderParam
        : "unknown",
  });

  const copy = result.copy;
  const animalType = result.animalType;
  const lockedSections = copy.paidSections;
  const debugKey = `${birthDate}-${birthTime}-${calendarTypeParam}-${genderParam}`;

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${copy.shareText} 재물 포텐셜 상위 ${result.topPercent}%가 나왔어요.`;
    const textWithUrl = `${text}\n${url}`;

    try {
      const copied = await copyTextToClipboard(textWithUrl);
      let shared = false;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "내 재물 사주 테스트 결과",
            text,
            url,
          });
          shared = true;
        } catch {
          // 공유 시트를 닫아도 클립보드 복사는 유지합니다.
        }
      }

      if (copied) {
        setShareToast({
          message: "공유 내용과 링크를 복사했어요.",
          tone: "success",
        });
        return;
      }

      if (!shared) {
        throw new Error("Share and clipboard unavailable");
      }

      setShareToast({
        message: "공유 시트를 열었어요.",
        tone: "success",
      });
    } catch {
      setShareToast({
        message: "공유에 실패했어요. 다시 시도해주세요.",
        tone: "error",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f1e8] px-5 py-8 [word-break:keep-all]">
      <ResultDebugLogger debugKey={debugKey} debug={result.debug} />

      <section className="mx-auto max-w-md pb-28">
        <div className="overflow-hidden rounded-[2rem] bg-[#21160f] shadow-2xl">
          <div className="px-6 pb-7 pt-7 text-white">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#f6d58b]">
              RESULT
            </div>

            <p className="text-sm font-semibold text-white/60">
              재물 포텐셜
            </p>

            <div className="mt-4 flex items-center justify-between gap-5">
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black tracking-tight">
                  상위 {result.topPercent}
                </span>
                <span className="mb-2 text-2xl font-black text-white/70">
                  %
                </span>
              </div>

              <WealthPyramid percent={result.topPercent} />
            </div>

            <p className="mt-4 text-xs leading-5 text-white/45">
              정통 만세력 산출이나 실제 인구 통계 순위가 아닌, 입력값을
              재물 성향 콘텐츠로 변환한 포텐셜 지표입니다.
            </p>
            <p className="mt-2 text-xs font-semibold leading-5 text-white/45">
              입력 기준: {calendarTypeParam === "lunar" ? "음력" : "양력"}
            </p>
          </div>

          <div className="border-t border-white/10 px-6 py-5 text-white">
            <p className="text-sm font-semibold text-white/50">
              재물 동물 유형
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight">
              {copy.title}
            </h1>

            <p className="mt-3 text-base font-semibold leading-7 text-[#f6d58b]">
              {copy.subtitle}
            </p>

            <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-[11px] font-bold tracking-widest text-white/40">
                동물 판정
              </p>
              <p className="mt-1 text-sm font-black leading-6 text-white">
                {animalType.name}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-xl">
          <p className="text-sm font-bold text-gray-400">결과 요약</p>

          <p className="mt-3 text-sm font-black leading-6 text-[#9a6a1d]">
            {copy.hook}
          </p>

          <h2 className="mt-2 text-2xl font-black leading-tight text-gray-950">
            {copy.oneLineDiagnosis}
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-700">
            {copy.summary}
          </p>

          <p className="mt-4 rounded-2xl bg-[#f7f1e8] px-4 py-3 text-sm font-bold leading-6 text-gray-800">
            {copy.moneyAttitude}
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-[#21160f] p-6 text-white shadow-xl">
          <p className="text-sm font-bold text-[#f6d58b]">돈을 대하는 방식</p>

          <h2 className="mt-2 text-2xl font-black leading-tight">핵심 판정</h2>

          <p className="mt-4 text-base font-bold leading-8 text-white/90">
            {copy.strength}
          </p>

          <p className="mt-4 border-t border-white/10 pt-4 text-sm font-semibold leading-7 text-white/65">
            {copy.weakness}
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">해석 근거</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            왜 이런 결과가 나왔을까?
          </h2>

          <div className="mt-5 space-y-3">
            {result.logic.map((item, index) => (
              <p
                key={index}
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold leading-6 text-gray-700"
              >
                {item}
              </p>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-[#f7f1e8] p-4">
            <p className="text-xs font-black tracking-widest text-gray-400">
              동물 비유
            </p>
            <h3 className="mt-2 text-lg font-black text-gray-950">
              {animalType.name}
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-gray-700">
              {animalType.freeCopy.summary}
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">오행 밸런스</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            재물 성향 오행 분석
          </h2>

          <div className="mt-5 space-y-4">
            {Object.entries(result.elements).map(([key, value]) => (
              <div key={key}>
                <div className="mb-2 flex justify-between text-sm font-bold text-gray-700">
                  <span>{ELEMENT_LABELS[key] || key}</span>
                  <span>{value}%</span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-[#efe5d6]">
                  <div
                    className="h-full rounded-full bg-[#21160f]"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-400">
            오행 비율은 계산된 천간/지지 글자 기준이며, 재물 성향 점수는
            해석용으로 별도 변환한 값입니다.
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">강점</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            돈으로 바뀌기 쉬운 강점
          </h2>

          <div className="mt-5 flex flex-wrap gap-2">
            {[copy.strength].map((item) => (
              <span
                key={item}
                className="rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-bold text-gray-800"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">주의 패턴</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            돈이 새기 쉬운 패턴
          </h2>

          <ul className="mt-5 space-y-3">
            {copy.cautions.map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold leading-6 text-gray-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 rounded-[2rem] border border-[#e0c58d] bg-[#fff8e9] p-6 shadow-lg">
          <div className="inline-flex rounded-full bg-[#21160f] px-4 py-2 text-xs font-bold text-[#f6d58b]">
            무료 해석 + 리포트 샘플
          </div>

          <h2 className="mt-4 text-2xl font-black leading-tight text-gray-950">
            무료 결과에서 잡힌 패턴을
            <br />
            리포트 샘플로 조금 더 보여줘요
          </h2>

          <div className="mt-4 rounded-3xl bg-white p-5">
            <p className="text-xs font-black tracking-widest text-gray-400">
              무료 핵심
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-gray-800">
              {copy.strength}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-gray-600">
              {copy.weakness}
            </p>
          </div>

          <div className="mt-3 rounded-3xl bg-[#21160f] p-5 text-white">
            <p className="text-xs font-black tracking-widest text-[#f6d58b]">
              리포트 샘플
            </p>
            <p className="mt-2 text-sm font-semibold leading-7 text-white/80">
              {copy.paidPreview}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {lockedSections.map((section) => (
              <div
                key={section.title}
                className="rounded-3xl border border-[#eadfca] bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-black text-gray-950">
                    {section.title}
                  </h3>

                  <span className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-black text-[#9a6a1d]">
                    샘플
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {section.teaser}
                </p>

                <p className="mt-3 text-xs font-bold text-gray-400">
                  핵심 키워드{" "}
                  <span className="select-none rounded-full bg-gray-100 px-2 py-1 text-gray-700 blur-[3px]">
                    {section.blurredKeyword}
                  </span>
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-2xl bg-[#21160f] px-5 py-4 text-base font-black text-white shadow-lg transition active:scale-[0.98]"
          >
            출시 기념 전체 리포트 보기 ₩2,500
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-gray-500">
            현재는 MVP 단계라 결제 기능은 아직 연결하지 않았습니다.
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">공유하기</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            친구에게 결과 공유하기
          </h2>

          <div className="mt-5 rounded-3xl bg-[#f7f1e8] p-5">
            <p className="text-sm leading-7 text-gray-700">
              나는{" "}
              <strong className="font-black text-gray-950">{animalType.name}</strong>,
              <br />
              판정은{" "}
              <strong className="font-black text-gray-950">
                {copy.title}
              </strong>
              이고,
              <br />
              재물 포텐셜{" "}
              <strong className="font-black text-gray-950">
                상위 {result.topPercent}%
              </strong>
              가 나왔어요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="mt-5 w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-base font-black text-gray-900 transition active:scale-[0.98]"
          >
            결과 공유하기
          </button>
        </section>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-5 w-full rounded-2xl bg-white px-5 py-4 text-base font-black text-gray-900 shadow-lg transition active:scale-[0.98]"
        >
          다시 테스트하기
        </button>

        <div className="fixed inset-x-0 bottom-0 z-20 bg-white/90 px-5 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-md gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-1/3 rounded-2xl border border-gray-300 bg-white px-3 py-4 text-sm font-black text-gray-800"
            >
              다시
            </button>

            <button
              type="button"
              className="w-2/3 rounded-2xl bg-[#21160f] px-3 py-4 text-sm font-black text-white"
            >
              전체 리포트 보기 ₩2,500
            </button>
          </div>
        </div>

        {shareToast && (
          <div
            aria-live="polite"
            className="fixed inset-x-0 bottom-24 z-30 px-5"
          >
            <p
              className={`mx-auto max-w-md rounded-2xl px-4 py-3 text-center text-sm font-bold shadow-2xl ${
                shareToast.tone === "success"
                  ? "bg-[#21160f] text-white"
                  : "bg-[#9f2d2d] text-white"
              }`}
            >
              {shareToast.message}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
function WealthPyramid({ percent }: { percent: number }) {
  const safePercent = Math.max(1, Math.min(100, percent));

  // 실제 삼각형 면적 기준 보정
  const fillRatio = Math.sqrt(safePercent / 100);

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="relative h-28 w-24">
        {/* 전체 삼각형 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            background:
              "linear-gradient(to bottom, #f6d58b 0%, #f6d58b " +
              `${fillRatio * 100}%` +
              `, rgba(255,255,255,0.08) ${fillRatio * 100}%` +
              ", rgba(255,255,255,0.08) 100%)",
          }}
        />

        {/* 외곽선 */}
        <div
          className="absolute inset-0 border border-white/20"
          style={{
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          }}
        />

        {/* 중앙 빛 느낌 */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />
      </div>

      <p className="mt-2 text-[10px] font-bold tracking-widest text-white/40">
        TOP {safePercent}%
      </p>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="p-10">결과를 불러오는 중입니다...</div>}>
      <ResultContent />
    </Suspense>
  );
}
