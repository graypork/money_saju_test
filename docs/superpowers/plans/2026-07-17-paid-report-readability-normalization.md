# 유료 리포트 가독성 구조화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 9개 유료 리포트를 의미는 유지한 채 모바일에서 빠르게 읽히는 문단·단계·행동 단위로 구조화한다.

**Architecture:** 런타임 문장 해석 없이 9개 정적 `PaidReport` 데이터 파일의 `paragraph`, `highlight`, `list`, `table` 블록만 재구성한다. 기존 `PaidReportSectionNavigator`의 단계형 강조 렌더링은 `문제\n…\n손실\n…\n해법\n…` 데이터 형식을 그대로 받아 사용한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Node.js test runner.

## Global Constraints

- 원본의 의미와 12개 섹션 순서를 보존한다.
- 유료 리포트의 주장·조언·예시·표 내용은 추가·삭제하지 않는다.
- 결과 유형 산정, 점수, 무료 결과, 결제·잠금·로그를 변경하지 않는다.
- 기존 리포트 맵, 카드 확장, 다음 분석, 모바일 표 표현, 색상·폰트 방향을 유지한다.
- 새 패키지와 새 런타임 문장 분해 로직을 추가하지 않는다.
- 커밋·푸시는 사용자가 명시적으로 요청할 때만 수행한다.

---

### Task 1: 가독성 회귀를 막는 정적 계약 테스트 작성

**Files:**
- Modify: `tests/ui/palette-contract.test.mjs`
- Verify only: `src/content/resultCopy/paidReports/*.ts`

**Interfaces:**
- Consumes: 9개 `PaidReport` 정적 데이터 파일
- Produces: 문장 경계·12개 섹션·문제 해결 단계·주간 행동 단위를 검사하는 테스트

- [ ] **Step 1: 실패하는 가독성 계약 테스트를 추가한다.**

  `tests/ui/palette-contract.test.mjs`에 아래 테스트를 추가한다. `reportSources`와 `keys`는 기존 `유료 리포트는 9개 결과 유형을 모두 제공한다` 테스트에서 새로 읽지 말고, 아래 테스트 안에서 같은 9개 파일을 명시적으로 읽는다.

  ```js
  test("유료 리포트는 읽기 단위와 행동 단위를 보존한다", async () => {
    const keys = ["fox", "ox", "squirrel", "hawk", "tiger", "rabbit", "deer", "swan", "otter"];
    const sources = await Promise.all(
      keys.map((key) =>
        readFile(
          new URL(`../../src/content/resultCopy/paidReports/${key}.ts`, import.meta.url),
          "utf8"
        )
      )
    );

    for (const [index, source] of sources.entries()) {
      assert.equal(/"order": 12/.test(source), true, `${keys[index]} must keep 12 sections`);
      assert.equal(/[.!?][가-힣]/.test(source), false, `${keys[index]} has joined sentences`);
      assert.equal(source.includes('"type": "list"'), true, `${keys[index]} needs action lists`);
      assert.equal(source.includes("3일 실천"), true, `${keys[index]} needs day 3 action`);
      assert.equal(source.includes("5일 점검"), true, `${keys[index]} needs day 5 check`);
      assert.equal(source.includes("1주 실험"), true, `${keys[index]} needs week 1 experiment`);
      assert.equal(source.includes("문제\\n"), true, `${keys[index]} needs problem stage`);
      assert.equal(source.includes("손실\\n"), true, `${keys[index]} needs loss stage`);
      assert.equal(source.includes("해법\\n"), true, `${keys[index]} needs solution stage`);
    }
  });
  ```

- [ ] **Step 2: 테스트가 현재 데이터에서 실패하는지 확인한다.**

  Run: `npm run test:ui`  
  Expected: 문장부호 뒤에 바로 붙은 한글과 `list`·문제 단계 블록 부재 때문에 새 테스트가 실패한다.

### Task 2: 핵심 판정·키워드·실행 요약의 문장 경계를 정리

**Files:**
- Modify: `src/content/resultCopy/paidReports/fox.ts`
- Modify: `src/content/resultCopy/paidReports/ox.ts`
- Modify: `src/content/resultCopy/paidReports/squirrel.ts`
- Modify: `src/content/resultCopy/paidReports/hawk.ts`
- Modify: `src/content/resultCopy/paidReports/tiger.ts`
- Modify: `src/content/resultCopy/paidReports/rabbit.ts`
- Modify: `src/content/resultCopy/paidReports/deer.ts`
- Modify: `src/content/resultCopy/paidReports/swan.ts`
- Modify: `src/content/resultCopy/paidReports/otter.ts`

**Interfaces:**
- Consumes: 기존 1·2·4번 섹션의 `PaidReportBlock[]`
- Produces: 문장당 읽기 단위를 가진 `paragraph`와 라벨/본문이 분리된 `highlight`

