# UI/UX Redesign Decision Brief

> Baseline: current repository source validated on 2026-07-15.
> Scope of this document: a redesign decision only. It does not change application code, styles, packages, business rules, or report copy.

## 1. Audit validation summary

The existing audit is directionally reliable. The relevant landing, input, result, report, form, token, and navigator sources all predate the audit document, so there is no evidence that a subsequent UI implementation has invalidated its main observations.

| Audit finding | Validation status | Current-source evidence / limit |
| --- | --- | --- |
| The journey is landing → query-based result → query-based report, with `/input` redirecting home. | **Confirmed** | `app/input/page.tsx` redirects to `/`; the birth form pushes result query parameters and the result links to `/report`. |
| The landing form sits after the hero, explanatory card deck, and animal introduction. | **Confirmed** | The landing composition renders those sections before `BirthForm`. |
| The explanatory card deck relies on pointer gestures without an equivalent visible control. | **Confirmed** | The deck handles pointer down/move/up/cancel; its cards disable pointer events and no alternate source-level control was found. |
| Randomly selected animal cards can change after initial render. | **Partially confirmed** | It initially renders three cards, then replaces them on the next animation frame. Code supports possible visual movement; its perceived severity needs runtime verification. |
| The birth form has weak label/group semantics and a picker sheet without explicit dialog semantics. | **Confirmed** | Labels are not associated with control ids; no fieldset/legend, dialog role, aria-modal, focus management, or keyboard-sheet handler was found. |
| The free result has repeated forward actions. | **Confirmed** | It exposes a hero `상세 보기`, a later `상세 리포트 확인하기`, and restart actions. Whether this confuses users requires runtime or usability evidence. |
| The free-result presentation duplicates paid-preview structure/data. | **Confirmed** | The result page owns a hard-coded locked list while animal data also contains paid sections; the current page does not consume that paid-section data. This is a presentation consistency risk, not a mandate to refactor content logic. |
| Current paid-report entry does not represent an actual purchase/unlock state. | **Confirmed, narrowly** | The current user-facing report route renders a sample report directly. No payment, checkout, purchase, or unlock UI state was found in the current route flow. This does not make a claim about services or future backend work outside that flow. |
| The report route always renders the Swan sample, not the result animal. | **Confirmed** | `app/report/page.tsx` imports `samplePaidReport` and includes a temporary UI-validation comment explicitly deferring animal-key connection. |
| The paid report is a 12-section, two-column expandable mosaic with no current reading location/progress state. | **Confirmed** | `samplePaidReport` has 12 section ids; `PaidReportView` uses `grid-cols-2`; no active-section, progress, or location control is present. |
| The report overview arrow suggests an action even though the current route supplies none. | **Confirmed** | The overview only invokes an optional callback; `/report` does not pass one. |
| Form and report accessibility are uniformly poor. | **No longer accurate as a blanket statement** | The form/picker issues are real, but report cards are buttons with `aria-expanded`, visible focus treatment, and reduced-motion handling. The audit should distinguish the two. |
| Token, gutter, radius, shadow, and color usage varies between pages. | **Confirmed** | Landing/result/report use different direct values and overlapping token layers; gutters and card geometry vary. |
| The current interface feels generically AI-generated or insufficiently dossier-like. | **Design judgment, not a factual defect** | The finding is useful as an art-direction hypothesis. It should guide review, not be treated as a measurable source defect. |
| Missing animal thumbnails or document marks visibly break the product. | **Unsupported by current evidence** | Asset helpers describe thumbnail/stamp paths, but current user pages do not render them; the asset folder contains the animal images, not those referenced marks. |
| The fixed version badge overlaps content. | **Requires runtime verification** | Its fixed placement is confirmed in source; actual collision depends on viewport and live layout. |
| The small result back target fails a specific physical size requirement. | **Requires runtime verification** | Source uses `h-8 w-8`; the practical target size and browser rendering should be checked before making a compliance claim. |

## 2. Confirmed highest-priority problems

1. **The paid-report boundary is not legible as a product state.** The current report route is explicitly a Swan sample for structural validation, while the free result presents paid-report invitations. A redesign must make the preview/entry/read boundary truthful without changing payment or unlock behavior.
2. **The landing’s primary action is visually and physically distant from its input task.** The page spends considerable vertical space on explanatory and animal content before the form, which weakens the “start now” hierarchy on a 390–430px screen.
3. **The free-result page offers the next step more than once.** It needs one dominant continuation point, with the rest of the page supporting confidence in that choice rather than competing with it.
4. **The report mixes an overview/mosaic model with a long-form reading job.** Twelve dense two-column cards make scanning possible, but do not currently establish where a reader is or how to continue through a paid report.
5. **The landing deck and form picker have source-level interaction/accessibility gaps.** These are concrete interaction-quality issues, independent of aesthetic preference.

