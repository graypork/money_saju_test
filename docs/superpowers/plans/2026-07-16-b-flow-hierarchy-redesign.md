# B 흐름·위계 재설계 구현 계획

> **에이전트 작업 지침:** 이 계획은 `superpowers:subagent-driven-development` 또는 `superpowers:executing-plans`를 사용해 작업 단위별로 실행한다. 각 단계는 체크박스로 추적한다.

**목표:** 허니·크림·로즈 표면과 기존 동물 에셋을 보존하면서, 검정 기반 텍스트 위계·명확한 시작/전진 행동·접근 가능한 입력 피커·정돈된 2열 리포트 모자이크를 구현한다.

**구조:** `src/lib/uiTokens.ts`와 `app/globals.css`가 색상·서체 위계의 단일 기준이 된다. 랜딩, 입력, 무료 결과, 리포트는 해당 기준을 소비하고 각 페이지의 기존 계산·쿼리·저장소 코드는 유지한다. 새 패키지나 라우트는 만들지 않는다.

**기술 스택:** Next.js App Router 16.2.4, React 19.2.4, TypeScript, Tailwind CSS 4, 로컬 Pretendard 가변 서체, Node 내장 `node:test`.

## 전역 제약

- 390–430px 모바일 화면만 대상으로 한다.
- `/`, `/input`, `/result`, `/report`와 현재 쿼리 문자열을 바꾸지 않는다.
- 사주 계산, 점수, 동물 매핑, 생성 문구, 리포트 문구/섹션 순서, 로깅, 결제·잠금, 저장소, `admin22` 제외 동작을 바꾸지 않는다.
- 패키지를 설치하지 않는다. 테스트는 Node 내장 테스트와 기존 ESLint/Next 빌드를 사용한다.
- 고객 UI의 브라운 텍스트/잉크 `#33241D`, `#82685D`, `rgba(51,36,29,...)`는 각각 검정·검정 투명도로 바꾼다. 허니 `#F3D58B`, 크림 `#FFF8ED`, 로즈 `#D98E73`, 소프트 로즈 `#E7C5B8`는 표면/행동 역할로 유지한다.
- 커밋과 푸시는 사용자가 별도로 요청할 때만 수행한다.

---

## 대상 파일과 책임

| 파일 | 책임 |
| --- | --- |
| `app/globals.css` | 앱 전역 배경·전경 및 Pretendard 기반의 기본 텍스트 색을 검정 계층으로 설정 |
| `src/lib/uiTokens.ts` | 화면에서 재사용하는 팔레트, 버튼, 제목, 라벨, 표면, 경계 토큰을 검정 위계로 통합 |
| `app/page.tsx` | 랜딩의 직접 시작 CTA, 설명 덱의 비-스와이프 진행 컨트롤, 시각 토큰 적용 |
| `src/components/BirthForm.tsx` | 입력 필드 관계, 피커 다이얼로그/포커스/Escape, 보조 QA 입력 노출 |
| `app/result/page.tsx` | 하나의 상세 리포트 전진 CTA와 신뢰 중심의 무료→상세 상태 설명 |
| `app/report/page.tsx` | 페이지 셸과 헤더의 검정 기반 위계, 현재 샘플/쿼리 계약 보존 |
| `src/components/PaidReportSectionNavigator.tsx` | 2열 모자이크 카드의 검정 텍스트·선택 상태·실제 동작만 보이는 개요 |
| `tests/ui/palette-contract.test.mjs` | 고객 UI 소스에 남은 브라운 텍스트/잉크 토큰을 탐지 |
| `package.json` | 새 Node 내장 UI 계약 테스트 스크립트만 추가 |

## 작업 1: 검정 텍스트 팔레트 계약과 공통 토큰

**파일:**

- 생성: `tests/ui/palette-contract.test.mjs`
- 수정: `package.json`
- 수정: `app/globals.css`
- 수정: `src/lib/uiTokens.ts`

