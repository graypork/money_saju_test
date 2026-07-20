# Free Result Source Audit

## 1. Executive Summary

현재 무료 결과의 실제 문구 source는 `src/lib/animalTypeBank.ts`이고, `app/result/page.tsx`는 `calculateWealthResult()` 뒤에 `buildResultCopy(result)`를 호출해 그 bank의 값을 화면에 전달한다. 유료 리포트의 source는 9개 `src/content/resultCopy/paidReports/*.ts`와 `paidReportWeeklyPlans.ts`이며, `paidReportBank.ts`가 이를 `animalKey`로 조회한다.

두 화면은 같은 URL 입력으로 결과를 각각 다시 계산하고 동일한 `builtCopy.animalKey`를 얻지만, 문구 객체와 렌더링 데이터는 공유하지 않는다. 따라서 현재 구조 분류는 **C: 무료 결과와 유료 리포트가 독립된 데이터 구조**다. key만 공유한다.

9개 유형 중 호랑이형만 무료의 확장·검증 방향과 유료의 결제 검증 방향이 직접 이어진다. 매·사슴·백조형은 일부만 맞고, 나머지 5개는 핵심 자산·돈 누수·첫 행동이 canonical 포지션과 다르다. 무료 결과 페이지 자체를 삭제할 근거는 없지만, 문구 데이터 계층은 **재구성**이 필요하다.

## 2. Current Free Result Data Flow

`WealthResult`에는 `animalKey` 필드가 없다. 결과의 `saju.dayMaster`를 `copyEngine`이 읽어 천간 key로 정규화하고, `animalTypeBank`의 `stemToAnimalKeyMap`으로 9개 유형 key를 만든다. 천간이 없을 때만 오행 fallback, 마지막에는 fox fallback을 사용한다. 근거: `copyEngine.ts:190-223`, `animalTypeBank.ts:1608-1650`.

```text
URL query
→ app/result/page.tsx ResultContent
→ calculateWealthResult(input)
→ result.saju.dayMaster
→ buildResultCopy(result)
→ animalTypeBank[animalKey]
→ CoreDecisionPreview({ result, builtCopy, reportHref })
→ /result 무료 화면
```

| 무료 화면 항목 | 렌더링 컴포넌트 | 전달 prop | 생성 함수 | 최종 source |
| --- | --- | --- | --- | --- |
| 동물 유형명·유형 라벨 | `CoreDecisionPreview` | `builtCopy.title`, `archetype` | `buildResultCopy` | `animalTypeBank[animalKey].title/archetype` |
| 한 줄 판정·설명 | `CoreDecisionPreview` | `title`, `firstImpression` | `buildResultCopy` | `animalTypeBank.copy.firstImpression` |
| 돈을 만드는 방향 | `DecisionReason` | `builtCopy.moneyFlow` | `buildResultCopy` | `animalTypeBank.copy.moneyFlow` |
| 돈이 새는 패턴 | `DecisionReason` | `builtCopy.repeatedPatterns[0]` | `buildResultCopy` | `animalTypeBank.copy.repeatedPatterns[0]` |
| 강점·키워드 | 현재 별도 렌더링 없음 | 없음 | 해당 없음 | `BuiltResultCopy`에 전용 strength field가 없고, `result.copy`도 이 페이지에서 읽지 않음 |
| 행동 조언 | 현재 렌더링 없음 | 없음 | `buildResultCopy`는 `advice`·3/5/7일 action을 만들지만 전달하지 않음 | `animalTypeBank.copy.advice/threeDayAction/fiveDayCheck/oneWeekExperiment` |
| 점수·수치 | `CoreDecisionPreview` | `result.topPercent` | `calculateWealthResult` | `score.ts`의 display score/top percent 계산 |
| 그래프 | 현재 렌더링 없음 | 없음 | 해당 없음 | 없음 |
| 구매 전 미리보기 | `LockedReportPreview` | 없음 | 해당 없음 | `app/result/page.tsx`의 고정 배열 |
| CTA 주변 문구 | `CoreDecisionPreview` | `reportHref` | query string 재사용 | 버튼·면책 문구는 `app/result/page.tsx` 고정 문자열; `builtCopy.cta`는 미사용 |

화면 바인딩은 `app/result/page.tsx:372-429`, 결과 계산과 props 전달은 `:476-534`에 있다. 특히 기존 `src/lib/result/animalTypes.ts`의 12개 유형과 `renderResultCopy()`는 `calculateWealthResult()` 안에서 생성돼 `result.animalType`·`result.copy`로 반환되지만, 현재 `/result`와 `/report`는 이를 읽지 않는다. 이는 화면 source가 아니라 잠재적인 구형 병행 데이터 경로다.

## 3. Current Paid Report Data Flow

