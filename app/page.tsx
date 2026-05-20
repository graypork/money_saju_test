"use client";

import { useEffect, useRef, useState } from "react";
import AppVersionBadge from "../src/components/AppVersionBadge";
import { uiTokens } from "../src/lib/uiTokens";

const statsCards = [
  {
    label: "MOST",
    text: "가장 많이 나온 동물 유형은 축적형 부엉이였어요!",
  },
  {
    label: "RARE",
    text: "가장 적게 나온 동물 유형은 흐름형 고래였어요!",
  },
  {
    label: "SENSE",
    text: "가장 높은 재물 감각 유형은 감각형 여우였어요!",
  },
  {
    label: "CAREFUL",
    text: "가장 신중한 소비 유형은 신중형 사슴이었어요!",
  },
  {
    label: "CHANCE",
    text: "가장 기회 포착이 빠른 유형은 사냥형 호랑이였어요!",
  },
];

const proofCards = [
  {
    label: "BIRTH",
    title: "생년월일시 기반",
    body: "입력한 생년월일과 태어난 시간으로 기본 사주 흐름을 봅니다.",
  },
  {
    label: "ELEMENT",
    title: "오행 밸런스 분석",
    body: "목·화·토·금·수의 강약을 돈 패턴 언어로 바꿉니다.",
  },
  {
    label: "ANIMAL",
    title: "동물 유형 리포트",
    body: "계산 결과를 하나의 돈버는 동물 유형으로 정리합니다.",
  },
];

function getNextStatsIndex(index: number) {
  return (index + 2) % statsCards.length;
}

