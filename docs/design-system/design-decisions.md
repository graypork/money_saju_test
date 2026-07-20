# 디자인 시스템 결정 기록

> 이 문서는 Figma 범용 키트와 현재 money-saju-test 구현이 다를 때의 판단 근거를 남긴다. canonical 값은 [DESIGN.md](../../DESIGN.md)를 따른다.

## D-001 제품 서체는 Pretendard를 유지한다

- Category: Typography
- Figma: Inter Semi Bold/Regular/Medium 기반의 10–48px scale, letter spacing 0 (`7:4`).
- Code: local Pretendard variable 100–900, system fallback (`app/fonts.ts`, `app/globals.css`).
- Current usage: 모든 사용자 화면에 `--font-pretendard`가 적용된다.
- Assessment: 서로 충돌
- Recommended canonical value: Pretendard variable + 현재의 역할별 size/leading을 유지한다.
- Reason: 한국어 사주·리포트의 긴 문장과 현재 렌더링 기준이 Pretendard에 맞춰져 있다. Inter 도입은 시각적 변경이자 폰트 로딩 변경이다.
- User decision required: 아니오
- Evidence:
  - Figma node: `7:4`
  - Code paths: `app/fonts.ts`, `app/globals.css`, `app/layout.tsx`

## D-002 브랜드 포인트는 로즈 `#D98E73`을 유지한다

- Category: Colors
- Figma: `Primary/500 #4E61F6`, `Text Color/text-primary-black #131927` (`18:19`).
- Code: honey `#F3D58B`, cream `#FFF8ED`, rose `#D98E73`, ink `#000000` (`src/lib/uiTokens.ts`).
- Current usage: CTA, eyebrow, form focus, report label, page surface에 반복된다.
- Assessment: 서로 충돌
- Recommended canonical value: honey/cream/rose/ink palette를 유지한다.
- Reason: 현재 제품의 동물 이미지와 “재물 파일” 인상은 warm paper palette로 이미 구성되어 있다. 보라색 전환은 문서화 범위를 넘는 재디자인이다.
- User decision required: 아니오
- Evidence:
  - Figma node: `18:19`
  - Code paths: `src/lib/uiTokens.ts`, `app/globals.css`, `app/page.tsx`, `app/result/page.tsx`, `src/components/PaidReportSectionNavigator.tsx`

## D-003 모바일 폭은 코드의 390–430px shell을 기준으로 한다

- Category: Layout
- Figma: 공통 콘텐츠 폭 350px, reference viewport 390px; top navbar 44px (`116:2139`), card width 350px (`270:9889`).
- Code: `max-w-[430px]` 내부 shell과 16–20px page gutter를 사용한다.
- Current usage: landing, result, report의 사용자 화면 전체.
- Assessment: 코드가 현재 기준으로 보임
- Recommended canonical value: viewport 390px reference, 390–430px supported, shell max 430px, 기본 gutter 20px; report 16px는 문서 카드 밀도 예외.
- Reason: 현재 제품은 데스크톱 확장보다 모바일 리포트 독해를 우선한다. Figma 350px content width는 390px viewport에서 20px gutter와 일치하지만, 코드의 430px 상한까지 대체하지는 않는다.
- User decision required: 아니오
- Evidence:
  - Figma node: `116:2139`, `270:9889`
  - Code paths: `AGENTS.md`, `app/page.tsx`, `app/result/page.tsx`, `app/report/page.tsx`

## D-004 radius는 동일 수치로 통합하지 않고 의미별 현행 값을 보존한다

- Category: Radius / Components
- Figma: xs 8px, sm 12px, xl 24px (`18:19`, `57:892`, `270:9889`).
- Code: pill, 접힘 20px/확장 28px report card, 22px report block, 28–30px panel/header, 36px hero panel.
- Current usage: 입력, CTA, hero, 결과 패널, 유료 리포트에서 역할에 따라 반복된다.
- Assessment: 서로 충돌
- Recommended canonical value: `pill`, `report-card 20px collapsed / 28px expanded`, `report-block 22px`, `panel 28px`, `hero 36px`를 의미 토큰으로 기록한다.
- Reason: 현재의 큰 반경은 문서 UI의 soft paper hierarchy를 구성한다. Figma 8/12/24px로의 강제 통일은 현재 UI를 리디자인하는 결과가 된다.
- User decision required: 아니오
- Evidence:
  - Figma node: `57:892`, `270:9889`, `18:19`
  - Code paths: `src/lib/uiTokens.ts`, `src/components/BirthForm.tsx`, `src/components/PaidReportSectionNavigator.tsx`

## D-005 버튼은 현행 pill 문법과 56px minimum action을 유지한다

