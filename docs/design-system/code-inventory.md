# 코드 디자인 시스템 인벤토리

> 조사 기준: 2026-07-17의 현재 working tree. 값은 실제 프로덕션 경로의 Tailwind class, CSS, TypeScript 토큰을 기준으로 기록한다.

## 기술·스타일 기반

| 항목 | 실제 구현 | 근거 |
| --- | --- | --- |
| Framework | Next.js `16.2.4`, React `19.2.4` | `package.json` |
| Styling | Tailwind CSS 4 (`@tailwindcss/postcss`) + arbitrary values | `package.json`, `app/globals.css`, JSX class |
| Font | local Pretendard variable, 100–900, `display: swap` | `app/fonts.ts` |
| Font stack | Pretendard → system-ui → sans-serif | `app/globals.css` |
| Base canvas | `#F3D58B`, foreground `#000000` | `app/globals.css` |
| Target viewport | mobile 390–430px, content max 430px | `AGENTS.md`, page shells |

## 색상과 surface

| 디자인 역할 | 실제 값 | 선언 파일 | 사용 파일 / 반복성 | Figma 대응 |
| --- | --- | --- | --- | --- |
| page surface | `#F3D58B` honey | `palette`, `globals.css` | 랜딩·결과·리포트 반복 | 충돌: Figma Grey 50/White |
| paper surface | `#FFF8ED` cream | `palette` | panel, input, card, picker 반복 | 충돌: Figma White |
| primary accent | `#D98E73` rose | `palette` | CTA, eyebrow, focus/border 반복 | 충돌: Figma Primary 500 |
| soft accent | `#E7C5B8` | `palette` | eyebrow/highlight background 반복 | 코드 기준 |
| ink | `#000000` | `palette`, page JSX | title, action, body base 반복 | 충돌: Figma `#131927` |
| body text | `rgba(0,0,0,0.72)` | `palette`, JSX | 설명·리포트 body 반복 | 코드 기준 |
| muted text | `rgba(0,0,0,0.48)` | `palette`, JSX | metadata·placeholder 반복 | 코드 기준 |
| rule/border | `rgba(0,0,0,0.14)` | `palette`, JSX | section divider, list/table border 반복 | 역할 일치, 값 다름 |
| animal accent | 동물별 9개 HEX | `src/lib/animalAssets.ts` | asset metadata | Figma 대응 없음 |

## Typography

| 역할 | 실제 값 | 선언 / 대표 사용 | 반복성 | Figma 대응 |
| --- | --- | --- | --- | --- |
| global family | Pretendard variable | `app/fonts.ts`, `globals.css` | 전역 | 충돌: Inter |
| landing hero | `clamp(46px, 11vw, 52px)`, bold, 0.95, `-0.06em` | `app/page.tsx` | 랜딩 전용 | Figma H1 크기 근접, family/tracking 충돌 |
| section title | 38px, bold, 1.04–1.15, negative tracking | `uiTokens.ts`, pages | 반복 | Figma H2/H3와 크기 다름 |
| result/report heading | 24–28px, bold | result/report/panel components | 반복 | Figma H4/H5와 부분 일치 |
| reading lead | 21px, bold, 1.45, `-0.035em` | `PaidReportSectionNavigator.tsx` | 유료 리포트 | 코드 기준 |
| body | 15–16px, semibold, 1.66–1.9 | pages, report blocks | 반복 | Figma Body size 근접, weight/leading 다름 |
| utility label | 11–13px, semibold, `0.08–0.14em` | tokens, headers, report | 반복 | Figma 12px label과 부분 일치 |

## Spacing, sizing, radius, border, elevation

