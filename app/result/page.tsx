"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { calculateWealthResult } from "../../src/lib/score";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const birthDate = searchParams.get("birthDate") || "";
  const birthTime = searchParams.get("birthTime") || "0";
  const gender = searchParams.get("gender") || "unknown";

  const result = calculateWealthResult({
    birthDate,
    birthTime,
    gender,
  });

  const handleCopy = async () => {
    const text = `나는 "${result.type.title}", 재물 포텐셜 상위 ${result.score}%가 나왔어요. 내 사주 속 돈그릇도 확인해보세요.`;

    try {
      await navigator.clipboard.writeText(text);
      alert("공유 문구가 복사되었습니다.");
    } catch {
      alert("복사에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-5 py-8">
      <section className="mx-auto max-w-md pb-28">
        <div className="overflow-hidden rounded-[2rem] bg-[#15110d] shadow-2xl">
          <div className="px-6 pb-7 pt-7 text-white">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#f5e7c6]">
              RESULT
            </div>

            <p className="text-sm font-semibold text-white/60">
              당신의 재물 포텐셜
            </p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-7xl font-black tracking-tight">
                상위 {result.score}
              </span>
              <span className="mb-3 text-2xl font-black text-white/70">
                %
              </span>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#f5e7c6]"
                style={{ width: `${result.score}%` }}
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-white/45">
              실제 인구 통계 기반 순위가 아닌, 입력값을 바탕으로 만든
              콘텐츠형 포텐셜 지표입니다.
            </p>
          </div>

          <div className="border-t border-white/10 px-6 py-5 text-white">
            <p className="text-sm font-semibold text-white/50">
              당신의 재물 유형
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight">
              {result.type.title}
            </h1>

            <p className="mt-3 text-base font-semibold leading-7 text-[#f5e7c6]">
              {result.type.subtitle}
            </p>
          </div>
        </div>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-xl">
          <p className="text-sm font-bold text-gray-400">SUMMARY</p>

          <h2 className="mt-2 text-2xl font-black text-gray-950">
            한 줄로 보면 이런 타입이에요
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-700">
            {result.type.summary}
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-[#15110d] p-6 text-white shadow-xl">
          <p className="text-sm font-bold text-[#f5e7c6]">CORE MESSAGE</p>

          <h2 className="mt-2 text-2xl font-black leading-tight">
            핵심 해석
          </h2>

          <p className="mt-4 text-base font-bold leading-8 text-white/90">
            {result.type.coreMessage}
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">STRENGTH</p>
              <h2 className="mt-1 text-2xl font-black text-gray-950">
                돈으로 바뀌기 쉬운 강점
              </h2>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {result.type.strengths.map((item) => (
              <span
                key={item}
                className="rounded-full bg-[#f4f1ea] px-4 py-2 text-sm font-bold text-gray-800"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">CAUTION</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            돈이 새기 쉬운 패턴
          </h2>

          <ul className="mt-5 space-y-3">
            {result.type.cautions.map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold leading-6 text-gray-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 rounded-[2rem] border border-[#dfd3bf] bg-[#fffaf0] p-6 shadow-lg">
          <div className="inline-flex rounded-full bg-[#15110d] px-4 py-2 text-xs font-bold text-[#f5e7c6]">
            LOCKED REPORT
          </div>

          <h2 className="mt-4 text-2xl font-black leading-tight text-gray-950">
            전체 리포트에서는
            <br />
            더 깊게 볼 수 있어요
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-700">
            {result.type.paidPreview}
          </p>

          <div className="mt-5 space-y-3">
            {result.type.paidSections.map((section) => (
              <div
                key={section.title}
                className="rounded-3xl border border-[#eadfca] bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-black text-gray-950">
                    {section.title}
                  </h3>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-500">
                    잠김
                  </span>
                </div>

                <p className="mt-3 select-none text-sm leading-6 text-gray-500 blur-[2px]">
                  {section.teaser}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-2xl bg-[#15110d] px-5 py-4 text-base font-black text-white shadow-lg transition active:scale-[0.98]"
          >
            출시 기념 전체 리포트 보기 ₩2,500
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-gray-500">
            현재는 MVP 단계라 결제 기능은 아직 연결하지 않았습니다.
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">SHARE</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            친구에게 결과 공유하기
          </h2>

          <div className="mt-5 rounded-3xl bg-[#f4f1ea] p-5">
            <p className="text-sm leading-7 text-gray-700">
              나는{" "}
              <strong className="font-black text-gray-950">
                {result.type.title}
              </strong>
              ,
              <br />
              재물 포텐셜{" "}
              <strong className="font-black text-gray-950">
                상위 {result.score}%
              </strong>
              가 나왔어요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="mt-5 w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-base font-black text-gray-900 transition active:scale-[0.98]"
          >
            공유 문구 복사하기
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
              className="w-2/3 rounded-2xl bg-[#15110d] px-3 py-4 text-sm font-black text-white"
            >
              전체 리포트 보기 ₩2,500
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="p-10">결과를 불러오는 중입니다...</div>}>
      <ResultContent />
    </Suspense>
  );
}