- [ ] **Step 1: 1번 섹션을 한 줄 판정과 2~3문장 문단으로 분리한다.**

  모든 파일의 `section-1`에서 `한 줄 정리` 강조 블록은 유지한다. 뒤의 설명은 문장 끝마다 공백 또는 줄바꿈을 넣고, 2~3문장 단위로 별도 `paragraph` 블록으로 나눈다. 예를 들어 `ox.ts`의 첫 설명은 다음처럼 구성한다.

  ```ts
  {
    type: "paragraph",
    text: "황소형은 한 번에 크게 치고 나가기보다, 맡은 일을 꾸준히 해내고 안정적으로 결과를 쌓는 힘이 강해요.\n반복되는 업무, 정리, 관리, 운영처럼 누군가는 꼭 해야 하지만 귀찮아하는 일을 오래 책임질 수 있습니다.",
  },
  {
    type: "paragraph",
    text: "월급 밖 수익을 만들려면 “더 열심히 일하기”보다 반복 가능한 실무를 월 단위 계약으로 바꾸는 구조가 필요해요.",
  },
  ```

- [ ] **Step 2: 2번·4번 섹션의 라벨과 설명을 분리한다.**

  이미 `highlight`로 분리된 `재물 흐름`·`강한 축`·`막히는 축`·`보조 해석`·`추천 수익화`·`주의할 패턴`, 그리고 실행 요약의 6개 라벨을 유지한다. `보조 해석` 본문처럼 제목과 설명이 붙어 있는 경우에는 줄바꿈을 넣는다.

  ```ts
  {
    type: "highlight",
    label: "보조 해석",
    text: "실무 축적 기질\n맡은 일을 끝까지 해내는 힘이 있어요.\n다만 성실함만 앞세우면 수익이 아니라 노동량만 늘어날 수 있습니다.",
  },
  ```

- [ ] **Step 3: 문장 결합을 전 파일에서 제거한다.**

  각 문자열의 `요.다만`, `니다.수익`, `요.그래서` 같은 문장부호 뒤 붙은 문장을 문장 단위로 나눈다. 질문형 문장도 `?` 뒤에 줄바꿈을 둔다. 표의 셀 값, 상품명, 숫자, URL은 바꾸지 않는다.

- [ ] **Step 4: 계약 테스트를 실행한다.**

  Run: `npm run test:ui`  
  Expected: 문장 결합 관련 실패는 사라지고, 아직 구조화하지 않은 행동 목록과 문제 단계 조건만 실패한다.

### Task 3: 수익 확장과 문제 해결 흐름을 단계형 블록으로 전사

**Files:**
- Modify: `src/content/resultCopy/paidReports/fox.ts`
- Modify: `src/content/resultCopy/paidReports/ox.ts`
- Modify: `src/content/resultCopy/paidReports/squirrel.ts`
- Modify: `src/content/resultCopy/paidReports/hawk.ts`
- Modify: `src/content/resultCopy/paidReports/tiger.ts`
- Modify: `src/content/resultCopy/paidReports/rabbit.ts`
- Modify: `src/content/resultCopy/paidReports/deer.ts`
- Modify: `src/content/resultCopy/paidReports/swan.ts`
- Modify: `src/content/resultCopy/paidReports/otter.ts`

**Interfaces:**
- Consumes: `highlightStages(text)`의 단계 라벨 `문제`, `손실`, `해법`
- Produces: 7번 섹션의 세 단계 확장 흐름과 8번 섹션의 문제별 단계형 카드

- [ ] **Step 1: 7번 섹션의 세 확장 단계를 독립 강조 블록으로 나눈다.**

  `첫 수익 만들기`, `반복 수익 만들기`, `고수익으로 키우기`를 각각 `highlight` 블록으로 만들고, 원래 문장 순서를 유지한다. 단품/확장 상품 표는 기존 `table` 블록으로 유지한다.

  ```ts
  {
    type: "highlight",
    label: "첫 수익 만들기",
    text: "처음에는 큰 프로젝트보다 작고 분명한 실무 대행이 좋아요.\n예를 들면 자료 정리, 문서 정리, 일정 관리, 게시물 업로드, 고객 응대 정리처럼 결과가 눈에 보이는 일이 좋습니다.",
  },
  {
    type: "highlight",
    label: "반복 수익 만들기",
    text: "한 번 맡은 업무는 작업 순서와 기준을 남겨야 해요.\n업무 요청 방식, 작업 시간, 결과물 형식, 수정 가능 범위를 정리하면 반복 계약으로 바꾸기 쉽습니다.",
  },
  ```

