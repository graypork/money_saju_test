"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateWealthResult,
  type WealthResult,
} from "../../src/lib/score";
import AppVersionBadge from "../../src/components/AppVersionBadge";
import { buildResultCopy, type BuiltResultCopy } from "../../src/lib/copyEngine";
import { getAvailableAnimalMainPhotos } from "../../src/lib/animalAssets";
import { uiTokens } from "../../src/lib/uiTokens";

const PAGE_BASE_CLASS =
  `${uiTokens.page} break-keep px-5 pb-10 pt-4`;
const PRIMARY_BUTTON_CLASS =
  `min-h-14 w-full rounded-full px-5 py-4 text-center text-[16px] font-extrabold text-[#ccff00] transition active:translate-y-0.5 ${uiTokens.greenButtonSurface}`;
const SECONDARY_BUTTON_CLASS =
  `min-h-14 w-full rounded-full px-5 py-4 text-center text-[16px] font-extrabold text-[#ccff00] transition active:translate-y-0.5 ${uiTokens.greenButtonSurface}`;
const DARK_PANEL_CLASS =
  "rounded-[28px] bg-[#000000] p-5 text-[#ccff00]";
const DARK_DIVIDER_CLASS = "border-[rgba(204,255,0,0.16)]";

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
      <div className="organic-float-b organic-depth-left absolute -left-44 top-[36rem] h-[190px] w-[330px] rotate-[-18deg] rounded-[999px] border-[44px] border-[rgba(255,255,0,0.1)]" />
      <div className="organic-float-c organic-depth-right absolute right-[-16rem] top-[86rem] h-[170px] w-[420px] rotate-[24deg] rounded-[999px] bg-[rgba(223,255,0,0.08)]" />
    </div>
  );
}

function SiteHeader({
  label,
  onBack,
}: {
  label: string;
  onBack: () => void;
}) {
  return (
    <header className={`${uiTokens.header} flex items-center justify-between`}>
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(204,255,0,0.12)] text-lg font-black text-[#ccff00]"
      >
        ←
      </button>
      <span className="text-[13px] font-black tracking-[-0.01em]">
        MONEY SAJU
      </span>
      <span className="text-[11px] font-black tracking-[0.12em] text-[#ffff00]">
        {label}
      </span>
    </header>
  );
}

function parseBirthDate(birthDate: string) {
  const parts = birthDate.split("-").map(Number);

  return {
    year: parts[0] || 2000,
    month: parts[1] || 1,
    day: parts[2] || 1,
  };
}