**인터페이스:**

- 소비: 기존 `palette`, `uiTokens`, `uiTokens.landing` 문자열 토큰과 Tailwind 임의값 클래스
- 생산: `palette.black`, `palette.text`, `palette.muted`, `palette.rule` 및 같은 의미의 `uiTokens` 텍스트/경계/그림자 토큰

- [ ] **1단계: 실패하는 팔레트 계약 테스트 작성**

  `tests/ui/palette-contract.test.mjs`에서 `node:test`, `node:assert/strict`, `node:fs/promises`, `node:path`, `node:url`을 사용한다. 아래 고객 UI 파일을 읽고 브라운 텍스트/잉크 문자열이 없음을 확인한다.

  ```js
  import assert from "node:assert/strict";
  import { readFile } from "node:fs/promises";
  import test from "node:test";

  const tokenFiles = [
    "app/globals.css",
    "src/lib/uiTokens.ts",
  ];
  const forbidden = ["#33241D", "#82685D", "rgba(51,36,29"];

  test("고객 UI는 브라운 텍스트·잉크 토큰을 사용하지 않는다", async () => {
    for (const file of tokenFiles) {
      const source = await readFile(new URL(`../../${file}`, import.meta.url), "utf8");
      for (const token of forbidden) {
        assert.equal(source.includes(token), false, `${file} contains ${token}`);
      }
    }
  });
  ```

- [ ] **2단계: 실패를 확인**

  실행: `node --test tests/ui/palette-contract.test.mjs`

  예상 결과: 현재 `#33241D`, `#82685D`, `rgba(51,36,29` 사용 때문에 실패한다.

- [ ] **3단계: 팔레트와 공통 토큰을 최소 변경**

  `package.json`에 아래 스크립트를 추가하고, `app/globals.css`의 전경을 `#000000`으로 바꾼다.

  ```json
  {
    "scripts": {
      "test:ui": "node --test tests/ui/palette-contract.test.mjs"
    }
  }
  ```

  `src/lib/uiTokens.ts`에서 아래 역할을 선언한다.

  ```ts
  export const palette = {
    honey: "#F3D58B",
    cream: "#FFF8ED",
    rose: "#D98E73",
    roseSoft: "#E7C5B8",
    black: "#000000",
    text: "rgba(0,0,0,0.72)",
    muted: "rgba(0,0,0,0.48)",
    rule: "rgba(0,0,0,0.14)",
  } as const;
  ```

  기존 `ink`, `body`, 브라운 그림자/경계 문자열을 위 역할로 치환한다. `uiTokens.button`, `secondaryButton`, `eyebrow`, `sectionTitle`, `label`, `body`, `muted`, `border`, `landing` 중복 토큰을 검정 계층으로 맞춘다. `font-black`은 CTA를 제외하고 `font-semibold` 또는 `font-bold`로 낮춘다. 버튼의 로즈/크림 표면은 유지한다.

- [ ] **4단계: 계약 테스트를 통과시킨다**

  실행: `npm run test:ui`

  예상 결과: 1개 테스트 통과.

- [ ] **5단계: 변경 파일만 린트한다**

  실행: `npm run lint -- app/page.tsx app/result/page.tsx app/report/page.tsx src/components/BirthForm.tsx src/components/PaidReportSectionNavigator.tsx src/lib/uiTokens.ts`

  예상 결과: 새 ESLint 오류 없음. 이 단계에서 아직 수정하지 않은 TS/TSX 파일은 명령에서 제외한다.

## 작업 2: 랜딩의 시작 위계와 설명 덱 접근성

**파일:**

- 수정: `app/page.tsx`

**인터페이스:**

- 소비: `BirthForm`의 현재 `id="birth-form"` 앵커, `StackedExplanationSection`의 `startForwardTransition`/`startBackwardTransition`, `uiTokens.landing`
- 생산: 히어로의 `href="#birth-form"` 시작 CTA와 키보드/터치 모두에서 쓸 수 있는 설명 덱 전후 이동 버튼

