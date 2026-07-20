# 무료 결과 핵심 판정 맛보기 구현 계획

> **에이전트 작업자용:** 필수 하위 스킬: `superpowers:subagent-driven-development`(권장) 또는 `superpowers:executing-plans`를 사용해 작업을 단계별로 수행한다. 각 단계는 체크박스로 추적한다.

**목표:** `/result`를 유료 리포트의 핵심 판정을 미리 체감시키는 짧은 맛보기 화면으로 교체한다.

**구조:** 기존 `ResultContent`의 쿼리 파싱, 사주 계산, 카피 생성, 로그 저장을 그대로 둔다. 결과를 표현하는 하위 섹션만 하나의 핵심 판정 카드, 근거 2개, 잠긴 분석 미리보기, 단일 리포트 CTA로 대체한다. `useSearchParams`가 쓰이는 현재 Suspense 경계도 유지한다.

**기술:** Next.js App Router 16.2.4, React 19.2.4, TypeScript, Tailwind CSS v4, Node 내장 테스트 러너.

## 전역 제약

- `/result` 경로와 현재 쿼리 파라미터를 유지한다.
- 사주 계산, 동물 매핑, 결과 카피 생성, 결과 로그 저장, `admin22` 제외 처리, 결제·잠금·리포트 진입 동작을 보존한다.
- 유료 리포트의 카피, 섹션 순서, 생성된 결과 의미는 변경하지 않는다.
- 모바일 390~430px만 지원하며, Pretendard와 검정 계열 정보 위계를 쓴다.
- 크림·그린·테라코타, 세리프, 기록지·도장 같은 C 방향 요소를 새로 추가하지 않는다.
- 새 패키지를 설치하지 않고, 결과 화면 전용 애니메이션을 추가하지 않는다.
- 사용자가 커밋을 요청하지 않았으므로 이 작업에서 커밋하거나 푸시하지 않는다.

---

### Task 1: 맛보기 구조를 보호하는 정적 계약 테스트 추가

**파일:**
- 수정: `tests/ui/palette-contract.test.mjs`

**인터페이스:**
- 사용: `node:test`, `node:assert/strict`, `node:fs/promises`
- 생성: `무료 결과는 핵심 판정 맛보기만 노출한다` 테스트

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/ui/palette-contract.test.mjs` 끝에 아래 테스트를 추가한다.

```js
test("무료 결과는 핵심 판정 맛보기만 노출한다", async () => {
  const source = await readFile(new URL("../../app/result/page.tsx", import.meta.url), "utf8");

  for (const marker of [
    "FREE PREVIEW",
    "핵심 판정",
    "판정의 근거",
    "상세 리포트에서 이어서 확인할 분석",
    "상세 리포트에서 분석 이어보기",
    "/report?${searchParams.toString()}",
    "testCaseCode.trim() === \"admin22\"",
  ]) {
    assert.equal(source.includes(marker), true, `result/page.tsx is missing ${marker}`);
  }

  for (const removedSection of [
    "ElementBalanceSummary",
    "MoneyFlowSummary",
    "StrengthCaution",
    "DetailPreview",
  ]) {
    assert.equal(source.includes(removedSection), false, `result/page.tsx still exposes ${removedSection}`);
  }
});
```

- [ ] **Step 2: 실패 확인**

실행: `npm run test:ui`

예상: `FREE PREVIEW` 표식이 없어 실패한다. 이 실패는 아직 핵심 판정 맛보기 UI가 구현되지 않았음을 뜻한다.

### Task 2: 무료 결과의 장문 섹션을 핵심 판정 맛보기로 교체

**파일:**
- 수정: `app/result/page.tsx`

**인터페이스:**
- 사용: `WealthResult`, `BuiltResultCopy`, `getRandomAnimalMainPhoto`, `uiTokens`, `reportHref`
- 생성: `CoreDecisionPreview`, `DecisionReason`, `LockedReportPreview`
- 보존: `ResultLogSaver`, `ResultDebugLogger`, `InvalidResult`, `ResultContent`의 쿼리·계산·로그 호출

- [ ] **Step 1: 기존 무료 결과 하위 섹션 제거**

`ElementBalanceSummary`, `SummaryBlock`, `LockedPreviewItem`, `DetailPreview`, `StrengthCaution`, `MoneyFlowSummary` 선언과 `ResultContent`의 해당 JSX 호출을 삭제한다. `ELEMENT_ORDER`, `ELEMENT_LABEL`도 더 이상 참조되지 않으면 함께 삭제한다.

- [ ] **Step 2: 최소 핵심 판정 컴포넌트 추가**

`ResultAnimalImage` 아래에 아래 형태의 컴포넌트를 추가한다. 실제 문구는 기존 생성 카피에서만 가져오고, 새로운 운세 결론을 만들지 않는다.

```tsx
function DecisionReason({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="border-t border-[rgba(0,0,0,0.12)] py-4 first:border-t-0 first:pt-0">
      <p className="text-[12px] font-semibold tracking-[0.08em] text-[rgba(0,0,0,0.48)]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold leading-6 text-[rgba(0,0,0,0.72)]">{children}</p>
    </li>
  );
}
```

`CoreDecisionPreview`는 다음을 순서대로 렌더링한다.

```tsx
<p>FREE PREVIEW</p>
<h1>핵심 판정</h1>
<p>{builtCopy.title}</p>
<p>재물 감각 상위 {result.topPercent}%</p>
<p>{sentenceSummary(builtCopy.firstImpression, 120)}</p>
<ResultAnimalImage animalKey={builtCopy.animalKey} title={builtCopy.title} />
<h2>판정의 근거</h2>
<DecisionReason label="강하게 작동하는 흐름">{builtCopy.archetype}</DecisionReason>
<DecisionReason label="더 살펴볼 지점">{builtCopy.repeatedPatterns[0] ?? sentenceSummary(builtCopy.elementReading, 84)}</DecisionReason>
```

### Task 3: 잠긴 리포트 미리보기와 단일 CTA 연결

**파일:**
- 수정: `app/result/page.tsx`

**인터페이스:**
- 사용: `reportHref: string`, `router.push("/")`
- 생성: `LockedReportPreview`
- 보존: `reportHref = \`/report?${searchParams.toString()}\``