- Category: Button
- Figma: Filled/Outline/Clear, 56/48/40/32/24px, Default/Hover/Focus/Press/Disabled. 직접 재확인은 Figma 도구 호출 한도로 확인 불가.
- Code: primary/secondary full-pill, `min-h-14` (56px), rose filled/cream outlined, press translate.
- Current usage: landing CTA, BirthForm submit, result/report action.
- Assessment: 코드가 현재 기준으로 보임
- Recommended canonical value: full-width primary/secondary action은 min 56px, full pill, filled/outlined 두 종류를 canonical으로 둔다.
- Reason: Figma size tier 중 56px은 일치하지만, 보라색·12px radius·Clear style은 현 제품에서 근거가 없다.
- User decision required: 아니오
- Evidence:
  - Figma node: `32:2` (재확인 불가)
  - Code paths: `src/lib/uiTokens.ts`, `app/result/page.tsx`, `app/report/page.tsx`, `src/components/BirthForm.tsx`

## D-006 Figma 입력 상태 체계는 참고 인벤토리로 유지한다

- Category: Input / States
- Figma: Filled/Outline, Large/Medium, Default/Filled/Hover/Focus/Disabled/Success/Info/Warning/Error; 1.5px border; 350px component width (`57:892`).
- Code: BirthForm은 full-pill input/option button, rose focus ring, inline error를 사용한다.
- Current usage: 생년월일, 시간, 성별, 달력 유형, 테스트 코드 입력.
- Assessment: 코드가 현재 기준으로 보임
- Recommended canonical value: 현재의 form control 외형과 focus/error 표현을 기록하고, 성공·정보·경고 상태는 미채택으로 둔다.
- Reason: 상태가 실제 비즈니스 요구와 연결되지 않았으며 Figma의 모든 상태를 구현할 이유가 없다.
- User decision required: 아니오
- Evidence:
  - Figma node: `57:892`
  - Code paths: `src/components/BirthForm.tsx`

## D-007 그림자는 Figma 수치가 아닌 코드의 soft black elevation을 사용한다

- Category: Elevation
- Figma: 100–800 ramp, ink-tinted multi-shadow (`118:1723`).
- Code: `rgba(0,0,0,.06–.18)`의 1–2 layer shadow; hero는 `0 22px 50px rgba(0,0,0,.12)`.
- Current usage: header, card, hero, CTA와 landing deck.
- Assessment: 서로 충돌
- Recommended canonical value: surface, action, hero 세 단계의 현재 soft black shadow를 기록한다.
- Reason: 현재 warm paper surface에서 Figma의 blue-black elevation을 그대로 적용하면 palette와 톤이 어긋난다.
- User decision required: 아니오
- Evidence:
  - Figma node: `118:1723`
  - Code paths: `src/lib/uiTokens.ts`, `app/page.tsx`, `src/components/PaidReportSectionNavigator.tsx`

## D-008 상단 navbar만 역할상 참고하고 bottom navbar/tab은 미채택으로 둔다

- Category: Navigation
- Figma: Top navbar 390px wide, 44px high, 16px center title (`116:2139`); bottom navbar and tab values are 직접 재확인 불가.
- Code: result/report의 back + brand + route label header, landing의 독립 brand header.
- Current usage: 내부 화면의 route orientation.
- Assessment: 부분 일치
- Recommended canonical value: 내부 header의 터치 영역과 정보 위계를 문서화하되, Figma navbar를 컴포넌트 계약으로 채택하지 않는다.
- Reason: 제품은 multi-tab 앱이 아니라 단일 진단/리포트 흐름이며 bottom navigation 요구가 없다.
- User decision required: 아니오
- Evidence:
  - Figma node: `116:2139`, `116:1271` (후자는 재확인 불가), `247:7995` (재확인 불가)
  - Code paths: `app/result/page.tsx`, `app/report/page.tsx`, `app/page.tsx`

## D-009 Apple 문서는 포맷만 참고한다

- Category: Documentation
- Figma: 해당 없음
- Code: `docs/design-system/source/DESIGN-apple.md`가 포맷 참고 자료로 존재한다.
- Current usage: 이번 문서의 YAML + 설명형 두 부분 구조.
- Assessment: 코드가 현재 기준으로 보임
- Recommended canonical value: Apple의 색, SF Pro, 버튼, 반경, 레이아웃 및 브랜드 원칙은 채택하지 않고 문서 구조만 사용한다.
- Reason: 제품의 실제 identity와 구현 근거가 Apple 분석과 다르다.
- User decision required: 아니오
- Evidence:
  - Figma node: 해당 없음
  - Code paths: `docs/design-system/source/DESIGN-apple.md`, `DESIGN.md`