function StatsCubeCard({
  currentCard,
  nextCard,
  isRolling,
}: {
  currentCard: (typeof statsCards)[number];
  nextCard: (typeof statsCards)[number];
  isRolling: boolean;
}) {
  const faceClass =
    `${uiTokens.card} absolute inset-0 h-[116px] overflow-hidden rounded-[24px] p-5 [backface-visibility:hidden]`;

  return (
    <div className="h-[116px] overflow-hidden rounded-[24px] [clip-path:inset(0_round_24px)] [perspective:900px]">
      <div
        className={`relative h-[116px] rounded-[24px] [transform-origin:center_center] [transform-style:preserve-3d] [will-change:transform] ${
          isRolling ? "animate-[stats-cube-roll_620ms_ease-in-out_1]" : ""
        }`}
      >
        <div className={`${faceClass} [transform:translateZ(58px)]`}>
          <p className={uiTokens.eyebrow}>{currentCard.label}</p>
          <p className="mt-2 text-[17px] font-extrabold leading-7 text-[#191F28]">
            {currentCard.text}
          </p>
        </div>
        <div
          className={`${faceClass} [transform:rotateX(90deg)_translateZ(58px)]`}
        >
          <p className={uiTokens.eyebrow}>{nextCard.label}</p>
          <p className="mt-2 text-[17px] font-extrabold leading-7 text-[#191F28]">
            {nextCard.text}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [statsIndices, setStatsIndices] = useState([0, 1]);
  const [rollingInfo, setRollingInfo] = useState<{
    slot: number;
    nextIndex: number;
  } | null>(null);
  const nextRollingSlotRef = useRef(0);
  const statsIndicesRef = useRef(statsIndices);
  const scheduleTimeoutRef = useRef<number | undefined>(undefined);
  const animationTimeoutRef = useRef<number | undefined>(undefined);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    statsIndicesRef.current = statsIndices;
  }, [statsIndices]);

  useEffect(() => {
    const scheduleNextRoll = () => {
      scheduleTimeoutRef.current = window.setTimeout(() => {
        if (isAnimatingRef.current) {
          scheduleNextRoll();
          return;
        }

        const slot = nextRollingSlotRef.current;
        const nextIndex = getNextStatsIndex(statsIndicesRef.current[slot]);
        isAnimatingRef.current = true;
        setRollingInfo({ slot, nextIndex });

        animationTimeoutRef.current = window.setTimeout(() => {
          setStatsIndices((current) =>
            current.map((index, itemSlot) =>
              itemSlot === slot ? nextIndex : index
            )
          );
          setRollingInfo(null);
          nextRollingSlotRef.current = (slot + 1) % 2;
          isAnimatingRef.current = false;
          scheduleNextRoll();
        }, 620);
      }, 2200);
    };

    scheduleNextRoll();

    return () => {
      if (scheduleTimeoutRef.current) {
        window.clearTimeout(scheduleTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      isAnimatingRef.current = false;
    };
  }, []);

  return (
    <main className={`${uiTokens.page} py-6`}>
      <section className={`${uiTokens.shell} space-y-5 pb-8`}>
        <section className="px-1 pb-2 pt-5">
          <div className="mb-5 inline-flex rounded-full border border-black/10 bg-[#FFFDF8] px-4 py-2 text-xs font-extrabold text-[#285C42] shadow-[0_8px_20px_rgba(31,42,34,0.06)]">
            사주와 오행으로 보는 돈 패턴 테스트
          </div>

          <h1 className="text-[38px] font-black leading-[1.12] tracking-[-0.01em] text-[#171C18]">
            돈 앞에서 깨어나는
            <br />
            내 내면의 동물은?
          </h1>

          <p className="mt-5 text-[16px] font-semibold leading-8 text-[#6F6253]">
            돈을 버는 방식, 쓰는 습관, 놓치기 쉬운 기회를
            사주와 오행 기반의 동물 유형으로 보여줍니다.
          </p>

          <a href="/input" className={`${uiTokens.button} mt-7`}>
            내 돈버는 동물 확인하기
          </a>
        </section>

        <section className="grid grid-cols-3 gap-2">
          {proofCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[22px] border border-black/10 bg-[#FFFDF8] p-4 shadow-[0_8px_22px_rgba(31,42,34,0.05)]"
            >
              <p className="text-[10px] font-black tracking-[0.08em] text-[#285C42]">
                {card.label}
              </p>
              <h2 className="mt-2 text-[14px] font-black leading-5 text-[#171C18]">
                {card.title}
              </h2>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#7D7469]">
                {card.body}
              </p>
            </article>
          ))}
        </section>

        <section className={uiTokens.card}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className={uiTokens.eyebrow}>TYPE PREVIEW</p>
              <h2 className="mt-2 text-[24px] font-black leading-[1.2] text-[#171C18]">
                지금 많이 보이는
                <br />
                돈버는 동물들
              </h2>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E7F1E7] text-xl">
              ◌
            </div>
          </div>

          <div className="mt-5 grid h-[244px] gap-3 overflow-hidden">
            {statsIndices.map((cardIndex, slot) => {
              const isRolling = rollingInfo?.slot === slot;
              const currentCard = statsCards[cardIndex];
              const nextCard =
                isRolling && rollingInfo
                  ? statsCards[rollingInfo.nextIndex]
                  : statsCards[getNextStatsIndex(cardIndex)];

              return (
                <StatsCubeCard
                  key={slot}
                  currentCard={currentCard}
                  nextCard={nextCard}
                  isRolling={isRolling}
                />
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-black/10 bg-[#FFFDF8] p-5 text-center shadow-[0_10px_28px_rgba(31,42,34,0.06)]">
          <p className="text-[18px] font-black leading-7 text-[#171C18]">
            나의 돈 패턴은
            <br />
            어떤 동물에 가까울까요?
          </p>
          <a href="/input" className={`${uiTokens.button} mt-4`}>
            나의 내면 동물 유형은 뭘까요?
          </a>
          <p className={`${uiTokens.caption} mt-4`}>
            본 테스트는 오락 및 자기이해 목적의 콘텐츠입니다.
            <br />
            금융, 투자, 법률, 직업 선택에 대한 전문 조언이 아닙니다.
          </p>
        </section>
      </section>
      <AppVersionBadge />
      <style jsx global>{`
        @keyframes stats-cube-roll {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(-90deg);
          }
        }
      `}</style>
    </main>
  );
}
