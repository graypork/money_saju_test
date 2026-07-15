"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
} from "react";
import { getAvailableAnimalMainPhotos } from "../lib/animalAssets";
import type {
  PaidReport,
  PaidReportBlock,
  PaidReportSection,
} from "../content/resultCopy/paidReportTypes";

type PaidReportViewProps = {
  report: PaidReport;
  onOverviewAction?: () => void;
};

type BasePlacement = {
  baseColumn: 1 | 2;
  baseRow: number;
  baseRowSpan: 1 | 2;
};

type GridCard = {
  id: string;
  visualIndex: number;
  placement: BasePlacement;
};

type RenderPlacement = {
  gridColumn: string;
  gridRow: string;
};

type GridLayout = {
  placements: Map<string, RenderPlacement>;
  templateRows: string;
};

type ExpansionPhase =
  | "collapsed"
  | "measuring"
  | "expanding"
  | "expanded"
  | "collapsing"
  | "switching";

const CARD_MOTION_DURATION = 380;
const COLLAPSED_ROW_COUNT = 8;
const CARD_VERTICAL_PADDING = 36;
const CARD_BORDER_HEIGHT = 2;
const BASE_PLACEMENTS: BasePlacement[] = [
  { baseColumn: 1, baseRow: 1, baseRowSpan: 2 },
  { baseColumn: 2, baseRow: 1, baseRowSpan: 1 },
  { baseColumn: 2, baseRow: 2, baseRowSpan: 1 },
  { baseColumn: 1, baseRow: 3, baseRowSpan: 1 },
  { baseColumn: 2, baseRow: 3, baseRowSpan: 1 },
  { baseColumn: 1, baseRow: 4, baseRowSpan: 2 },
  { baseColumn: 2, baseRow: 4, baseRowSpan: 1 },
  { baseColumn: 2, baseRow: 5, baseRowSpan: 1 },
  { baseColumn: 1, baseRow: 6, baseRowSpan: 1 },
  { baseColumn: 2, baseRow: 6, baseRowSpan: 1 },
  { baseColumn: 1, baseRow: 7, baseRowSpan: 1 },
  { baseColumn: 1, baseRow: 8, baseRowSpan: 1 },
  { baseColumn: 2, baseRow: 7, baseRowSpan: 2 },
];

const CARD_SURFACES: Record<string, string> = {
  "core-judgment": "#FFF8ED",
  "custom-keywords": "#FFFDF9",
  "money-map": "#FFF8F1",
  "execution-summary": "#FFF8ED",
  "growth-stages": "#FFFDF9",
  "monetizable-talents": "#FFF8F1",
  "income-expansion": "#FFF8ED",
  blockers: "#FFFDF9",
  "strength-problem-solution": "#FFF8F1",
  "avoid-monetization": "#FFF8ED",
  "supporting-interpretation": "#FFFDF9",
  "weekly-plan": "#FFF8F1",
};

const CARD_BASE_CLASS =
  "relative min-w-0 scroll-mt-5 overflow-visible rounded-[20px] border p-4 text-left text-[#33241D]";
const CARD_SHADOW = "0 10px 24px rgba(51,36,29,0.06)";
const EXPANDED_CARD_SHADOW = "0 14px 28px rgba(51,36,29,0.08)";

function ReportCardArrow({ expanded = false }: { expanded?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`pointer-events-none absolute right-4 top-4 z-10 h-[18px] w-[18px] text-[#82685D] transition-transform duration-200 ease-out motion-reduce:transition-none ${
        expanded ? "rotate-180" : ""
      }`}
    >
      <path d="M5 19 19 5" />
      <path d="M8 5h11v11" />
    </svg>
  );
}