- [ ] **1단계: 랜딩의 기존 이동 계약을 기록하는 브라우저 점검을 먼저 수행**

  개발 서버 실행: `npm run dev`

  390px에서 브라우저 자동화로 `/`을 열고, 현재 헤더의 `href="#birth-form"`, `data-section="explanation"`, `data-section="birth-form"` 존재를 기록한다. 이 단계는 콘텐츠 순서와 폼 앵커를 바꾸지 않는 기준점이다.

- [ ] **2단계: 히어로에 명시적 시작 CTA를 추가**

  `app/page.tsx`의 히어로 섹션(현재 642행 부근)에서 기존 헤더 앵커와 같은 `#birth-form` 대상으로 CTA를 추가한다. 텍스트는 현재 제품 카피의 의미를 바꾸지 않는 직접 행동형 문구로 하고, 클래스는 `landingTokens.button`과 검정 텍스트 위계를 사용한다. 설명 덱·동물 소개·폼의 섹션 순서는 유지한다.

  이 변경을 마친 뒤 첫 번째 팔레트 계약의 파일 목록에 `"app/page.tsx"`를 추가하고 `npm run test:ui`를 실행한다. 현재 랜딩에 남은 브라운 텍스트/잉크가 있으면 먼저 치환한 뒤 통과시킨다.

- [ ] **3단계: 설명 덱에 버튼 진행을 추가**

  `StackedExplanationSection`(현재 212행 부근)의 덱 아래에 `type="button"` 전후 버튼을 둔다. 이전 버튼은 첫 카드에서 비활성화하고 `startBackwardTransition("front")`를 호출한다. 다음 버튼은 마지막 카드에서 비활성화하고 `startForwardTransition()`을 호출한다. 각 버튼에는 `aria-label`과 현재 카드 위치를 설명하는 보조 텍스트를 넣는다. 기존 포인터 핸들러와 애니메이션 타이머는 삭제하지 않는다.

- [ ] **4단계: 랜덤 카드 재교체로 인한 초기 레이아웃 이동을 제거**

  `Home`의 `requestAnimationFrame`으로 `visibleAnimalTypeCards`를 다시 설정하는 효과를 제거한다. 초기 표시 카드 집합을 고정해 초기 렌더와 하이드레이션 후 내용이 달라지지 않게 한다. `getRandomAnimalTypeCards`가 더 이상 소비되지 않으면 함께 제거한다. 동물 매핑 데이터와 이미지 선택 로직은 바꾸지 않는다.

- [ ] **5단계: 390px 상호작용을 확인**

  브라우저 자동화에서 히어로 CTA를 클릭해 `#birth-form`으로 이동하고, 덱 전후 버튼을 각각 눌러 카드가 바뀌는지 확인한다. 페이지 너비가 390px를 넘지 않는지 확인한다.

## 작업 3: 입력 폼 의미론·피커·QA 접근 정리

**파일:**

- 수정: `src/components/BirthForm.tsx`
- 수정: `tests/ui/palette-contract.test.mjs`

**인터페이스:**

- 소비: `handleSubmit`, `router.push(`/result?${params.toString()}`)`, `PickerSheet`의 `onChange`/`onClose`, `testCaseCode`
- 생산: 기존 결과 쿼리를 그대로 만드는 접근 가능한 폼/피커와 보조 위치의 QA 입력

