# money-saju-test 현재 UI/UX 감사

> 감사 기준일: 2026-07-15
> 범위: 현재 working tree의 사용자 대상 경험, 모바일 390px 우선 / 390–430px 지원
> 방법: 실제 render tree, 라우트 흐름, 컴포넌트 구조, Tailwind 클래스, 토큰, 에셋 참조를 정적 분석하고 현재 로컬 서버의 HTTP 응답을 확인했다. in-app browser는 localhost에 연결되지 않아 성공한 시각 스크린샷이나 브라우저 기반 DOM 관찰로 간주하지 않는다.

## 1. Executive summary

### 현재 경험

현재 제품은 하나의 긴 모바일 랜딩에서 사용자를 설득한 뒤 생년월일을 입력하게 하고, `/result`에서 무료 결과를 보여준 다음 `/report`의 상세 리포트로 이동시키는 구조다. `/input`은 독립 입력 화면이 아니라 `/`로 redirect한다.

랜딩은 다음 순서로 구성된다.

1. 브랜드/테스트명 헤더와 `시작` 앵커
2. “나는 월급보다 더 많이 벌 수 있을까?”라는 히어로 질문
3. 스와이프형 설명 카드
4. 랜덤 동물 유형 3개 미리보기
5. 생년월일 입력 폼과 고지문

무료 결과는 유형명과 상위 퍼센트, 동물 이미지, 오행 밸런스, 수익 흐름, 강점/주의 패턴, 상세 리포트 미리보기 순서다. 상세 리포트는 현재 유효한 쿼리만 있으면 잠금/결제 경계 없이 `samplePaidReport`의 백조형 샘플을 바로 렌더링한다. 이 상태는 `app/report/page.tsx:146-148`의 임시 UI 구조 검증 주석으로 명시되어 있다.

### 강한 부분

- 히어로의 질문이 제품의 핵심 관심사와 직접 연결된다.
- `#F3D58B` 허니 배경, `#FFF8ED` 크림 페이퍼, `#33241D` 잉크, `#D98E73` 로즈 포인트가 랜딩·결과·리포트 전반에 반복된다.
- 동물 사진 에셋이 유형을 기억하기 쉬운 시각적 앵커로 만든다.
- 생년월일 텍스트 입력과 년·월·일·시간 picker를 함께 제공해 입력 방식의 선택 폭이 있다.
- 상세 리포트의 확장 카드는 `button`, `aria-expanded`, visible focus outline, `scrollIntoView`, `prefers-reduced-motion` 처리를 일부 갖추고 있다.
- 긴 보고서 문단은 `15px`와 높은 line-height를 사용해 단순한 작은 텍스트보다 읽기 좋다.

### 가장 큰 UX 문제

1. 무료 결과에서 유료 리포트로 가는 가치·결제·잠금 경계가 현재 사용자 경험에 존재하지 않는다. `/report`는 유효한 쿼리만 있으면 고정 샘플을 바로 보여준다.
2. 랜딩이 설명 카드와 동물 미리보기를 먼저 지나야 입력 폼에 도달하는 긴 구조다. `시작`은 헤더의 작은 앵커 하나에 의존한다.
3. 설명 카드 스택은 포인터 스와이프에 의존하고 실제 카드가 `pointer-events: none`인 구조라 키보드·스크린리더 사용자가 같은 정보를 조작하기 어렵다.
4. 결과 화면에는 상세 보기, 다시 하기, 상세 리포트 확인하기, 다시 테스트하기가 반복되어 상태별 다음 행동이 분산된다.
5. 리포트의 2열 모자이크는 12개 섹션을 빠르게 훑는 장점이 있지만, 긴 제목과 긴 본문을 읽는 흐름에는 색인·진행감·현재 위치가 부족하다.

### 가장 큰 시각 시스템 문제

색상 팔레트는 제품 콘셉트에 잘 맞지만, 20·22·28·30·36px의 라운드, 다수의 반투명 패널, 여러 shadow 수치, full-pill 컨트롤이 동시에 사용된다. 결과적으로 “private-bank customer file”보다 부드러운 카드형 랜딩 템플릿이나 캐주얼한 AI UI에 가깝게 읽힐 여지가 있다. Pretendard 단일 서체에서 `font-black`과 강한 tracking 조정이 반복되어 정보의 계층보다 모든 요소가 강조되는 문제도 있다.

### 가장 높은 영향의 개선 기회

기존 계산·카피·결제·로그 동작을 건드리지 않고, 사용자 경험의 중심에 “발급된 재물 파일”이라는 하나의 구조를 세우는 것이다.

`발견 → 입력 → 무료 판정 → 잠금된 상세 범위 → 해제 후 읽기`를 명시적인 상태로 나누고, 각 상태마다 primary CTA를 하나만 둔다. 시각적으로는 현재 색과 동물 에셋을 유지하면서 카드 수·라운드·shadow를 줄이고, 문서 번호·섹션 색인·hairline rule을 실제 정보 구조로 사용한다.

권장 방향은 **Approach B: flow and hierarchy refinement**다. 단순 토큰 정리만으로는 결제 경계와 긴 리포트의 독해 문제가 해결되지 않고, 완전한 시스템 재구축은 현재 임시 리포트 데이터와 결제 상태가 정리되기 전 회귀 위험이 크다.

## 2. Current user journey

