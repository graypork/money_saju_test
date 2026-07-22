"use client";

import Image from "next/image";
import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { LandingVersionBadge } from "../src/components/AppVersionBadge";
import BirthForm from "../src/components/BirthForm";
import {
  getRandomLandingAnimalPreviews,
  type LandingAnimalPreview,
} from "../src/lib/animalAssets";
import { uiTokens } from "../src/lib/uiTokens";

const stackedExplanationCards = [
  {
    id: "money-percent",
    title: "월급 밖 수익 가능성",
    body: "내 사주와 오행흐름에서\n월급 외 수익이 커질 가능성을 확인해요.",
    surface: "#BACCEC",
  },
  {
    id: "method",
    title: "돈이 모이는 방식",
    body: "어떤 방식으로 돈이 붙고,\n어떤 흐름에서 수익이 커지는지 보여줘요.",
    surface: "#EFE9DB",
  },
  {
    id: "birth",
    title: "생년월일 기반 흐름",
    body: "생년월일과 생시를 바탕으로\n나에게 강하게 작동하는 재물 흐름을 읽어요.",
    surface: "#EFE9DB",
  },
  {
    id: "element",
    title: "오행 밸런스",
    body: "오행의 균형을 통해\n수익이 막히거나 열리는 지점을 살펴봐요.",
    surface: "#EFE9DB",
  },
  {
    id: "animal",
    title: "재물 동물 유형",
    body: "수입의 방식을 9가지 동물 유형으로 비유해\n쉽게 이해할 수 있게 보여줘요.",
    surface: "#EFE9DB",
  },
];

const landingTokens = uiTokens.landing;
const landingSectionRuleCompact = "border-t border-[#DDD6C8] pt-8";
const explanationDeckSwipeThreshold = 78;
const explanationDeckExitDuration = 380;
const explanationDeckSnapDuration = 300;
const explanationDeckTransforms = [
  0,
  -44,
  -88,
  -132,
];
const explanationDeckCardClass =
  "absolute left-0 top-0 flex h-[204px] w-full flex-col justify-between rounded-[30px] border border-[rgba(246,187,221,0.75)] p-[23px] text-left shadow-[0_22px_45px_rgba(0,0,0,0.18),0_8px_18px_rgba(0,0,0,0.10)] transition-transform ease-out will-change-transform";
const explanationDeckCardShadow =
  "0 22px 45px rgba(0,0,0,0.18), 0 8px 18px rgba(0,0,0,0.10)";

