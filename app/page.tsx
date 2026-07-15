"use client";

import Image from "next/image";
import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { LandingVersionBadge } from "../src/components/AppVersionBadge";
import BirthForm from "../src/components/BirthForm";
import {
  getLandingAnimalPreviewOptions,
  type LandingAnimalPreview,
} from "../src/lib/animalAssets";
import { uiTokens } from "../src/lib/uiTokens";

const stackedExplanationCards = [
  {
    id: "money-percent",
    label: "MONEY PERCENT",
    title: "월급 밖 수익 가능성",
    body: "내 사주와 오행 흐름에서 월급 외 수익이 커질 가능성을 확인해요.",
    surface: "#FFF8ED",
  },
  {
    id: "method",
    label: "METHOD",
    title: "돈이 모이는 방식",
    body: "어떤 방식으로 돈이 붙고, 어떤 흐름에서 수익이 커지는지 보여줘요.",
    surface: "#E7C5B8",
  },
  {
    id: "birth",
    label: "BIRTH",
    title: "생년월일 기반 흐름",
    body: "생년월일과 생시를 바탕으로 나에게 강하게 작동하는 재물 흐름을 읽어요.",
    surface: "#FFF8ED",
  },
  {
    id: "element",
    label: "ELEMENT",
    title: "오행 밸런스",
    body: "목·화·토·금·수의 균형을 통해 돈이 막히거나 열리는 지점을 살펴봐요.",
    surface: "#F3D58B",
  },
  {
    id: "animal",
    label: "ANIMAL",
    title: "재물 동물 유형",
    body: "돈 버는 방식을 9가지 동물 유형으로 비유해 쉽게 이해할 수 있게 보여줘요.",
    surface: "#FFF8ED",
  },
];

type AnimalTypeIntroCardData = {
  animalKey: LandingAnimalPreview["animalKey"];
  name: string;
  description: string;
};

const animalTypeCards: AnimalTypeIntroCardData[] = [
  {
    animalKey: "deer",
    name: "사슴형",
    description: "신뢰와 완성도로 돈을 쌓는 유형",
  },
  {
    animalKey: "tiger",
    name: "호랑이형",
    description: "큰 가능성에 과감히 올라타는 유형",
  },
  {
    animalKey: "squirrel",
    name: "다람쥐형",
    description: "작은 기회를 모아 수익을 키우는 유형",
  },
  {
    animalKey: "fox",
    name: "여우형",
    description: "감각과 설득으로 흐름을 만드는 유형",
  },
  {
    animalKey: "ox",
    name: "소형",
    description: "꾸준한 반복으로 안정적인 돈을 만드는 유형",
  },
  {
    animalKey: "otter",
    name: "수달형",
    description: "유연한 연결 속에서 기회를 잡는 유형",
  },
  {
    animalKey: "rabbit",
    name: "토끼형",
    description: "섬세한 감각으로 안전하게 키우는 유형",
  },
  {
    animalKey: "hawk",
    name: "매형",
    description: "빠른 판단으로 기회를 포착하는 유형",
  },
  {
    animalKey: "swan",
    name: "백조형",
    description: "품격과 이미지로 가치를 높이는 유형",
  },
];

const landingAnimalPreviewOptions = getLandingAnimalPreviewOptions();
const landingAnimalPreviewMap = new Map(
  Array.from(
    new Map(
      landingAnimalPreviewOptions.map((preview) => [
        preview.animalKey,
        preview,
      ])
    ).values()
  ).map((preview) => [preview.animalKey, preview])
);

const landingTokens = uiTokens.landing;
const explanationDeckSwipeThreshold = 78;
const explanationDeckExitDuration = 380;
const explanationDeckSnapDuration = 300;
const explanationDeckTransforms = [
  0,
  -14,
  -28,
  -42,
];
const explanationDeckCardClass =
  "absolute left-0 top-0 flex h-[204px] w-full flex-col justify-between rounded-[30px] border border-[rgba(231,197,184,0.75)] p-[23px] text-left shadow-[0_22px_45px_rgba(51,36,29,0.18),0_8px_18px_rgba(51,36,29,0.10)] transition-transform ease-out will-change-transform";