| 단계 | 사용자 의도 | 현재 화면/시스템 응답 | Primary action | Secondary action | 마찰·혼란 | 위험 |
|---|---|---|---|---|---|---|
| 랜딩 발견 | 이 테스트가 무엇을 알려주는지 빠르게 이해하고 시작하기 | 히어로 질문, 설명 카드 스택, 랜덤 동물 3개, 마지막에 입력 폼 노출 | 헤더의 `시작` → `#birth-form` | 설명 카드 스와이프, 동물 카드 가로 스크롤 | 핵심 benefit은 명확하지만 입력 전까지 긴 스크롤이 필요하다. 사용자가 무엇을 먼저 해야 하는지 페이지 중간에서 다시 결정해야 한다. | 높음 |
| 생년월일 입력 | 내 정보를 안전하고 쉽게 입력하기 | 날짜 텍스트 입력, 양력/음력 토글, 시간 picker, 성별 선택, 테스트 코드 입력, 제출 | `내 유형 확인하기` | picker의 `닫기`, 폼 수정 | 실제 사용자에게 필요한 값과 QA용 테스트 코드가 같은 위계다. label이 input과 명시적으로 연결되지 않고, 날짜 오류는 `alert`로도 처리된다. | 중간 |
| 계산/전환 | 입력이 처리되고 결과가 곧 나온다는 확신 얻기 | submit 시 `router.push(/result?... )`; 결과 계산은 client render에서 동기 실행. 별도 계산 진행 UI는 없음. Suspense fallback은 라우트 로딩용 텍스트뿐이다. | 결과 화면 진입 | 브라우저 뒤로 가기 | 기다림의 의미와 예상 시간이 없고, “발급 중”이라는 제품 세계관 연결도 없다. | 중간 |
| 무료 결과 | “나는 돈을 얼마나 잘 다루는가?”에 대한 첫 답 얻기 | `FREE RESULT`, 유형명, `재물 감각 상위 N%`, 요약, 동물 이미지, archetype/rank, 오행·수익 흐름·강점/주의 패턴 노출 | 히어로의 `상세 보기` 또는 아래 `상세 리포트 확인하기` | `다시 하기`, 마지막 `다시 테스트하기` | 첫 답은 강하지만 CTA가 중복되고, 상세 리포트 가치가 결과 중간에 여러 번 등장한다. 이미지와 큰 제목이 첫 답 이후의 정보 흐름을 압도할 수 있다. | 높음 |
| 유료 리포트 진입/해제 | 무엇을 더 얻는지 이해하고, 결제/해제 후 보고서를 읽기 | 현재 구현에는 별도 entry, 가격, 결제, 잠금, 해제 상태가 없다. 유효한 쿼리로 `/report`에 직접 접근하면 백조형 샘플이 즉시 렌더링된다. | 현재는 링크 `상세 보기` | 결과로 돌아가기 | 사용자는 무료/유료 경계를 학습할 수 없고, 실제 결과 유형과 리포트가 일치한다는 신뢰를 얻기 어렵다. | 치명적 |
| 해제 후 리포트 읽기 | 내 결과를 긴 보고서로 탐색하고 행동으로 옮기기 | 전체 리포트 overview 카드 + 12개 섹션의 2열 카드 그리드. 각 섹션은 클릭으로 확장되고, 확장 시 높이를 측정해 layout animation 후 scroll한다. 하단에 재테스트/무료 결과 버튼. | 섹션 카드 확장 | 무료 결과로 돌아가기, 다시 테스트하기 | 섹션 색인은 있으나 현재 위치·완료 여부가 없다. overview 카드의 화살표는 보이지만 현재 `onOverviewAction`이 전달되지 않아 실제 동작이 없다. 긴 표와 본문은 카드 모자이크에서 독해 흐름이 끊길 수 있다. | 높음 |

## 3. Current page structure map

아래 순서는 파일명 추정이 아니라 현재 JSX 반환 순서 기준이다.

### `/` — 랜딩 + 입력

`app/page.tsx:614-710`

1. `main`: 허니 배경, `min-h-dvh`, `px-5`, `max-w-[430px]` 내부 shell
2. header: 원형 `₩` 마크, 테스트명, 설명, 작은 `시작` anchor
3. `data-section="hero"`: 핵심 질문과 짧은 설명
4. `StackedExplanationSection`: “이 테스트로 알 수 있어요”, 5장의 스와이프 설명 카드
5. `data-section="animal-intro"`: `ANIMAL TYPES`, 9가지 중 랜덤 3개 동물 카드, 가로 snap scroll
6. `data-section="birth-form"`: `START`, 입력 안내, `BirthForm`, 금융·투자 조언이 아니라는 고지문
7. fixed `LandingVersionBadge`

`BirthForm`의 실제 내부 순서 (`src/components/BirthForm.tsx:492-631`):

1. 태어난 날: 텍스트 input
2. 날짜 기준: 양력/음력 segmented controls와 음력 안내
3. 태어난 시간: picker button, 모름 포함
4. 성별: 선택 안 함/남성/여성 버튼
5. 테스트 코드: 선택 입력 text input
6. `내 유형 확인하기` submit button
7. 열려 있을 때 picker sheet: 배경 닫기 버튼, sheet header, scroll picker, 취소/확인

### `/input` — 독립 입력 화면 없음

`app/input/page.tsx:1-5`

서버 컴포넌트에서 `redirect("/")`한다. 사용자가 `/input`을 방문해도 랜딩의 입력 앵커로 이동하지 않고 루트로 돌아간다.

### `/result` — 무료 결과

`app/result/page.tsx:572-649`

1. `main`: 허니 배경, `px-5`, `pt-4`
2. `SiteHeader`: 뒤로 가기, `MONEY SAJU`, `RESULT`
3. hero panel:
   - `FREE RESULT`
   - 계산된 유형명
   - `재물 감각 상위 N%`
   - 첫 인상 요약
   - 랜덤 동물 메인 이미지
   - archetype/rank summary panel
   - `상세 보기` / `다시 하기`
4. `ElementBalanceSummary`: 5개 오행 bar와 강·약 기운 panel
5. `MoneyFlowSummary`: 수익을 키우는 방식과 자주 보이는 장면
6. `StrengthCaution`: 강점과 통장에 구멍 나는 순간
7. `DetailPreview`: 상세 리포트에서 더 보는 것, 7개 잠금 list, 상세 리포트 CTA
8. disclaimer와 `다시 테스트하기`
9. fixed `AppVersionBadge`

유효하지 않은 query인 경우 header와 “아직 만들 결과가 없어요” panel, `테스트 시작하기`가 렌더링된다.

### `/report` — 현재는 샘플 리포트 읽기

`app/report/page.tsx:142-168`

1. `main`: 허니 배경, 다른 페이지보다 좁은 `px-4`
2. `SiteHeader`: 뒤로 가기 → 결과 query, `MONEY SAJU`, `REPORT`
3. `PaidReportView report={samplePaidReport}`
4. `다시 테스트하기`
5. `무료 결과로 돌아가기`
6. fixed `AppVersionBadge`