function ReportBlock({ block }: { block: PaidReportBlock }) {
  if (block.type === "paragraph") {
    return (
      <p className="whitespace-pre-line break-words text-[15px] font-semibold leading-[1.85] text-[#82685D]">
        {block.text}
      </p>
    );
  }

  if (block.type === "highlight") {
    return (
      <div className="rounded-[22px] border border-[rgba(217,142,115,0.2)] bg-[rgba(231,197,184,0.22)] px-4 py-4">
        {block.label ? (
          <p className="mb-2 text-[11px] font-black tracking-[0.08em] text-[#D98E73]">
            {block.label}
          </p>
        ) : null}
        <p className="whitespace-pre-line break-words text-[15px] font-extrabold leading-7 text-[#33241D]">
          {block.text}
        </p>
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <div className="grid gap-3 rounded-[22px] bg-[#FFF8ED] p-1 text-[#33241D]">
        {block.title ? (
          <p className="px-4 pt-3 text-[13px] font-black text-[#D98E73]">
            {block.title}
          </p>
        ) : null}
        <ul>
          {block.items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="border-t border-[rgba(217,142,115,0.18)] px-4 py-4 text-[14px] font-extrabold leading-6 text-[#33241D] first:border-t-0"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto rounded-[22px] border border-[rgba(217,142,115,0.18)] bg-[#FFF8ED]">
      <table className="w-full table-fixed border-collapse text-left text-[12px] text-[#33241D]">
        <thead>
          <tr>
            {block.headers.map((header, index) => (
              <th
                key={`${header}-${index}`}
                className="break-words border-b border-[rgba(217,142,115,0.22)] px-3 py-3 align-top font-black text-[#D98E73] [overflow-wrap:anywhere]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {block.headers.map((header, columnIndex) => (
                <td
                  key={`${header}-${rowIndex}-${columnIndex}`}
                  className="break-words border-b border-[rgba(217,142,115,0.14)] px-3 py-3 align-top font-semibold leading-5 last:border-b-0 [overflow-wrap:anywhere]"
                >
                  {row[columnIndex] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportBody({ section }: { section: PaidReportSection }) {
  return (
    <div className="grid gap-5">
      {section.subtitle ? (
        <p className="whitespace-pre-line break-words text-[14px] font-bold leading-7 text-[#82685D]">
          {section.subtitle}
        </p>
      ) : null}
      {section.blocks.map((block, index) => (
        <ReportBlock key={`${section.id}-block-${index}`} block={block} />
      ))}
    </div>
  );
}

function assetBasename(path: string | null, animalKey: string) {
  return path?.split("/").filter(Boolean).pop() ?? `${animalKey}-1.webp`;
}

function OverviewAnimalImage({
  animalKey,
  title,
}: {
  animalKey: string;
  title: string;
}) {
  const candidates = getAvailableAnimalMainPhotos(animalKey);
  const photo = candidates[1 % Math.max(candidates.length, 1)] ?? null;
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const failed = photo !== null && failedPhoto === photo;

  return photo && !failed ? (
    <img
      src={photo}
      alt={title}
      draggable={false}
      onError={() => setFailedPhoto(photo)}
      className="pointer-events-none h-[92px] w-full object-contain"
    />
  ) : (
    <div className="pointer-events-none grid h-[76px] w-full place-items-center border border-dashed border-[rgba(217,142,115,0.28)] px-2 text-center font-mono text-[10px] font-bold leading-4 text-[rgba(130,104,93,0.78)]">
      {assetBasename(photo, animalKey)}
    </div>
  );
}

function canPlace(
  occupied: Map<number, Set<number>>,
  row: number,
  column: 1 | 2,
  rowSpan: number,
  columnSpan = 1
) {
  for (let currentRow = row; currentRow < row + rowSpan; currentRow += 1) {
    const occupiedColumns = occupied.get(currentRow) ?? new Set<number>();

    for (
      let currentColumn = column;
      currentColumn < column + columnSpan;
      currentColumn += 1
    ) {
      if (occupiedColumns.has(currentColumn)) return false;
    }
  }

  return true;
}

function reserve(
  occupied: Map<number, Set<number>>,
  row: number,
  column: 1 | 2,
  rowSpan: number,
  columnSpan = 1
) {
  for (let currentRow = row; currentRow < row + rowSpan; currentRow += 1) {
    const occupiedColumns = occupied.get(currentRow) ?? new Set<number>();

    for (
      let currentColumn = column;
      currentColumn < column + columnSpan;
      currentColumn += 1
    ) {
      occupiedColumns.add(currentColumn);
    }

    occupied.set(currentRow, occupiedColumns);
  }
}

function findAvailableRow(
  occupied: Map<number, Set<number>>,
  preferredRow: number,
  column: 1 | 2,
  rowSpan: number
) {
  let row = preferredRow;

  while (!canPlace(occupied, row, column, rowSpan)) {
    row += 1;
  }

  return row;
}

function collapsedLayout(cards: GridCard[]): GridLayout {
  const placements = new Map<string, RenderPlacement>();

  for (const card of cards) {
    placements.set(card.id, {
      gridColumn: String(card.placement.baseColumn),
      gridRow: `${card.placement.baseRow} / span ${card.placement.baseRowSpan}`,
    });
  }

  return {
    placements,
    templateRows: Array.from(
      { length: COLLAPSED_ROW_COUNT },
      () => "var(--report-cell)"
    ).join(" "),
  };
}

function expandedLayout(
  cards: GridCard[],
  selectedIndex: number,
  measuredHeight: number | null
): GridLayout {
  const selectedCardIndex = selectedIndex + 1;
  const selectedCard = cards[selectedCardIndex];

  if (!selectedCard) return collapsedLayout(cards);

  const selectedStart = selectedCard.placement.baseRow;
  const selectedEndExclusive =
    selectedStart + selectedCard.placement.baseRowSpan;
  const removedCollapsedRows = selectedCard.placement.baseRowSpan - 1;
  const occupied = new Map<number, Set<number>>();
  const placements = new Map<string, RenderPlacement>();
  const sortedCards = [...cards].sort(
    (left, right) =>
      left.placement.baseRow - right.placement.baseRow ||
      left.placement.baseColumn - right.placement.baseColumn ||
      left.visualIndex - right.visualIndex
  );

  for (const card of sortedCards) {
    const isSelected = card.visualIndex === selectedCard.visualIndex;
    const endsAtOrBeforeSelected =
      card.placement.baseRow + card.placement.baseRowSpan <= selectedStart;

    if (isSelected) continue;
    if (!endsAtOrBeforeSelected) continue;

    placements.set(card.id, {
      gridColumn: String(card.placement.baseColumn),
      gridRow: `${card.placement.baseRow} / span ${card.placement.baseRowSpan}`,
    });
    reserve(
      occupied,
      card.placement.baseRow,
      card.placement.baseColumn,
      card.placement.baseRowSpan
    );
  }

  placements.set(selectedCard.id, {
    gridColumn: "1 / -1",
    gridRow: `${selectedStart} / span 1`,
  });
  reserve(occupied, selectedStart, 1, 1, 2);

  for (const card of sortedCards) {
    const isSelected = card.visualIndex === selectedCard.visualIndex;
    const isAbove =
      card.placement.baseRow + card.placement.baseRowSpan <= selectedStart;

    if (isSelected || isAbove) continue;

    const { baseRow, baseColumn, baseRowSpan } = card.placement;
    const startsBelowSelected = baseRow >= selectedEndExclusive;
    const candidateRow = startsBelowSelected
      ? baseRow - removedCollapsedRows
      : selectedStart + 1 + Math.max(0, baseRow - selectedStart);
    const row = findAvailableRow(occupied, candidateRow, baseColumn, baseRowSpan);

    placements.set(card.id, {
      gridColumn: String(baseColumn),
      gridRow: `${row} / span ${baseRowSpan}`,
    });
    reserve(occupied, row, baseColumn, baseRowSpan);
  }

  const highestRow = Math.max(...[...occupied.keys(), selectedStart]);
  const templateRows = Array.from({ length: highestRow }, (_, index) => {
    const logicalRow = index + 1;

    return logicalRow === selectedStart
      ? measuredHeight === null
        ? "max-content"
        : `${measuredHeight}px`
      : "var(--report-cell)";
  }).join(" ");

  return { placements, templateRows };
}

function captureRects(
  cardRefs: MutableRefObject<Map<string, HTMLElement>>
) {
  return new Map(
    [...cardRefs.current.entries()].map(([id, node]) => [
      id,
      node.getBoundingClientRect(),
    ])
  );
}

function cancelAnimations(
  runningAnimations: MutableRefObject<Map<string, Animation>>
) {
  for (const animation of runningAnimations.current.values()) {
    animation.cancel();
  }
  runningAnimations.current.clear();
}

function animateLayoutChange(
  nodes: Map<string, HTMLElement>,
  beforeRects: Map<string, DOMRect>,
  sequence: number,
  currentSequence: MutableRefObject<number>,
  runningAnimations: MutableRefObject<Map<string, Animation>>,
  onSettled: () => void
) {
  cancelAnimations(runningAnimations);
  const animations: Animation[] = [];

  for (const [id, from] of beforeRects.entries()) {
    const node = nodes.get(id);
    if (!node || sequence !== currentSequence.current) continue;

    const to = node.getBoundingClientRect();
    const deltaX = from.left - to.left;
    const deltaY = from.top - to.top;
    const sizeChanged =
      Math.abs(from.width - to.width) >= 0.5 ||
      Math.abs(from.height - to.height) >= 0.5;

    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5 && !sizeChanged) {
      continue;
    }

    const scaleX = to.width > 0 ? from.width / to.width : 1;
    const scaleY = to.height > 0 ? from.height / to.height : 1;
    const animation = node.animate(
      [
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
        },
        { transform: "translate(0, 0) scale(1, 1)" },
      ],
      {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : CARD_MOTION_DURATION,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "none",
      }
    );

    runningAnimations.current.set(id, animation);
    animation.onfinish = () => {
      animation.cancel();
      if (runningAnimations.current.get(id) === animation) {
        runningAnimations.current.delete(id);
      }
    };
    animations.push(animation);
  }

  if (animations.length === 0) {
    onSettled();
    return;
  }

  Promise.all(
    animations.map((animation) => animation.finished.catch(() => undefined))
  )
    .then(() => {
      if (sequence === currentSequence.current) onSettled();
    })
    .catch(() => {
      if (sequence === currentSequence.current) onSettled();
    });
}

function OverviewCard({
  report,
  placement,
  onAction,
}: {
  report: PaidReport;
  placement: RenderPlacement;
  onAction?: () => void;
}) {
  const content = (
    <div className="flex h-full min-w-0 flex-col justify-between gap-2">
      <p className="text-[11px] font-black tracking-[0.08em] text-[#D98E73]">
        전체 리포트
      </p>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-visible py-1">
        <OverviewAnimalImage animalKey={report.animalKey} title={report.animalName} />
      </div>
      <div className="min-w-0">
        <h2 className="break-words text-[22px] font-extrabold leading-[1.08] tracking-[-0.04em]">
          {report.title}
        </h2>
        <p className="mt-1 break-words text-[12px] font-bold leading-5 text-[#82685D]">
          {report.animalName}
        </p>
      </div>
    </div>
  );

  return (
    <article
      data-report-overview-card="true"
      className={`${CARD_BASE_CLASS} flex flex-col justify-end border-[rgba(231,197,184,0.7)] p-[18px]`}
      style={{
        backgroundColor: "#FFF8F1",
        boxShadow: CARD_SHADOW,
        gridColumn: placement.gridColumn,
        gridRow: placement.gridRow,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <ReportCardArrow />
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="h-full w-full rounded-[inherit] text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D98E73]"
        >
          {content}
        </button>
      ) : (
        content
      )}
    </article>
  );
}

function ReportSectionCard({
  section,
  expanded,
  tall,
  placement,
  onToggle,
  setRef,
}: {
  section: PaidReportSection;
  expanded: boolean;
  tall: boolean;
  placement: RenderPlacement;
  onToggle: () => void;
  setRef: (node: HTMLElement | null) => void;
}) {
  return (
    <article
      ref={setRef}
      data-report-section-card={section.id}
      data-expanded={expanded ? "true" : "false"}
      className={`${CARD_BASE_CLASS} box-border ${
        expanded
          ? "h-full min-h-0 self-stretch rounded-[20px] p-[18px]"
          : "h-full min-h-0 flex flex-col justify-end"
      }`}
      style={{
        backgroundColor: CARD_SURFACES[section.id] ?? "#FFFDF9",
        borderColor: "rgba(231,197,184,0.7)",
        boxShadow: expanded ? EXPANDED_CARD_SHADOW : CARD_SHADOW,
        gridColumn: placement.gridColumn,
        gridRow: placement.gridRow,
        height: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        overflow: "visible",
      }}
    >
      {expanded ? (
        <div className="flow-root min-w-0" data-report-expanded-content="true">
          <button
            type="button"
            aria-expanded="true"
            onClick={onToggle}
            className="sticky top-4 z-10 w-full rounded-[20px] bg-inherit text-left text-[#33241D] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D98E73]"
          >
            <ReportCardArrow expanded />
            <h2 className="break-words text-[30px] font-extrabold leading-[1.08] tracking-[-0.045em]">
              {section.title}
            </h2>
          </button>
          <div className="mt-7 pb-2" data-report-body="true">
            <ReportBody section={section} />
          </div>
        </div>
      ) : (
        <button
          type="button"
          aria-expanded="false"
          onClick={onToggle}
          className="relative flex h-full w-full items-end rounded-[inherit] text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D98E73]"
        >
          <ReportCardArrow />
          <h2
            className={
              tall
                ? "break-words text-[27px] font-extrabold leading-[1.08] tracking-[-0.045em]"
                : "break-words text-[21px] font-extrabold leading-[1.1] tracking-[-0.04em]"
            }
          >
            {section.title}
          </h2>
        </button>
      )}
    </article>
  );
}

export function PaidReportView({
  report,
  onOverviewAction,
}: PaidReportViewProps) {
  const sections = report.sections;
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<
    number | null
  >(null);
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null);
  const [expansionPhase, setExpansionPhase] =
    useState<ExpansionPhase>("collapsed");
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const layoutBeforeRectsRef = useRef<Map<string, DOMRect> | null>(null);
  const runningAnimationsRef = useRef(new Map<string, Animation>());
  const layoutFrameRef = useRef<number | null>(null);
  const measurementFrameRef = useRef<number | null>(null);
  const measurementObserverRef = useRef<ResizeObserver | null>(null);
  const collapseScrollIdRef = useRef<string | null>(null);
  const pendingSectionIndexRef = useRef<number | null>(null);
  const focusPendingRef = useRef(false);
  const sequenceRef = useRef(0);
  const phaseRef = useRef<ExpansionPhase>("collapsed");
  const expandedIndexRef = useRef<number | null>(null);
  const expandedHeightRef = useRef<number | null>(null);

  const cards: GridCard[] = [
    { id: "overview", visualIndex: 0, placement: BASE_PLACEMENTS[0] },
    ...sections.map((section, index) => ({
      id: section.id,
      visualIndex: index + 1,
      placement: BASE_PLACEMENTS[index + 1],
    })),
  ];
  const layout =
    expandedSectionIndex === null
      ? collapsedLayout(cards)
      : expandedLayout(cards, expandedSectionIndex, expandedHeight);

  const setPhase = (nextPhase: ExpansionPhase) => {
    phaseRef.current = nextPhase;
    setExpansionPhase(nextPhase);
  };

  const cancelPendingWork = () => {
    if (layoutFrameRef.current !== null) {
      window.cancelAnimationFrame(layoutFrameRef.current);
      layoutFrameRef.current = null;
    }
    if (measurementFrameRef.current !== null) {
      window.cancelAnimationFrame(measurementFrameRef.current);
      measurementFrameRef.current = null;
    }
    cancelAnimations(runningAnimationsRef);
  };

  const beginExpand = (index: number) => {
    if (!sections[index]) return;

    cancelPendingWork();
    sequenceRef.current += 1;
    pendingSectionIndexRef.current = null;
    collapseScrollIdRef.current = null;
    focusPendingRef.current = true;
    layoutBeforeRectsRef.current = captureRects(cardRefs);
    expandedIndexRef.current = index;
    expandedHeightRef.current = null;
    setExpandedHeight(null);
    setExpandedSectionIndex(index);
    setPhase("measuring");
  };

  const beginCollapse = (nextIndex: number | null) => {
    cancelPendingWork();
    sequenceRef.current += 1;
    pendingSectionIndexRef.current = nextIndex;
    focusPendingRef.current = false;
    collapseScrollIdRef.current =
      nextIndex === null && expandedSectionIndex !== null
        ? sections[expandedSectionIndex]?.id ?? null
        : null;
    layoutBeforeRectsRef.current = captureRects(cardRefs);
    expandedIndexRef.current = null;
    expandedHeightRef.current = null;
    setExpandedHeight(null);
    setExpandedSectionIndex(null);
    setPhase(nextIndex === null ? "collapsing" : "switching");
  };

  const handleToggle = (index: number) => {
    const currentPhase = phaseRef.current;

    if (
      currentPhase === "measuring" ||
      currentPhase === "expanding" ||
      currentPhase === "collapsing" ||
      currentPhase === "switching"
    ) {
      if (expandedIndexRef.current === index) return;

      if (expandedIndexRef.current !== null) {
        beginCollapse(index);
      } else {
        pendingSectionIndexRef.current = index;
        setPhase("switching");
      }
      return;
    }

    if (expandedSectionIndex === index) {
      beginCollapse(null);
      return;
    }

    if (expandedSectionIndex !== null) {
      beginCollapse(index);
      return;
    }

    beginExpand(index);
  };

  useEffect(() => {
    return () => {
      cancelPendingWork();
      measurementObserverRef.current?.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    if (expandedSectionIndex === null) return;

    const section = sections[expandedSectionIndex];
    const node = section ? cardRefs.current.get(section.id) : null;
    const wrapper = node?.querySelector<HTMLElement>(
      "[data-report-expanded-content]"
    );
    const sequence = sequenceRef.current;

    if (!node || !wrapper || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      measurementFrameRef.current = null;
      if (sequence !== sequenceRef.current) return;

      const computed = window.getComputedStyle(node);
      const verticalBox =
        Number.parseFloat(computed.paddingTop) +
        Number.parseFloat(computed.paddingBottom) +
        Number.parseFloat(computed.borderTopWidth) +
        Number.parseFloat(computed.borderBottomWidth);
      const nextHeight = Math.ceil(
        wrapper.getBoundingClientRect().height +
          (Number.isFinite(verticalBox)
            ? verticalBox
            : CARD_VERTICAL_PADDING + CARD_BORDER_HEIGHT)
      );
      const previousHeight = expandedHeightRef.current;

      if (
        previousHeight !== null &&
        Math.abs(previousHeight - nextHeight) < 1
      ) {
        return;
      }

      if (phaseRef.current !== "measuring") {
        layoutBeforeRectsRef.current = captureRects(cardRefs);
      }

      expandedHeightRef.current = nextHeight;
      setExpandedHeight(nextHeight);
      setPhase("expanding");
    };

    const scheduleMeasure = () => {
      if (measurementFrameRef.current !== null) return;
      measurementFrameRef.current = window.requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(scheduleMeasure);
    measurementObserverRef.current = observer;
    observer.observe(wrapper);
    scheduleMeasure();

    return () => {
      observer.disconnect();
      if (measurementObserverRef.current === observer) {
        measurementObserverRef.current = null;
      }
      if (measurementFrameRef.current !== null) {
        window.cancelAnimationFrame(measurementFrameRef.current);
        measurementFrameRef.current = null;
      }
    };
  }, [expandedSectionIndex, sections]);

  const settleLayout = (sequence: number) => {
    if (sequence !== sequenceRef.current) return;

    const currentPhase = phaseRef.current;

    if (currentPhase === "collapsing" || currentPhase === "switching") {
      const pendingIndex = pendingSectionIndexRef.current;
      pendingSectionIndexRef.current = null;

      if (pendingIndex !== null) {
        layoutFrameRef.current = window.requestAnimationFrame(() => {
          layoutFrameRef.current = null;
          if (sequence !== sequenceRef.current) return;
          beginExpand(pendingIndex);
        });
        return;
      }

      setPhase("collapsed");
      const collapseId = collapseScrollIdRef.current;
      collapseScrollIdRef.current = null;

      if (collapseId) {
        layoutFrameRef.current = window.requestAnimationFrame(() => {
          layoutFrameRef.current = null;
          if (sequence !== sequenceRef.current) return;
          cardRefs.current.get(collapseId)?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
            block: "start",
          });
        });
      }
      return;
    }

    if (currentPhase !== "expanding") return;

    setPhase("expanded");

    if (!focusPendingRef.current || expandedSectionIndex === null) return;

    focusPendingRef.current = false;
    const selectedId = sections[expandedSectionIndex]?.id;
    if (!selectedId) return;

    layoutFrameRef.current = window.requestAnimationFrame(() => {
      layoutFrameRef.current = null;
      if (sequence !== sequenceRef.current || phaseRef.current !== "expanded") {
        return;
      }

      const node = cardRefs.current.get(selectedId);
      if (!node) return;

      const block =
        node.getBoundingClientRect().height > window.innerHeight * 0.9
          ? "start"
          : "center";
      node.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block,
      });
    });
  };

  useLayoutEffect(() => {
    if (phaseRef.current === "measuring") return;

    const beforeRects = layoutBeforeRectsRef.current;
    if (!beforeRects) return;

    layoutBeforeRectsRef.current = null;
    const sequence = sequenceRef.current;
    layoutFrameRef.current = window.requestAnimationFrame(() => {
      layoutFrameRef.current = null;
      if (sequence !== sequenceRef.current) return;

      animateLayoutChange(
        cardRefs.current,
        beforeRects,
        sequence,
        sequenceRef,
        runningAnimationsRef,
        () => settleLayout(sequence)
      );
    });
  }, [expandedSectionIndex, expandedHeight, expansionPhase, settleLayout]);

  const gridStyle = {
    "--report-cell": "clamp(173px, calc((100vw - 44px) / 2), 193px)",
    gridTemplateRows: layout.templateRows,
  } as CSSProperties;

  return (
    <div
      className="grid grid-cols-2 gap-3"
      style={gridStyle}
      data-report-card-grid="all"
      data-report-card-phase={expansionPhase}
    >
      <OverviewCard
        report={report}
        placement={
          layout.placements.get("overview") ?? {
            gridColumn: "1",
            gridRow: "1 / span 2",
          }
        }
        onAction={onOverviewAction}
      />
      {sections.map((section, index) => {
        const placement = layout.placements.get(section.id);
        const base = BASE_PLACEMENTS[index + 1];

        if (!placement || !base) return null;

        return (
          <ReportSectionCard
            key={section.id}
            section={section}
            expanded={expandedSectionIndex === index}
            tall={base.baseRowSpan === 2}
            placement={placement}
            onToggle={() => handleToggle(index)}
            setRef={(node) => {
              if (node) cardRefs.current.set(section.id, node);
              else cardRefs.current.delete(section.id);
            }}
          />
        );
      })}
    </div>
  );
}

export function PaidReportSectionNavigator(props: PaidReportViewProps) {
  return <PaidReportView {...props} />;
}