```text
동일 URL query
→ app/report/page.tsx ReportContent
→ calculateWealthResult(input)
→ buildResultCopy(result).animalKey
→ getPaidReportByAnimalKey(animalKey)
→ paidReportBank (9개 report + section 12 weekly plan 결합)
→ PaidReportView
→ PaidReportSectionNavigator의 12개 섹션 렌더링
```

`app/report/page.tsx:126-175`는 무료 화면과 같은 입력으로 결과와 `builtCopy`를 다시 만들고, 같은 key로 report를 조회한다. 고정 sample이나 임시 animal key는 없다. 조회 실패 시에만 오류 UI를 보여 준다.

`paidReportBank.ts:3-43`는 9개 원문 report를 import하고, `withWeeklyPlan()`에서 section 12의 block을 비우고 `paidReportWeeklyPlans[animalKey]`를 붙인다. `PaidReportView`는 전달된 `report.sections`를 모두 카드로 렌더링하고, section 12에는 `WeeklyPlan`을 사용한다 (`PaidReportSectionNavigator.tsx:300-379, 815-824, 872-876`).

`/result`는 `paidReportBank`나 `PaidReportView`를 import하지 않는다. 반대로 유료 화면은 무료 preview의 `moneyFlow`, `repeatedPatterns`, CTA를 읽지 않는다. `app`, `src/components`의 unlock/payment/checkout 검색에서도 조건 분기는 확인되지 않았고, 현재 `/report`는 유효한 query가 있으면 전체 12개 섹션을 렌더링한다.

## 4. Structure Classification

**결론: C — 독립 데이터 구조.**

- A가 아닌 이유: 무료 화면은 유료 section/block을 직접 선택하거나 렌더링하지 않는다.
- B가 아닌 이유: 두 화면은 동일 canonical 콘텐츠 객체에서 파생되지 않는다. `animalTypeBank.copy`와 `PaidReport` 원문은 별도다.
- D가 아닌 이유: 공유하는 것은 문구 field가 아니라 `buildResultCopy()`로 계산한 key뿐이다.

## 5. Free vs Paid Comparison

비교 기준은 `docs/content/paid-report-type-position-guide.md`이며, 유료는 section 1·2·4·8과 실제 section 12 source인 weekly plan만 확인했다.

| 유형 | 무료 핵심 포지션 | 유료 핵심 포지션 | 일치 여부 | 주요 차이 |
| --- | --- | --- | --- | --- |
| 여우 | 소비 속도·충동 결제 지연 | 전환 감각·근거 있는 세일즈 기획 | 불일치 | 무료는 소비 관리, 유료는 문구·상품화·구매 전환 |
| 황소 | 보류·지출 결정 지연 | 반복 실무를 월 계약으로 전환 | 불일치 | 무료 title은 `소형`, 유료·guide는 `황소형`; 자산과 첫 행동 모두 다름 |
| 다람쥐 | 세부 지출 관리·성장비 | 축적 자료를 템플릿으로 상품화 | 불일치 | 무료는 가계 관리, 유료는 자료 상품화 |
| 매 | 수익 가능성 선별·작은 실험 | 문제 진단을 고객 언어·결과물로 전환 | 부분 일치 | 판단·검증은 겹치나 진단 상품과 고객 언어가 빠짐 |
| 호랑이 | 성장 가능성·작은 검증 | 결제 검증 후 빠른 확장 | 일치 | 무료 3/5/7일 행동도 유료의 신청·결제 기준으로 자연스럽게 이어짐 |
| 토끼 | 작은 연결·틈새 제안 | 안전 설계·저위험 실험 상품 | 불일치 | 무료는 기회 포착, 유료는 위험 감지와 초보자 안전 상품 |
| 사슴 | 표현·콘텐츠 공개 | 결과물·신뢰를 가격 있는 서비스로 전환 | 부분 일치 | 공개 행동은 맞지만 후기·가격·재구매 구조가 빠짐 |
| 백조 | 품질·최소 판매 기준 | 이미지·브랜드 가치를 판매 전달물로 전환 | 부분 일치 | 완성도/가격은 겹치나 브랜드 상품·전후 기준이 빠짐 |
| 수달 | 직감 신호 기록·근거 확인 | 관계를 범위·가격 있는 서비스로 전환 | 불일치 | 무료는 불안/신호 관리, 유료는 관계·협업·경계 설정 |

유료 9개는 guide의 핵심 실행 방향과 section 12 weekly plan이 일관된다. 반면 무료는 동물명은 같아도 이전의 개인 소비·지출 관리 프레임이 남아 있어, 무료에서 유료의 수익화 포지션으로 넘어가는 연결이 약하다.

## 6. Conversion Continuity Findings