현재 `PaidReportView`의 DOM 순서는 `overview` 후 아래 12개다. 시각 배치는 `BASE_PLACEMENTS`에 의해 2열 grid에 재배치된다.

1. 백조형 핵심 판정
2. 맞춤 해석 키워드
3. Money Map
4. 실행 요약
5. 백조형 수익 성장 단계
6. 돈이 되는 재능
7. 필살! 수익확장법!
8. 막히는 지점
9. 강점 / 문제 / 해법
10. 피해야 할 수익화 방식
11. 보조 해석
12. 이번 주 맞춤 플랜

유효하지 않은 query인 경우 header와 “상세 리포트를 만들 결과가 없어요” panel, `테스트 시작하기`가 렌더링된다.

### 직접 관련 파일의 현재 상태

- `src/components/document-ui.tsx`는 현재 파일 목록에 없다. `public/assets/document-ui/animals`는 존재하지만, 문서 UI라는 이름의 공유 컴포넌트는 확인되지 않았다.
- 사용자에게 보이는 리포트 구조는 `src/components/PaidReportSectionNavigator.tsx`와 `src/content/resultCopy/paidReportSample.ts`에 있다.
- `src/lib/result/renderResultCopy.ts`에는 동물 유형별 유료 미리보기 데이터가 있지만 현재 `app/result/page.tsx`는 이를 직접 출력하지 않고 하드코딩된 7개 잠금 항목을 사용한다.

## 4. UI inventory

### Existing reusable patterns

| 패턴 | 현재 구현 | 평가 |
|---|---|---|
| 페이지 shell | `uiTokens.page`, 랜딩·결과·리포트의 `max-w-[430px]` shell | 재사용 가능하지만 report의 `px-4`와 나머지 `px-5`가 다르다. |
| 상단 header | 결과와 리포트가 유사한 `SiteHeader`; 랜딩은 별도 brand header | 결과/리포트는 공통화 가능하다. 랜딩과 내부 화면의 파일 문서 관계는 아직 약하다. |
| hero/answer panel | `uiTokens.heroPanel`, 결과의 유형명·상위 퍼센트·이미지 | 가장 강한 시각 앵커. 다만 50px 유형명과 380px 이미지가 한 panel 안에서 동시에 크다. |
| section rule | `uiTokens.sectionRule`의 top border + `pt-12` | 문서 느낌에 유리하지만 결과의 모든 주요 섹션에 같은 비중으로 반복된다. |
| primary/secondary button | `uiTokens.button`, `greenButtonSurface`, `secondaryButtonSurface`, 페이지별 중복 class | 모양은 일관되지만 primary가 화면마다 다른 의미를 가진다. |
| landing explanation card | `StackedExplanationSection`의 absolute stack, pointer drag | 브랜드 기억점이 될 수 있으나 semantic control이 아니다. |
| animal card | `AnimalTypeIntroCard`, photo cutout, shadow, cream surface | 에셋 활용과 유형 인지에는 좋다. 랜덤 교체로 layout/content stability가 떨어진다. |
| form controls | full-pill text input, segmented buttons, picker sheet | tap target은 대체로 크지만 label/field semantics와 modal semantics가 부족하다. |
| result blocks | `ElementBalanceSummary`, `MoneyFlowSummary`, `StrengthCaution`, `DetailPreview` | 내용 역할은 분리되어 있다. `DARK_PANEL_CLASS`라는 이름과 실제 밝은 surface가 어긋난다. |
| report blocks | paragraph, highlight, list, table | 실제 HTML text, `ul`, `table`을 사용해 콘텐츠 구조가 보존된다. |
| report navigator | overview + 12 section card grid, expanded layout, scroll/focus | 큰 리포트를 작은 화면에서 접어 보여주는 시도는 좋지만 index/read mode가 하나로 섞여 있다. |
| version badge | fixed `AppVersionBadge` / `LandingVersionBadge` | QA에는 유용하지만 사용자 경험에서는 floating obstruction과 내부 도구 인상을 준다. |
| image treatment | 랜딩은 `next/image`, 결과·리포트는 native `<img>` | 동일한 animal asset도 로딩·sizes·fallback 패턴이 다르다. |
| motion | 랜딩 deck 300/380ms, report Web Animations 380ms, CSS transition | 일부 reduced-motion 처리는 있으나 모든 motion 경로가 동일한 원칙을 따르지 않는다. |

### Reusable, duplicated, conflicting patterns

#### 재사용을 강화할 수 있는 패턴

- page gutter와 section spacing
- internal header/back control
- primary/secondary action
- paper panel / evidence panel / locked preview item
- animal image frame와 missing-asset fallback
- eyebrow + heading + body 조합

#### 중복 패턴

- `app/result/page.tsx`와 `app/report/page.tsx`가 `SiteHeader`, button class, panel class를 각각 선언한다.
- `uiTokens`의 global 값과 `uiTokens.landing` 값이 거의 같은 문자열을 중복한다.
- `DARK_PANEL_CLASS`, `PRIMARY_BUTTON_CLASS`, `SECONDARY_BUTTON_CLASS`가 페이지에 각각 존재한다.
- 현재 결과의 유료 preview는 `renderResultCopy`의 `paidSections`와 별도로 화면에서 하드코딩된다.

#### 충돌하는 패턴

- 랜딩/결과는 `px-5`, 리포트는 `px-4`다.
- hero는 36px radius, 일반 panel은 28px, report card는 20px, block은 22px, picker는 2rem/26px, button은 full pill이다.
- 배경과 border의 alpha 값이 요소마다 직접 입력된다.
- 랜딩은 `next/image`, 결과와 리포트는 `<img>`다.
- landing deck은 `motion-reduce` 대응이 없고, report card arrow는 대응이 있지만 layout animation은 `matchMedia`에서만 처리한다.

#### 공유 토큰 또는 컴포넌트가 되어야 할 후보

구현 단계에서 `PageShell`, `DocumentHeader`, `ActionButton`, `PaperPanel`, `LockedList`, `AnimalImageFrame`, `ReportSectionCard`를 검토할 수 있다. 단, 이 감사에서는 새 컴포넌트를 만들지 않았다.