These are presentation and interaction priorities. They do not authorize changes to saju calculations, scoring, animal mapping, generated copy, query contracts, local storage, logging, payment, unlock behavior, or `admin22` handling.

## 3. Rejected findings or findings that need evidence

| Finding | Decision | Why |
| --- | --- | --- |
| Missing thumbnail/stamp assets are a live visual defect. | Reject for current scope | The paths exist in helpers but are not rendered by the current user flow. |
| Every report interaction needs accessibility repair. | Narrow the finding | The report already has meaningful button, expansion, focus, and reduced-motion behavior. Preserve those strengths. |
| Users are definitely abandoning the form, mistrusting the report, or suffering performance problems. | Needs analytics/usability/runtime evidence | Source inspection cannot establish behavior or conversion. |
| The version badge definitely covers a control. | Needs 390px runtime verification | Fixed positioning alone is insufficient proof of a collision. |
| The visual language is objectively generic. | Treat as a design judgment | It can inform an art direction, but should not be presented as a fact or used to justify broad replacement. |

## 4. Approach comparison

| Approach | What changes | Expected benefit | Risk / compatibility | Fit for the current product |
| --- | --- | --- | --- | --- |
| **A. Consistency only** | Normalize surface tokens, spacing, buttons, and a few accessibility details while preserving page hierarchy. | Cleaner visual coherence; lowest implementation cost. | Low risk; high compatibility. | Insufficient by itself: it leaves the landing distance, duplicated result CTAs, and report-reading ambiguity intact. |
| **B. Flow and hierarchy redesign** | Keep routes, calculation logic, result identity, and core visual assets; clarify start, free-result continuation, paid-entry boundary, and report reading hierarchy. Include a small token/interaction cleanup where it supports the flow. | High user-facing gain without rewriting the product model. | Medium risk; can be staged and regression-tested against current contracts. | **Recommended.** It addresses the confirmed priorities and preserves the product’s existing character. |
| **C. Full presentation consolidation** | Rebuild the visual system and consolidate page/presentation architecture across landing, result, and report. | Highest theoretical consistency. | Highest risk; can obscure current temporary sample/report constraints and invites unrelated refactoring. | Not recommended merely for cleanup. Consider only after Approach B is validated and still proves inadequate. |

## 5. Recommended approach

**Selected approach: B — flow and hierarchy redesign, with a constrained consistency pass.**

It is the smallest direction that resolves the issues users can actually encounter: finding the start point, understanding the free-result next step, recognizing what is preview versus paid/report reading, and moving through a long report. It deliberately does not replace the existing warm dossier identity, animal system, routes, or computation/content contracts.

Approach A is too cosmetic to solve the confirmed journey problems. Approach C is disproportionate while the report route is still intentionally rendering a sample and the paid-entry/unlock UI state is not represented in the present route flow.

## 6. Recommended scope

Included, subject to the decisions below:

- A narrow shared presentation foundation: page gutters, surface hierarchy, button roles, focus treatment, and only the tokens needed to make the route flow coherent.
- Landing prioritization: one unmistakable start action and a shorter path to the birth form, while retaining the explanatory deck and animal discovery content.
- Input refinement: semantically grouped fields and an accessible picker-sheet interaction, preserving all current values, query parameters, test-case behavior, and validation intent.
- Free-result hierarchy: retain the result, percentage, animal identity, element cues, and existing copy; reduce competing next actions to one clear continuation hierarchy.
- Paid-entry presentation: make preview, entry, and report-reading states legible without inventing a purchase system or changing current payment/unlock logic.
- Report-reading structure: add orientation and a coherent scan-to-read transition while retaining section order, existing paid content, expandable behavior, focus handling, and reduced-motion support.

Excluded:

- Saju, scoring, animal mapping, generated result meaning, report copy, logging, payment, unlock, query parameter, localStorage, and `admin22` changes.
- A new package, route architecture, database/schema, checkout implementation, or report-content rewrite.
- A full visual rebrand or broad component refactor.

## 7. Page-by-page target experience

### Landing

**Job:** establish why this test is worth taking, then let a visitor start immediately.

**Current tension:** the form comes after substantial explanation and animal content; the header start link is small; the card deck is gesture-led.

**Target:** present a concise, document-like promise and one dominant start action in the first viewport. The form should be reachable immediately through that action, while the card deck and animal introduction become confidence-building discovery rather than a gate before starting. Give the deck an understandable, non-gesture-only way to progress or inspect it.

**Preserve:** warm hero palette, animal imagery, the underlying explanatory and animal content, and the current form route/query behavior.

### Input

**Job:** collect birth information with calm confidence.

**Current tension:** source labels and groups do not communicate strong relationships to assistive technology; the picker is visually sheet-like but not explicitly managed as a dialog.

