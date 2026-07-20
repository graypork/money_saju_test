# UI Audit — money-saju-test

> 감사 일자: 2026-07-17 · 범위: 현행 로컬 구현의 읽기 전용 UI/UX 감사 · 코드 변경 없음

## 1. Executive Summary

현재 화면은 허니 캔버스와 크림 문서 표면, Pretendard의 굵은 한글 제목으로 `가벼운 테스트 → 개인화된 문서형 리포트`라는 정체성을 일관되게 만들고 있다. 390–430px에서 가로 오버플로는 발견되지 않았고, BirthForm의 시간 선택 sheet와 유료 리포트 카드 확장은 모바일 크기에서 동작한다.

다만 신뢰와 독해를 해치는 P1 세 가지가 있다. 첫째, 로즈 CTA의 크림 텍스트 대비가 약 **2.47:1**로 낮다. 둘째, 결과 동물 이미지가 SSR과 클라이언트에서 각각 무작위로 고르게 되어 hydration mismatch가 실제 발생한다. 셋째, “상세/유료 리포트”로 읽히는 흐름에 결제·잠금·구매 후 상태가 없어 가치 교환을 평가하거나 신뢰 있게 안내할 화면이 없다.

권장 범위는 **Polish Scope B: 읽기 흐름과 신뢰를 함께 정비**다. 새 스타일을 더하는 작업보다 색 대비, 동물 이미지 결정성, 터치/접근성, 리포트 읽기 구조와 유료 전환 상태를 차례로 정리하는 편이 현재 제품 정체성을 가장 잘 보존한다.

| Severity | Count |
| --- | ---: |
| P0 | 0 |
| P1 | 3 |
| P2 | 6 |
| P3 | 3 |

## 2. Audit Scope and Limitations

### 확인한 화면과 뷰포트

| Screen | 390×844 | 414×896 | 430×932 | 확인 내용 |
| --- | --- | --- | --- | --- |
| Landing | 확인 | - | 확인 | header, hero, 설명 카드 덱, 동물 카드, BirthForm 진입, fixed badge, overflow |
| BirthForm | 확인 | - | - | 라벨/그룹, 시간 picker, `admin22`, 터치/포커스, 오류 구조 코드 점검 |
| Result | 확인 | - | - | 핵심 판정, 동물 이미지, 근거, 상세 리포트 bridge, CTA |
| Paid report | 확인 | 확인 | - | 12개 mosaic, 카드 확장, 긴 본문, 다음 분석, fixed badge, overflow |
| Payment / unlock | 코드 점검만 | - | - | 실제 결제·잠금·구매 완료 UI가 현행에 없음 |

- 테스트 경로에는 `testCaseCode=admin22`를 사용했고, 실제 결제와 Google Sheets 로그는 실행하지 않았다.
- Playwright에서 390/414/430px 모두 `scrollWidth - viewportWidth = 0`이었다.
- 카드 확장 뒤 유료 리포트는 페이지 스크롤로 읽히며, 내부 이중 스크롤은 확인되지 않았다.
- 전체 9개 동물 결과와 모든 오류/결제 완료 상태, 실제 결제 제공자 흐름은 실행하지 못했다. 코드와 대표 황소형 경로를 근거로 판단했다.
- Figma는 기존 inventory의 확인 값만 사용했다. Button, bottom navigation, tab은 기존 문서처럼 **Unverified** 상태다.

## 3. Product-Level Findings