## 5. UX issue list

| ID | 페이지 | 관찰된 동작 | 문제 이유 / 사용자 영향 | 심각도 | 현재 구현 근거 | 권장 방향 |
|---|---|---|---|---|---|---|
| UX-01 | `/result` → `/report` | 상세 보기 링크가 query를 유지한 채 report로 이동하지만 report는 `samplePaidReport`를 바로 렌더링한다. | 무료/유료 가치, 결제, 잠금, 실제 유형 일치 여부를 사용자가 구분할 수 없다. 서비스 신뢰와 전환 모두에 직접적인 손상이다. | critical | `app/report/page.tsx:146-148`; payment/unlock/localStorage 참조 없음 | 승인된 결제·해제 상태를 유지한 entry / locked / unlocked 화면으로 나누고, UI가 그 상태를 명확히 보여주는 경계를 설계한다. 기존 결제·해제 로직 자체는 바꾸지 않는다. |
| UX-02 | 랜딩 | 히어로 뒤에 설명 deck, 동물 미리보기, 입력 폼이 차례로 있다. | 제품의 답을 얻으려는 사용자가 입력까지 긴 탐색을 먼저 해야 한다. 설명은 유용하지만 primary task보다 앞선다. | high | `app/page.tsx:619-710` | 히어로 바로 아래 시작 행동과 입력의 관계를 선명하게 하고, 설명/동물 영역은 progressive disclosure로 둔다. |
| UX-03 | 랜딩 | 설명 deck은 `onPointerDown/Move/Up`으로만 진행되고 card는 `pointerEvents: none`이다. | 스와이프를 모르는 사용자, 키보드 사용자, 스크린리더 사용자가 같은 정보를 탐색할 제어 수단이 없다. | high | `app/page.tsx:212-589`, 특히 `:490-501`, `:537-589` | 스와이프는 유지하되 실제 버튼/탐색 상태/키보드 방향키 또는 이전·다음 control을 함께 제공한다. |
| UX-04 | `/result` | hero의 `상세 보기`, 중간의 `상세 리포트 확인하기`, 마지막의 `다시 테스트하기`, hero의 `다시 하기`가 모두 강한 버튼이다. | 다음 행동의 우선순위가 흐려지고, 사용자가 무료 결과를 읽기 전에 유료 CTA를 보거나 끝에서 다시 시작할 수 있다. | high | `app/result/page.tsx:615-645`, `:433-441` | 상태별 primary action을 하나로 정하고 secondary action은 시각·위치·문구를 낮춘다. CTA 문구는 전체 흐름에서 동일하게 유지한다. |
| UX-05 | `/report` | overview 카드에 확장 화살표가 있지만 `onOverviewAction`이 전달되지 않아 카드 자체는 동작하지 않는다. | 장식이 affordance처럼 보이는 dead end가 된다. | high | `src/components/PaidReportSectionNavigator.tsx:520-545`; `app/report/page.tsx:146` | overview를 실제 색인/첫 화면으로 정의하거나 화살표를 제거한다. 카드의 의미와 동작을 일치시킨다. |
| UX-06 | `/report` | 12개 섹션을 2열 카드 모자이크로 배치하고 확장 시 grid layout을 애니메이션한다. | 짧은 제목을 훑기에는 좋지만 긴 한글 제목, 표, 긴 본문을 읽는 문서 흐름과 충돌한다. 현재 위치나 읽은 범위를 기억하기 어렵다. | high | `BASE_PLACEMENTS`, `expandedLayout`, `grid-cols-2`, `--report-cell` | 색인 모드와 읽기 모드를 구분한다. 추천은 overview + 단일 섹션 읽기, 현재 섹션/전체 섹션 수, 색인 복귀다. 섹션 순서와 내용 의미는 보존한다. |
| UX-07 | 입력 | 필드 이름을 별도 `<label>`로 출력하지만 `htmlFor`/`id`가 없다. 양력·음력과 성별은 `fieldset/legend`가 아니다. | 보조기술의 field name 인식, label 클릭, 그룹 탐색이 불안정하다. | high | `src/components/BirthForm.tsx:494-619` | 실제 label association과 fieldset semantics를 추가하고 오류 메시지를 `aria-describedby`로 연결한다. |
| UX-08 | 입력 picker | fixed sheet가 열리지만 `role="dialog"`, `aria-modal`, Escape 처리, focus trap/복귀가 없다. | 키보드·스크린리더 사용자는 modal 경계를 알기 어렵고, 닫힌 뒤 focus 위치를 잃을 수 있다. | high | `src/components/BirthForm.tsx:216-289` | dialog semantics, focus 진입/복귀, Escape, sheet trigger의 expanded state를 명시한다. |
| UX-09 | 입력 | 날짜가 잘못되면 경우에 따라 inline error와 `alert`가 혼용된다. | 브라우저 alert는 흐름을 끊고, 같은 오류가 어디에 있는지 문맥을 잃게 한다. | medium | `src/components/BirthForm.tsx:423-442`, `:503-529` | 입력 아래 inline error를 단일 오류 채널로 정의하고, 오류 위치로 focus/scroll하는 방향을 검토한다. |
| UX-10 | 전환 | submit은 곧바로 result route로 이동하며 명시적인 발급/계산 진행 화면이 없다. | 사용자는 입력이 처리되는지, 실패했는지, 결과가 준비되는지 제품 언어로 확인하지 못한다. | medium | `src/components/BirthForm.tsx:458`; `app/result/page.tsx:650-664` | 실제 계산 시간이 늘어나지 않더라도 route 전환에 짧은 “파일 발급 중” 상태를 제공하고, 오류 시 복구 경로를 분명히 한다. |
| UX-11 | 랜딩 | 초기 3개 동물 카드가 먼저 `slice(0, 3)`로 렌더된 뒤 `requestAnimationFrame`에서 랜덤 카드로 교체된다. | 첫 paint 후 콘텐츠가 바뀌어 사용자가 보고 있던 카드가 사라질 수 있고, 랜덤성은 제품 신뢰보다 장난스러운 인상을 준다. | medium | `app/page.tsx:594-613`; `getRandomAnimalTypeCards` | 랜덤 미리보기의 의미를 유지할지 결정하고, 선택한다면 안정적인 초기 데이터와 reserved layout으로 content shift를 줄인다. |
| UX-12 | 전체 | landing/result/report의 gutter, radius, shadow, panel alpha가 미세하게 다르다. | 같은 서비스의 한 파일이 아니라 페이지별 별도 템플릿처럼 보인다. | medium | `app/page.tsx:617`, `app/result/page.tsx:23`, `app/report/page.tsx:15`, `src/lib/uiTokens.ts` | shared tokens로 페이지 shell, radius, rule, shadow 역할을 다시 정의한다. |
| UX-13 | 전체 | Pretendard 단일 계열에서 11–50px, `font-black`/`font-extrabold`가 넓게 사용된다. | 숫자·질문·설명·보조 라벨의 hierarchy가 weight에 의존하고, private-bank document의 차분한 인상보다 광고형 headline 비중이 커진다. | medium | `app/page.tsx:643-650`; `app/result/page.tsx:590-599`; report card headings | body/display/utility 역할을 weight·size·tracking으로 제한하고, 강조는 핵심 판정과 CTA에만 사용한다. |
| UX-14 | 전체 | 결과/리포트의 back control은 `h-8 w-8`, 랜딩 `시작`은 작은 pill이다. | 시각적으로는 버튼이지만 44px tap target 기준에 못 미칠 수 있고, 작은 모바일 화면에서 조작 신뢰가 떨어진다. | medium | `app/result/page.tsx:51-58`; `app/report/page.tsx:31-38`; `app/page.tsx:634-640` | 실제 hit area를 44px 이상으로 보장하고, focus-visible 상태를 모든 primary control에 일관되게 둔다. |
| UX-15 | 전체 | `AppVersionBadge`가 fixed bottom-right로 모든 사용자 화면에 보인다. | QA 정보가 콘텐츠와 겹치거나 제품이 아직 내부 테스트 중이라는 인상을 준다. 긴 리포트 마지막 버튼과의 충돌 가능성도 있다. | low | `src/components/AppVersionBadge.tsx:11-37` | 운영/QA 노출 여부를 결정하고, 사용자 화면에서 필요하다면 unobtrusive한 위치와 spacing을 검증한다. |
| UX-16 | 전체 | `metadata.title`이 `Create Next App`, description이 생성 기본값이다. | 브라우저 탭, 공유, 접근성 context에서 실제 제품 이름과 불일치한다. | low | `app/layout.tsx:5-8` | 제품명과 실제 테스트 목적을 반영하는 metadata를 검토한다. |

