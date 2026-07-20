# Figma 디자인 시스템 인벤토리

> 기준 파일: `ClTewrvnMMIDRCBC4ZOkCo` — Design System (Community)
>
> 조사일: 2026-07-17. 이 파일은 money-saju-test의 설계 참고 원본 인벤토리이며, 여기의 모든 항목이 프로젝트 표준은 아니다. 채택 여부는 [design-decisions.md](./design-decisions.md)와 루트 [DESIGN.md](../../DESIGN.md)에서 결정한다.

## 조사 방법과 한계

- Figma MCP의 `get_design_context`와 `get_variable_defs`를 읽기 전용으로 사용했다.
- Typography(`7:4`), Colors(`18:19`), Shadow(`118:1723`), Input(`57:892`), Card(`270:9889`), Navbar Top(`116:2139`)의 실제 컨텍스트/변수를 확인했다.
- 전체 시스템 루트(`4:6`)의 컨텍스트 요청은 Figma 선택 상태 제약으로 실패했고, 후속 Button·Navbar Bottom·Tab 재조회는 Starter 요금제 도구 호출 한도에 도달해 확인할 수 없었다. 사전 제공 값은 참고로 보존하되, 이 표의 상태를 “확인 불가”로 기록한다.

## 페이지와 주요 섹션

| 영역 | Node ID | 관찰 내용 | money-saju 적용성 | 상태 |
| --- | --- | --- | --- | --- |
| 전체 디자인 시스템 | `4:6` | 범용 모바일 UI 키트의 상위 프레임 | 참고 범위 | 확인 불가 |
| Typography | `7:4` | Inter 기반 H1–H5, Subtitle, Body, Caption, Label | 크기 체계만 비교 가능 | 확인 |
| Colors | `18:19` | Primary/Grey/semantic 색과 font/color 변수 | semantic 상태색은 참고 가능 | 확인 |
| Shadow | `118:1723` | 100–800 elevation ramp | 그림자 구조 비교 가능 | 확인 |
| Button | `32:2` | Filled/Outline/Clear와 크기·상태 세트 | 버튼 상태 모델 참고 | 확인 불가 |
| Button Group | `48:712` | 복수 버튼 배치 | 현재 공통 컴포넌트 없음 | 미확정 |
| Input | `57:892` | Filled/Outline, Large/Medium, 상태별 border/surface | 입력 상태 모델 참고 | 확인 |
| Navbar Bottom | `116:1271` | 하단 내비게이션 | 현재 제품에 없음 | 확인 불가 |
| Navbar Top | `116:2139` | 390px 폭, 44px 높이, 좌·중·우 아이템 | 내부 화면 헤더와 비교 가능 | 확인 |
| Card | `270:9889` | 350px 폭 vertical/horizontal card | 제한적으로 참고 가능 | 확인 |
| Tab | `247:7995` | 40px tab item | 현재 제품에 없음 | 확인 불가 |

## Typography

Figma Typography 노드 `7:4`에서 확인한 규칙이다. 모든 letter spacing은 `0`이다.

| 토큰 | Family / Weight | Size / Line height | 확인된 용도 |
| --- | --- | --- | --- |
| H1 | Inter Semi Bold / 600 | 48 / 58 | Headline |
| H2 | Inter Semi Bold / 600 | 40 / 48 | Headline |
| H3 | Inter Semi Bold / 600 | 32 / 38 | Headline |
| H4 | Inter Semi Bold / 600 | 28 / 34 | Headline |
| H5 | Inter Semi Bold / 600 | 24 / 28 | Headline |
| Subtitle 1 | Inter Semi Bold / 600 | 18 / 28 | Subtitle |
| Subtitle 2 | Inter Semi Bold / 600 | 16 / 24 | Subtitle |
| Body 1 | Inter Regular / 400 | 16 / 24 | Body |
| Body 2 | Inter Medium / 500 | 16 / 24 | Body |
| Body 3 | Inter Regular / 400 | 14 / 20 | Body |
| Body 4 | Inter Medium / 500 | 14 / 20 | Body |
| Caption | Inter Regular / 400 | 12 / 16 | Caption |
| Label | Inter Medium / 500 | 12 / 16 | Label |

