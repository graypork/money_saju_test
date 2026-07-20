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
  PaidReportWeeklyPlan,
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
  "core-judgment": "#BACCEC",
  "custom-keywords": "#EFE9DB",
  "money-map": "#EFE9DB",
  "execution-summary": "#EFE9DB",
  "growth-stages": "#EFE9DB",
  "monetizable-talents": "#EFE9DB",
  "income-expansion": "#EFE9DB",
  blockers: "#EFE9DB",
  "strength-problem-solution": "#EFE9DB",
  "avoid-monetization": "#EFE9DB",
  "supporting-interpretation": "#EFE9DB",
  "weekly-plan": "#EFE9DB",
};

const CARD_BASE_CLASS =
  "relative min-w-0 scroll-mt-5 overflow-visible rounded-[20px] border p-4 text-left text-[#202020]";
const CARD_SHADOW = "0 10px 24px rgba(0,0,0,0.06)";
const EXPANDED_CARD_SHADOW = "0 14px 28px rgba(0,0,0,0.08)";

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
      className={`pointer-events-none absolute right-4 top-4 z-10 h-[18px] w-[18px] text-[#202020] transition-transform duration-200 ease-out motion-reduce:transition-none ${
        expanded ? "rotate-180" : ""
      }`}
    >
      <path d="M5 19 19 5" />
      <path d="M8 5h11v11" />
    </svg>
  );
}

const HIGHLIGHT_STAGE_LABELS = new Set(["문제", "손실", "해법"]);

function readingParagraphs(text: string) {
  return text.split("\n").map((part) => part.trim()).filter(Boolean);
}

function highlightStages(text: string) {
  const parts = readingParagraphs(text);

  if (parts.length < 4 || parts.length % 2 !== 0) return null;

  const stages = Array.from({ length: parts.length / 2 }, (_, index) => ({
    label: parts[index * 2],
    text: parts[index * 2 + 1],
  }));

  return stages.every((stage) => HIGHLIGHT_STAGE_LABELS.has(stage.label))
    ? stages
    : null;
}