function formatBirthDate(birthDate: string) {
  return `${birthDate.slice(0, 4)}-${birthDate.slice(4, 6)}-${birthDate.slice(6, 8)}`;
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

function textParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function ReportSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={`${uiTokens.sectionRule} space-y-6`}>
      <div>
        <p className={uiTokens.sectionEyebrow}>
          {label}
        </p>
        <h2 className={uiTokens.sectionTitle}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function CopyText({
  value,
  tone = "default",
}: {
  value: string;
  tone?: "default" | "dark";
}) {
  return (
    <div className="grid gap-4">
      {textParagraphs(value).map((paragraph, index) => (
        <p
          key={`${paragraph.slice(0, 18)}-${index}`}
          className={`whitespace-pre-line text-[15px] font-semibold leading-7 ${
            tone === "dark"
              ? "text-[rgba(204,255,0,0.72)]"
              : "text-[rgba(223,255,0,0.72)]"
          }`}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function assetBasename(path: string | null, animalKey: string) {
  return path?.split("/").filter(Boolean).pop() ?? `${animalKey}-1.webp`;
}

function getReportAnimalPhoto(animalKey: string, preferredIndex: number) {
  const candidates = getAvailableAnimalMainPhotos(animalKey);

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  return candidates[preferredIndex % candidates.length] ?? candidates[0];
}

function ReportAnimalImage({
  animalKey,
  title,
  preferredIndex,
  size = "small",
}: {
  animalKey: string;
  title: string;
  preferredIndex: number;
  size?: "hero" | "small";
}) {
  const [failed, setFailed] = useState(false);
  const photo = getReportAnimalPhoto(animalKey, preferredIndex);
  const imageClass =
    size === "hero"
      ? "h-[260px] max-h-[260px] max-w-full"
      : "h-[150px] max-h-[150px] max-w-[220px]";
  const fallbackClass =
    size === "hero" ? "h-[220px] w-full" : "h-[140px] w-[180px]";

  return (
    <div className="flex w-full justify-center overflow-visible bg-transparent">
      {photo && !failed ? (
        <img
          src={photo}
          alt={title}
          draggable={false}
          onError={() => setFailed(true)}
          className={`${imageClass} w-auto object-contain`}
        />
      ) : (
        <div
          className={`${fallbackClass} grid place-items-center border border-dashed border-[rgba(204,255,0,0.3)] px-3 text-center font-mono text-[11px] font-bold leading-5 text-[rgba(223,255,0,0.64)]`}
        >
          {assetBasename(photo, animalKey)}
        </div>
      )}
    </div>
  );
}

function ActionItem({
  label,
  item,
}: {
  label: string;
  item: BuiltResultCopy["threeDayAction"];
}) {
  return (
    <div className={DARK_PANEL_CLASS}>
      <p className="text-[13px] font-black text-[#ffff00]">{label}</p>
      <h3 className="mt-2 text-[16px] font-black leading-6 text-[#ccff00]">
        {item.title}
      </h3>
      <div className="mt-3">
        <CopyText value={item.body} tone="dark" />
      </div>
    </div>
  );
}

function InvalidReport() {
  const router = useRouter();

  return (
    <main className={PAGE_BASE_CLASS}>
      <OrganicBackdrop />
      <section className="relative z-10 mx-auto max-w-[430px] space-y-10 pt-1">
        <SiteHeader label="REPORT" onBack={() => router.push("/")} />
        <div className={DARK_PANEL_CLASS}>
          <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#ffff00]">
            REPORT
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.25] text-[#ccff00]">
            상세 리포트를 만들 결과가 없어요
          </h1>
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[rgba(204,255,0,0.72)]">
            먼저 테스트 결과를 만든 뒤 상세 리포트를 확인할 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className={`${PRIMARY_BUTTON_CLASS} mt-6`}
          >
            테스트 시작하기
          </button>
        </div>
      </section>
    </main>
  );
}

function ReportHeader({
  result,
  builtCopy,
}: {
  result: WealthResult;
  builtCopy: BuiltResultCopy;
}) {
  return (
    <header className={`${uiTokens.heroPanel} space-y-5`}>
      <div>
        <p className="text-[12px] font-black tracking-[0.14em] text-[#ffff00]">
          FULL REPORT
        </p>
        <h1 className="mt-4 text-[50px] font-black leading-[0.92] tracking-[-0.06em] text-[#ccff00]">
          {builtCopy.title}
        </h1>
      </div>

      <ReportAnimalImage
        animalKey={builtCopy.animalKey}
        title={builtCopy.title}
        preferredIndex={1}
        size="hero"
      />

      <div className="rounded-[28px] bg-[rgba(204,255,0,0.1)] p-5">
        <p className="text-[13px] font-black text-[#ffff00]">
          재물 감각 상위 {result.topPercent}%
        </p>
        <p className="mt-2 text-[18px] font-black leading-7 text-[#ccff00]">
          {builtCopy.archetype} · {builtCopy.rankText}
        </p>
      </div>
    </header>
  );
}

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawBirthDate = searchParams.get("birthDate") || "";
  const normalizedBirthDate = rawBirthDate.replace(/\D/g, "");
  const birthDate =
    normalizedBirthDate.length === 8
      ? formatBirthDate(normalizedBirthDate)
      : "";
  const birthTime = searchParams.get("birthTime") || "0";
  const genderParam = searchParams.get("gender") || "unknown";
  const calendarTypeParam = searchParams.get("calendarType") || "solar";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return <InvalidReport />;
  }

  const { year, month, day } = parseBirthDate(birthDate);
  const hour = parseBirthTime(birthTime);
  const result = calculateWealthResult({
    year,
    month,
    day,
    hour,
    birthTime,
    calendarType: calendarTypeParam === "lunar" ? "lunar" : "solar",
    gender:
      genderParam === "male" || genderParam === "female"
        ? genderParam
        : "unknown",
  });
  const builtCopy = buildResultCopy(result);
  const resultHref = `/result?${searchParams.toString()}`;
  const moneyLeakPatterns = builtCopy.repeatedPatterns.slice(0, 3);
  const missedPatterns = builtCopy.repeatedPatterns.slice(3);

  return (
    <main className={PAGE_BASE_CLASS}>
      <OrganicBackdrop />
      <section className="relative z-10 mx-auto max-w-[430px] space-y-12 pb-8">
        <SiteHeader label="REPORT" onBack={() => router.push(resultHref)} />

        <ReportHeader result={result} builtCopy={builtCopy} />

        <ReportSection label="FULL READING" title="상세 재물 성향">
          <CopyText value={builtCopy.firstImpression} />
        </ReportSection>

        <ReportSection label="GROWTH CONDITION" title="돈이 커지는 조건">
          <CopyText value={builtCopy.moneyFlow} />
        </ReportSection>

        <ReportAnimalImage
          animalKey={builtCopy.animalKey}
          title={builtCopy.title}
          preferredIndex={2}
        />

        <ReportSection label="LEAK POINT" title="돈이 새는 지점">
          <CopyText value={builtCopy.elementReading} />
          <ul className="grid gap-2">
            {moneyLeakPatterns.map((pattern) => (
              <li
                key={pattern}
                className="rounded-[20px] bg-[#000000] px-4 py-3 text-[14px] font-extrabold leading-6 text-[#ccff00]"
              >
                {pattern}
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection label="ABILITY" title="강하게 써야 할 능력">
          <CopyText value={builtCopy.advice} />
        </ReportSection>

        <ReportAnimalImage
          animalKey={builtCopy.animalKey}
          title={builtCopy.title}
          preferredIndex={3}
        />

        {missedPatterns.length > 0 ? (
          <ReportSection label="PATTERN" title="놓치기 쉬운 패턴">
            <ul className="overflow-hidden rounded-[28px] bg-[#000000] p-1 text-[#ccff00]">
              {missedPatterns.map((pattern) => (
                <li
                  key={pattern}
                  className={`border-t px-4 py-4 text-[14px] font-extrabold leading-6 text-[#ccff00] first:border-t-0 ${DARK_DIVIDER_CLASS}`}
                >
                  {pattern}
                </li>
              ))}
            </ul>
          </ReportSection>
        ) : null}

        {builtCopy.salText ? (
          <ReportSection label="SAL READING" title="신살 해석">
            <CopyText value={builtCopy.salText} />
          </ReportSection>
        ) : null}

        <ReportSection label="ACTION PLAN" title="실천 계획">
          <div className="grid gap-3">
            <ActionItem label="3일 실천" item={builtCopy.threeDayAction} />
            <ActionItem label="5일 점검" item={builtCopy.fiveDayCheck} />
            <ActionItem label="1주 실험" item={builtCopy.oneWeekExperiment} />
          </div>
        </ReportSection>

        <ReportSection label="CLOSING NOTE" title="마무리 노트">
          <CopyText value={builtCopy.closingNote} />
          <div className={DARK_PANEL_CLASS}>
            <CopyText value={builtCopy.cta} tone="dark" />
          </div>
        </ReportSection>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className={PRIMARY_BUTTON_CLASS}
          >
            다시 테스트하기
          </button>
          <button
            type="button"
            onClick={() => router.push(resultHref)}
            className={SECONDARY_BUTTON_CLASS}
          >
            무료 결과로 돌아가기
          </button>
        </div>
      </section>
      <AppVersionBadge />
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#000000] p-10 text-sm font-bold text-[rgba(223,255,0,0.56)]">
          상세 리포트를 불러오는 중입니다...
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
