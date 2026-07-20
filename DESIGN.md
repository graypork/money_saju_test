---
version: "1.0.0"
name: "money-saju-test design system"
description: "390–430px 모바일 사주 재물 진단과 긴 한국어 리포트 독해를 위한 현행 구현 기반 디자인 시스템"
sourceOfTruth:
  priority:
    - "사용자 요구"
    - "프로젝트 AGENTS.md"
    - "현재 프로덕션 코드의 반복 규칙"
    - "명시적으로 채택된 Figma 규칙"
    - "범용 Figma UI 키트"
    - "Apple DESIGN.md 포맷 참고"
  code: "src/lib/uiTokens.ts, app/globals.css, app/, src/components/"
  figma: "ClTewrvnMMIDRCBC4ZOkCo (참고 원본; 전체 채택 아님)"
viewport:
  reference: "390px"
  supported: "390–430px"
  content-max: "430px"
  page-gutter: "20px"
  report-page-gutter: "16px"
colors:
  surface-page: "#FBF5E7"
  surface-paper: "#EFE9DB"
  surface-paper-translucent: "rgba(239,233,219,0.86)"
  action-primary: "#222222"
  text-primary: "#202020"
  text-secondary: "#746F67"
  text-on-dark: "#FFF9ED"
  accent-blue: "#BACCEC"
  accent-pink: "#F6BBDD"
  accent-yellow: "#F6DA6E"
  accent-sage: "#A2AE6E"
  border-rule: "#DDD6C8"
typography:
  family: "Pretendard Variable, Pretendard, system-ui, sans-serif"
  hero: "clamp(46px, 11vw, 52px) / 0.95 / 700 / -0.06em"
  section-title: "38px / 1.04–1.15 / 700 / negative tracking"
  panel-title: "24–28px / 1.15–1.25 / 700"
  report-lead: "21px / 1.45 / 700 / -0.035em"
  body: "15–16px / 1.66–1.9 / 600"
  label: "11–13px / 600 / 0.08–0.14em"
spacing:
  page-gutter: "20px"
  section-rule-top: "48px"
  panel-padding: "20–24px"
  action-horizontal: "20–22px"
  report-card-padding: "16px"
  report-block-padding: "16–20px"
sizing:
  primary-action-min-height: "56px"
  picker-option-height: "48px"
  internal-header-reference: "44px"
  animal-card-reference-width: "350px"
rounded:
  action: "9999px"
  report-card: "20px"
  report-card-expanded: "28px"
  report-block: "22px"
  panel: "28px"
  hero-panel: "36px"
borders:
  default: "1px solid {colors.border-rule}"
  accent-focus: "#222222 with rgba(32,32,32,0.16) ring"
elevation:
  surface: "0 10–16px 22–36px rgba(0,0,0,0.06–0.09)"
  action: "0 12–14px 24–28px rgba(0,0,0,0.12–0.14)"
  hero: "0 22px 50px rgba(0,0,0,0.12)"
motion:
  press: "translateY(2px); some compact controls use scale(.9)"
  landing-deck: "300ms snap / 380ms exit / ease-out"
  report-layout: "380ms / cubic-bezier(0.22,1,0.36,1)"
  reduced-motion: "report layout duration 0 and auto scroll"
components:
  page-shell:
    background: "{colors.surface-page}"
    maxWidth: "{viewport.content-max}"
    paddingInline: "{viewport.page-gutter}"
  primary-action:
    background: "{colors.action-primary}"
    textColor: "{colors.text-on-dark}"
    minHeight: "{sizing.primary-action-min-height}"
    rounded: "{rounded.action}"
  secondary-action:
    background: "{colors.surface-paper}"
    textColor: "{colors.text-primary}"
    border: "{borders.default}"
    rounded: "{rounded.action}"
  paper-panel:
    background: "{colors.surface-paper}"
    border: "{borders.default}"
    rounded: "{rounded.panel}"
    elevation: "{elevation.surface}"
  report-section-card:
    background: "{colors.surface-paper}; core judgment may use {colors.accent-blue}"
    border: "{borders.default}"
    rounded: "{rounded.report-card} collapsed / {rounded.report-card-expanded} expanded"
  report-reading-block:
    use: "table or independent state information only; ordinary paragraph/list stays on the expanded section card surface"
  weekly-plan:
    default: "focus + three numbered actions"
    detail: "seven-day plan as inline progressive disclosure"
    scrolling: "page scroll; no internal scroll"
---

# money-saju-test 디자인 시스템

## Overview