const explanationDeckCardShadow =
  "0 22px 45px rgba(51,36,29,0.18), 0 8px 18px rgba(51,36,29,0.10)";

function getRandomAnimalTypeCards() {
  const shuffled = [...animalTypeCards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, 3);
}

function AnimalTypeIntroCard({ card }: { card: AnimalTypeIntroCardData }) {
  const [failed, setFailed] = useState(false);
  const preview = landingAnimalPreviewMap.get(card.animalKey);
  const photo = preview?.photo ?? "";
  const basename =
    photo.split("/").filter(Boolean).pop() ?? `${card.animalKey}-1.webp`;

  return (
    <article
      className="shrink-0 snap-start pt-10"
      data-animal-intro-card={card.animalKey}
    >
      <div className="relative w-[158px] min-[414px]:w-[166px]">
        <div className="pointer-events-none absolute left-1/2 top-0 z-20 flex h-[112px] w-[124px] -translate-x-1/2 -translate-y-10 items-end justify-center overflow-visible">
          {photo && !failed ? (
            <div className="relative isolate z-10 h-[108px] w-[120px] overflow-visible">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute z-0 block"
                style={{
                  right: "50px",
                  bottom: "11px",
                  width: "126px",
                  height: "30px",
                  transform: "rotate(15deg) skewX(-10deg)",
                  transformOrigin: "right center",
                  borderRadius: "999px 70% 70% 999px",
                  filter: "blur(0.8px)",
                  background:
                    "linear-gradient(to left, rgba(51,36,29,0.38) 0%, rgba(51,36,29,0.24) 45%, rgba(51,36,29,0.08) 100%)",
                }}
              />
              <Image
                src={photo}
                alt={`${card.name} 미리보기`}
                fill
                sizes="120px"
                draggable={false}
                loading="eager"
                unoptimized
                onError={() => setFailed(true)}
                className="z-10 object-contain"
                style={{ objectPosition: "bottom center" }}
              />
            </div>
          ) : (
            <div className="relative z-10 grid h-[96px] w-[112px] place-items-center rounded-[24px] border border-dashed border-[rgba(217,142,115,0.34)] bg-[rgba(255,248,237,0.78)] px-2 text-center font-mono text-[10px] font-bold leading-4 text-[#82685D]">
              {basename}
            </div>
          )}
        </div>

        <div className="min-h-[174px] rounded-[28px] border border-[rgba(231,197,184,0.9)] bg-[#FFF8ED] px-4 pb-5 pt-[74px] shadow-[0_16px_30px_rgba(51,36,29,0.09)]">
          <p className="text-[18px] font-black leading-6 tracking-[-0.02em] text-[#33241D]">
            {card.name}
          </p>
          <p className="mt-2 text-[13px] font-bold leading-[1.52] text-[#82685D]">
            {card.description}
          </p>
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

  const startForwardTransition = () => {
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
    setExitStartX(Math.max(0, dragDeltaXRef.current));
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
        startForwardTransition();
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
    ? "cubic-bezier(0.22, 1, 0.36, 1)"
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
      <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#D98E73]">
        {card.label}
      </p>
      <div>
        <h3 className="text-[25px] font-black leading-[1.08] tracking-[-0.04em] text-[#33241D]">
          {card.title}
        </h3>
        <p className="mt-3 text-[14px] font-bold leading-[1.58] text-[#82685D]">
          {card.body}
        </p>
      </div>
    </article>
  );

  return (
    <section className="space-y-4" data-section="explanation">
      <div>
        <h2 className="text-[24px] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#33241D]">
          이 테스트로 알 수 있어요
        </h2>
        <p className="mt-2.5 max-w-[350px] text-[14px] font-bold leading-[1.45] tracking-[-0.02em] text-[#82685D]">
          사주와 오행 흐름을 바탕으로, 월급 밖 수익 가능성과 돈이 커지는
          방식을 가볍지만 현실적으로 확인해요.
        </p>
      </div>

      <div
        className="-mx-5 overflow-x-hidden overflow-y-visible pb-10 pt-2"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="relative ml-5 h-[250px] touch-pan-y overflow-visible"
          style={{ width: "min(410px, calc(100vw - 20px))" }}
        >
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
                timingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
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
                  ? "cubic-bezier(0.22, 1, 0.36, 1)"
                  : "ease-out",
              })
            : null}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [visibleAnimalTypeCards, setVisibleAnimalTypeCards] = useState(() =>
    animalTypeCards.slice(0, 3)
  );
  const hasPickedAnimalTypesRef = useRef(false);

  useEffect(() => {
    if (hasPickedAnimalTypesRef.current) {
      return;
    }

    hasPickedAnimalTypesRef.current = true;
    const animationFrame = window.requestAnimationFrame(() => {
      setVisibleAnimalTypeCards(getRandomAnimalTypeCards());
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <main
      className={`${landingTokens.page} min-h-dvh px-5 pb-10 [word-break:keep-all]`}
    >
      <section className="relative z-10 mx-auto max-w-[430px] space-y-16 pb-12 pt-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[rgba(231,197,184,0.82)] bg-[#FFF8ED] text-[15px] font-black text-[#D98E73] shadow-[0_8px_18px_rgba(51,36,29,0.08)]">
              ₩
            </span>
            <div>
              <p className="text-[15px] font-black leading-5 tracking-[-0.01em] text-[#33241D]">
                월급 밖 수익 가능성 테스트
              </p>
              <p className="mt-0.5 text-[13px] font-bold leading-5 text-[#82685D]">
                생년월일과 생시로 보는 재물 흐름
              </p>
            </div>
          </div>
          <a
            href="#birth-form"
            className="shrink-0 rounded-full bg-[#D98E73] px-3.5 py-2 text-[12px] font-black text-[#FFF8ED] shadow-[0_10px_18px_rgba(51,36,29,0.12)] transition active:translate-y-0.5"
          >
            시작
          </a>
        </header>

        <section className="space-y-6" data-section="hero">
          <h1 className="max-w-[360px] text-[clamp(46px,11vw,52px)] font-black leading-[0.95] tracking-[-0.06em] text-[#33241D]">
            나는 월급보다
            <br />
            더 많이 벌 수
            <br />
            있을까?
          </h1>
          <p className="max-w-[345px] text-[15px] font-bold leading-[1.66] text-[#82685D] min-[414px]:text-[16px]">
            돈이 모이는 방식과 수익이 커지는 조건을 따뜻한 리포트로
            확인해요.
          </p>
        </section>

        <StackedExplanationSection />

        <section
          className={`${landingTokens.sectionRule} space-y-6`}
          data-section="animal-intro"
        >
          <div>
            <p className={landingTokens.sectionEyebrow}>
              ANIMAL TYPES
            </p>
            <h2 className={landingTokens.sectionTitle}>
              9가지 재물 동물 유형
            </h2>
            <p className="mt-3 max-w-[350px] text-[15px] font-bold leading-7 text-[#82685D]">
              돈이 모이는 방식은 사람마다 달라요. 아래에는 9가지 중 일부
              유형이 랜덤으로 먼저 보여요.
            </p>
          </div>

          <div className="-mx-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex snap-x snap-mandatory gap-4 px-5 pt-8">
              {visibleAnimalTypeCards.map((card) => (
                <AnimalTypeIntroCard key={card.animalKey} card={card} />
              ))}
            </div>
          </div>
        </section>

        <section
          id="birth-form"
          className={`scroll-mt-6 ${landingTokens.sectionRule} space-y-6`}
          data-section="birth-form"
        >
          <div>
            <p className={landingTokens.sectionEyebrow}>
              START
            </p>
            <h2 className="mt-2 text-[38px] font-black leading-[1.05] tracking-[-0.052em] text-[#33241D]">
              리포트 발급을 위해 기본 정보를 입력해 주세요
            </h2>
            <p className="mt-4 text-[16px] font-bold leading-7 text-[#82685D]">
              생년월일과 태어난 시간을 기준으로 사주와 오행 흐름을 계산해요.
            </p>
          </div>

          <BirthForm />

          <p className="text-center text-[13px] font-semibold leading-6 text-[#82685D]">
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