| ID | Severity | Finding | Risk | Scope | Recommended direction |
| --- | --- | --- | --- | --- | --- |
| F-01 | P1 | 핵심 CTA 대비가 낮아 행동 유도와 접근성이 함께 약해진다. | High | Global | 로즈를 유지한다면 CTA text/background 조합을 WCAG AA 수준으로 재정의한다. |
| F-02 | P1 | 결과 동물 이미지가 로드 중 바뀌어 개인화된 결과의 신뢰를 해친다. | High | Shared | 결과별 이미지 선택을 결정적으로 만들고, 클라이언트 전용 변화는 hydration 뒤에 명시적으로 처리한다. |
| F-03 | P1 | paid report의 가치·잠금·구매 후 상태가 없어 전환 구조를 검증할 수 없다. | High | Global | 결제 도입 전에도 locked preview, 가격/포함 항목, 해제 후 상태를 하나의 흐름으로 명세한다. |
| F-04 | P2 | 작은 보조 컨트롤과 고정 badge가 모바일 읽기 흐름의 여백을 잠식한다. | Medium | Shared | 최소 터치 영역과 fixed 요소의 제품용 노출 기준을 통일한다. |
| F-05 | P2 | 긴 리포트는 카드 확장 자체는 자연스럽지만, 재진입·진행감·블록 리듬이 약해 피로가 누적된다. | Medium | Shared | 긴 카드의 읽기 구간과 다음 분석 진입을 더 명확한 정보 단위로 재구성한다. |
| F-06 | P2 | `FREE PREVIEW`와 상세 리포트의 관계는 보이지만, 왜 지금 열어야 하는지와 무엇이 잠겨 있는지가 약하다. | Medium | Global | 결과 bridge에서 무료/상세의 경계와 얻는 효용을 한 문장·한 목록으로 고정한다. |

## 4. Screen-by-Screen Findings