money-saju-test는 모바일에서 생년 정보로 재물 유형을 확인하고, 동물 이미지와 긴 한국어 해석 리포트를 읽는 경험이다. 디자인 시스템의 목적은 화려한 범용 앱 UI를 추가하는 것이 아니라, **밝은 page canvas 위의 차분한 문서 표면·다크 행동색·명확한 한국어 독해 계층**을 일관되게 유지하는 것이다.

## Source of Truth

우선순위는 사용자 요구, 프로젝트 `AGENTS.md`, 현재 반복 구현, 명시적으로 채택된 Figma 규칙, 범용 Figma UI 키트, Apple 문서 포맷 순이다. Figma `ClTewrvnMMIDRCBC4ZOkCo`는 비교 근거이고, Inter·보라색 Primary·모든 generic component를 자동 채택하는 원본이 아니다. 상세 근거는 [Figma inventory](docs/design-system/figma-inventory.md), [code inventory](docs/design-system/code-inventory.md), [decision log](docs/design-system/design-decisions.md)를 본다.

## Design Principles

- **문서 우선:** 카드·rule·eyebrow는 장식이 아니라 결과를 읽는 순서를 보여준다.
- **한 화면, 한 행동:** CTA는 현재 단계의 다음 행동을 명확히 한다.
- **강조는 대비로:** 본문은 `text-secondary`, 핵심 판정·제목은 `text-primary`를 쓴다. pink/yellow/sage는 badge·번호·작은 강조에만 쓴다.
- **동물은 정보 앵커:** 이미지와 동물 이름은 유형을 기억시키지만 본문 독해보다 우선하지 않는다.
- **모바일 독해 보호:** 390px에서 긴 한글 텍스트와 터치가 깨지지 않아야 한다.

## Colors

| Token | Value | Use |
| --- | --- | --- |
| `{colors.surface-page}` | `#FBF5E7` | 전체 page canvas |
| `{colors.surface-paper}` | `#EFE9DB` | 일반 panel, card, input, sheet |
| `{colors.action-primary}` | `#222222` | primary CTA background |
| `{colors.text-on-dark}` | `#FFF9ED` | dark primary action text |
| `{colors.text-primary}` | `#202020` | heading, body, icon |
| `{colors.text-secondary}` | `#746F67` | paragraph, helper, placeholder |
| `{colors.accent-blue}` | `#BACCEC` | 핵심 정보 표면만 사용 |
| `{colors.accent-pink}` / `{colors.accent-yellow}` / `{colors.accent-sage}` | `#F6BBDD` / `#F6DA6E` / `#A2AE6E` | badge, 번호, 작은 강조 |
| `{colors.border-rule}` | `#DDD6C8` | divider, list/table border |

Figma의 `#4E61F6` Primary와 `#131927` text token은 현재 canonical 색이 아니다. 실제 error/success/info/warning 상태가 필요할 때만 Figma semantic ramp를 별도 결정으로 검토한다.

## Typography

전역 서체는 local Pretendard Variable이다. display와 body를 다른 family로 나누지 않는다. 대신 크기·leading·tracking을 역할에 맞게 사용한다.

- Hero: 46–52px, bold, dense leading. 랜딩의 단 하나의 핵심 질문에만 쓴다.
- Section title: 38px, bold, negative tracking. 페이지의 큰 구조 전환에 쓴다.
- Panel title: 24–28px, bold. 결과와 리포트의 local heading에 쓴다.
- Report lead: 21px, 1.45 line height. 확장 리포트의 첫 문단에 쓴다.
- Body: 15–16px, 1.66–1.9 line height. 긴 한국어 문단은 이 범위를 유지한다.
- Label: 11–13px, semibold, positive tracking. section eyebrow와 metadata에만 쓴다.

## Spacing and Sizing

- 기본 page gutter는 20px이며, 유료 report는 카드 밀도를 위해 16px을 쓴다.
- user-facing page content는 `max-w-[430px]` 안에 둔다.
- section rule 뒤의 기본 상단 여백은 48px이다.
- primary/secondary action의 최소 높이는 56px이다. 44px 미만의 시각 버튼은 실제 터치 hit area를 별도로 보장해야 한다.
- Figma의 350px card width는 390px reference viewport에서의 component reference이며, 모든 프로젝트 card의 고정 폭 계약은 아니다.

## Radius, Borders, and Elevation

| Role | Canonical |
| --- | --- |
| action/input/segmented control | `{rounded.action}` |
| report section card | `{rounded.report-card}` collapsed / `{rounded.report-card-expanded}` expanded |
| report reading/list/table block | `{rounded.report-block}` |
| header/ordinary panel | `{rounded.panel}` |
| result hero panel | `{rounded.hero-panel}` |