현재 무료는 유형명, 금전 흐름 한 문장, 반복 패턴 하나를 보여 주므로 유료 본문을 과도하게 공개하지는 않는다. 그러나 `advice`와 3/5/7일 action은 화면에 나오지 않고, 보이는 행동은 유료 수익화 행동이 아니라 무료 bank의 개인 소비 행동인 경우가 많다. 따라서 `유형 납득 → 돈 누수 인식 → 첫 행동 → 유료 필요` 중 마지막 두 단계가 자주 끊긴다.

고정 preview의 “돈이 새는 반복 패턴”과 “현실적인 전략”은 유료 자료와 대체로 관련 있지만, “수익이 커지는 시점”은 `PaidReport`의 특정 field나 section과 직접 연결돼 있지 않다. CTA가 거짓이라고 단정할 근거는 없지만, 유형별 유료 내용과 연결된 약속도 아니다.

## 7. Risks

- `animalTypeBank`의 9개 현재 유형과 `src/lib/result/animalTypes.ts`의 12개 구형 유형이 동시에 계산 경로에 있다. 후자는 현재 화면 source는 아니지만, 재사용 시 거북·곰·늑대 등 이전 명칭을 다시 노출할 위험이 있다.
- `animalTypeBank`의 ox title은 실제 무료 화면에 보이는 `소형`이고, canonical/paid는 `황소형`이다.
- 무료와 유료가 별도 원고라 한쪽의 포지션 수정이 다른 쪽에 전파되지 않는다.
- `/report`에는 unlock 조건이 없어, “잠금 preview”는 접근 제어가 아니라 무료 화면의 안내 표현이다.

## 8. Recommended Architecture

| 선택지 | 장점 | 한계 |
| --- | --- | --- |
| 1. 기존 무료 copy 수동 동기화 | 가장 작은 초기 변경 | 9개 유형 × 다수 field를 사람이 계속 맞춰야 하며 현재 불일치가 재발하기 쉬움 |
| 2. 유료 section 직접 노출 | 새 문구를 적게 씀 | 무료 범위 제어가 어려우며 section/block UI와 12개 본문에 의존해 과다 공개 위험이 큼 |
| 3. 공통 key 기반 무료 전용 projection | 무료 범위가 명확하고 유료 본문을 import하지 않음 | 9개 preview를 새로 정리하고 key 완전성 검증이 필요 |

**권장: 선택지 3의 `freeResultBank[animalKey]`.** `PaidReportAnimalKey`와 같은 9개 key를 사용하고 다음 public field만 둔다.

```ts
type FreeResultPreview = {
  oneLine: string;
  strength: string;
  moneyLeak: string;
  firstAction: string;
  unlockTeaser: string;
};
```

`paidReport.freePreview`는 한 객체 안에서 관리하기 쉬운 반면, 무료 페이지가 전체 유료 report와 12개 block을 import하게 된다. 현재처럼 무료 공개 범위를 작게 유지하려면 `freeResultBank`가 더 적합하다. 대신 `PaidReportAnimalKey` 기반 `Record`와 9개 key 완전성 검증을 두고, 각 값은 position guide와 section 1·2·4·8·12를 검수 기준으로 삼아야 한다.

## 9. Recommended Migration Order

1. guide와 현재 유료 핵심 섹션을 기준으로 9개 `FreeResultPreview`를 확정한다.
2. `PaidReportAnimalKey`를 key 계약으로 쓰는 `freeResultBank`를 추가한다.
3. `copyEngine`은 동물 key 해석 역할만 유지하거나 얇은 adapter로 축소한다.
4. `/result`의 title, strength, leak, first action, teaser만 새 preview에 연결한다. 유료 section/block은 연결하지 않는다.
5. 9개 key 존재·명칭 일치·무료/유료 포지션 일치 검증 후, 기존 `animalTypeBank.copy`의 미사용 field 정리 범위를 별도 승인받는다.

## 10. Expected Implementation Files

- 신규: `src/content/resultCopy/freeResultBank.ts`
- 수정 예상: `app/result/page.tsx`, `src/lib/copyEngine.ts`
- 후속 정리 후보(별도 승인): `src/lib/animalTypeBank.ts`
- 검증 추가가 승인될 경우: 무료/유료 key와 포지션 계약을 확인하는 테스트 파일

권장안에서는 `paidReportBank.ts`, `paidReportWeeklyPlans.ts`, 9개 유료 원문, `PaidReportSectionNavigator.tsx`, `app/report/page.tsx`를 바꿀 필요가 없다.

## 11. Files That Must Remain Untouched

무료 재구성의 첫 구현에서도 `src/lib/score.ts`, `src/lib/saju.ts`, `src/lib/result/selectAnimalType.ts`, 사주·점수·동물 판정 로직, `paidReportBank.ts`, `paidReportWeeklyPlans.ts`, 9개 유료 원문, payment/unlock, admin/log, Google Sheets, 테스트·설정은 유지한다. 이번 감사에서는 위 파일을 수정하지 않았고, 이 문서만 생성했다.
