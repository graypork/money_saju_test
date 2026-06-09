"use client";

import { useEffect, useRef, useState } from "react";
import AppVersionBadge from "../src/components/AppVersionBadge";
import BirthForm from "../src/components/BirthForm";
import {
  getLandingAnimalPreviewOptions,
  getRandomLandingAnimalPreviews,
  type LandingAnimalPreview,
} from "../src/lib/animalAssets";
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
    body: "태어난 날과 시간을 기준으로 기본 흐름을 읽습니다.",
  },
  {
    label: "ELEMENT",
    title: "오행 밸런스 분석",
    body: "복잡한 오행 강약을 돈의 행동 패턴으로 바꿉니다.",
  },
  {
    label: "ANIMAL",
    title: "동물 유형 리포트",
    body: "결과를 하나의 동물 유형과 생활 장면으로 정리합니다.",
  },
];

const initialLandingAnimalPreviews = Array.from(
  new Map(
    getLandingAnimalPreviewOptions().map((preview) => [
      preview.animalKey,
      preview,
    ])
  ).values()
).slice(0, 3);

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
    "absolute inset-0 h-[116px] overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white p-5 [backface-visibility:hidden]";

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

function AnimalPreviewImage({ preview }: { preview: LandingAnimalPreview }) {
  const [failed, setFailed] = useState(false);
  const basename = preview.photo.split("/").filter(Boolean).pop() ?? preview.photo;

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-[26px] border border-[#E5E7EB] bg-[#F7F8F5]">
      {failed ? (
        <div className="grid h-full place-items-center border border-dashed border-[#D5DBD2] px-2 text-center font-mono text-[10px] font-bold leading-4 text-[#8A9288]">
          {basename}
        </div>
      ) : (
        <img
          src={preview.photo}
          alt={`${preview.displayName} 미리보기`}
          draggable={false}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
      <p className="absolute inset-x-2 bottom-2 rounded-full bg-white/78 px-2 py-1 text-center text-[11px] font-black text-[#1E6A48] [backdrop-filter:blur(10px)]">
        {preview.displayName}
      </p>
    </div>
  );
}

export default function Home() {
  const [statsIndices, setStatsIndices] = useState([0, 1]);
  const [landingAnimalPreviews, setLandingAnimalPreviews] = useState<
    LandingAnimalPreview[]
  >(initialLandingAnimalPreviews);
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
    setLandingAnimalPreviews(getRandomLandingAnimalPreviews(3));
  }, []);

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
    <main className="min-h-screen bg-white px-5 py-7 text-[#191F28] [word-break:keep-all]">
      <section className="mx-auto max-w-[430px] space-y-16 pb-10">
        <section className="space-y-6 pt-2">
          <div className="inline-flex rounded-full bg-[#F3F8F4] px-4 py-2 text-[12px] font-black tracking-[-0.01em] text-[#1E6A48]">
            사주와 오행으로 보는 돈 패턴 테스트
          </div>
          <div>
            <h1 className="text-[38px] font-black leading-[1.08] tracking-[-0.03em] text-[#111827]">
              돈 앞에서 깨어나는
              <br />
              내 안의 동물은?
            </h1>
            <p className="mt-5 text-[16px] font-semibold leading-7 text-[#4B5563]">
              생년월일시로 돈을 버는 방식, 쓰는 습관, 놓치기 쉬운 기회를
              하나의 동물 유형으로 정리해봅니다.
            </p>
          </div>
          <a href="#birth-form" className={uiTokens.button}>
            내 돈버는 동물 확인하기
          </a>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-black tracking-[0.1em] text-[#1E6A48]">
                ANIMAL PREVIEW
              </p>
              <h2 className="mt-2 text-[24px] font-black leading-[1.18] text-[#111827]">
                어떤 동물이
                <br />
                나올까요?
              </h2>
            </div>
            <p className="max-w-[138px] text-right text-[12px] font-bold leading-5 text-[#6B7280]">
              매번 다른 동물 사진 조합을 보여줍니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {landingAnimalPreviews.map((preview, index) => (
              <div
                key={`${preview.animalKey}-${preview.photo}`}
                className={index === 1 ? "translate-y-4" : ""}
              >
                <AnimalPreviewImage preview={preview} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-[#E5E7EB] bg-[#F7F8F5] p-5">
          <div>
            <p className="text-[12px] font-black tracking-[0.1em] text-[#1E6A48]">
              TYPE PREVIEW
            </p>
            <h2 className="mt-2 text-[24px] font-black leading-[1.2] text-[#111827]">
              지금 많이 보이는
              <br />
              돈버는 동물들
            </h2>
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

        <section className="rounded-[30px] border border-[#E5E7EB] bg-white p-6">
          <p className="text-[12px] font-black tracking-[0.1em] text-[#F26B3A]">
            MONEY PERCENT
          </p>
          <h2 className="mt-3 text-[27px] font-black leading-[1.18] tracking-[-0.02em] text-[#111827]">
            내 재물 감각은
            <br />
            상위 몇 %일까?
          </h2>
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[#4B5563]">
            같은 돈을 쥐어도 키우는 방식은 다릅니다. 사주와 오행의
            흐름을 돈의 행동 패턴으로 바꿔 보여드릴게요.
          </p>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-[12px] font-black tracking-[0.1em] text-[#1E6A48]">
              HOW IT WORKS
            </p>
            <h2 className="mt-2 text-[24px] font-black leading-[1.2] text-[#111827]">
              계산은 짧게,
              <br />
              결과는 쉽게 봅니다
            </h2>
          </div>

          <div className="grid gap-3">
            {proofCards.map((card) => (
              <article
                key={card.label}
                className="rounded-[24px] border border-[#E5E7EB] bg-white p-5"
              >
                <p className="text-[11px] font-black tracking-[0.1em] text-[#1E6A48]">
                  {card.label}
                </p>
                <h3 className="mt-2 text-[18px] font-black text-[#111827]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[14px] font-semibold leading-6 text-[#6B7280]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="birth-form" className="scroll-mt-6 space-y-5">
          <div>
            <p className="text-[12px] font-black tracking-[0.1em] text-[#1E6A48]">
              START
            </p>
            <h2 className="mt-2 text-[30px] font-black leading-[1.12] tracking-[-0.02em] text-[#111827]">
              내 돈버는 동물 찾기
            </h2>
            <p className="mt-3 text-[15px] font-semibold leading-7 text-[#4B5563]">
              생년월일, 생시, 성별만 입력하면 결과 페이지로 바로 이동합니다.
            </p>
          </div>

          <BirthForm />

          <p className="text-center text-[13px] font-semibold leading-6 text-[#6B7280]">
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