| 역할 | 실제 값 | 선언 / 대표 사용 | 반복성 | 비고 |
| --- | --- | --- | --- | --- |
| page gutter | 20px (`px-5`) | landing/result | 반복 | report는 16px 예외 |
| content width | `max-w-[430px]` | all user routes | 반복 | 390–430px 전용 |
| section separation | top rule + `pt-12`; page sections `space-y-8/10/12/16` | `uiTokens.sectionRule`, pages | 반복 | 정보 구조 역할 |
| action minimum | `min-h-14` / 56px | `uiTokens.button`, result/report CTA | 반복 | Figma 56px button과 일치 |
| picker option | 48px | `BirthForm.tsx` | 반복 | Figma 48px button과 부분 일치 |
| pill control | `rounded-full` | input, CTA, segmented control | 반복 | Figma radius와 충돌 |
| report card | 접힘 20px / 확장 28px | `PaidReportSectionNavigator.tsx` | 반복 | 별도 문서 카드 상태 역할 |
| report block | 22px | `PaidReportSectionNavigator.tsx` | 반복 | highlight/list/table |
| ordinary panel/header | 28–30px | `uiTokens.ts`, result/report | 반복 | Figma 12px와 충돌 |
| hero panel | 36px | `uiTokens.heroPanel` | 반복 | 코드 기준 |
| common border | 1px `rgba(0,0,0,.14)` | token/pages/report | 반복 | Figma 1.5px input과 다름 |
| surface shadow | `0 10–16px 22–36px rgba(0,0,0,.06–.09)` | tokens/pages | 반복 | Figma 500과 성격 유사 |
| hero shadow | `0 22px 50px rgba(0,0,0,.12)` | `uiTokens.heroPanel` | 반복 | Figma ramp보다 크게 연출 |

## 화면과 reusable patterns

| 디자인 역할 | 실제 구현 | 선언 파일 | 사용 위치 | Figma 대응 |
| --- | --- | --- | --- | --- |
| landing hero | 질문형 headline, 설명, single CTA | `app/page.tsx` | `/` | 키트 외 제품 고유 |
| explanation deck | pointer swipe + stacked card | `app/page.tsx` | `/` | Figma 대응 없음 |
| birth form | text date + segmented controls + picker sheet | `BirthForm.tsx` | landing start section | Input과 역할 유사, 외형은 다름 |
| internal header | back, brand, route label | result/report pages | `/result`, `/report` | Top navbar 44px와 역할 유사 |
| result hero | paper panel, animal image, rank/summary | `app/result/page.tsx` | `/result` | 키트 외 제품 고유 |
| balance/summary blocks | section rule, bordered list/panel | `app/result/page.tsx` | `/result` | card/list 일부 대응 |
| report map | overview + 12 mosaic cards | `PaidReportSectionNavigator.tsx` | `/report` | 키트 외 제품 고유 |
| report reading blocks | paragraph, highlight, list, table | `PaidReportSectionNavigator.tsx` | `/report` | generic card primitive만 유사 |
| action buttons | rose filled / cream outlined pill | `uiTokens.ts`, pages | all routes | Figma size만 부분 일치 |
| version badge | fixed right-bottom pill | `AppVersionBadge.tsx` | all routes | 제품 운영 예외 |

## 동물 이미지와 motion

| 항목 | 실제 구현 | 근거 | 반복성 |
| --- | --- | --- | --- |
| animal assets | 9 keys, 4 main WebP candidates/key, thumbnail, mark, HEX accent | `src/lib/animalAssets.ts` | 결과·랜딩·리포트 |
| image handling | landing `next/image`; result/report native `img` + fallback | `app/page.tsx`, result, report navigator | 서로 다름 |
| landing deck | exit 380ms, snap 300ms, transform transition | `app/page.tsx` | 랜딩 전용 |
| report expansion | Web Animations 380ms, `cubic-bezier(.22,1,.36,1)` | `PaidReportSectionNavigator.tsx` | report |
| reduced motion | report layout animation duration 0; scroll auto | `PaidReportSectionNavigator.tsx` | report 중심 |
| simple press | `active:translate-y-0.5`, 일부 `active:scale-90` | tokens/pages | CTA 및 controls |

## 반복과 예외의 구분

- **반복 시스템:** honey/cream/rose/ink palette, 430px shell, full-pill action, 14–16px reading body, hairline rule, soft black shadow.
- **의도된 예외:** landing hero의 46–52px display, 결과 hero 36px radius, animal별 accent color, report의 접힘 20px/확장 28px/reading block 22px hierarchy, fixed version badge.
- **관리 공백:** page별 raw Tailwind 색상/반경/그림자가 토큰보다 많고, result/report header/button classes가 중복된다. 이 감사에서는 리팩터링하지 않는다.