기본 border는 `{borders.default}`다. elevation은 카드가 surface에서 분리되어야 할 때만 사용하고, hero가 가장 크다. Figma의 8단계 shadow ramp는 현재 구현에 직접 적용하지 않는다.

## Layout

### Landing hero

랜딩은 브랜드 header, 핵심 질문, 설명 deck, 동물 미리보기, 생년 정보 form 순이다. hero의 질문과 CTA는 첫 read에서 이해되어야 하며, deck과 동물 카드는 보조 맥락이다.

### Birth form

BirthForm은 텍스트 날짜 입력, 양력/음력 선택, 시간 picker, 성별, 선택 테스트 코드, submit action으로 구성한다. picker sheet는 mobile overlay이며 430px max width를 넘지 않는다. control은 paper surface와 rose focus cue를 쓴다.

### Result summary

결과는 paper hero panel을 중심으로 유형, rank/summary, animal image, 오행·수익 흐름·강점/주의, 상세 리포트 preview 순으로 읽힌다. 결과를 설명하는 카드와 CTA의 위계를 섞지 않는다.

### Paid report

Paid report는 overview와 12개 section card를 가진다. 확장 section card가 primary reading surface이며, 일반 paragraph, highlight, list는 별도 card 없이 소제목·문서 행·divider·왼쪽 선으로 위계를 만든다. section 안의 nested reading surface는 table 또는 독립 상태 정보처럼 필요한 경우 한 개로 제한한다. 이번 주 맞춤 플랜은 초점과 번호 행동 3개를 기본으로 보이고, 7일 계획은 같은 card 안에서 progressive disclosure로 연다. 페이지 스크롤을 유지하고 internal scroll을 만들지 않는다.

## Components

| Component | Canonical behavior / appearance |
| --- | --- |
| Primary action | `{components.primary-action}`. 현재 단계의 한 가지 주 행동에 사용하며 dark surface와 `{colors.text-on-dark}`를 쓴다. |
| Secondary action | `{components.secondary-action}`. 되돌리기·재시작 등 보조 행동에 사용한다. |
| Paper panel | `{components.paper-panel}`. hero, form/panel grouping에 사용한다. |
| Internal header | back control + `MONEY SAJU` + route label. 44px Figma top nav는 터치/수직 리듬 참고값이다. |
| Birth control | pill input/option + dark focus ring. Figma generic validation states는 미채택이다. |
| Animal image frame | 9개 animal asset 후보와 fallback file name. subject를 가리지 않는 `object-contain` 중심 처리다. |
| Element balance | 수치와 오행 이름을 같은 card rhythm 안에서 보여주는 result summary block이다. |
| Report section card | `{components.report-section-card}`. mosaic index와 expanded reading state를 가진다. |
| Report reading block | table 또는 독립 상태 정보에만 `{rounded.report-block}`을 쓴다. 일반 paragraph/highlight/list는 expanded card의 문서형 읽기 surface를 공유한다. |
| Weekly plan | 초점, 번호 행동 3개, 44px 이상 disclosure, 월–일 문서 행으로 구성한다. 상세 7일 계획은 같은 section card 안에서만 연다. |
| Locked/unlock CTA | 현재 result/report의 entry action에만 존재하는 흐름 표현이다. 결제·unlock business rule을 새로 정의하지 않는다. |

## Interaction and Motion

- Button/control press는 짧은 `translateY(2px)` 또는 제한된 scale feedback을 사용한다.
- Landing explanation deck은 300ms snap, 380ms exit를 사용한다.
- Report layout transition은 380ms와 `cubic-bezier(0.22,1,0.36,1)`을 사용한다.
- Report는 `prefers-reduced-motion: reduce`에서 layout duration을 0으로 하고 scroll을 auto로 바꾼다. 새 motion은 동일한 접근성 원칙을 따라야 한다.
- Motion은 읽기·스크롤·touch target을 방해하지 않아야 한다.

## Imagery and Animal Assets

`src/lib/animalAssets.ts`는 fox, ox, squirrel, hawk, tiger, rabbit, deer, swan, otter의 main photo candidates, thumbnail, paw mark, accent color를 관리한다. 랜딩은 `next/image`, result/report는 native image fallback을 사용한다. 새 asset 처리 시에는 기존 path, candidate fallback, alt text를 재사용하고, animal accent가 global primary color를 대체하지 않도록 한다.

## Content Presentation