## Primitive 및 semantic colors

`get_variable_defs(18:19)`에서 확인한 대표 변수다.

| 역할 | Figma 변수 / 값 | money-saju 적용성 |
| --- | --- | --- |
| Primary 500 | `Primary/500` — `#4E61F6` | 현재 브랜드 포인트와 충돌 |
| Primary 50 | `Primary/50` — `#EDEFFE` | 현재 사용하지 않음 |
| Text primary | `Text Color/text-primary-black` — `#131927` | 현재 순흑색과 충돌 |
| White | `White/100%` — `#FFFFFF` | 표면/텍스트 대비에만 일반 적용 가능 |
| Grey 200 | `Grey/200` — `#E5E7EA` | border 역할로 비교 가능 |
| Grey 50 | `Grey/50` — `#F9FAFB` | subtle surface 역할로 비교 가능 |
| Success | `Green/500` — `#43B75D` | 현재 상태 UI 미정 |
| Info | `Blue/500` — `#0095FF` | 현재 상태 UI 미정 |
| Warning | `Yellow/500` — `#FFAA00` | 현재 상태 UI 미정 |
| Error | `Red/500` — `#EE443F` | 입력 오류 역할로 비교 가능 |

## Radius와 elevation

| 역할 | Figma 값 | 근거 |
| --- | --- | --- |
| radius xs | 8px | `Spacing System/radius-xs` 및 Input medium |
| radius sm | 12px | `Spacing System/radius-sm`, Card, Input large |
| radius xl | 24px | `Spacing System/radius-xl` |
| shadow 100 | `0 2px 4px -2px rgba(19,25,39,.12), 0 4px 4px -2px rgba(19,25,39,.08)` | Shadow `118:1896` |
| shadow 300 | `0 6px 8px -6px rgba(19,25,39,.12), 0 8px 16px -6px rgba(19,25,39,.08)` | Shadow `118:1892` |
| shadow 500 | `0 6px 14px -6px rgba(19,25,39,.12), 0 10px 32px -4px rgba(19,25,39,.10)` | Shadow `118:1897`, Card |
| shadow 800 | `0 8px 28px -6px rgba(19,25,39,.12), 0 18px 88px -4px rgba(19,25,39,.14)` | Shadow `118:1891` |

## Component sets, variants, states, dimensions

| Component | 확인된 variants / states | 핵심 치수 | money-saju 적용성 |
| --- | --- | --- | --- |
| Input `57:892` | Filled, Outline; Large, Medium; Default, Filled, Hover, Focus, Disabled, Success, Info, Warning, Error | content width 350px; gap 8px; 1.5px border; medium padding 12×8; large padding 12 | BirthForm 상태 모델의 참고만 가능 |
| Card `270:9889` | Vertical, Horizontal - Small | vertical 350×452, image 350×200, content padding 24; horizontal 350×120, image width 120, content padding 16 | 동물 이미지 카드/일반 카드 비교용 |
| Navbar Top `116:2139` | 좌·중·우 item, title / title+secondary / icon 조합 | width 390, item height 44, side padding 16/10, center text 16/24 | 결과·리포트 헤더의 터치 면적 기준 참고 |
| Button `32:2` | Filled, Outline, Clear; icons+text / icon only; Default, Hover, Focus, Press, Disabled | 56, 48, 40, 32, 24 높이 | 세트는 사전 분석값, 직접 재확인 불가 |
| Navbar Bottom `116:1271` | item과 label 조합 | item height 48 | 현재 미사용, 직접 재확인 불가 |
| Tab `247:7995` | 상태/선택 item | item height 40 | 현재 미사용, 직접 재확인 불가 |

## 범용 키트 중 핵심 시스템에서 제외할 항목

- Alert, Breadcrumbs, Pagination, Avatar와 하단 navbar는 현재 제품의 실제 UI에 없다.
- Figma의 Inter와 보라색 Primary는 현재 Pretendard·허니/크림/로즈 제품 정체성과 충돌하므로 canonical으로 채택하지 않는다.
- Input의 Success/Info/Warning 상태, tab 및 clear button은 실제 요구가 생길 때 코드·사용자 요구와 함께 재검토한다.