**Target:** make date, time, calendar type, and gender read like a concise issued-information form: clear grouping, visible current selection, predictable opening/closing, and keyboard/focus behavior appropriate to the existing mobile sheet model.

**Preserve:** every field, value option, validation behavior, query parameter, `testCaseCode` behavior, and the `admin22` exclusion downstream.

### Free result

**Job:** deliver the first meaningful answer and earn the next action.

**Current tension:** repeated detail/report CTAs compete, while the locked preview and existing result structure do not clearly communicate a single continuation path.

**Target:** establish an evidence order: result identity → short explanation/meaning → selected preview of what comes next → one dominant continuation. Secondary restart/navigation actions stay available but visually subordinate.

**Preserve:** result percentage, animal and elemental identity, generated copy, existing result query use, logging/session behavior, and current paid-preview information.

### Paid-report entry

**Job:** honestly signal the transition from free insight to fuller reading.

**Current tension:** the current route directly shows a temporary Swan sample and has no user-facing purchase/unlock state. A design must not imply that a completed payment or animal-specific report exists when current logic does not provide it.

**Target:** create a clearly named preview/entry boundary that can consume the product’s existing approved unlock state once present, without inventing one now. The visual emphasis should explain what deeper reading contains and what state the user is in.

**Preserve:** the current query contract, locked-preview semantics, paid-copy source, and all payment/unlock behavior. Do not connect the sample report to animal mapping as part of this redesign decision.

### Report reading

**Job:** support both quick orientation and immersive reading.

**Current tension:** twelve sections are visually available as an expandable two-column grid, but readers do not have a location/progress model; the overview arrow is inert in the current route.

**Target:** retain a concise section index while giving the reader an explicit transition into a readable section sequence or focused reading state. Show meaningful stage/location information only where it helps orientation; any overview action must either work or not be presented as an action.

**Preserve:** section order, section content, current expansion intent, accessible button semantics, visible focus behavior, and reduced-motion treatment.

## 8. Identity review: what to preserve and what to tighten

### Core identity to preserve

- The **private dossier / personal file** metaphor: information should feel issued for one person, not like a generic fortune-feed card.
- The warm **cream, honey, deep ink, and terracotta/orange** family.
- Animal imagery as a recognizable result identity, used with restraint and a clear relationship to the reported type.
- A **premium but approachable** tone: editorial confidence without luxury-brand distance or occult cliché.
- Document references such as label strips, stamps, dividers, case/index signals, when they convey real stage, identity, or navigation information.

### Elements that are currently generic or disconnected

- Repeated rounded cards, pills, shadows, and surface treatments can make unrelated content feel equivalently important.
- The random animal-card swap has weak narrative linkage to the visitor’s own result and can read as decorative motion rather than useful discovery.
- Some document-like labels behave as ornamental framing rather than conveying current stage, section identity, or a meaningful action.
- A visible fixed “UI flow update” badge is a QA/development signal, not part of the customer-facing dossier metaphor unless it has a deliberate release-note purpose.

### Direction for the redesign

Use one identifiable signature instead of adding more decoration: a restrained **file spine / issued-reading index** that becomes useful across entry and report-reading states. Keep the animal, paper warmth, and terracotta emphasis as recognition cues; simplify surface variations so the document metaphor carries hierarchy rather than competing ornament.

## 9. Explicit preserve list

The redesign must preserve all of the following unless a later, separately approved task says otherwise:

- Routes: `/`, `/input`, `/result`, `/report`, and their current query contracts.
- All saju calculations, scoring, animal selection/mapping, result generation, and report-copy meaning.
- Existing logging, session/local storage, payment/unlock behavior, and `admin22` exclusion behavior.
- Existing animal imagery and the warm honey/cream/rose identity family.
- Current free-result information: percentage, animal, elemental cues, generated explanatory copy, and locked-preview intent.
- Existing paid-report content, section sequence, and current expandable-section intent.
- Existing report accessibility strengths: button semantics, `aria-expanded`, focus-visible styling, and reduced-motion behavior.
- Existing `testCaseCode` handling and input values/validation intent.

## 10. High-level implementation stages

This is a sequencing guide, not an implementation plan. No files, components, or logic are authorized to change until the open decisions are approved.

1. **Foundation and guardrails** — establish the constrained presentation rules and regression checklist for routes, queries, stored state, `admin22`, and report interaction. Low visual risk; prerequisite for consistent changes.
2. **Landing and input** — clarify the start path and form/picker interaction without changing submitted data or result navigation. Medium UX gain; independent of final report-reading mode.
3. **Free result and paid entry** — establish one continuation hierarchy and an honest preview/entry state while retaining current route and unlock contracts. Medium dependency on the paid-entry emphasis decision.
4. **Report orientation and reading** — apply the approved reading mode, retaining all report sections/content and current interaction strengths. Medium-to-higher presentation risk; depends on the report-reading decision.
5. **Regression and live-layout verification** — check mobile 390px behavior, query preservation, test/admin exclusions, reduced motion, focus behavior, current temporary sample constraints, and source-level accessibility improvements. This stage validates rather than expands scope.

