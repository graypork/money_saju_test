# 결과 유형별 유료 리포트 연결 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 테스트 결과의 9개 `animalKey` 각각에 맞는 실제 유료 리포트를 표시한다.

**Architecture:** 원본 Markdown 문서 9개를 타입이 검증되는 `PaidReport` 데이터로 전사해 하나의 리포트 뱅크에 둔다. `/report`는 기존 계산 결과에서 `buildResultCopy(result).animalKey`를 얻고, 뱅크 조회 결과만 `PaidReportView`에 전달한다. 누락된 키는 다른 동물 리포트로 대체하지 않는다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Node.js test runner.

## Global Constraints

- 대상 키는 정확히 `fox`, `ox`, `squirrel`, `hawk`, `tiger`, `rabbit`, `deer`, `swan`, `otter` 9개다.
- 원본 문장, 표의 내용, 섹션 순서는 `docs/paid-reports-source/`를 기준으로 보존한다.
- 점수·동물 선택·결과 생성·로그·결제·잠금·쿼리 파라미터·`admin22` 동작을 변경하지 않는다.
- 새 패키지를 설치하지 않는다.
- 모바일 390–430px 범위와 기존 리포트 읽기 모드를 유지한다.
- 커밋·푸시는 사용자가 명시적으로 요청할 때만 수행한다.

---

### Task 1: 리포트 뱅크 계약과 누락 방지 테스트 만들기

**Files:**
- Modify: `src/content/resultCopy/paidReportTypes.ts`
- Modify: `tests/ui/palette-contract.test.mjs`

**Interfaces:**
- Produces: `PAID_REPORT_ANIMAL_KEYS`, `PaidReportAnimalKey`

- [ ] **Step 1: 실패하는 정적 계약 테스트를 추가한다.**

  `tests/ui/palette-contract.test.mjs`에 아래 테스트를 추가한다. 이 테스트는 9개 키가 모두 리포트 뱅크에 선언됐는지, 임시 샘플을 경로가 사용하지 않는지를 검사한다.

  ```js
  test("유료 리포트는 9개 결과 유형을 모두 제공한다", async () => {
    const [bank, reportPage] = await Promise.all([
      readFile(new URL("../../src/content/resultCopy/paidReportBank.ts", import.meta.url), "utf8"),
      readFile(new URL("../../app/report/page.tsx", import.meta.url), "utf8"),
    ]);
    const keys = ["fox", "ox", "squirrel", "hawk", "tiger", "rabbit", "deer", "swan", "otter"];

    for (const key of keys) {
      assert.equal(bank.includes(`animalKey: "${key}"`), true, `missing ${key} paid report`);
    }
    assert.equal(reportPage.includes("samplePaidReport"), false, "report page must not use swan sample");
    assert.equal(reportPage.includes("getPaidReportByAnimalKey"), true, "report page must select a report by animal key");
  });
  ```

- [ ] **Step 2: 테스트가 실패하는지 확인한다.**

  Run: `npm run test:ui`  
  Expected: `paidReportBank.ts`를 찾을 수 없거나 9개 리포트 계약이 충족되지 않아 실패.

- [ ] **Step 3: 리포트 키와 조회 API의 타입 계약을 구현한다.**

  `src/content/resultCopy/paidReportTypes.ts` 끝에 아래 선언을 추가한다.

  ```ts
  export const PAID_REPORT_ANIMAL_KEYS = [
    "fox", "ox", "squirrel", "hawk", "tiger", "rabbit", "deer", "swan", "otter",
  ] as const;

  export type PaidReportAnimalKey = (typeof PAID_REPORT_ANIMAL_KEYS)[number];
  ```

- [ ] **Step 4: 계약 테스트를 다시 실행한다.**

  Run: `npm run test:ui`  
  Expected: 리포트 데이터가 아직 비어 있으므로 Task 2 전에는 실패할 수 있다. 기존 4개 테스트는 유지된다.

### Task 2: 9개 원본을 타입 안전한 리포트 뱅크로 전사한다

**Files:**
- Create: `src/content/resultCopy/paidReportBank.ts`
- Read only: `docs/paid-reports-source/fox.md`, `ox.md`, `squirrel.md`, `hwak.md`, `tiger.md`, `rabbit.md`, `deer.md`, `swan.md`, `otter.md`

**Interfaces:**
- Consumes: `PaidReport`, `PaidReportAnimalKey` from `paidReportTypes.ts`
- Produces: `paidReportsByAnimalKey` with 정확히 9개의 완성된 `PaidReport`

