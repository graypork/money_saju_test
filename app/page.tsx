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

function getNextStatsIndex(index: number) {
  return (index + 2) % statsCards.length;
}

function StatsCardFace({
  card,
  state,
}: {
  card: (typeof statsCards)[number];
  state: "current" | "next" | "currentRolling" | "nextRolling";
}) {
  const stateClass = {
    current: "opacity-100 [transform:rotateX(0deg)_translateY(0)]",
    next: "opacity-0 [transform:rotateX(82deg)_translateY(14px)]",
    currentRolling: "opacity-0 [transform:rotateX(-82deg)_translateY(-14px)]",
    nextRolling: "opacity-100 [transform:rotateX(0deg)_translateY(0)]",
  }[state];

  return (
    <div
      className={`${uiTokens.card} absolute inset-0 h-[116px] p-5 [backface-visibility:hidden] transition-all duration-[620ms] ease-out ${stateClass}`}
    >
      <p className={uiTokens.eyebrow}>{card.label}</p>
      <p className="mt-2 text-[17px] font-extrabold leading-7 text-[#191F28]">
        {card.text}
      </p>
    </div>
  );
}

export default function Home() {
  const [statsIndices, setStatsIndices] = useState([0, 1]);
  const [rollingSlot, setRollingSlot] = useState<number | null>(null);
  const nextRollingSlotRef = useRef(0);

  useEffect(() => {
    let timeoutId: number | undefined;
    const intervalId = window.setInterval(() => {
      const slot = nextRollingSlotRef.current;

      setRollingSlot(slot);
      timeoutId = window.setTimeout(() => {
        setStatsIndices((current) =>
          current.map((index, itemSlot) =>
            itemSlot === slot ? getNextStatsIndex(index) : index
          )
        );
        setRollingSlot(null);
        nextRollingSlotRef.current = (slot + 1) % 2;
      }, 620);
    }, 2200);

    return () => {
      window.clearInterval(intervalId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <main className={`${uiTokens.page} py-7`}>
      <section className={`${uiTokens.shell} min-h-[calc(100vh-56px)]`}>
        <section className="flex min-h-[calc(100vh-96px)] flex-col justify-center px-1 py-8">
          <div className="mb-5 inline-flex rounded-full bg-[#FFFDF8] px-4 py-2 text-xs font-bold text-[#779682]">
            사주와 오행으로 보는 재물 동물 테스트
          </div>

          <h1 className="text-[36px] font-extrabold leading-[1.18] text-[#614A37]">
            돈 앞에서 깨어나는
            <br />
            내 내면의 동물은?
          </h1>

          <p className="mt-6 text-[16px] font-semibold leading-8 text-[rgba(97,74,55,0.72)]">
            사주와 오행을 바탕으로 돈을 대하는 방식과 새기 쉬운 지점을
            하나의 동물 유형으로 보여줍니다.
          </p>

          <div className="mt-8 grid h-[244px] gap-3 overflow-hidden">
            {statsIndices.map((cardIndex, slot) => {
              const isRolling = rollingSlot === slot;
              const currentCard = statsCards[cardIndex];
              const nextCard = statsCards[getNextStatsIndex(cardIndex)];

              return (
                <div
                  key={slot}
                  className="relative h-[116px] [perspective:900px] [transform-style:preserve-3d]"
                >
                  <StatsCardFace
                    card={currentCard}
                    state={isRolling ? "currentRolling" : "current"}
                  />
                  <StatsCardFace
                    card={nextCard}
                    state={isRolling ? "nextRolling" : "next"}
                  />
                </div>
              );
            })}
          </div>

          <a href="/input" className={`${uiTokens.button} mt-8`}>
            나의 내면 동물 유형은 뭘까요?
          </a>

          <p className={`${uiTokens.caption} mt-5 text-center`}>
            본 테스트는 오락 및 자기이해 목적의 콘텐츠입니다.
            <br />
            금융, 투자, 법률, 직업 선택에 대한 전문 조언이 아닙니다.
          </p>
        </section>
      </section>
      <AppVersionBadge />
    </main>
  );
}