- [ ] **1단계: 폼/피커 정적 계약을 테스트에 추가**

  기존 Node 테스트에 두 번째 테스트를 추가한다. `BirthForm.tsx` 소스에 `role="dialog"`, `aria-modal="true"`, `aria-invalid`, `aria-describedby`, `Escape`, `htmlFor`, `testCaseCode`가 존재하는지 확인한다. 이 검사는 피커 시맨틱과 QA 계약을 구현 전에는 실패하게 만든다.

  ```js
  test("생년 정보 폼은 연결된 라벨과 대화상자 피커를 제공한다", async () => {
    const source = await readFile(new URL("../../src/components/BirthForm.tsx", import.meta.url), "utf8");
    for (const marker of ["htmlFor", 'role="dialog"', 'aria-modal="true"', "aria-describedby", "Escape", "testCaseCode"]) {
      assert.equal(source.includes(marker), true, `BirthForm.tsx is missing ${marker}`);
    }
  });
  ```

  같은 테스트 파일의 첫 번째 팔레트 계약 파일 목록에 `"src/components/BirthForm.tsx"`를 추가한다.

- [ ] **2단계: 실패를 확인**

  실행: `npm run test:ui`

  예상 결과: `BirthForm.tsx`에 다이얼로그/라벨 마커가 없어 두 번째 테스트가 실패한다.

- [ ] **3단계: 라벨과 그룹 관계를 구현**

  날짜 텍스트 입력에는 고유 `id="birth-date"`와 연결된 `label htmlFor="birth-date"`를 사용한다. 양력/음력과 성별 선택은 각각 `<fieldset>`/`<legend>`로 감싸고, 각 옵션 버튼에는 `aria-pressed`를 설정한다. 날짜 오류의 고유 id를 만들고 입력의 `aria-describedby`로 연결한다. 값·유효성 검사·`handleSubmit`의 `URLSearchParams` 구성은 바꾸지 않는다.

- [ ] **4단계: 피커를 실제 모달 대화상자로 구현**

  `PickerSheet` 컨테이너에 `role="dialog"`, `aria-modal="true"`, `aria-labelledby`를 추가한다. 열었던 `PickerButton` 요소를 ref로 저장해 닫힐 때 포커스를 되돌리고, 열릴 때 닫기 버튼 또는 현재 선택 옵션에 포커스한다. `useEffect`의 키다운 핸들러에서 `Escape`이면 `onClose()`를 호출하고 정리 함수에서 이벤트를 해제한다. 기존 body scroll lock, 선택 확정, 옵션 스크롤 동작은 보존한다.

- [ ] **5단계: QA 입력을 보조 콘텐츠로 이동**

  `testCaseCode`의 state, `name`, `value`, `onChange`, 제출 시 trim/파라미터 추가는 그대로 둔다. 현재 일반 필드와 같은 위계 대신 `<details>`와 `<summary>` 또는 동등한 접근 가능한 보조 공개 컨트롤 안에 배치한다. 기본적으로 일반 생년 정보 흐름보다 낮은 검정 농도와 작은 라벨을 사용한다.

- [ ] **6단계: 테스트와 브라우저 흐름을 확인**

  실행: `npm run test:ui`

  예상 결과: 모든 테스트 통과.

  390px 브라우저에서 날짜 오류, 양력/음력, 성별, 시간 피커 열기·Escape 닫기·포커스 복귀, QA 접기/펼치기, 제출 후 `birthDate`, `birthTime`, `gender`, `calendarType`, `testCaseCode`가 포함된 `/result` URL을 확인한다.

## 작업 4: 무료 결과의 단일 전진 CTA와 상태 설명

**파일:**

- 수정: `app/result/page.tsx`

**인터페이스:**

- 소비: `reportHref = /report?${searchParams.toString()}`, `ResultLogSaver`, `DetailPreview`, 현재 생성 결과와 동물 이미지
- 생산: 결과 쿼리/로깅을 바꾸지 않는 하나의 상세 리포트 CTA와 현재 무료 상태를 설명하는 보조 UI

- [ ] **1단계: 현재 CTA 수를 390px에서 기록**

  유효한 결과 쿼리로 `/result`를 열고, `reportHref`를 향하는 링크와 재시작 버튼의 위치를 기록한다. `ResultLogSaver`의 세션/로그 동작은 이 단계에서 변경하지 않는다.

  그 다음 첫 번째 팔레트 계약 파일 목록에 `"app/result/page.tsx"`를 추가하고 `npm run test:ui`가 현재 실패함을 확인한다.