function ReportBlock({
  block,
  isLead,
}: {
  block: PaidReportBlock;
  isLead: boolean;
}) {
  if (block.type === "paragraph") {
    const paragraphs = readingParagraphs(block.text);

    return (
      <div className="grid gap-4">
        {paragraphs.map((paragraph, index) => {
          const lead = isLead && index === 0;

          return (
            <p
              key={`${paragraph}-${index}`}
              data-report-reading-lead={lead ? "true" : undefined}
              className={
                lead
                  ? "break-words text-[21px] font-bold leading-[1.45] tracking-[-0.035em] text-[#202020]"
                  : "break-words text-[16px] font-semibold leading-[1.9] text-[#202020]"
              }
            >
              {paragraph}
            </p>
          );
        })}
      </div>
    );
  }

  if (block.type === "highlight") {
    const stages = highlightStages(block.text);
    const paragraphs = readingParagraphs(block.text);

    return (
      <div className="border-l-2 border-[#202020] pl-4">
        {block.label ? (
          <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-[#202020]">
            {block.label}
          </p>
        ) : null}
        {stages ? (
          <div className="grid">
            {stages.map((stage, index) => (
              <div
                key={`${stage.label}-${index}`}
                data-report-highlight-stage="true"
                className="border-t border-[#DDD6C8] py-4 first:border-t-0 first:pt-0 last:pb-0"
              >
                <p className="text-[12px] font-semibold tracking-[0.08em] text-[#202020]">
                  {stage.label}
                </p>
                <p className="mt-2 break-words text-[15px] font-semibold leading-7 text-[#202020]">
                  {stage.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${paragraph}-${index}`}
                className={
                  index === 0
                    ? "break-words text-[16px] font-bold leading-7 text-[#202020]"
                    : "break-words text-[15px] font-semibold leading-7 text-[#202020]"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <div className="text-[#202020]">
        {block.title ? (
          <p className="mb-2 text-[13px] font-semibold text-[#202020]">
            {block.title}
          </p>
        ) : null}
        <ul>
          {block.items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 border-t border-[#DDD6C8] py-4 text-[15px] font-semibold leading-7 text-[#202020] first:border-t-0 first:pt-0"
            >
              <span className="font-bold text-[#202020]" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <>
      <dl className="sm:hidden" data-report-mobile-table="true">
        {block.rows.map((row, rowIndex) => (
          <div key={`mobile-row-${rowIndex}`} className="border-t border-[#DDD6C8] first:border-t-0">
            {block.headers.map((header, columnIndex) => (
              <div
                key={`${header}-${rowIndex}-${columnIndex}`}
                className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-4"
              >
                <dt className="text-[12px] font-semibold leading-5 text-[#202020]">
                  {header}
                </dt>
                <dd className="break-words text-[15px] font-semibold leading-6 text-[#202020]">
                  {row[columnIndex] ?? ""}
                </dd>
              </div>
            ))}
          </div>
        ))}
      </dl>

      <div className="hidden max-w-full overflow-x-auto rounded-[22px] border border-[rgba(32,32,32,0.18)] bg-[#EFE9DB] sm:block">
        <table className="w-full table-fixed border-collapse text-left text-[12px] text-[#202020]">
          <thead>
            <tr>
              {block.headers.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  className="break-words border-b border-[rgba(32,32,32,0.22)] px-3 py-3 align-top font-semibold text-[#202020] [overflow-wrap:anywhere]"
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
                    className="break-words border-b border-[rgba(32,32,32,0.14)] px-3 py-3 align-top font-semibold leading-5 last:border-b-0 [overflow-wrap:anywhere]"
                  >
                    {row[columnIndex] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function WeeklyPlan({
  plan,
  sectionId,
  isPlanOpen,
  onToggle,
}: {
  plan: PaidReportWeeklyPlan;
  sectionId: string;
  isPlanOpen: boolean;
  onToggle: () => void;
}) {
  const detailsId = `${sectionId}-seven-day-plan`;

  return (
    <section className="grid gap-6" data-report-weekly-plan="true" aria-label="이번 주 맞춤 플랜">
      <div className="border-l-2 border-[#202020] pl-4">
        <p className="text-[11px] font-semibold tracking-[0.1em] text-[#202020]">
          이번 주 돈 관리 초점
        </p>
        <p className="mt-2 break-words text-[16px] font-semibold leading-7 text-[#202020]">
          {plan.focus}
        </p>
      </div>

      <ol>
        {plan.actions.map((action, index) => (
          <li
            key={action.title}
            className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-t border-[#DDD6C8] py-5 first:border-t-0 first:pt-0"
          >
            <span className="pt-0.5 text-[12px] font-bold tracking-[0.08em] text-[#202020]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="break-words text-[17px] font-bold leading-6 text-[#202020]">
                {action.title}
              </h3>
              <p className="mt-1 break-words text-[15px] font-semibold leading-7 text-[#202020]">
                {action.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="border-t border-[#DDD6C8] pt-3">
        <button
          type="button"
          aria-expanded={isPlanOpen}
          aria-controls={detailsId}
          onClick={onToggle}
          className="flex min-h-11 w-full items-center justify-between gap-4 py-2 text-left text-[16px] font-bold text-[#202020] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202020] motion-reduce:transition-none"
        >
          <span>{isPlanOpen ? "7일 계획 접기" : "7일 계획 자세히 보기"}</span>
          <span className="text-[18px] leading-none text-[#202020]" aria-hidden="true">
            {isPlanOpen ? "−" : "+"}
          </span>
        </button>
        <div id={detailsId} hidden={!isPlanOpen} className="pt-3">
          <ol>
            {plan.days.map((item) => (
              <li
                key={item.day}
                data-report-weekly-day={item.day}
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-t border-[#DDD6C8] py-4 first:border-t-0 first:pt-0"
              >
                <span className="text-[13px] font-bold text-[#202020]">{item.day}</span>
                <p className="break-words text-[15px] font-semibold leading-7 text-[#202020]">
                  {item.action}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {plan.caution ? (
        <p className="border-l-2 border-[#DDD6C8] pl-4 text-[14px] font-semibold leading-6 text-[#202020]">
          {plan.caution}
        </p>
      ) : null}
    </section>
  );
}

function ReportBody({ section }: { section: PaidReportSection }) {
  if (section.weeklyPlan) {
    return null;
  }

  return (
    <div className="grid gap-6" data-report-reading-body="true">
      {section.subtitle ? (
        <p className="whitespace-pre-line break-words text-[15px] font-semibold leading-7 text-[#202020]">
          {section.subtitle}
        </p>
      ) : null}
      {section.blocks.map((block, index) => (
        <ReportBlock
          key={`${section.id}-block-${index}`}
          block={block}
          isLead={index === 0}
        />
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
    <div className="pointer-events-none grid h-[76px] w-full place-items-center border border-dashed border-[rgba(32,32,32,0.28)] px-2 text-center text-[10px] font-bold leading-4 text-[#202020]">
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
  dimmed,
}: {
  report: PaidReport;
  placement: RenderPlacement;
  onAction?: () => void;
  dimmed: boolean;
}) {
  const content = (
    <div className="flex h-full min-w-0 flex-col justify-between gap-2">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#202020]">
        전체 리포트
      </p>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-visible py-1">
        <OverviewAnimalImage animalKey={report.animalKey} title={report.animalName} />
      </div>
      <div className="min-w-0">
        <h2 className="break-words text-[22px] font-bold leading-[1.08] tracking-[-0.04em]">
          {report.title}
        </h2>
        <p className="mt-1 break-words text-[12px] font-semibold leading-5 text-[#202020]">
          {report.animalName}
        </p>
      </div>
    </div>
  );

  return (
    <article
      data-report-overview-card="true"
      className={`${CARD_BASE_CLASS} flex flex-col justify-end border-[rgba(246,187,221,0.7)] p-[18px] transition-opacity duration-200 ease-out motion-reduce:transition-none ${
        dimmed ? "opacity-55" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#EFE9DB",
        boxShadow: CARD_SHADOW,
        gridColumn: placement.gridColumn,
        gridRow: placement.gridRow,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="h-full w-full rounded-[inherit] text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202020]"
        >
          <ReportCardArrow />
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
  dimmed,
  nextSection,
  tall,
  onNext,
  placement,
  onToggle,
  setRef,
}: {
  section: PaidReportSection;
  expanded: boolean;
  dimmed: boolean;
  nextSection?: PaidReportSection;
  tall: boolean;
  onNext?: () => void;
  placement: RenderPlacement;
  onToggle: () => void;
  setRef: (node: HTMLElement | null) => void;
}) {
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  return (
    <article
      ref={setRef}
      data-report-section-card={section.id}
      data-expanded={expanded ? "true" : "false"}
      className={`${CARD_BASE_CLASS} box-border ${
        expanded
          ? "h-full min-h-0 self-stretch rounded-[28px] p-5"
          : "h-full min-h-0 flex flex-col justify-end"
      } transition-opacity duration-200 ease-out motion-reduce:transition-none ${
        dimmed ? "opacity-55" : "opacity-100"
      }`}
      style={{
        backgroundColor: CARD_SURFACES[section.id] ?? "#EFE9DB",
        borderColor: expanded ? "#222222" : "#DDD6C8",
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
            className="sticky top-4 z-10 w-full bg-inherit pb-5 text-left text-[#202020] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202020]"
          >
            <ReportCardArrow expanded />
            <h2 className="break-words text-[32px] font-bold leading-[1.08] tracking-[-0.045em]">
              {section.title}
            </h2>
          </button>
          <div
            className="mt-1 border-t border-[#DDD6C8] pb-2 pt-6"
            data-report-body="true"
            data-report-reading-surface="true"
          >
            {section.weeklyPlan ? (
              <WeeklyPlan
                plan={section.weeklyPlan}
                sectionId={section.id}
                isPlanOpen={isPlanOpen}
                onToggle={() => setIsPlanOpen((current) => !current)}
              />
            ) : (
              <ReportBody section={section} />
            )}
          </div>
          {nextSection && onNext ? (
            <div
              className="mt-8 border-t border-[#DDD6C8] pt-5"
              data-report-next-section="true"
            >
              <p className="text-[12px] font-semibold tracking-[0.08em] text-[#202020]">
                다음 분석
              </p>
              <button
                type="button"
                onClick={onNext}
                className="mt-2 flex w-full items-center justify-between gap-4 rounded-[18px] bg-[rgba(246,187,221,0.34)] px-4 py-4 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202020]"
              >
                <span className="text-[16px] font-bold leading-6 text-[#202020]">
                  {nextSection.title}
                </span>
                <span className="shrink-0 text-[13px] font-semibold text-[#202020]">
                  다음 분석 읽기 →
                </span>
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          aria-expanded="false"
          onClick={onToggle}
          className="relative flex h-full w-full items-end rounded-[inherit] text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202020]"
        >
          <ReportCardArrow />
          <h2
            className={
              tall
                ? "break-words text-[27px] font-bold leading-[1.08] tracking-[-0.045em]"
                : "break-words text-[21px] font-bold leading-[1.1] tracking-[-0.04em]"
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
    <section className="space-y-4" aria-label="상세 리포트 탐색">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-[14px] font-semibold leading-6 text-[#202020]">
            카드를 선택해 자세한 분석을 열어보세요.
          </p>
        </div>
        <span className="shrink-0 text-[12px] font-semibold text-[#202020]">
          {sections.length}개 분석
        </span>
      </div>

      <div
        className="grid grid-cols-2 gap-3"
        style={gridStyle}
        data-report-card-grid="all"
        data-report-card-phase={expansionPhase}
        data-report-reading-mode={expandedSectionIndex !== null ? "true" : "false"}
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
          dimmed={expandedSectionIndex !== null}
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
              dimmed={expandedSectionIndex !== null && expandedSectionIndex !== index}
              nextSection={sections[index + 1]}
              tall={base.baseRowSpan === 2}
              onNext={() => handleToggle(index + 1)}
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
    </section>
  );
}

export function PaidReportSectionNavigator(props: PaidReportViewProps) {
  return <PaidReportView {...props} />;
}