| ID | Severity | Screen | Evidence / files | DESIGN.md rule | Risk | Scope | Figma reference | Recommended direction — no code change |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | P1 | Landing, BirthForm, Result, Report | `src/lib/uiTokens.ts:13`, `app/result/page.tsx:21`, `app/report/page.tsx:17`; `#FFF8ED` on `#D98E73` = about 2.47:1 | colors.text-on-accent, primary-action | High | Global | Color variables `18:19` (warm palette itself not Figma canonical) | Filled CTA의 foreground/background pair를 다시 정한다. 로즈를 text/outline/eyebrow로 남기고, filled action에는 더 진한 표면 또는 검정 text를 검토한다. |
| F-02 | P1 | Result, animal images | 실제 콘솔 hydration mismatch: `ox-1.webp` vs `ox-3.webp`; `app/result/page.tsx:269`, `src/lib/animalAssets.ts:178-188` | 동물은 정보 앵커 | High | Shared | 없음 | 한 결과에는 한 이미지가 일관되게 유지되도록 선택 근거를 고정한다. 이미지 변주는 결과 신뢰보다 앞서면 안 된다. |
| F-03 | P1 | Payment / unlock | `app/result/page.tsx:428-429`가 상세 리포트로 직접 연결; `app/report/page.tsx`에 결제/lock 상태 없음 | 한 화면, 한 행동 | High | Global | Unverified — Button / payment component 없음 | 구매가 제품 범위라면 free preview → locked value → checkout → unlocked report의 상태 계약을 먼저 결정한다. 현재는 “유료”라는 말만 있고 유료 경험은 없다. |
| F-04 | P2 | Landing 설명 카드 | 390px에서 접근성 트리에 동일한 “다음 설명 카드 보기” 버튼 3개가 노출되고 2개는 x<0; `app/page.tsx:491-495` | 모바일 독해 보호, reduced/intentional motion | Medium | Shared | 없음 | 비가시 덱 카드의 버튼은 접근성 트리/탭 순서에서 제외하고, 보이는 다음 행동 하나만 노출한다. |
| F-05 | P2 | Landing 설명 카드, Result/Report header | 설명 카드 화살표 20×32px, 뒤로 가기 32×32px; `app/page.tsx:493`, `app/result/page.tsx:40`, `app/report/page.tsx:36` | sizing.internal-header-reference 44px | Medium | Shared | Top navbar 44px `116:2139` | 시각 아이콘은 작게 유지하되 실제 hit area는 44×44px 이상으로 맞춘다. |
| F-06 | P2 | All screens | `AppVersionBadge`가 bottom 16/right 16 fixed; 390px에서 y=786, 414px에서 y=838; `src/components/AppVersionBadge.tsx:13` | 모바일 독해 보호 | Medium | Global | 없음 | 제품 화면에서 노출할 필요가 없으면 debug-only로 분리하고, 유지한다면 bottom CTA/OS safe area와 충돌하지 않는 계약을 둔다. |
| F-07 | P2 | Paid report | “막히는 지점” 확장 뒤 한 card가 약 1,988px, 전체 page 3,905px가 됨; `src/components/PaidReportSectionNavigator.tsx:707-742` | report-card 20/28, report-block 22, body 15–16 | Medium | Shared | Card `270:9889` (generic reference) | 한 카드 안의 긴 본문을 문제/손실/해법 같은 청크로 더 선명하게 시작·종료시키고, 현재 분석 위치와 다음 분석의 연결을 강화한다. 내부 스크롤을 추가하는 것은 권장하지 않는다. |
| F-08 | P2 | Paid report reading | `ox.ts:338`, `tiger.ts:348`, `rabbit.ts:338`, `deer.ts:330`, `otter.ts:338` 등에 인용문 뒤 공백 없이 다음 문장이 이어짐; renderer는 line split에 의존 (`PaidReportSectionNavigator.tsx:116-160`) | 긴 한국어 리포트 독해 | Medium | Local | 없음 | 콘텐츠 데이터의 문장/인용부호/줄바꿈을 편집 기준으로 정규화한다. 카드 레이아웃을 바꾸기 전에 텍스트 자체의 호흡을 고친다. |
| F-09 | P2 | Result → report bridge | Result에 `FREE PREVIEW`, “상세 리포트에서 이어서 확인할 분석”, direct CTA가 함께 있으나 가격·잠금 이유·신뢰 근거 없음; `app/result/page.tsx:319-429` | 한 화면, 한 행동 / 강조는 대비로 | Medium | Global | Button Unverified | bridge를 ‘다음 화면 링크’가 아니라 ‘무료에서 멈춘 질문과 상세에서 얻는 답’의 짧은 계약으로 정돈한다. F-03의 결제 상태 결정 뒤에 작업한다. |
| F-10 | P3 | Landing | Hero 46px / 43.7px은 개성이 있으나 390px에서 3행으로 매우 조밀하고, 이후 38px section title이 연속해 정보 피로가 생긴다; `app/page.tsx:643`, `src/lib/uiTokens.ts:40` | hero / section-title scale | Low | Shared | Typography `7:4`는 참조용 Inter scale | hero만 강하게 두고 이후 section heading의 크기·weight 차이를 더 분명히 한다. 새로운 폰트가 아니라 역할별 대비의 문제다. |
| F-11 | P3 | BirthForm | 라벨, fieldset/legend, 420px modal, body scroll lock은 잘 구성됨; `BirthForm.tsx:240-271`, `600-680`. 다만 test code는 일반 사용자 흐름에 노출된다. | form / mobile reading | Low | Local | Input `57:892` (semantic state reference) | 테스트 코드의 공개 목적을 결정한다. 운영 도구라면 일반 전환 흐름과 시각적으로 분리하거나 개발 환경으로 한정한다. |
| F-12 | P3 | Motion | 설명 카드에는 pointer/drag와 300/380ms transition, report는 380ms layout transition 및 reduced-motion 대응; `app/page.tsx`, `PaidReportSectionNavigator.tsx` | motion | Low | Shared | Motion Unverified | 모션 방향은 제품에 맞다. 단, F-04 해결 뒤 덱의 ‘다음’ 신호를 하나로 줄여 독해를 방해하지 않게 한다. |

### 긍정적으로 유지할 사항

- 390/414/430px에서 페이지와 카드 그리드의 수평 오버플로가 없었다.
- BirthForm은 날짜 label, 날짜 기준/성별 `fieldset`, 시간 picker의 dialog/initial focus/body scroll lock을 갖춘다. 390px에서 time sheet는 390×420px로 잘린 영역 없이 열렸다.
- 결과 화면은 ‘핵심 판정 → 판정 근거 → 상세에서 이어지는 분석’ 순서가 명확하고, free result를 단순 점수판으로 두지 않은 방향이 좋다.
- paid report는 12개 분석의 mosaic에서 한 카드만 길게 펴지고 내부 스크롤을 만들지 않는다. 이는 모바일 긴 글 읽기에는 적절한 기본 선택이다.