- [ ] **Step 1: 각 원본의 12개 섹션을 확인하고 블록 종류를 고정한다.**

  각 리포트는 원본의 번호 순서대로 `핵심 판정`, `맞춤 해석 키워드`, `Money Map`, `실행 요약`, `수익 성장 단계`, `돈이 되는 재능`, `필살! 수익확장법!`, `막히는 지점`, `강점 / 문제 / 해법`, `피해야 할 수익화 방식`, `보조 해석`, `이번 주 맞춤 플랜`을 만든다. 표는 `table`, 항목명/내용 쌍은 `highlight`, 3일·5일·1주 실천 항목은 `list` 또는 줄바꿈이 보존된 `paragraph`로 표현한다.

- [ ] **Step 2: 리포트 하나를 완전한 `PaidReport` 객체로 전사하는 형식을 적용한다.**

  모든 리포트는 아래 객체 형식을 사용하며, `order`는 원본 섹션 번호와 같게 둔다.

  ```ts
  const foxReport: PaidReport = {
    animalKey: "fox",
    animalName: "여우형",
    title: "여우형 유료 리포트",
    sections: [
      {
        id: "core-judgment",
        order: 1,
        title: "여우형 핵심 판정",
        blocks: [
          { type: "highlight", label: "한 줄 정리", text: "여우형은 팔리는 흐름을 읽고 감각적인 기획으로 수익을 만드는 유형이에요." },
          { type: "paragraph", text: "여우형은 사람들이 어떤 말에 멈추고, 어떤 제목에 궁금해지고, 어떤 제안에 마음이 움직이는지 빠르게 읽는 힘이 있어요.\n감각이 빠르고 문구 전환이 좋기 때문에 상품명, 후킹 문장, 상세페이지 흐름, SNS 기획에서 강점이 잘 드러납니다." },
          { type: "paragraph", text: "월급 밖 수익을 만들려면 “더 자극적으로 보이기”보다 호기심을 만들고, 사고 싶게 만드는 세일즈 흐름으로 바꾸는 구조가 필요해요." },
        ],
      },
      {
        id: "money-map",
        order: 3,
        title: "Money Map",
        blocks: [
          {
            type: "table",
            headers: ["항목", "경향"],
            rows: [["재능 축적", "중간"], ["공개 속도", "빠름"]],
          },
          { type: "paragraph", text: "여우형은 사람을 멈추게 하는 문구를 빠르게 만들고, 방향을 바꾸는 속도가 강한 편이에요.\n장기 수익으로 가려면 감각적인 문구를 기록, 분석, 패키지화해서 반복 가능한 세일즈 문구 상품으로 만들어야 합니다." },
        ],
      },
    ],
  };
  ```

- [ ] **Step 3: 원본 전체를 9개 객체에 빠짐없이 전사한다.**

  - `hwak.md`의 파일명은 `hawk` 키에 연결하되 표시 이름은 원본의 `매형`으로 유지한다.
  - 표의 헤더와 모든 행은 원본 순서 그대로 `headers`, `rows`에 넣는다.
  - `문제 N`의 `문제`·`손실`·`해법`은 단일 `highlight` 텍스트에 줄바꿈을 유지해 기존 읽기 모드의 단계 강조가 동작하도록 한다.
  - 원본의 구분선(`⸻`, `---`)은 데이터에 넣지 않는다.
  - 원본의 굵게 표시된 문구는 문장 텍스트로 보존하고 Markdown 기호는 렌더링하지 않는다.

- [ ] **Step 4: 9개 객체를 단일 맵에 연결하고 누락을 컴파일 단계에서 막는다.**

  ```ts
  const REPORTS: Record<PaidReportAnimalKey, PaidReport> = {
    fox: foxReport,
    ox: oxReport,
    squirrel: squirrelReport,
    hawk: hawkReport,
    tiger: tigerReport,
    rabbit: rabbitReport,
    deer: deerReport,
    swan: swanReport,
    otter: otterReport,
  };

  export const paidReportsByAnimalKey = REPORTS;

  export function getPaidReportByAnimalKey(animalKey: string): PaidReport | null {
    return REPORTS[animalKey as PaidReportAnimalKey] ?? null;
  }
  ```

- [ ] **Step 5: UI 계약 테스트를 실행한다.**

  Run: `npm run test:ui`  
  Expected: 5개 테스트가 모두 통과.

### Task 3: `/report`를 결과 유형에 맞는 리포트로 연결한다

**Files:**
- Modify: `app/report/page.tsx`
- Modify: `tests/ui/palette-contract.test.mjs`

**Interfaces:**
- Consumes: `buildResultCopy(result).animalKey`, `getPaidReportByAnimalKey(animalKey)`
- Produces: 결과 유형과 같은 `PaidReportView` 또는 유형 불일치 없이 안전한 안내 화면