- [ ] **Step 2: 8번 섹션의 각 문제를 단계형 강조 블록으로 만든다.**

  `문제 1`·`문제 2`·`문제 3`마다 `highlight` 하나를 만들고, `text`는 정확히 `문제`, `손실`, `해법` 순서의 줄바꿈 구조를 사용한다. 렌더러가 자동으로 3단계를 나눈다.

  ```ts
  {
    type: "highlight",
    label: "문제 1: 월급 구조에 갇힘",
    text: "문제\n돈은 정해진 시간 동안 일해야 받는 것이라고 생각하기 쉬워요.\n손실\n잘하는 실무가 있어도 시간제 노동이나 단건 작업에서 멈출 수 있습니다.\n해법\n업무를 시간 단위가 아니라 서비스 단위로 정리하세요.\n“몇 시간 일합니다”보다 “매달 이 업무를 이 결과물로 관리합니다”가 맞습니다.",
  },
  ```

- [ ] **Step 3: 기존 8번 섹션의 도입 성향과 마무리 문장을 유지한다.**

  `먼저 보이는 성향`은 제목 `highlight`와 목록 `list`로 분리하고, 문제 블록 뒤의 종합 문장은 독립 `paragraph`로 둔다. 원래 항목의 순서와 문장을 바꾸지 않는다.

- [ ] **Step 4: 계약 테스트를 실행한다.**

  Run: `npm run test:ui`  
  Expected: 문제·손실·해법 단계 조건이 통과하고, 주간 행동 목록 조건만 남는다.

### Task 4: 주간 플랜을 행동 목록으로 구조화하고 전체 검증

**Files:**
- Modify: `src/content/resultCopy/paidReports/fox.ts`
- Modify: `src/content/resultCopy/paidReports/ox.ts`
- Modify: `src/content/resultCopy/paidReports/squirrel.ts`
- Modify: `src/content/resultCopy/paidReports/hawk.ts`
- Modify: `src/content/resultCopy/paidReports/tiger.ts`
- Modify: `src/content/resultCopy/paidReports/rabbit.ts`
- Modify: `src/content/resultCopy/paidReports/deer.ts`
- Modify: `src/content/resultCopy/paidReports/swan.ts`
- Modify: `src/content/resultCopy/paidReports/otter.ts`
- Test: `tests/ui/palette-contract.test.mjs`

**Interfaces:**
- Consumes: `PaidReportListBlock` (`type: "list"`, `title`, `items`)
- Produces: 3일·5일·1주 단위가 각각 행동 목록으로 읽히는 12번 섹션

- [ ] **Step 1: 12번 섹션의 도입·행동 단위·마무리를 나눈다.**

  각 리포트에서 주간 목표는 `paragraph`로 남긴다. `3일 실천`, `5일 점검`, `1주 실험`은 `highlight`로 설명을 두고, 바로 뒤의 선택·기록·실행 항목은 `list`로 만든다.

  ```ts
  {
    type: "highlight",
    label: "3일 실천: 반복 업무 1개 고르기",
    text: "아래 중 하나를 고르세요.",
  },
  {
    type: "list",
    items: ["자료 정리", "문서 작성", "엑셀 관리", "일정 관리", "게시물 업로드", "고객 응대 정리", "운영 보조", "체크리스트 관리"],
  },
  ```

- [ ] **Step 2: 질문·기록 항목도 목록으로 바꾼다.**

  `그리고 세 가지를 적어보세요.`, `반응은 이렇게 기록하세요.`는 `paragraph` 또는 `highlight`로 유지하고, 뒤의 질문·기록 항목은 원래 순서의 `list`로 만든다. 문장을 합치거나 새 문장을 만들지 않는다.

- [ ] **Step 3: UI 계약 테스트를 통과시킨다.**

  Run: `npm run test:ui`  
  Expected: 전체 테스트 통과.

- [ ] **Step 4: 수정한 파일을 린트한다.**

  Run: `npm run lint -- src/content/resultCopy/paidReports/*.ts tests/ui/palette-contract.test.mjs`  
  Expected: ESLint 오류 0개.

- [ ] **Step 5: 프로덕션 빌드를 실행한다.**

  Run: `npm run build`  
  Expected: TypeScript와 `/report` 경로를 포함한 빌드 완료.

- [ ] **Step 6: 390px 리포트 읽기 흐름을 확인한다.**

  1. `admin22` 결과에서 상세 리포트로 이동한다.
  2. `막히는 지점`을 확장해 문제·손실·해법 3단계가 분리됐는지 확인한다.
  3. `이번 주 맞춤 플랜`을 확장해 3일·5일·1주 행동 목록이 각각 보이는지 확인한다.
  4. `다음 분석 읽기`를 눌러 기존 전환이 유지되는지 확인한다.
  5. 가로 넘침과 콘솔 오류를 확인한다.

- [ ] **Step 7: 변경 범위를 확인한다.**

  Run: `git diff --check && git diff -- src/content/resultCopy/paidReports tests/ui/palette-contract.test.mjs`  
  Expected: 공백 오류가 없고, 리포트 데이터와 테스트 외의 제품 로직 변경이 없음.