## 6. Visual consistency matrix

기준: **consistent**는 핵심 값과 역할이 거의 같음, **partially consistent**는 공통 방향은 있으나 수치/사용 맥락이 다름, **inconsistent**는 페이지별 규칙이 달라 하나의 system으로 읽기 어려움이다.

| 항목 | Landing | Free result | Report | 판정 | 근거 / 메모 |
|---|---|---|---|---|---|
| horizontal padding | `px-5` | `px-5` | `px-4` | partially consistent | 모두 430px shell이지만 report만 16px gutter다. |
| section gap | `space-y-16`, 내부 `space-y-6` | `space-y-12`, section `pt-12` | `space-y-12`, grid `gap-3` | inconsistent | task 단계와 문서 읽기 단계의 리듬이 정리되어 있지 않다. |
| card radius | 28/30/36/full | 28/36, inner 20/28 | 20/22 | partially consistent | paper surface는 공통이지만 scale이 넓다. |
| border | rose/cream alpha 혼용 | rose alpha와 rule line | rose alpha, card border | partially consistent | 색 역할은 같지만 직접 입력값이 많다. |
| shadow | 큰 deck/hero shadow | hero shadow + light panel | light card shadow + expanded shadow | partially consistent | shadow가 문서 깊이보다 카드 장식으로 느껴질 수 있다. |
| background | honey + cream surface | honey + cream result | honey + cream report | consistent | 가장 성공적인 공통 요소다. |
| typography | Pretendard heavy, 큰 hero | 50px type + 32px percent | 21/27/30px headings, 15px body | partially consistent | font family는 같지만 hierarchy rule이 없다. |
| CTA style | full pill, header small pill | full pill + two-column buttons | full pill bottom actions | partially consistent | button surface는 비슷하나 CTA priority가 다르다. |
| image treatment | 120px cutout / card | 380px object-contain | 92px object-contain | inconsistent | 같은 animal asset이 역할별 frame을 갖지 않는다. |
| motion | pointer deck, 300/380ms | result image random selection, no reveal motion | WAAPI 380ms, scrollIntoView | partially consistent | reduced motion이 모든 경로에 적용되지 않는다. |

### 시각적 결론

팔레트는 유지할 가치가 높다. 일관성을 높이는 핵심은 새 색을 추가하는 것이 아니라, 다음 세 가지를 줄이는 것이다.

1. card radius를 2–3단계로 제한한다.
2. shadow를 shell/hero의 두 역할로 제한하고 report card는 border와 rule 중심으로 둔다.
3. full-pill을 모든 control의 기본값이 아니라 실제 action button에만 사용한다.

## 7. Proposed product experience

### 7.1 Landing message

랜딩은 “무엇을 계산하는가”보다 “사용자가 무엇을 알게 되는가”를 첫 화면에서 더 직접적으로 보여준다.

권장 첫 화면 구조:

```text
[MONEY SAJU / FILE 01]

나는 월급보다 더 많이 벌 수 있을까?
돈이 커지는 조건과 막히는 지점을
내 재물 흐름 파일로 확인해요.

[내 재물 흐름 확인하기]

발급되는 내용
· 재물 감각 상위 퍼센트
· 돈이 붙는 방식
· 주의할 소비/실행 패턴
```

현재의 동물 유형과 설명 deck은 삭제할 대상이 아니라, 첫 action 이후의 증거/탐색 콘텐츠로 둔다. 이 순서는 사용자의 핵심 질문을 먼저 해결하고 브랜드 세계관을 다음에 보여준다.

### 7.2 Input flow

