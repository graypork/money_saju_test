# 디자인 시스템 감사 및 문서화 실행 계획

> **에이전트 작업자용:** 이 계획을 실행할 때는 `superpowers:executing-plans`를 사용해 작업 단위별로 검토한다.

**목표:** 실제 money-saju-test UI와 지정된 Figma 범용 모바일 UI 키트를 대조하여, 코드 기준의 최종 디자인 시스템 문서와 근거 인벤토리를 작성한다.

**구성:** 프로덕션 코드의 반복 토큰과 컴포넌트만 canonical 후보로 분류한다. Figma는 노드별 실제 컨텍스트와 변수 값을 근거로 기록하되, 충돌하는 Inter·보라색 Primary 같은 범용 키트 규칙을 임의로 채택하지 않는다.

**기술:** Next.js 16.2.4, React 19.2.4, Tailwind CSS 4, TypeScript, Figma MCP 읽기 전용 조회, Markdown/YAML.

## 전역 제약

- 프로덕션 UI 코드와 비즈니스 로직은 수정하지 않는다.
- Figma는 참고 원본이며, 현재 코드와 일치하거나 채택 근거가 충분한 값만 canonical으로 선언한다.
- 기존 `AGENTS.md` 내용은 삭제·교체하지 않고, UI 문서 사용 규칙만 추가한다.
- 생성 문서는 한국어로 작성한다.
- 커밋·푸시·패키지 설치를 수행하지 않는다.

---

### Task 1: 원본과 코드 인벤토리 작성

**Files:**
- Create: `docs/design-system/figma-inventory.md`
- Create: `docs/design-system/code-inventory.md`

**산출물:** Figma 노드 ID·변수·컴포넌트 규칙과 코드의 실제 토큰·선언 파일·반복 사용 여부를 각각 독립적으로 기록한다.

- [ ] Figma Typography, Colors, Shadow, Button, Input, Navigation, Card, Tab 노드의 디자인 컨텍스트와 변수 정의를 읽기 전용으로 확인한다.
- [ ] `app/`, `src/components/`, `src/lib/uiTokens.ts`, `src/lib/animalAssets.ts`, 전역 CSS, 폰트 로딩, Tailwind 설정을 조사한다.
- [ ] 반복 토큰과 일회성 예외를 구분하고 Figma 대응 상태를 표로 기록한다.

### Task 2: 충돌 결정과 canonical DESIGN.md 작성

**Files:**
- Create: `docs/design-system/design-decisions.md`
- Create: `DESIGN.md`

**산출물:** 충돌을 근거와 함께 분류하고, 현 코드 기반의 machine-readable YAML과 설명형 명세를 작성한다.

- [ ] Figma와 코드의 폰트, Primary, 반경, 버튼, 카드, 레이아웃, 모션 충돌을 D-001 형식으로 기록한다.
- [ ] `DESIGN.md` 상단 YAML에 실제 canonical 토큰과 컴포넌트 참조를 작성한다.
- [ ] 설명형 명세에 모바일 레이아웃, 랜딩·입력·결과·유료 리포트, 동물 에셋, 긴 한국어 리포트, 접근성, 반응형, 구현 매핑, 예외와 알려진 공백을 포함한다.

### Task 3: 프로젝트 지침 연결과 문서 검증

**Files:**
- Modify: `AGENTS.md`

**산출물:** 이후 UI 작업자가 DESIGN.md를 우선 읽고, Figma 범용 키트와 Apple 포맷을 오용하지 않도록 짧은 규칙을 추가한다.

- [ ] `AGENTS.md`의 기존 규칙을 보존한 채 UI 작업 전 DESIGN.md 읽기·기존 토큰/컴포넌트 재사용·충돌 보고·범용 Figma/Apple 참고의 제한을 추가한다.
- [ ] 네 산출물의 필수 제목, YAML 키, Figma 노드 근거, 코드 경로를 정적 검색으로 확인한다.
- [ ] `git diff --check`와 `npm run build`를 실행해 문서 변경이 작업 트리를 깨뜨리지 않았는지 확인한다.
