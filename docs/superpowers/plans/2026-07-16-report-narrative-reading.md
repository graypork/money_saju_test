# 상세 리포트 이어 읽기 구현 계획

> **에이전트 작업자용:** `superpowers:executing-plans`를 사용해 작업을 순서대로 실행한다.

**목표:** 리포트 원문을 바꾸지 않고 확장 카드에서 결론·설명·행동·다음 분석 흐름을 만든다.

**구조:** `PaidReportSectionNavigator.tsx` 안에 텍스트 분리와 구조화된 강조 블록 렌더러를 추가한다. 기존 `handleToggle`을 다음 분석 버튼에 재사용하므로 확장·접기·모션·포커스 상태 기계는 그대로 유지한다.

**기술:** Next.js App Router 16.2.4, React 19.2.4, TypeScript, Tailwind CSS v4, Node 내장 테스트 러너.

## 전역 제약

- 리포트 원문, 섹션 순서, 표 행·열, 쿼리와 기존 모자이크 배치 계산을 변경하지 않는다.
- `aria-expanded`, `handleToggle`, 기존 FLIP 모션과 모션 감소 처리를 보존한다.
- 390~430px 모바일을 대상으로 하며 새 패키지·라우트·결제 동작을 추가하지 않는다.
- 커밋·푸시는 사용자가 별도로 요청할 때만 한다.

### Task 1: 이어 읽기 구조 계약 추가

**파일:**
- 수정: `tests/ui/palette-contract.test.mjs`

- [ ] **Step 1: 실패하는 계약 작성**

상세 리포트 테스트의 표식 배열에 아래 값을 추가한다.

```js
'data-report-reading-lead="true"',
'data-report-highlight-stage="true"',
'data-report-next-section="true"',
'다음 분석 읽기',
'handleToggle(index + 1)',
```

- [ ] **Step 2: 실패 확인**

실행: `npm run test:ui`

예상: 이어 읽기 표식이 없어 실패한다.

### Task 2: 원문을 독해 단위로 렌더링

**파일:**
- 수정: `src/components/PaidReportSectionNavigator.tsx`

- [ ] **Step 1: 줄바꿈 분리 함수 구현**

아래 함수를 `ReportBlock` 위에 추가한다.

```tsx
function readingParagraphs(text: string) {
  return text.split("\n").map((part) => part.trim()).filter(Boolean);
}
```

- [ ] **Step 2: 문단을 선행 결론과 일반 본문으로 표시**

`ReportBlock`에 `isLead` boolean을 추가한다. 문단 블록은 `readingParagraphs` 결과를 순서대로 렌더링하며, `isLead && index === 0`인 항목에 `data-report-reading-lead="true"`와 큰 제목형 클래스만 부여한다.

- [ ] **Step 3: 문제·손실·해법 강조 블록 분리**

`readingParagraphs` 결과가 `문제`, `손실`, `해법` 제목과 본문으로 교차할 때만 각 항목에 `data-report-highlight-stage="true"`를 둔 세로 행으로 렌더링한다. 그 외 강조 블록은 기존 라벨·텍스트 순서를 유지한다.

- [ ] **Step 4: 섹션의 첫 콘텐츠 블록만 선행 결론으로 전달**

`ReportBody`에서 `ReportBlock`에 `isLead={index === 0}`을 전달한다. 첫 블록이 문단이 아닌 경우 해당 블록은 기존 강조/표/목록 표현을 유지한다.

### Task 3: 다음 분석 연결

**파일:**
- 수정: `src/components/PaidReportSectionNavigator.tsx`

- [ ] **Step 1: 다음 섹션 props 추가**

`ReportSectionCard`에 `nextSection?: PaidReportSection`, `onNext?: () => void` props를 추가한다.

- [ ] **Step 2: 확장 카드 마지막에 다음 분석 버튼 추가**

다음 섹션이 있으면 아래 구조를 `ReportBody` 뒤에 둔다.

```tsx
<div data-report-next-section="true">
  <p>다음 분석</p>
  <button type="button" onClick={onNext}>
    <span>{nextSection.title}</span>
    <span>다음 분석 읽기 →</span>
  </button>
</div>
```

마지막 섹션에는 렌더링하지 않는다.

- [ ] **Step 3: 기존 전환 상태 기계 재사용**

섹션 map에서 다음 props를 전달한다.

```tsx
nextSection={sections[index + 1]}
onNext={() => handleToggle(index + 1)}
```

- [ ] **Step 4: 테스트 통과 확인**

실행: `npm run test:ui`

예상: 4개 계약 테스트가 통과한다.

### Task 4: 검증

**파일:**
- 수정 없음

- [ ] **Step 1: 변경 컴포넌트 린트**

실행: `npm run lint -- src/components/PaidReportSectionNavigator.tsx`

예상: ESLint 오류가 없다. 기존 이미지·훅 경고는 기능 오류와 구분해 보고한다.

- [ ] **Step 2: 프로덕션 빌드**

실행: `npm run build`

예상: TypeScript와 `/report` 정적 생성이 통과한다.

- [ ] **Step 3: 변경 범위 확인**

실행: `git diff --check`

예상: 공백 오류가 없고 원문 데이터 파일은 변경되지 않는다.