- 입력 shell은 “리포트 발급 정보”라는 하나의 form group으로 인식되게 한다.
- 날짜 input, 양력/음력, 시간, 성별의 목적을 한 줄 안내로 설명한다.
- “태어난 시간 모름”은 정상 선택으로 보이게 하되, 정확도에 영향을 주는지 현재 제품 규칙 안에서만 설명한다.
- 테스트 코드는 사용자 입력과 QA 입력의 성격이 다르므로 노출 정책을 별도 결정한다. `admin22` 제외 동작과 query contract는 보존한다.
- picker를 열면 focus가 sheet 안으로 들어가고 닫으면 trigger로 돌아온다.

### 7.3 Result reveal

결과 페이지는 먼저 한 장의 발급된 판정표처럼 읽혀야 한다.

1. 상단: `FREE RESULT` + 결과 파일 header
2. 첫 답: 유형명 + `재물 감각 상위 N%`
3. 근거: 짧은 첫 인상 + 동물 image
4. 한 줄 요약: archetype/rank
5. 다음 행동: `상세 리포트 보기` 하나
6. 그 아래: 오행·수익 흐름·강점/주의 패턴
7. 마지막: 무료에서 유료로 이어지는 상세 범위 preview

기존 copy와 계산 결과를 바꾸지 않고, “첫 답 → 근거 → 다음 행동 → 세부 근거”의 순서로 시각 hierarchy를 재정렬하는 방향이다.

### 7.4 Free-result information order

무료 결과는 최소한 아래 핵심 질문을 첫 viewport에 답해야 한다.

- 나중에 많이 벌 수 있는가: 상위 퍼센트와 유형 판정
- 어떤 조건에서 돈이 커지는가: 수익 흐름 요약
- 어떤 강점/위험이 있는가: strength/caution 한 쌍

오행 balance는 신뢰를 보강하는 근거로 두되, 첫 판정과 같은 weight로 경쟁시키지 않는다.

### 7.5 Paid-report preview

무료 결과에서 바로 report route로 보내기 전에 다음을 명시한다.

- 이 화면은 무료 결과인지 상세 리포트 입구인지
- 상세 리포트에서 새로 읽게 되는 범위
- 현재 결과 유형에 맞는 내용인지
- 해제 전과 해제 후 무엇이 보이는지
- 사용자가 다음에 누를 action이 무엇인지

현재 hard-coded locked list와 `renderResultCopy`의 `paidSections`가 모두 존재하므로, 나중에 어떤 데이터가 사용자-facing preview의 source of truth인지 먼저 결정해야 한다. 내용 의미를 바꾸는 것이 아니라 표현 source를 하나로 정하는 문제다.

### 7.6 Unlock transition

결제·해제 로직은 변경하지 않는다. UI는 그 상태를 세 가지로만 읽기 쉽게 표현한다.

1. locked entry: 무료 결과에서 상세 범위와 해제 action
2. processing/confirmed: 해제 요청이 처리 중인지 성공했는지
3. unlocked report: 실제 report overview와 읽기 시작점

해제 후 곧바로 긴 첫 section으로 점프하기보다, overview에서 “이 파일을 어떻게 읽을지”를 짧게 보여주고 첫 section을 선택하게 하는 편이 신뢰와 탐색성을 높인다.

### 7.7 Paid-report reading experience

권장 pattern은 **dossier index + single-section reading**이다.

- overview는 표지 겸 색인으로 사용한다.
- section card는 현재처럼 제목을 먼저 보여주되, 읽기 상태에서는 한 번에 하나의 넓은 column으로 확장한다.
- 상단에 `3 / 12` 같은 진행 위치를 둔다. 숫자는 실제 sections array와 연결한다.
- `색인으로 돌아가기`와 `다음 섹션`을 명확히 둔다.
- paragraph, list, table의 실제 HTML semantics는 유지한다.
- 현재 섹션 순서와 report content meaning은 유지한다.

#### Signature: “파일 spine”

이 경험이 기억될 한 가지 시각 장치는 화면 왼쪽의 얇은 문서 spine과 섹션 index다. 장식용 숫자가 아니라 `FREE RESULT`, `DETAIL REPORT`, `3 / 12`처럼 사용자가 현재 파일의 어느 상태에 있는지 알려주는 정보로만 쓴다. 이 방식은 generic dashboard의 stat card를 추가하지 않고, private-bank dossier라는 제품 세계를 실제 navigation에 연결한다.

### Frontend-design self-critique

현재 brief에 맞춰야 할 것은 cream + green + orange라는 색상 조합을 더 많이 만드는 것이 아니다. 이미 그 색은 충분하다. 차별점은 “AI dashboard”식 card collection을 늘리는 대신, 한 장의 고객 파일과 그 파일의 spine을 정보 구조로 삼는 것이다. 사진은 동물의 판정/기억 장치로만 남기고, 텍스트·폼·버튼·표를 generated image로 대체하지 않는다.

## 8. Design-direction options

| 접근 | 범위 | 기대 효과 | 위험 | 예상 영향 파일 수 | 회귀 가능성 | 복잡도 |
|---|---|---|---|---:|---|---|
| **A. Minimal consistency cleanup** | `uiTokens`, page gutter, radius/shadow, 공통 header/button, focus 상태 정리. 현재 랜딩 순서와 report grid 유지. | 빠르게 한 제품처럼 보이게 만들고 작은 시각 불일치를 줄인다. | 결제 경계, 긴 랜딩, report 독해 문제는 남는다. | 약 6–8개 | 낮음 | 낮음 |
| **B. Flow and hierarchy refinement (권장)** | A의 공통 정리 + 랜딩 첫 action, 결과의 answer/CTA hierarchy, locked preview, entry/unlocked reading shell, report 색인/읽기 구분. business logic은 그대로 둔다. | 핵심 이탈 지점과 유료 전환 이해를 동시에 개선한다. 현재 리포트 컴포넌트를 재사용할 수 있다. | route state와 query handoff를 잘못 건드리면 사용자 흐름 회귀가 생길 수 있다. | 약 9–11개 | 중간 | 중간 |
| **C. Complete user-facing visual-system consolidation** | dossier spine을 중심으로 공통 document primitives, landing/result/report 전면 재구성, report navigator 독해 방식 재설계. | 가장 강한 브랜드 일관성과 읽기 경험을 만든다. | 현재 sample report와 실제 payment/unlock source가 정리되기 전 범위가 커지고 회귀 surface가 넓다. | 약 12–16개 | 중간~높음 | 높음 |