- paragraph는 줄바꿈 단위로 읽기 문단을 나눈다.
- 리포트 lead는 하나의 결론을 먼저 보여주고, supporting paragraph는 body token을 쓴다.
- highlight stage는 `문제 → 손실 → 해법`의 label과 본문을 분리한다.
- list는 행동 항목을 한 줄씩 분리하고, table은 mobile에서 label/value card로 읽힌다.
- 강조를 굵기만으로 남용하지 않는다. title, lead, label, body 역할의 차이를 유지한다.

## Accessibility

- HTML button, input, list, table, dialog semantics를 유지한다.
- focus-visible과 dark focus ring은 interactive control에서 사라지지 않아야 한다.
- action은 가급적 44px 이상의 실제 터치 영역을 보장한다. 현재 일부 back control과 small utility control은 별도 검토 대상이다.
- 동물 이미지는 유형명을 설명하는 alt를 사용하고, fallback은 누락 asset을 식별 가능하게 남긴다.
- motion은 reduced-motion preference를 존중한다.

## Responsive Behavior

이 프로젝트는 mobile-only다. 390px을 기준으로 검증하고 430px까지 support한다. 데스크톱 multi-column을 새 standard로 추가하지 않는다. 표는 mobile에서는 row별 `dl` card로 변환되고, larger breakpoint에서만 conventional table을 보인다.

## Implementation Mapping

| System responsibility | Current implementation |
| --- | --- |
| global canvas/font | `app/globals.css`, `app/fonts.ts`, `app/layout.tsx` |
| shared visual token strings | `src/lib/uiTokens.ts` |
| landing/hero/deck | `app/page.tsx` |
| input controls/picker | `src/components/BirthForm.tsx` |
| result summary | `app/result/page.tsx` |
| paid report/navigation/reading blocks | `app/report/page.tsx`, `src/components/PaidReportSectionNavigator.tsx` |
| animal image metadata | `src/lib/animalAssets.ts` |
| version badge | `src/components/AppVersionBadge.tsx` |

## Do and Don’t

**Do**

- UI 작업 전 이 문서와 `src/lib/uiTokens.ts`를 읽고 기존 역할 토큰을 먼저 찾는다.
- 현재 palette와 Pretendard에 맞춰 새 UI를 구성한다.
- Figma 값과 코드가 다를 때 decision log에 근거를 남기고 사용자에게 보고한다.
- 긴 report copy는 readable line height와 semantic block을 유지한다.

**Don’t**

- Figma에 있다는 이유만으로 Inter, 보라색 Primary, bottom navbar, generic Alert/Avatar/Pagination을 도입하지 않는다.
- Apple 참고 문서의 SF Pro, blue accent, layout, radius를 시각 기준으로 복사하지 않는다.
- 새로운 raw HEX, radius, shadow를 반복 토큰 검토 없이 여러 화면에 흩뿌리지 않는다.
- report copy, section order, 계산/결제/unlock 동작을 디자인 작업 명목으로 변경하지 않는다.

## Exceptions

- landing hero display와 result hero panel은 일반 card보다 큰 type/radius/elevation을 쓴다.
- report는 16px gutter와 20px 접힌 card / 28px 확장 card를 쓴다. 22px nested reading block은 table 또는 독립 상태 정보에만 예외적으로 쓴다.
- animal별 accent color는 asset metadata이며, product-wide interaction accent가 아니다.
- version badge는 운영/QA 정보를 위한 fixed overlay다.

## Known Gaps

- shared token이 있어도 raw Tailwind color/radius/shadow가 여러 페이지에 남아 있다.
- result/report header와 button class는 유사하지만 단일 공통 component로 완전히 추출되지 않았다.
- Figma Button, Navbar Bottom, Tab은 이번 조사에서 도구 호출 한도로 직접 재확인하지 못했다.
- 일부 small control의 실제 hit area와 landing deck의 reduced-motion coverage는 후속 UI 감사에서 확인할 필요가 있다.
- 유료 리포트 데이터에는 문장/소제목 결합이 남아 있는 항목이 있어, 콘텐츠 가독성 정규화 작업의 후속 보완이 필요하다.

## Iteration Guide

1. 새 UI 작업 전 `DESIGN.md`, 관련 decision, `uiTokens.ts`, 대상 component를 읽는다.
2. 기존 component/token으로 표현 가능한지 확인한다.
3. Figma·코드·문서가 충돌하면 임의 채택하지 말고 사용자에게 값과 영향 범위를 보고한다.
4. 변경 후 390px에서 실제 터치·overflow·motion·긴 한국어 copy를 확인한다.
5. 새로운 반복 규칙이 생기면 code inventory와 canonical YAML을 함께 갱신한다.