function AnimalTypeIntroCard({ preview }: { preview: LandingAnimalPreview }) {
  const [failed, setFailed] = useState(false);
  const photo = preview.photo;

  return (
    <article
      className="shrink-0 snap-start pt-0"
      data-animal-intro-card={preview.animalKey}
    >
      <div className="relative w-[158px] min-[414px]:w-[166px]">
        <div className="relative h-[240px] rounded-[28px] border border-[rgba(246,187,221,0.9)] bg-[#EFE9DB] min-[414px]:h-[252px]">
          {photo && !failed ? (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[232px] w-[154px] -translate-x-1/2 -translate-y-1/2 min-[414px]:h-[242px] min-[414px]:w-[160px]">
              <Image
                src={photo}
                alt=""
                fill
                sizes="(min-width: 414px) 160px, 154px"
                draggable={false}
                loading="eager"
                unoptimized
                onError={() => setFailed(true)}
                className="z-10 object-contain"
                style={{ objectPosition: "bottom center" }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function StackedExplanationSection() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transitionMode, setTransitionMode] = useState<
    "forward" | "backward" | null
  >(null);
  const [outgoingCardIndex, setOutgoingCardIndex] = useState<number | null>(
    null
  );
  const [incomingCardIndex, setIncomingCardIndex] = useState<number | null>(
    null
  );
  const [transitionTarget, setTransitionTarget] = useState<
    "front" | "back" | null
  >(null);
  const [exitStartX, setExitStartX] = useState(0);
  const [isExitActive, setIsExitActive] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragIntentRef = useRef<boolean | null>(null);
  const dragDeltaXRef = useRef(0);
  const transitionTimerRef = useRef<number | null>(null);
  const transitionFrameRef = useRef<number | null>(null);

  const resetDrag = () => {
    dragStartRef.current = null;
    dragIntentRef.current = null;
    dragDeltaXRef.current = 0;
    setDragDeltaX(0);
    setIsDragging(false);
  };

  const releasePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const clearTransitionHandles = () => {
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (transitionFrameRef.current) {
      window.cancelAnimationFrame(transitionFrameRef.current);
      transitionFrameRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (transitionFrameRef.current) {
        window.cancelAnimationFrame(transitionFrameRef.current);
      }
    };
  }, []);

  const finishTransition = (mode: "forward" | "backward" | "snap-back") => {
    if (mode === "forward") {
      setActiveCardIndex((index) =>
        Math.min(index + 1, stackedExplanationCards.length - 1)
      );
    }

    if (mode === "backward") {
      setActiveCardIndex((index) => Math.max(index - 1, 0));
    }

    clearTransitionHandles();
    setIsAnimating(false);
    setTransitionMode(null);
    setOutgoingCardIndex(null);
    setIncomingCardIndex(null);
    setTransitionTarget(null);
    setExitStartX(0);
    setIsExitActive(false);
    resetDrag();
  };

  const startForwardTransition = (startingOffset = 0) => {
    if (isAnimating) {
      return;
    }

    const nextIndex = activeCardIndex + 1;

    if (nextIndex >= stackedExplanationCards.length) {
      resetDrag();
      return;
    }

    clearTransitionHandles();
    setIsAnimating(true);
    setTransitionMode("forward");
    setOutgoingCardIndex(activeCardIndex);
    setIncomingCardIndex(null);
    setTransitionTarget(null);
    setExitStartX(Math.max(0, startingOffset));
    setIsExitActive(false);
    resetDrag();

    transitionFrameRef.current = window.requestAnimationFrame(() => {
      setIsExitActive(true);
      transitionFrameRef.current = null;
    });

    transitionTimerRef.current = window.setTimeout(
      () => finishTransition("forward"),
      explanationDeckExitDuration
    );
  };

  const startBackwardTransition = (target: "front" | "back") => {
    if (isAnimating) {
      return;
    }

    if (activeCardIndex <= 0) {
      resetDrag();
      return;
    }

    clearTransitionHandles();
    setIsAnimating(true);
    setTransitionMode("backward");
    setIncomingCardIndex(activeCardIndex - 1);
    setTransitionTarget(target);
    setIsExitActive(false);
    resetDrag();

    transitionTimerRef.current = window.setTimeout(
      () => finishTransition(target === "front" ? "backward" : "snap-back"),
      target === "front"
        ? explanationDeckExitDuration
        : explanationDeckSnapDuration
    );
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isAnimating) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    dragIntentRef.current = null;
    dragDeltaXRef.current = 0;
    setDragDeltaX(0);
    setIsDragging(false);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;

    if (!dragStart || isAnimating) {
      return;
    }

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;

    if (dragIntentRef.current === null) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
        return;
      }

      dragIntentRef.current = Math.abs(deltaX) > Math.abs(deltaY) + 6;
    }

    if (!dragIntentRef.current) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const limitedDelta = Math.max(-92, Math.min(92, deltaX));
    dragDeltaXRef.current = limitedDelta;
    setDragDeltaX(limitedDelta);
    setIsDragging(true);

    if (limitedDelta < 0 && activeCardIndex > 0) {
      setTransitionMode("backward");
      setIncomingCardIndex(activeCardIndex - 1);
      setTransitionTarget(null);
    } else if (limitedDelta >= 0) {
      setTransitionMode(null);
      setIncomingCardIndex(null);
      setTransitionTarget(null);
    }
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    releasePointer(event);

    const deltaX = dragDeltaXRef.current;
    const isValidSwipe =
      dragIntentRef.current &&
      Math.abs(deltaX) >= explanationDeckSwipeThreshold;

    if (!dragStartRef.current) {
      return;
    }

    if (isValidSwipe) {
      if (deltaX > 0) {
        startForwardTransition(deltaX);
        return;
      }

      if (activeCardIndex > 0) {
        startBackwardTransition("front");
      } else {
        resetDrag();
      }
      return;
    }

    if (
      deltaX < 0 &&
      activeCardIndex > 0 &&
      transitionMode === "backward"
    ) {
      startBackwardTransition("back");
      return;
    }

    resetDrag();
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    releasePointer(event);

    if (transitionMode === "backward" && incomingCardIndex !== null) {
      startBackwardTransition("back");
    } else {
      resetDrag();
    }
  };

  const previewBaseIndex =
    isAnimating && transitionMode === "forward"
      ? Math.min(activeCardIndex + 1, stackedExplanationCards.length - 1)
      : activeCardIndex;
  const visibleCards = stackedExplanationCards.slice(
    previewBaseIndex,
    previewBaseIndex + explanationDeckTransforms.length
  );
  const transitionDuration = isDragging
    ? "0ms"
    : `${explanationDeckSnapDuration}ms`;
  const transitionTimingFunction = isAnimating
    ? "cubic-bezier(0.16, 1, 0.3, 1)"
    : "ease-out";
  const renderCard = (
    card: (typeof stackedExplanationCards)[number],
    options: {
      key: string;
      transform: string;
      zIndex: number;
      stackPosition?: number;
      isFront?: boolean;
      duration: string;
      timingFunction: string;
      exiting?: boolean;
      onAdvance?: () => void;
    }
  ) => (
    <article
      key={options.key}
      data-explanation-card={card.id}
      data-stack-position={options.stackPosition}
      data-exiting-card={options.exiting ? "true" : undefined}
      aria-current={options.isFront ? "true" : undefined}
      className={explanationDeckCardClass}
      style={{
        zIndex: options.zIndex,
        transform: options.transform,
        transitionDuration: options.duration,
        transitionTimingFunction: options.timingFunction,
        transitionProperty: "transform",
        backgroundColor: card.surface,
        boxShadow: explanationDeckCardShadow,
        pointerEvents: "none",
      }}
    >
      {options.stackPosition && !options.isFront ? (
        <button
          type="button"
          aria-label="다음 설명 카드 보기"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={options.onAdvance}
          className="pointer-events-auto absolute bottom-4 left-7 flex h-8 w-5 items-center justify-start rounded-full text-[#746F67] outline-none transition active:scale-90 focus-visible:outline-2 focus-visible:outline-[#202020]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <path d="M10 6H2M5 3 2 6l3 3" />
          </svg>
        </button>
      ) : (
        <div className="mt-auto text-left">
          <h3 className="text-[25px] font-bold leading-[1.08] tracking-[-0.04em] text-[#202020]">
            {card.title}
          </h3>
          <p className="mt-3 whitespace-pre-line text-[14px] font-semibold leading-[1.58] text-[#202020]">
            {card.body}
          </p>
        </div>
      )}
    </article>
  );

  return (
    <section className="space-y-4" data-section="explanation">
      <div>
        <h2 className="text-[24px] font-bold leading-[1.1] tracking-[-0.04em] text-[#202020]">
          이 테스트로 알 수 있어요
        </h2>
        <p className="mt-2.5 max-w-[350px] text-[14px] font-semibold leading-[1.45] tracking-[-0.02em] text-[#202020]">
          사주와 오행 흐름을 바탕으로,
          <br />
          월급 밖 수익 가능성과 돈이 들어오는 방식을 현실적으로 확인해요.
        </p>
      </div>

      <div
        className="-mx-5 overflow-x-hidden overflow-y-visible pb-4 pt-2"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="relative ml-5 h-[250px] touch-pan-y overflow-visible"
          style={{ width: "min(410px, calc(100vw - 20px))" }}
        >
          {/* eslint-disable-next-line react-hooks/refs -- onAdvance runs only from the rear-card button click. */}
          {visibleCards.map((card, stackPosition) => {
            const isFront = stackPosition === 0;
            const dragOffset =
              isFront && isDragging && dragDeltaX > 0 ? dragDeltaX : 0;

            return renderCard(card, {
              key: card.id,
              transform: `translateX(${explanationDeckTransforms[stackPosition] + dragOffset}px)`,
              zIndex: 70 - stackPosition,
              stackPosition,
              isFront,
              duration: transitionDuration,
              timingFunction: transitionTimingFunction,
              onAdvance: () => startForwardTransition(),
            });
          })}
          {outgoingCardIndex !== null && transitionMode === "forward"
            ? renderCard(stackedExplanationCards[outgoingCardIndex], {
                key: `outgoing-${stackedExplanationCards[outgoingCardIndex].id}`,
                transform: isExitActive
                  ? "translateX(110vw)"
                  : `translateX(${exitStartX}px)`,
                zIndex: 80,
                duration: isExitActive
                  ? `${explanationDeckExitDuration}ms`
                  : "0ms",
                timingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                exiting: true,
              })
            : null}
          {incomingCardIndex !== null && transitionMode === "backward"
            ? renderCard(stackedExplanationCards[incomingCardIndex], {
                key: `incoming-${stackedExplanationCards[incomingCardIndex].id}`,
                transform: isDragging
                  ? `translateX(clamp(0px, calc(100% + ${dragDeltaX}px), 100%))`
                  : transitionTarget === "front"
                    ? "translateX(0)"
                    : "translateX(100%)",
                zIndex: 80,
                duration: isDragging
                  ? "0ms"
                  : transitionTarget === "front"
                    ? `${explanationDeckExitDuration}ms`
                    : `${explanationDeckSnapDuration}ms`,
                timingFunction: isAnimating
                  ? "cubic-bezier(0.16, 1, 0.3, 1)"
                  : "ease-out",
              })
            : null}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [landingAnimalPreviews, setLandingAnimalPreviews] =
    useState<LandingAnimalPreview[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLandingAnimalPreviews(getRandomLandingAnimalPreviews());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <main
      className={`${landingTokens.page} min-h-dvh px-5 pb-10 [word-break:keep-all]`}
    >
      <section className="relative z-10 mx-auto max-w-[430px] space-y-6 pb-12 pt-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[rgba(246,187,221,0.82)] bg-[#EFE9DB] text-[15px] font-bold text-[#202020] shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
              ₩
            </span>
            <div>
              <p className="text-[15px] font-bold leading-5 tracking-[-0.01em] text-[#202020]">
                내 인생 수익 가능성 테스트
              </p>
              <p className="mt-0.5 text-[13px] font-semibold leading-5 text-[#746F67]">
                사주로 보면 나는 얼마나 벌 수 있을까?
              </p>
            </div>
          </div>
          <a
            href="#birth-form"
            className="shrink-0 rounded-full bg-[#222222] px-3.5 py-2 text-[12px] font-bold text-[#FFF9ED] shadow-[0_10px_18px_rgba(32,32,32,0.12)] transition active:translate-y-0.5"
          >
            시작
          </a>
        </header>

        <section className="space-y-6" data-section="hero">
          <h1 className="origin-left scale-y-[1.06] max-w-[360px] text-[clamp(46px,11vw,52px)] font-bold leading-[0.95] tracking-[-0.06em] text-[#202020]">
            동물 유형으로 보는
            <br />
            사주 재물운
            <br />
          </h1>
          <p className="max-w-[345px] text-[15px] font-semibold leading-[1.66] text-[#202020] min-[414px]:text-[16px]">
            돈이 모이는 방식과 수익을 증가시키는 방법을
            <br />
            리포트로 확인해요.
          </p>
          <a
            href="#birth-form"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#222222] px-5 text-[15px] font-bold text-[#FFF9ED] shadow-[0_12px_24px_rgba(32,32,32,0.12)] transition active:translate-y-0.5"
          >
            사주 확인
          </a>
        </section>

        <StackedExplanationSection />

        <section
          className={`${landingSectionRuleCompact} space-y-4`}
          data-section="animal-intro"
        >
          <div>
            <h2 className="text-[38px] font-bold leading-[1.04] tracking-[-0.042em] text-[#202020]">
              9가지 동물 유형
            </h2>
            <p className="mt-3 max-w-[350px] text-[15px] font-semibold leading-7 text-[#202020]">
              사람마다 다른 돈이 모이는 방식 !
              <br />
              일부 유형을 먼저 소개합니다.
            </p>
          </div>

          <div className="-mx-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex snap-x snap-mandatory gap-4 px-5 pt-0">
              {landingAnimalPreviews.map((preview) => (
                <AnimalTypeIntroCard
                  key={preview.animalKey}
                  preview={preview}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          id="birth-form"
          className={`scroll-mt-6 ${landingSectionRuleCompact} space-y-6`}
          data-section="birth-form"
        >
          <div>
            <h2 className="text-[38px] font-bold leading-[1.05] tracking-[-0.052em] text-[#202020]">
              내 사주는 어떻게?
            </h2>
            <p className="mt-4 text-[16px] font-semibold leading-7 text-[#202020]">
              생년월일과 태어난 시간을 기준으로 사주와 오행 흐름을 계산해요.
            </p>
          </div>

          <BirthForm />

          <p className="text-center text-[13px] font-semibold leading-6 text-[#746F67]">
            본 테스트는 오락 및 자기이해 목적의 콘텐츠입니다.
            <br />
            금융, 투자, 법률, 직업 선택에 대한 전문 조언이 아닙니다.
          </p>
        </section>
      </section>
      <LandingVersionBadge />
    </main>
  );
}