## 5. Design-System Findings

1. **색 토큰은 브랜드에는 맞지만 역할 대비 계약이 불완전하다.** 허니/크림/로즈/검정 조합 자체는 유지할 가치가 있다. 문제는 `accent-primary`를 CTA 표면과 작은 label 모두에 재사용하면서, CTA text contrast가 무너진 점이다.
2. **타이포그래피는 서체보다 weight 역할이 부족하다.** Pretendard 유지가 맞다. 다만 body 15–16px을 넓게 정의하면서 semibold가 반복되므로, 긴 리포트의 기본 문단과 강조 문단을 구분할 수 있는 weight 규칙이 필요하다.
3. **radius는 의미 토큰이 있으나 soft surface가 연속될 때 정보 위계가 흐려진다.** 20/22/28px의 report 규칙은 유지할 수 있다. 대신 card, reading block, next-analysis surface가 동시에 강조되지 않도록 표면 수를 줄이는 원칙을 추가해야 한다.
4. **44px header reference가 계약으로 작동하지 않는다.** 문서는 44px을 기록하지만 실제 back button은 32px이다. 시각 크기와 hit area를 분리해 명세해야 한다.
5. **페이지 gutter의 예외는 합리적이나 기록 방식이 더 명확해야 한다.** landing/result 20px, report 16px은 목적이 다르다. 이는 예외가 아니라 “reading density mode”로 이름 붙이는 편이 재사용에 안전하다.
6. **Figma의 범용 kit는 자동 source of truth가 아니다.** 현재 Figma는 Inter/blue primary 기반으로, 채택 근거가 있는 값만 참조해야 한다. Button/bottom navigation/tab은 Unverified 상태를 유지한다.

## 6. DESIGN.md Review

| DESIGN.md rule | Status | Audit conclusion |
| --- | --- | --- |
| honey `#F3D58B` | Keep | 브랜드 캔버스와 동물/문서 인상에 잘 맞는다. |
| cream `#FFF8ED` | Keep | 본문 표면과 입력 sheet의 가독성을 지지한다. |
| rose `#D98E73` | Revise | brand accent로는 유지하되 filled CTA surface의 역할은 재검토한다. |
| black text `#000000` | Keep | 제목과 핵심 정보의 명료한 대비를 만든다. |
| primary 56px full pill | Keep | 주 행동의 터치성과 단계 구분에는 적절하다. 모든 보조 행동으로 확장하지는 않는다. |
| cream CTA text | Revise | 로즈 위 조합이 약 2.47:1이므로 canonical foreground가 될 수 없다. |
| report radius 20 / 28 / 22 | Clarify | 수치는 유지 가능하나 collapsed/expanded/reading-block 표면이 동시에 경쟁하지 않는 사용 규칙이 필요하다. |
| body 15–16px | Clarify | 크기는 맞지만 UI body와 long-form reading body의 weight/line-length를 분리해야 한다. |
| body line height 1.66–1.9 | Keep | 긴 한글 독해에는 유효하다. 다만 1.9는 reading body에, 짧은 안내에는 더 짧은 leading을 권장한다. |
| 390px reference, max 430px | Keep | 세 검증 뷰포트 모두 수평 오버플로 없이 동작했다. |
| Pretendard Variable | Keep | 한국어 결과·리포트의 현행 제품 정체성과 읽기성에 맞다. |

## 7. Prioritized Backlog