- [ ] **2단계: 전진 CTA를 `DetailPreview` 하나로 통합**

  `ResultContent`의 히어로 내부 `reportHref` 링크(현재 616행 부근)를 제거하거나 단순 비행동 설명으로 바꾼다. `DetailPreview`의 `href={reportHref}` 링크만 상세 리포트로 가는 기본 행동으로 남기며, 재시작은 보조 버튼으로 유지한다. `reportHref`를 만드는 쿼리 문자열은 수정하지 않는다.

- [ ] **3단계: 신뢰 중심 상태 설명을 추가**

  `DetailPreview`의 잠긴 항목 앞에 정적 상태 블록을 둔다. 이 블록은 현재 무료 결과에서 확인 가능한 범위와 상세 화면에서 이어지는 항목을 설명한다. 결제 완료, 잠금 해제 완료, 동물별 유료 리포트가 이미 연결되었다는 표현은 추가하지 않는다. 생성 문구와 `lockedItems` 항목의 의미는 바꾸지 않는다.

- [ ] **4단계: 검정 텍스트 위계와 동물 이미지 역할을 적용**

  `PAGE_BASE_CLASS`, 버튼/패널/리스트 클래스, `SiteHeader`, `ResultAnimalImage` 주변의 브라운 텍스트·그림자를 검정 계층으로 바꾼다. 결과 동물 이미지는 결과 정체성 영역에 남기되 장식 배경이나 새 인장으로 만들지 않는다.

- [ ] **5단계: 결과 계약을 검증**

  390px 브라우저에서 상세 리포트 링크가 정확히 하나인지, 링크 클릭 후 모든 기존 검색 파라미터가 `/report`에 유지되는지 확인한다. `testCaseCode=admin22` 결과에서는 기존 로그 제외 동작을 변경하지 않았음을 관리자 로그/코드 경로로 점검한다.

## 작업 5: 2열 상세 리포트 모자이크 정돈

**파일:**

- 수정: `app/report/page.tsx`
- 수정: `src/components/PaidReportSectionNavigator.tsx`

**인터페이스:**

- 소비: `samplePaidReport`, `PaidReportView({ report, onOverviewAction? })`, `BASE_PLACEMENTS`, `expandedSectionIndex`, `aria-expanded`
- 생산: 현재 2열 배치와 확장 애니메이션을 보존하면서 검정 대비·선택 상태·동작 가능한 개요만 제공하는 리포트

- [ ] **1단계: 2열과 확장 상태의 현재 기준을 기록**

  유효한 `/report` 쿼리를 390px에서 열고, 2열 카드 그리드, 카드 클릭 후 `aria-expanded` 변경, 포커스 표시, 모션 감소 분기를 기록한다. 이 기준은 레이아웃 알고리즘과 보고서 콘텐츠를 바꾸지 않는 증거다.

  그 다음 첫 번째 팔레트 계약 파일 목록에 `"app/report/page.tsx"`, `"src/components/PaidReportSectionNavigator.tsx"`를 추가하고 `npm run test:ui`가 현재 실패함을 확인한다.

- [ ] **2단계: 리포트 셸을 공통 검정 위계로 전환**

  `app/report/page.tsx`의 `PAGE_BASE_CLASS`, 버튼, 어두운 패널, 헤더에 남은 브라운 텍스트/그림자를 검정 계층으로 바꾼다. `samplePaidReport`를 전달하는 코드와 `resultHref` 쿼리 구성은 수정하지 않는다.

