# Paid Report Visual Format Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make seven mobile paid-report sections visibly distinct according to their information structure, without changing the paid-report data.

**Architecture:** Keep the existing `ReportTable` section selection, desktop `<table>`, report block types, and section-8 parser. Replace only the mobile bodies of the seven selected renderers with a metric scale, vertical timeline, document list, continuous roadmap, causal flow, pattern shift, and warning/alternative composition. Each renderer stays report-local in `PaidReportSectionNavigator.tsx` and consumes the existing `headers` and `rows` unchanged.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Node test runner, in-app browser.

## Global Constraints

- Target only the 390–430px mobile report reading surface.
- Preserve all 12 section IDs, order, titles, user copy, paid-report data, block types, and type definitions.
- Preserve mosaic placement, collapsed-card sizing, expansion/collapse motion, page scrolling, payment/unlock, the Warm Beige palette, and Pretendard.
- Keep the existing desktop `<table>` branch unchanged.
- Do not edit `src/content/resultCopy/paidReports/*.ts`, `paidReportTypes.ts`, `paidReportBank.ts`, or `paidReportWeeklyPlans.ts`.
- Do not add packages, commit, or push.

---

### Task 1: Lock the distinct mobile-format contract before implementation

**Files:**
- Modify: `tests/ui/palette-contract.test.mjs`

**Interfaces:**
- Consumes: source text from `src/components/PaidReportSectionNavigator.tsx`.
- Produces: a source-level contract requiring the seven content-specific visual structures and preventing the former shared mapping/pattern row skeleton from being the only mobile output.

- [ ] **Step 1: Write the failing test**

```js
test("유료 리포트 모바일 renderer는 정보 성격별 시각 구조를 제공한다", async () => {
  const source = await readFile(
    new URL("../../src/components/PaidReportSectionNavigator.tsx", import.meta.url),
    "utf8"
  );

  for (const marker of [
    "MetricScale",
    "GrowthTimeline",
    "TalentNarrativeList",
    "ExpansionRoadmap",
    "SituationFlow",
    "PatternShift",
    "AvoidanceAlternatives",
    'data-report-mobile-format="metric-scale"',
    'data-report-mobile-format="growth-timeline"',
    'data-report-mobile-format="talent-list"',
    'data-report-mobile-format="expansion-roadmap"',
    'data-report-mobile-format="pattern-shift"',
    'data-report-mobile-format="avoid-alternatives"',
    'data-report-situation-flow="true"',
  ]) {
    assert.equal(source.includes(marker), true, `missing ${marker}`);
  }
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test --test-name-pattern='유료 리포트 모바일 renderer는 정보 성격별 시각 구조를 제공한다' tests/ui/palette-contract.test.mjs`

Expected: FAIL because the new renderer names and visual-format markers do not exist.

### Task 2: Replace repeated row skeletons with content-specific mobile compositions

**Files:**
- Modify: `src/components/PaidReportSectionNavigator.tsx`

**Interfaces:**
- Consumes: existing `PaidReportTableBlock.headers`, `PaidReportTableBlock.rows`, and parsed section-8 `SituationFlowData`.
- Produces: `MetricScale`, `GrowthTimeline`, `TalentNarrativeList`, `ExpansionRoadmap`, `SituationFlow`, `PatternShift`, and `AvoidanceAlternatives` selected by `ReportTable` or `ReportBlock`.

- [ ] **Step 1: Make section 3 a text-supported five-step scale**

```tsx
<div data-report-mobile-format="metric-scale">
  <dt>{row[0]}</dt>
  <dd>{row[1]}</dd>
  <span aria-hidden="true" className="grid grid-cols-5">...</span>
</div>
```

Map only the existing qualitative values to 1–5 visual steps; render the original value string beside the scale so the bar never carries meaning alone.

- [ ] **Step 2: Make sections 5–7 three distinct reading structures**

```tsx
// section 5: one vertical spine, numbered milestones, title + goal + action
<ol data-report-mobile-format="growth-timeline">...</ol>

// section 6: number + talent title + prose application, no two-column mapping
<ol data-report-mobile-format="talent-list">...</ol>

// section 7: a continuous source-to-expansion path with connected nodes
<ol data-report-mobile-format="expansion-roadmap">...</ol>
```

Preserve every row order and string. Do not add independent nested cards or a second column.

- [ ] **Step 3: Make sections 8–10 express causality, change, and choice**

```tsx
// section 8: label and copy joined by visible downward directional connectors
<section data-report-situation-flow="true">...</section>

// section 9: strength anchor, then problem to solution as one directional shift
<ol data-report-mobile-format="pattern-shift">...</ol>

// section 10: warning statement + reason, then a separate labelled alternative emphasis
<ol data-report-mobile-format="avoid-alternatives">...</ol>
```

Use text labels plus rules/connectors; no color-only meaning and no fabricated after-state copy.

- [ ] **Step 4: Select the new mobile renderers while preserving desktop tables**

```tsx
if (sectionId === "section-3") mobileTable = <MetricScale block={block} />;
else if (sectionId === "section-5") mobileTable = <GrowthTimeline block={block} />;
else if (sectionId === "section-6") mobileTable = <TalentNarrativeList block={block} />;
else if (sectionId === "section-7") mobileTable = <ExpansionRoadmap block={block} />;
else if (sectionId === "section-9") mobileTable = <PatternShift block={block} />;
else if (sectionId === "section-10") mobileTable = <AvoidanceAlternatives block={block} />;
```

- [ ] **Step 5: Run the focused test and verify it passes**

Run: `node --test --test-name-pattern='유료 리포트 모바일 renderer는 정보 성격별 시각 구조를 제공한다' tests/ui/palette-contract.test.mjs`

Expected: PASS.

### Task 3: Verify visual rhythm and non-regression boundaries

**Files:**
- Inspect: `src/components/PaidReportSectionNavigator.tsx`
- Inspect: `tests/ui/palette-contract.test.mjs`

**Interfaces:**
- Consumes: completed mobile visual renderer changes and unchanged paid-report data.
- Produces: fresh source, browser, type, test, build, and diff evidence.

- [ ] **Step 1: Run the required commands**

Run: `npx eslint src/components/PaidReportSectionNavigator.tsx`, `npx tsc --noEmit`, `npm run test:ui`, `npm run build`, `git diff --check`.

Expected: report actual command outcomes; do not repair unrelated existing lint errors.

- [ ] **Step 2: Verify the report in the in-app browser**

At 390px and 430px, expand sections 3, 5, 6, 7, 8, 9, and 10. Confirm their visual markers differ, no horizontal overflow or overlap occurs, the section grid still expands/collapses, the weekly-plan disclosure still opens and closes, and desktop table markup remains present above the `sm` breakpoint.

- [ ] **Step 3: Check change scope**

Run: `git status --short`, `git diff --name-only`, and `git diff --stat`.

Expected: preserve pre-existing `rabbit.ts` and runtime-directory changes; do not commit or push.