| Priority | Finding | Smallest sensible scope | Dependency |
| --- | --- | --- | --- |
| P1 | F-01 CTA contrast | primary action foreground/surface token과 전 화면 사용처를 함께 교정 | DESIGN.md color decision |
| P1 | F-02 animal hydration | 결과 이미지 선택을 deterministic하게 만들고 대표 동물 결과 회귀 검증 | asset-selection decision |
| P1 | F-03 paid state absence | paid report의 잠금/가치/해제/완료 상태 명세 승인 | 제품·결제 정책 결정 |
| P2 | F-04, F-05 touch/a11y | 덱의 offscreen control 제거 및 44px hit-area 계약 | shared component audit |
| P2 | F-08 content rhythm | 9개 리포트 데이터의 quote/line-break lint 기준과 고침 | content ownership |
| P2 | F-07 report reading | 확장 card의 section progress, paragraph grouping, next-analysis cue polish | F-08 content cleanup |
| P2 | F-06, F-09 bridge | free preview와 paid value 경계를 결제 명세에 맞춰 재작성 | F-03 |
| P2 | F-06 fixed badge | 운영/개발 노출 정책 및 safe-area rule | product decision |
| P3 | F-10 type rhythm | hero/section/panel의 weight and size role tuning | contrast tokens |
| P3 | F-11 test code | 일반 사용자와 운영자 경로 분리 정책 | product decision |

## 8. Recommended Polish Scope A/B/C

| Scope | Includes | Excludes | Recommendation |
| --- | --- | --- | --- |
| A — Foundation | CTA contrast, deterministic animal image, 44px touch areas, offscreen a11y, fixed badge policy | report content/paid-state redesign | 빠른 안정화가 필요할 때 |
| B — Reading & trust | Scope A + paid value/lock state, free-to-paid bridge, report content rhythm, paragraph/quote cleanup, typography roles | 새 visual identity, 새 feature set | **Recommended** |
| C — Visual reframe | Scope B + palette/radius/layout signature 전면 재설계 | - | 현재 정체성을 버릴 이유가 확인될 때만 |

Scope B는 기존 허니·크림·Pretendard 정체성을 유지하면서 고객이 결과를 믿고 계속 읽게 만드는 범위다. Scope C는 현재 감사에서 필요성이 확인되지 않았다.

## 9. Suggested Implementation Order

1. **Foundations:** CTA contrast, semantic color states, 44px hit-area, fixed badge/safe-area policy를 확정한다.
2. **Shared components:** primary/secondary action, back control, explanation deck control, surface/radius usage를 정리한다.
3. **Landing:** hero 이후 heading rhythm과 설명 카드 덱의 단일 다음 행동을 다듬는다.
4. **Input:** BirthForm의 일반 사용자/테스트 코드 경계를 결정하고 picker의 현재 접근성 계약을 회귀 검증한다.
5. **Result:** 동물 이미지 선택을 결정화하고, 핵심 판정·근거·상세 bridge의 신뢰 흐름을 유지한다.
6. **Paid report:** content line break 정규화 후 expanded card의 읽기 청크, 진행감, 다음 분석 연결을 polish한다.
7. **Payment / unlock:** 가격/포함 항목/locked preview/구매/해제 후 상태를 구현 가능한 하나의 state flow로 만든다.
8. **Motion / a11y:** deck와 expansion의 focus, reduced-motion, 키보드 순서, touch target을 검증한다.
9. **Responsive:** 390/414/430px과 long-content/card expansion을 다시 점검한다.

## 10. User Decisions Required

1. **상세 리포트의 실제 상태:** 지금의 direct report를 임시 미리보기로 둘지, 유료 잠금/결제/해제 흐름을 이번 polish 범위에 포함할지 결정이 필요하다.
2. **로즈 CTA의 브랜드 역할:** `#D98E73`을 filled primary surface로 계속 쓸지, 강조 텍스트/outline 중심으로 돌리고 별도 accessible primary surface를 둘지 결정이 필요하다.
3. **버전 badge와 테스트 코드의 운영 노출:** 최종 사용자 화면에 남길 제품 정보인지, 개발/관리용 UI인지 결정이 필요하다.

## Verification Record

- 새 production code, CSS, React component, asset, Figma file, package는 변경하지 않았다.
- 이 감사 작업에서 수정한 파일은 본 문서 `docs/design-system/ui-audit.md` 하나다.
- 실제 결제와 Google Sheets 기록은 실행하지 않았다.
- `npm run build`는 이 읽기 전용 감사의 지시사항에 따라 실행하지 않았다.
- 커밋과 push는 수행하지 않았다.