- [ ] **3단계: 카드 표면·본문·선택 상태를 정리**

  `PaidReportSectionNavigator.tsx`의 `CARD_SURFACES`, `CARD_BASE_CLASS`, 그림자, 본문 텍스트/경계 클래스를 허니·크림·로즈·검정 계층으로 통일한다. 선택/확장 카드는 로즈 경계 또는 로즈 표면을 사용하되, 본문 텍스트는 검정 농도 단계로 읽히게 한다. `BASE_PLACEMENTS`, `collapsedLayout`, `expandedLayout`, `animateLayoutChange`의 계산을 수정하지 않는다.

- [ ] **4단계: 동작하지 않는 개요 화살표를 숨긴다**

  `OverviewCard`에서 `onAction`이 있을 때만 화살표 또는 클릭 가능한 개요 컨트롤을 렌더링한다. `onAction`이 없으면 개요 카드 전체가 비활성 행동처럼 보이지 않게 한다. `PaidReportView`의 선택적 `onOverviewAction` 인터페이스는 유지한다.

- [ ] **5단계: 리포트 상호작용을 검증**

  390px 브라우저에서 두 장 이상의 카드를 순서대로 열고 닫는다. 각 카드의 `aria-expanded`, 키보드 포커스, 포커스 후 화면 위치, 모션 감소 환경의 즉시 상태 전환을 확인한다. `/result`로 돌아가는 링크가 기존 검색 파라미터를 유지하는지 확인한다.

## 작업 6: 통합 회귀 검증과 품질 확인

**파일:**

- 수정 없음

**인터페이스:**

- 소비: 작업 1–5의 UI 토큰, 랜딩 앵커, BirthForm 쿼리 제출, 결과/리포트 링크, 리포트 확장 상태
- 생산: 모바일 UI 변경이 기존 계산·쿼리·저장소·로그·접근성 계약을 보존한다는 검증 기록

- [ ] **1단계: 수정한 TS/TSX 파일을 린트**

  실행: `npm run lint -- app/page.tsx app/result/page.tsx app/report/page.tsx src/components/BirthForm.tsx src/components/PaidReportSectionNavigator.tsx src/lib/uiTokens.ts`

  예상 결과: 오류 0개.

- [ ] **2단계: 팔레트 계약 테스트 실행**

  실행: `npm run test:ui`

  예상 결과: 모든 하위 테스트 통과.

- [ ] **3단계: 프로덕션 빌드 실행**

  실행: `npm run build`

  예상 결과: Next.js 컴파일, TypeScript, 11개 정적 페이지 생성이 성공한다.

- [ ] **4단계: 핵심 모바일 시나리오를 검증**

  390px에서 다음을 한 번씩 수행한다.

  1. 랜딩 히어로의 시작 CTA에서 기존 폼 앵커로 이동하고 설명 덱의 버튼 진행을 사용한다.
  2. 일반 생년 정보 제출과 QA `testCaseCode` 제출이 기존 쿼리 문자열을 만든다.
  3. 결과에서 상세 리포트 CTA가 하나만 보이고 `/report`로 파라미터를 전달한다.
  4. 리포트에서 2열 카드 하나를 열고 다른 카드를 열며 `aria-expanded`와 포커스를 확인한다.
  5. 가로 스크롤이 없고, 검정 텍스트 위계와 허니·크림·로즈 역할이 일관적인지 확인한다.

- [ ] **5단계: 범위 외 변경이 없는지 확인**

  실행: `git diff --check` 및 `git diff --name-only`

  예상 결과: 포커스 파일 외의 계산, 리포트 콘텐츠, 결제/잠금, 저장소, 로그, `admin22` 관련 변경이 없다. 사용자 소유의 기존 변경은 되돌리거나 스테이징하지 않는다.

## 계획 자체 점검

- 설계 명세의 팔레트, 서체, 이미지, 랜딩, 입력, 결과, 리포트, 보존 조건은 각각 작업 1–6에 대응한다.
- 새로운 함수/타입 이름은 도입하지 않고 기존 컴포넌트와 props를 보존한다.
- 계획에는 패키지 설치, 결제/잠금 구현, 동물 매핑/리포트 문구 변경, 별도 커밋 명령이 없다.
