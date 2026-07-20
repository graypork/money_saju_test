# Paid Report Semantic Rows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the six repeated mobile report-table presentations with semantic document rows and make section 8’s existing situation-to-loss-to-cause data visibly sequential.

**Architecture:** Keep every paid-report block and its data contract unchanged. `PaidReportSectionNavigator.tsx` will select a report-local mobile renderer by `section.id`, while the existing desktop table and generic mobile-table fallback remain intact for unrecognised table blocks. Section 8’s existing `highlight` text is parsed only for display into an ordered flow; the original strings remain the source of truth.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Node test runner, in-app browser.

## Global Constraints

- Target only the 390–430px mobile report reading surface.
- Preserve all 12 section IDs, order, titles, user copy, paid-report data, block types, and type definitions.
- Preserve mosaic placement, collapsed-card sizing, expansion/collapse motion, page scrolling, payment/unlock, and existing color/font tokens.
- Do not edit `src/content/resultCopy/paidReports/*.ts`, `paidReportTypes.ts`, `paidReportBank.ts`, or `paidReportWeeklyPlans.ts`.
- Use semantic `<dl>` for name/value data and `<ol>` for ordered or causal data; do not create div-based imitation tables.
- No packages, commit, or push.

---

### Task 1: Protect the approved mobile renderer contract

**Files:**
- Modify: `tests/ui/palette-contract.test.mjs`

**Interfaces:**
- Consumes: source text from `src/components/PaidReportSectionNavigator.tsx`.
- Produces: a source-level regression test requiring the seven approved mobile render markers while retaining the generic `data-report-mobile-table` fallback marker.

- [ ] **Step 1: Write the failing test**

```js
test("유료 리포트 모바일 행은 정보 성격별 renderer를 사용한다", async () => {
  const navigator = await readFile(
    new URL("../../src/components/PaidReportSectionNavigator.tsx", import.meta.url),
    "utf8"
  );

  for (const marker of [
    "MetricRows",
    "StepTimeline",
    "MappingRows",
    "SituationFlow",
    "PatternShiftRows",
    "AvoidInsteadRows",
    'data-report-mobile-format="metrics"',
    'data-report-mobile-format="steps"',
    'data-report-mobile-format="mapping"',
    'data-report-mobile-format="expansion"',
    'data-report-mobile-format="pattern-shift"',
    'data-report-mobile-format="avoid-instead"',
    'data-report-situation-flow="true"',
  ]) {
    assert.equal(navigator.includes(marker), true, `missing ${marker}`);
  }
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test --test-name-pattern='유료 리포트 모바일 행은 정보 성격별 renderer를 사용한다' tests/ui/palette-contract.test.mjs`

Expected: fail because the named renderers and data attributes do not exist.

### Task 2: Render the approved information structures without changing report data

**Files:**
- Modify: `src/components/PaidReportSectionNavigator.tsx`

**Interfaces:**
- Consumes: `section.id`, existing `PaidReportBlock` table rows, and existing section-8 highlight text.
- Produces: `MetricRows`, `StepTimeline`, `MappingRows`, `SituationFlow`, `PatternShiftRows`, and `AvoidInsteadRows`, selected by `ReportBlock` through a `sectionId` prop.

- [ ] **Step 1: Add renderer selection and semantic renderers**

```tsx
function ReportTable({ sectionId, block }: { sectionId: string; block: PaidReportTableBlock }) {
  switch (sectionId) {
    case "section-3": return <MetricRows block={block} />;
    case "section-5": return <StepTimeline block={block} />;
    case "section-6": return <MappingRows block={block} variant="mapping" />;
    case "section-7": return <MappingRows block={block} variant="expansion" />;
    case "section-9": return <PatternShiftRows block={block} />;
    case "section-10": return <AvoidInsteadRows block={block} />;
    default: return <GenericMobileTable block={block} />;
  }
}
```

Use `<dl>` for section 3 and section 6/7 paired values. Use `<ol>` for section 5 stages and section 8/9/10 causal sequences. Keep the existing `sm:block` desktop table branch and the existing `data-report-mobile-table` fallback unchanged.

- [ ] **Step 2: Parse only valid section-8 flows**

```tsx
function parseSituationFlow(text: string) {
  const parts = readingParagraphs(text);
  const labels = ["반복되는 상황", "손실", "원인"] as const;
  const indices = labels.map((label) => parts.indexOf(label));
  if (indices.some((index) => index < 1)) return null;
  return {
    summary: parts.slice(0, indices[0]).join(" "),
    stages: labels.map((label, index) => ({
      label,
      text: parts.slice(indices[index] + 1, indices[index + 1] ?? parts.length).join(" "),
    })),
  };
}
```

Render the parsed result only for section 8’s `문제 N` highlights. When parsing fails, retain the existing highlight renderer.

- [ ] **Step 3: Pass the section ID into each block render**

```tsx
<ReportBlock
  key={`${section.id}-block-${index}`}
  sectionId={section.id}
  block={block}
  isLead={index === 0}
/>
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test --test-name-pattern='유료 리포트 모바일 행은 정보 성격별 renderer를 사용한다' tests/ui/palette-contract.test.mjs`

Expected: pass.

### Task 3: Verify the approved mobile reading flow and non-regression boundaries

**Files:**
- Inspect: `src/components/PaidReportSectionNavigator.tsx`
- Inspect: `tests/ui/palette-contract.test.mjs`

**Interfaces:**
- Consumes: completed renderer changes and unchanged paid-report data.
- Produces: fresh type, lint, UI-test, build, diff, and 390px/430px evidence.

- [ ] **Step 1: Run static verification**

Run: `npx eslint src/components/PaidReportSectionNavigator.tsx && npx tsc --noEmit && npm run lint && npm run test:ui && npm run build && git diff --check`

Expected: every command exits 0.

- [ ] **Step 2: Inspect 390px and 430px in the in-app browser**

Open one report type and expand sections 3, 5, 6, 7, 8, 9, 10. Confirm no horizontal overflow, no overlap, readable dividers, unchanged card expansion, and working weekly-plan disclosure.

- [ ] **Step 3: Check scope before handoff**

Run: `git diff --name-only && git diff --stat`

Expected: only the navigator, the UI contract test, and this implementation-plan document are changed by this task; preserve all pre-existing user changes and do not commit or push.