- [ ] **Step 1: 잠긴 분석 항목 구현**

`LockedReportPreview`는 아래 세 제목만 노출한다. 각 행은 낮은 대비 텍스트와 잠금 아이콘으로 처리하며, 유료 리포트 본문을 복제하지 않는다.

```tsx
const lockedItems = [
  "수익이 커지는 시점과 방식",
  "돈이 새는 반복 패턴",
  "지금 적용할 현실적인 전략",
];
```

제목은 `상세 리포트에서 이어서 확인할 분석`, 설명은 `핵심 판정의 근거와 행동 전략은 리포트에서 구체적으로 이어집니다.`로 둔다.

- [ ] **Step 2: 단일 주 행동과 보조 재시작 연결**

`CoreDecisionPreview` 끝에 아래 링크와 보조 버튼을 둔다.

```tsx
<a href={reportHref} className={PRIMARY_BUTTON_CLASS}>
  상세 리포트에서 분석 이어보기
</a>
<button type="button" onClick={() => router.push("/")} className="text-[14px] font-semibold text-[rgba(0,0,0,0.48)]">
  다시 테스트하기
</button>
```

CTA에는 `reportHref`를 그대로 사용해 모든 URL 쿼리를 전달한다. 기존 별도 ‘다시 하기’ 버튼과 하단 장문 안내를 제거한다.

- [ ] **Step 3: 테스트 통과 확인**

실행: `npm run test:ui`

예상: 3개 테스트가 모두 통과한다.

### Task 4: 정적 검증과 빌드 확인

**파일:**
- 수정 없음

- [ ] **Step 1: 변경 파일 검사**

실행: `npm run lint -- app/result/page.tsx`

예상: 오류 없이 종료한다. Next Image 권고가 남으면 기존 `<img>` 자산 처리 경고인지 구분해 보고하되, 이 범위에서 자산 로딩 방식을 변경하지 않는다.

- [ ] **Step 2: 프로덕션 빌드 검사**

실행: `npm run build`

예상: `/result`의 `useSearchParams`가 기존 `<Suspense>` 경계 안에 남아 빌드가 통과한다.

- [ ] **Step 3: 변경 범위 확인**

실행: `git diff -- app/result/page.tsx tests/ui/palette-contract.test.mjs docs/superpowers/specs/2026-07-16-free-result-core-decision-teaser-design.md docs/superpowers/plans/2026-07-16-free-result-core-decision-teaser.md`

예상: 무료 결과 맛보기와 그 테스트·문서만 표시되고, 점수·로그·리포트 카피는 변경되지 않는다.

## 자체 검토

- 명세의 핵심 판정·근거 2개·잠긴 맛보기·단일 CTA 요구는 Task 2~3으로 모두 충족한다.
- 계산, 로그, `admin22`, 쿼리 전달 보존은 Task 2~4에서 정적 계약과 기존 호출 보존으로 확인한다.
- `TODO`, `TBD`, ‘적절히’ 같은 미완성 지시어를 사용하지 않았다.
- 함수·속성 명칭은 `CoreDecisionPreview`, `DecisionReason`, `LockedReportPreview`, `reportHref`로 일관되게 정의했다.