### 권장

현재는 **B**가 적절하다.

- A는 안전하지만 지금의 가장 큰 문제인 paid/unlock 경계를 해결하지 못한다.
- C는 시각적으로 매력적이지만, 현재 `/report`가 임시 sample을 사용하는 상태에서 너무 많은 가정을 코드에 심을 수 있다.
- B는 기존 계산·카피·assets·route/query 계약을 보존하면서, 사용자가 실제로 이해해야 하는 상태와 CTA를 먼저 정리할 수 있다.

## 9. Proposed design system

### Layout

- viewport: 390px 우선, 430px까지 확장
- app shell: `width: 100%`, `max-width: 430px`
- page gutter: 390px에서 좌우 20px, 430px에서도 같은 content rule 유지
- report card 내부 padding: 16–20px
- 가로 scroll은 의도적인 carousel/table에만 허용하고 page-level horizontal overflow는 금지

### Spacing scale

`4 / 8 / 12 / 16 / 24 / 32 / 48`을 기본 scale로 삼는다.

- field 내부 gap: 8–12
- card 내부 gap: 12–16
- page section gap: 32–48
- 페이지 상단/하단: 16–24 / 32–48

현재의 `space-y-16`, `pt-12`, `gap-3`을 모두 없애는 것이 아니라 이 scale 안에서 역할별로 제한한다.

### Section hierarchy

1. file shell / header
2. thesis / answer
3. evidence
4. locked value / next action
5. supporting detail
6. disclaimer / exit

각 section은 eyebrow, heading, body, action을 모두 가질 필요가 없다. 실제 역할이 있는 요소만 둔다.

### Typography hierarchy

- body: Pretendard `15–16px`, line-height `1.65–1.85`
- small body / metadata: `12–13px`, line-height `1.4–1.6`
- utility/docket label: `10–11px`, uppercase, 제한된 tracking
- section heading: `26–32px`, `font-extrabold`
- page thesis: `42–52px` 범위에서 줄 수가 안정적인 크기
- result number: `28–36px`; headline과 동일한 weight로 경쟁시키지 않음

새 폰트를 추가하지 않고 Pretendard + 제한된 `ui-monospace` utility label 조합으로 문서성을 만든다.

### Card hierarchy

- Shell card: page/header/hero에만 큰 surface와 shadow
- Evidence card: 얇은 border와 낮은 shadow
- Reading block: radius를 줄이고 rule/spacing으로 구분
- Locked item: lock badge가 의미를 전달하되 전체 row가 CTA처럼 보이지 않게 함

권장 radius scale은 `12 / 18 / 28 / full`이다. 20·22·28·30·36을 모두 독립적인 의미로 유지하지 않는다.

### Button hierarchy

- Primary: 채워진 rose button, 화면당 주요 다음 행동 1개
- Secondary: cream + border, back/retry 같은 보조 행동
- Tertiary: text link 또는 compact control, 정보 탐색용
- 모든 interactive hit area: 최소 44px
- 모든 keyboard focus: rose outline + 충분한 offset

### Color roles

현재 팔레트를 재사용한다.

| 역할 | 값 |
|---|---|
| canvas / honey | `#F3D58B` |
| paper / cream | `#FFF8ED` |
| ink | `#33241D` |
| body / muted | `#82685D` |
| accent / stamp | `#D98E73` |
| soft rule / secondary surface | `#E7C5B8` |

추가 색은 상태 의미가 정말 필요할 때만 검토한다. private-bank dossier의 인상은 색상 수보다 역할의 일관성으로 만든다.

### Border and shadow roles

- structural rule: ink 12% hairline
- paper outline: rose 18–24%
- primary action: accent shadow 1단계
- hero/shell: 큰 shadow 1단계
- reading card: shadow보다 border와 spacing 우선

### Image treatment

- animal main photo는 고정 aspect-ratio frame 안에 `object-contain`으로 둔다.
- 랜딩 preview/result hero/report overview는 같은 asset contract를 사용한다.
- 실제 text, form, button, table, chart를 이미지로 바꾸지 않는다.
- missing asset fallback은 사용자에게 파일명 대신 의미 있는 상태를 보여주는 방향을 검토한다. 현재 placeholder filename은 개발 중 에러 확인에는 유용하지만 제품 신뢰에는 약하다.

### Motion principles

- 한 화면에 하나의 주요 motion만 둔다.
- card layout transition은 300–380ms 범위에서 통일한다.
- motion은 방향과 상태 변화를 설명해야 한다.
- content shift를 일으키는 random swap은 피하거나 공간을 미리 예약한다.
- `prefers-reduced-motion: reduce`에서는 deck swipe transition, report layout animation, smooth scroll을 즉시 이동으로 바꾼다.

## 10. Implementation sequence

이 절은 high-level design approval용 순서다. 상세 구현 계획이나 코드는 아직 작성하지 않는다.

### 1. Shared foundations

- 목표: page shell, header, action, paper/card, spacing, focus, motion roles를 하나의 토큰 체계로 정리한다.
- 예상 파일: `src/lib/uiTokens.ts`, `app/globals.css`, `app/layout.tsx`, 결과/리포트에서 중복된 공통 header/button 부분.
- 의존성: 없음. 현재 색과 Pretendard, assets를 재사용한다.
- 회귀 위험: 전 페이지 spacing/radius 변경으로 layout shift.
- 검증: 390px에서 page gutter, focus, no horizontal overflow, metadata/title 확인.

### 2. Landing

- 목표: 핵심 benefit과 시작 action을 첫 화면에서 이해시키고 설명/동물 탐색을 입력 task와 경쟁시키지 않는다.
- 예상 파일: `app/page.tsx`, `src/components/BirthForm.tsx`, 필요 시 `src/lib/uiTokens.ts`.
- 의존성: foundation.
- 회귀 위험: `#birth-form` anchor, form state, animal preview randomization, swipe pointer behavior.
- 검증: CTA가 정확한 form 위치로 이동, form keyboard flow, animal asset fallback, 390px page width.