- [ ] **Step 1: 리포트 누락 처리의 실패 조건을 테스트에 추가한다.**

  기존 유료 리포트 테스트에 `"getPaidReportByAnimalKey(builtCopy.animalKey)"`, `"상세 리포트를 준비하지 못했어요"` 문자열 검사를 추가한다. 이 검사는 샘플 고정 전달과 다른 유형 대체를 방지한다.

- [ ] **Step 2: 테스트가 현재 코드에서 실패하는지 확인한다.**

  Run: `npm run test:ui`  
  Expected: `/report`가 `samplePaidReport`를 사용하므로 새 문자열 검사에서 실패.

- [ ] **Step 3: 결과 계산 직후 정확한 리포트를 조회한다.**

  `app/report/page.tsx`에서 샘플 import를 아래 import로 교체한다.

  ```ts
  import { getPaidReportByAnimalKey } from "../../src/content/resultCopy/paidReportBank";
  ```

  `void buildResultCopy(result);`를 아래 코드로 교체하고, `report`가 없을 때 안내를 반환한다.

  ```tsx
  const builtCopy = buildResultCopy(result);
  const report = getPaidReportByAnimalKey(builtCopy.animalKey);
  const resultHref = `/result?${searchParams.toString()}`;

  if (!report) {
    return (
      <main className={PAGE_BASE_CLASS}>
        <section className="relative z-10 mx-auto max-w-[430px] space-y-10 pt-1">
          <SiteHeader label="REPORT" onBack={() => router.push(resultHref)} />
          <div className={DARK_PANEL_CLASS}>
            <p className="text-[12px] font-semibold tracking-[0.08em] text-[#D98E73]">REPORT</p>
            <h1 className="mt-3 text-[28px] font-bold leading-[1.25] text-[#000000]">상세 리포트를 준비하지 못했어요</h1>
            <p className="mt-4 text-[15px] font-semibold leading-7 text-[rgba(0,0,0,0.72)]">무료 결과로 돌아가 다시 확인해 주세요.</p>
            <button type="button" onClick={() => router.push(resultHref)} className={`${PRIMARY_BUTTON_CLASS} mt-6`}>무료 결과로 돌아가기</button>
          </div>
        </section>
      </main>
    );
  }
  ```

  기존의 두 임시 샘플 주석과 `<PaidReportView report={samplePaidReport} />`를 제거하고 아래처럼 렌더링한다.

  ```tsx
  <PaidReportView report={report} />
  ```

- [ ] **Step 4: UI 계약 테스트를 통과시킨다.**

  Run: `npm run test:ui`  
  Expected: 5개 테스트가 모두 통과.

### Task 4: 타입·빌드·실사용 흐름을 검증한다

**Files:**
- Verify only: `src/content/resultCopy/paidReportBank.ts`
- Verify only: `app/report/page.tsx`
- Verify only: `tests/ui/palette-contract.test.mjs`

**Interfaces:**
- Verifies: 9개 결과 유형 → 동일한 9개 리포트, 쿼리 보존, 390px 읽기 흐름

- [ ] **Step 1: 수정한 TypeScript 파일만 린트한다.**

  Run: `npm run lint -- app/report/page.tsx src/content/resultCopy/paidReportBank.ts src/content/resultCopy/paidReportTypes.ts`  
  Expected: 오류 0개. 기존 이미지 관련 경고가 있으면 별도로 기록한다.

- [ ] **Step 2: 전체 UI 계약 테스트를 실행한다.**

  Run: `npm run test:ui`  
  Expected: 모든 테스트 통과.

- [ ] **Step 3: 프로덕션 빌드를 실행한다.**

  Run: `npm run build`  
  Expected: `/report`를 포함한 정적 경로 생성과 빌드 완료.

- [ ] **Step 4: 390px 브라우저에서 실제 흐름을 확인한다.**

  1. `admin22` 테스트 입력으로 무료 결과를 만든다.
  2. 무료 결과의 동물 유형을 기록한다.
  3. `상세 리포트에서 분석 이어보기`를 누른다.
  4. 상세 리포트의 동물명과 첫 번째 섹션 제목이 동일 유형 원본과 일치하는지 확인한다.
  5. 섹션 하나를 확장하고 `다음 분석 읽기`로 다음 섹션을 열어 기존 읽기 모드가 유지되는지 확인한다.
  6. `무료 결과로 돌아가기`를 눌러 모든 쿼리 파라미터가 유지되는지 확인한다.

- [ ] **Step 5: 변경 범위를 확인한다.**

  Run: `git diff --check && git diff -- app/report/page.tsx src/content/resultCopy/paidReportTypes.ts src/content/resultCopy/paidReportBank.ts tests/ui/palette-contract.test.mjs`  
  Expected: 공백 오류가 없고, 원본 유료 리포트 문구 외의 결과·점수·로그 로직 변경이 없음.