## 11. Open user decisions

### Decision 1 — Which redesign scope should be approved?

**Exact question:** 이번 UI/UX 작업 범위를 어느 수준으로 승인할까요?

| Option | Concrete scope | Recommendation | Effect | Does it block later work? |
| --- | --- | --- | --- | --- |
| A. Consistency only | Tokens, spacing, component surfaces, and selected interaction/accessibility polish; existing page hierarchy remains. | Not recommended | Lowest risk, but leaves the main journey issues unresolved. | **Yes.** It determines the entire scope. |
| B. Flow and hierarchy redesign | Keep routes, logic, result identity, and assets; improve landing start, input clarity, result continuation, paid-entry boundary, and report orientation. | **Recommended** | Resolves the confirmed issues with staged, controlled change. | **Yes.** It authorizes the direction for later design and implementation planning. |
| C. Full presentation consolidation | Broad redesign/system consolidation across all presentation layers. | Not recommended now | Highest cost and compatibility risk while the paid-report route is intentionally a sample. | **Yes.** It materially changes the project scale. |

### Decision 2 — How should report reading work after the section overview?

**Exact question:** 유료 리포트에서 12개 섹션을 읽는 방식을 어떻게 정할까요?

| Option | Concrete behavior | Recommendation | Effect | Does it block later work? |
| --- | --- | --- | --- | --- |
| Keep the two-column mosaic | Preserve the current card grid; improve labels and spacing only. | Not recommended | Lowest change, but limited reading orientation. | No for foundation; **yes for report stage**. |
| Hybrid index + focused reading | Keep a compact section index, then enter a clear focused/linear reading state with location cues. | **Recommended** | Balances scanning with long-form reading and fits the dossier metaphor. | No for foundation; **yes for report stage**. |
| Fully linear report | Remove the mosaic as the primary model and present all sections in one reading sequence. | Consider only if reading depth matters more than scanning | Simplest reading narrative, but changes the current discovery behavior most. | No for foundation; **yes for report stage**. |

### Decision 3 — What should happen to publicly visible test/QA code affordance?

**Exact question:** 현재 입력 화면의 테스트 코드 성격을 사용자에게 어떻게 보여줄까요?

| Option | Concrete behavior | Recommendation | Effect | Does it block later work? |
| --- | --- | --- | --- | --- |
| Keep as currently exposed | Keep its present public affordance. | Not recommended for the customer-facing hierarchy | Lowest behavior risk, but can weaken confidence. | No for foundation; **yes for input polish**. |
| Contextual QA access | Preserve the exact contract, but visually subordinate it to a contextual QA/test entry. | **Recommended** | Retains operational access while protecting the primary form flow. | No for foundation; **yes for input polish**. |
| Hide from the production surface | Remove the visible entry while retaining only an approved alternate operational path. | Requires separate product approval | Strongest customer focus, but may affect workflow expectations. | **Yes.** It can alter operational access expectations. |

### Decision 4 — What should the paid-entry message emphasize?

**Exact question:** 무료 결과에서 상세 리포트로 넘어갈 때, 어떤 가치를 가장 앞에 둘까요?

| Option | Concrete behavior | Recommendation | Effect | Does it block later work? |
| --- | --- | --- | --- | --- |
| Feature list | Lead with the chapters/items users will receive. | Viable | Clear utility, but can feel transactional. | No for foundation; **yes for paid-entry stage**. |
| Trust and reading state | Lead with what is previewed, what is available now, and what the deeper reading adds; feature list supports it. | **Recommended** | Best matches the current temporary/sample constraint and reduces misleading implication. | No for foundation; **yes for paid-entry stage**. |
| Urgency/offer | Lead with scarcity, promotion, or immediate purchase pressure. | Not recommended | Conflicts with the premium, approachable dossier direction and risks overpromising. | No for foundation; **yes for paid-entry stage**. |

---

**Decision record (2026-07-16):**

- Decision 1: **B. Flow and hierarchy redesign** selected.
- Decision 2: **Keep the two-column mosaic** selected for report reading.
- Decision 3: **Contextual QA access** selected; retain the exact test-code contract while making the entry secondary.
- Decision 4: **Trust and reading state** selected for the free-result to detailed-report transition.
- Visual refinement within B: keep the honey/cream/rose surfaces and existing animal assets; replace brown-family text/ink usage with black; establish text emphasis through black opacity, size, and weight rather than brown text colors.

No application code is authorized by this decision record alone. The approved design specification and implementation plan remain required before interface changes.