### 3. Input

- 목표: 입력 semantics와 picker interaction을 안전하게 만든다.
- 예상 파일: `src/components/BirthForm.tsx`, `/input` redirect는 변경 여부를 별도 승인.
- 의존성: foundation, landing.
- 회귀 위험: `birthDate`, `birthTime`, `calendarType`, `gender`, `testCaseCode` query 생성, `admin22` exclusion.
- 검증: query string이 기존 계약과 동일한지, 양력/음력·시간 모름·성별·유효성 오류·picker close/restore를 확인한다.

### 4. Free result

- 목표: 첫 답과 다음 행동을 선명하게 하면서 무료 결과의 기존 copy와 의미를 보존한다.
- 예상 파일: `app/result/page.tsx`, 공통 UI token; `src/lib/result/renderResultCopy.ts`는 내용 변경 없이 source 연결 여부만 검토.
- 의존성: foundation, input.
- 회귀 위험: 계산 결과 표시, query forwarding, back behavior, session logging, `admin22` exclusion.
- 검증: top percent, animal mapping, element summary, copy, report href, session logging path가 그대로 동작하는지 확인한다.

### 5. Paid report

- 목표: locked entry → unlock state → unlocked reading experience를 명시하고, 해제 후 report를 읽기 쉽게 만든다.
- 예상 파일: `app/report/page.tsx`, `src/components/PaidReportSectionNavigator.tsx`, `src/content/resultCopy/*`와 관련 asset mapping은 실제 source of truth 승인 후에만 검토.
- 의존성: foundation, result, 결제/unlock 계약.
- 회귀 위험: 현재 임시 sample과 실제 paid report bank의 차이, query/localStorage/session state, section order, long tables, animation/scroll.
- 검증: locked/unlocked 직접 접근, 실제 유형과 report identity, 섹션 순서, table overflow, expanded/collapse/keyboard/reduced-motion, 무료 결과 복귀를 확인한다.

### 6. End-to-end regression review

- 목표: landing → input → result → paid entry → unlock → report의 전체 흐름을 확인한다.
- 예상 파일: 위 단계의 변경 파일 전체.
- 의존성: 모든 이전 단계 완료.
- 회귀 위험: route handoff, duplicate CTA, query loss, localStorage/session behavior.
- 검증: 390px 한 번을 기본으로 수행하고, 폭 관련 위험이 실제로 있을 때만 430px을 추가한다. 수정 파일 lint, `npm run build`, original symptom check, `git diff`를 확인한다.

## 11. Preserve list

향후 UI/UX 구현에서도 아래는 사용자 승인 없이 변경하지 않는다.

- 사주 계산
- 오행 계산
- animal-type resolution / animal mapping
- scoring과 percentile 산출
- copy-generation logic
- `salCopyBank` behavior
- 결과와 유료 리포트의 content meaning
- payment logic
- unlock logic
- query parameter 이름과 forwarding behavior
- localStorage/session behavior
- logging과 Google Sheets integration
- `admin22` exclusion behavior
- 기존 animal asset 파일명과 mapping contract
- report section order
- 실제 HTML text, form, button, table, chart semantics를 generated image로 대체하지 않음
- `/input` redirect를 변경하려면 별도 승인이 필요함

현재 audit 문서는 어떤 application source, style, component, dependency도 수정하지 않았다.

## 12. Open decisions

### Decision 1 — 어느 디자인 방향을 승인할 것인가?

- A: 토큰·spacing·accessibility만 정리
- B: 흐름과 hierarchy를 정리하고 paid/report 상태 shell까지 설계 **(추천)**
- C: 사용자 대상 visual system 전면 통합

추천: B. 현재 가장 큰 문제인 무료/유료 경계와 긴 리포트의 읽기 문제를 해결하면서 C보다 회귀 위험이 낮다.

영향: 구현 범위, 변경 파일 수, QA 기간이 결정된다.

### Decision 2 — 유료 리포트의 기본 읽기 패턴은 무엇인가?

- 현재 2열 card mosaic 유지
- overview 색인 + 한 번에 한 section을 읽는 hybrid **(추천)**
- 처음부터 전체 문서를 단일 column으로 순서대로 읽기

추천: hybrid. 현재 카드 탐색의 장점은 남기고, 긴 본문/표의 독해를 개선한다.

영향: `PaidReportSectionNavigator`의 layout과 scroll/focus behavior가 달라진다. section order와 content meaning은 어느 옵션에서도 유지한다.

### Decision 3 — 무료 결과에서 유료 리포트로 넘어갈 때 어떤 entry tone을 쓸 것인가?

- value-first: 상세 리포트의 구체적인 얻는 것부터 강조
- trust-first: 현재 결과에 맞는 범위, 결제/해제 상태, 읽기 방식을 먼저 명시 **(추천)**
- minimal: 짧은 설명과 단일 CTA만 제공

추천: trust-first. 현재 report가 sample을 쓰는 과도기에는 기대와 실제 결과가 일치한다는 신뢰를 먼저 확보해야 한다.

영향: paid preview copy의 배치, lock badge, 가격/해제 안내의 시각 우선순위가 달라진다. 결제 로직은 변경하지 않는다.

### Decision 4 — 테스트 코드 입력을 사용자 화면에서 어떻게 취급할 것인가?

- 현재처럼 공개 폼에 유지
- QA용 접이식 영역으로 구분
- 일반 사용자 화면에서는 숨기되 query/admin22 계약은 유지

추천: QA용 접이식 영역 또는 별도 진입. `admin22` 제외 behavior와 기존 query contract를 보존할 수 있어야 한다.

영향: 첫 입력 화면의 신뢰감과 폼 길이, QA 테스트 방법이 달라진다.

## Audit handoff

- 생성 문서: `docs/uiux/current-uiux-audit.md`
- 코드 변경: 없음
- 스타일 변경: 없음
- 의존성 설치: 없음
- commit/push: 없음

다음 단계는 이 문서와 Approach B, Decision 1–4에 대한 검토·승인이다. 승인 전에는 구현을 시작하지 않는다.
