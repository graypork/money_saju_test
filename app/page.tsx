"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
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
    text: "가장 적게 나온 동물 유형은 직감형 수달이었어요!",
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

function OrganicBackdrop() {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = backdropRef.current;
    if (!element) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      element.style.setProperty("--scroll-progress", "0");
      return;
    }

    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

      element.style.setProperty(
        "--scroll-progress",
        String(Math.min(1, Math.max(0, progress)).toFixed(3))
      );
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <div
      ref={backdropRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ "--scroll-progress": "0" } as CSSProperties}
    >
      <div className="organic-float-a organic-depth-right absolute -right-44 -top-36 h-[420px] w-[420px] bg-[rgba(204,255,0,0.12)] [border-radius:52%_48%_58%_42%/44%_56%_44%_56%]" />
      <div className="organic-float-b organic-depth-left absolute -left-44 top-[28rem] h-[190px] w-[330px] rotate-[-18deg] rounded-[999px] border-[44px] border-[rgba(255,255,0,0.1)]" />
      <div className="organic-float-c organic-depth-right absolute right-[-16rem] top-[74rem] h-[170px] w-[420px] rotate-[24deg] rounded-[999px] bg-[rgba(223,255,0,0.08)]" />
      <div className="organic-float-b organic-depth-left absolute -left-44 top-[112rem] h-[260px] w-[360px] rounded-[50%] bg-[rgba(204,255,0,0.08)]" />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className={`${uiTokens.header} flex items-center justify-between`}>
      <span className="text-[13px] font-black tracking-[-0.01em]">
        MONEY SAJU
      </span>
      <span className="text-[11px] font-black tracking-[0.12em] text-[#ffff00]">
        ANIMAL TEST
      </span>
    </header>
  );
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
    `absolute inset-0 h-[116px] overflow-hidden rounded-[26px] p-5 [backface-visibility:hidden] ${uiTokens.controlSurface}`;

  return (
    <div className="h-[116px] overflow-hidden rounded-[24px] [clip-path:inset(0_round_24px)] [perspective:900px]">
      <div
        className={`relative h-[116px] rounded-[24px] [transform-origin:center_center] [transform-style:preserve-3d] [will-change:transform] ${
          isRolling ? "animate-[stats-cube-roll_620ms_ease-in-out_1]" : ""
        }`}
      >
        <div className={`${faceClass} [transform:translateZ(58px)]`}>
          <p className={uiTokens.eyebrow}>{currentCard.label}</p>
          <p className="mt-2 text-[17px] font-extrabold leading-7 text-[#dfff00]">
            {currentCard.text}
          </p>
        </div>
        <div
          className={`${faceClass} [transform:rotateX(90deg)_translateZ(58px)]`}
        >
          <p className={uiTokens.eyebrow}>{nextCard.label}</p>
          <p className="mt-2 text-[17px] font-extrabold leading-7 text-[#dfff00]">
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
    <div className="relative flex min-w-0 flex-col items-center overflow-visible bg-transparent">
      <div className="flex h-[150px] w-full items-end justify-center overflow-visible bg-transparent">
        {failed ? (
          <div className="grid h-[150px] w-[110px] place-items-center border border-dashed border-[rgba(204,255,0,0.32)] px-2 text-center font-mono text-[10px] font-bold leading-4 text-[rgba(223,255,0,0.56)]">
            {basename}
          </div>
        ) : (
          <img
            src={preview.photo}
            alt={`${preview.displayName} 미리보기`}
            draggable={false}
            onError={() => setFailed(true)}
            className="h-[150px] w-auto max-w-[130px] object-contain"
          />
        )}
      </div>
      <p className="mt-2 text-center font-mono text-[12px] font-black uppercase leading-4 tracking-[0.08em] text-[#ccff00] [text-shadow:1px_1px_0_#000000]">
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
    <main className={`${uiTokens.page} px-5 py-5 [word-break:keep-all]`}>
      <OrganicBackdrop />
      <section className="relative z-10 mx-auto max-w-[430px] space-y-16 pb-10">
        <SiteHeader />

        <section className={`${uiTokens.heroPanel} space-y-7 pt-7`}>
          <div className="inline-flex rounded-full bg-[rgba(255,255,0,0.18)] px-4 py-2 text-[12px] font-black tracking-[-0.01em] text-[#ffff00]">
            사주로 보는 재물운 테스트
          </div>
          <div>
            <h1 className="text-[56px] font-black leading-[0.9] tracking-[-0.06em] text-[#ccff00]">
              돈 앞에서
              <br />깨어나는
              <br />내 동물
            </h1>
            <p className="mt-7 max-w-[340px] text-[17px] font-bold leading-7 text-[rgba(204,255,0,0.78)]">
              생년월일시를 돈의 행동 패턴으로 바꾸고, 하나의 동물 유형으로
              짧고 선명하게 보여드립니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a href="#birth-form" className={uiTokens.button}>
              시작하기
            </a>
            <a href="#money-percent" className={uiTokens.secondaryButton}>
              더 보기
            </a>
          </div>
        </section>

        <section className={`${uiTokens.sectionRule} space-y-5`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className={uiTokens.sectionEyebrow}>
                PREVIEW
              </p>
              <h2 className={uiTokens.sectionTitle}>
                결과는
                <br />
                동물처럼 보입니다
              </h2>
            </div>
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

        <section id="type-preview" className={`${uiTokens.sectionRule} space-y-5`}>
          <div>
            <p className={uiTokens.sectionEyebrow}>
              TYPE PREVIEW
            </p>
            <h2 className={uiTokens.sectionTitle}>
              지금 많이 보이는
              <br />
              돈 패턴
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

        <section id="money-percent" className={`${uiTokens.sectionRule} space-y-4`}>
          <p className="text-[12px] font-black tracking-[0.14em] text-[#ffff00]">
            MONEY PERCENT
          </p>
          <h2 className="text-[44px] font-black leading-[0.98] tracking-[-0.055em] text-[#dfff00]">
            내 재물 감각은
            <br />
            상위 몇 %일까?
          </h2>
          <p className="max-w-[350px] text-[16px] font-bold leading-7 text-[rgba(223,255,0,0.72)]">
            같은 돈을 쥐어도 키우는 방식은 다릅니다. 사주와 오행의 흐름을
            돈의 행동 패턴으로 바꿔봅니다.
          </p>
        </section>

        <section className={`${uiTokens.sectionRule} space-y-5`}>
          <div>
            <p className={uiTokens.sectionEyebrow}>
              METHOD
            </p>
            <h2 className={uiTokens.sectionTitle}>
              계산은 짧게,
              <br />
              결과는 쉽게!
            </h2>
          </div>

          <div className="grid gap-3">
            {proofCards.map((card) => (
              <article
                key={card.label}
                className="border-t border-[rgba(204,255,0,0.18)] py-5"
              >
                <p className="text-[11px] font-black tracking-[0.1em] text-[#ccff00]">
                  {card.label}
                </p>
                <h3 className="mt-2 text-[18px] font-black text-[#dfff00]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[14px] font-semibold leading-6 text-[rgba(223,255,0,0.56)]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="birth-form" className={`scroll-mt-6 ${uiTokens.sectionRule} space-y-6`}>
          <div>
            <p className={uiTokens.sectionEyebrow}>
              START
            </p>
            <h2 className="mt-2 text-[48px] font-black leading-[0.96] tracking-[-0.055em] text-[#dfff00]">
              내 동물
              <br />
              바로 찾기
            </h2>
            <p className="mt-4 text-[16px] font-bold leading-7 text-[rgba(223,255,0,0.72)]">
              간단한 정보만 입력하면 결과 페이지로 이동합니다.
            </p>
          </div>

          <BirthForm />

          <p className="text-center text-[13px] font-semibold leading-6 text-[rgba(223,255,0,0.56)]">
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
