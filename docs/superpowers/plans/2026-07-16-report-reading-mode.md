# 상세 리포트 읽기 모드 구현 계획

> **에이전트 작업자용:** `superpowers:executing-plans`를 사용해 각 작업을 순서대로 실행한다.

**목표:** 확장된 리포트 카드를 모바일에 맞는 읽기 모드로 전환한다.

**구조:** `PaidReportSectionNavigator.tsx`의 기존 배치·확장 상태는 그대로 두고, 확장 여부를 `ReportSectionCard`, `OverviewCard`, `ReportBody`, `ReportBlock`의 표시 밀도에만 전달한다. 표 데이터는 같은 배열을 모바일용 `dl`과 기존 데스크톱 표에 각각 표현한다.

**기술:** Next.js App Router 16.2.4, React 19.2.4, TypeScript, Tailwind CSS v4, Node 내장 테스트 러너.

## 전역 제약

- 390~430px 모바일만 대상으로 한다.
- 리포트 카피·섹션 순서·카드 배치·확장 알고리즘·쿼리 전달을 변경하지 않는다.
- 기존 FLIP 모션과 `prefers-reduced-motion` 처리를 보존하며, 새 모션은 추가하지 않는다.
- 새 패키지를 설치하거나 커밋·푸시하지 않는다.

### Task 1: 읽기 모드 계약 테스트

**파일:**
- 수정: `tests/ui/palette-contract.test.mjs`

- [ ] **Step 1: 실패하는 계약 추가**

기존 리포트 테스트에 아래 표식을 추가한다.

```js
"data-report-reading-mode=\"true\"",
"data-report-reading-surface=\"true\"",
"data-report-mobile-table=\"true\"",
"opacity-55",
```

- [ ] **Step 2: 실패 확인**

실행: `npm run test:ui`

예상: 읽기 모드 표식이 없어 실패한다.

### Task 2: 확장 카드와 주변 카드의 읽기 위계

**파일:**
- 수정: `src/components/PaidReportSectionNavigator.tsx`

- [ ] **Step 1: 주변 카드 대비 낮추기**

`OverviewCard`와 `ReportSectionCard`에 `dimmed` boolean prop을 추가한다. 한 카드가 확장된 동안 선택되지 않은 카드는 `opacity-55`만 적용한다.

- [ ] **Step 2: 확장 헤더와 본문 분리**

확장 카드의 헤더 버튼에 아래 구조를 적용한다.

```tsx
<div data-report-reading-surface="true" className="mt-6 border-t border-[rgba(0,0,0,0.14)] pt-6">
  <ReportBody section={section} />
</div>
```

제목 버튼은 `sticky top-4`와 로즈 포커스 윤곽을 유지하며, 본문은 카드의 전체 읽기 폭을 사용한다.

- [ ] **Step 3: 문단·목록·표 모바일 가독성 강화**

`ReportBlock`의 문단은 `text-[16px] leading-[1.9]`, 목록 항목은 `px-5 py-5 text-[15px] leading-7`로 한다. 표는 `sm:hidden`의 `dl`을 사용해 헤더와 값을 세로 행으로 출력하고, 기존 `<table>`은 `hidden sm:block`으로 보존한다.

- [ ] **Step 4: 읽기 상태 표식 추가**

그리드에 아래 속성을 둔다.

```tsx
data-report-reading-mode={expandedSectionIndex !== null ? "true" : "false"}
```

- [ ] **Step 5: 테스트 통과 확인**

실행: `npm run test:ui`

예상: 전체 계약 테스트가 통과한다.

### Task 3: 정적 검증

**파일:**
- 수정 없음

- [ ] **Step 1: 변경 파일 린트**

실행: `npm run lint -- src/components/PaidReportSectionNavigator.tsx`

예상: ESLint 오류 없이 종료한다. 기존 이미지·훅 경고는 기능 오류와 구분해 보고한다.

- [ ] **Step 2: 프로덕션 빌드**

실행: `npm run build`

예상: TypeScript와 `/report` 정적 생성이 통과한다.

- [ ] **Step 3: 변경 범위 검사**

실행: `git diff --check`

예상: 공백 오류가 없고 리포트 표현·테스트·문서만 새로 변경된다.
