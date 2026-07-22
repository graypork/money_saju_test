import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tokenFiles = [
  "app/globals.css",
  "src/lib/uiTokens.ts",
  "src/components/AppVersionBadge.tsx",
  "app/page.tsx",
  "src/components/BirthForm.tsx",
  "app/result/page.tsx",
  "app/report/page.tsx",
  "src/components/PaidReportSectionNavigator.tsx",
];
const forbidden = [
  "#F3D58B",
  "#FFF8ED",
  "#D98E73",
  "#E7C5B8",
  "#FFF8F1",
  "#FFFDF9",
  "#33241D",
  "#82685D",
  "rgba(217,142,115",
  "rgba(231,197,184",
  "rgba(255,248,237",
  "rgba(243,213,139",
  "rgba(51,36,29",
];

test("공통 UI 토큰은 브라운 텍스트·잉크를 사용하지 않는다", async () => {
  for (const file of tokenFiles) {
    const source = await readFile(new URL(`../../${file}`, import.meta.url), "utf8");
    for (const token of forbidden) {
      assert.equal(source.includes(token), false, `${file} contains ${token}`);
    }
  }
});

test("공통 UI 토큰은 승인된 semantic palette와 dark CTA를 사용한다", async () => {
  const source = await readFile(
    new URL("../../src/lib/uiTokens.ts", import.meta.url),
    "utf8"
  );

  for (const marker of [
    'page: "#FBF5E7"',
    'surface: "#EFE9DB"',
    'textPrimary: "#202020"',
    'textSecondary: "#746F67"',
    'actionPrimary: "#222222"',
    'textOnDark: "#FFF9ED"',
    'accentBlue: "#BACCEC"',
    'accentPink: "#F6BBDD"',
    'accentYellow: "#F6DA6E"',
    'accentSage: "#A2AE6E"',
    'borderSubtle: "#DDD6C8"',
    "bg-[#222222] text-[#FFF9ED]",
  ]) {
    assert.equal(source.includes(marker), true, `uiTokens.ts is missing ${marker}`);
  }
});

test("생년 정보 폼은 연결된 라벨과 대화상자 피커를 제공한다", async () => {
  const source = await readFile(
    new URL("../../src/components/BirthForm.tsx", import.meta.url),
    "utf8"
  );

  for (const marker of [
    "htmlFor",
    'role="dialog"',
    'aria-modal="true"',
    "aria-describedby",
    "Escape",
    "testCaseCode",
  ]) {
    assert.equal(source.includes(marker), true, `BirthForm.tsx is missing ${marker}`);
  }
});

test("무료 결과는 유형별 핵심 판정 맛보기만 노출한다", async () => {
  const source = await readFile(
    new URL("../../app/result/page.tsx", import.meta.url),
    "utf8"
  );

  for (const marker of [
    "핵심 판정",
    "판정의 근거",
    "상세 리포트에서 이어서 확인할 분석",
    "상세 리포트에서 분석 이어보기",
    "/report?${searchParams.toString()}",
    'testCaseCode.trim() === "admin22"',
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

test("무료 결과 bank는 승인된 9개 유형 카피를 사용한다", async () => {
  const bankPath = new URL(
    "../../src/content/resultCopy/freeResultBank.ts",
    import.meta.url
  );

  assert.equal(existsSync(bankPath), true, "freeResultBank.ts is required");

  const [bank, draft] = await Promise.all([
    readFile(bankPath, "utf8"),
    readFile(
      new URL("../../docs/content/free-result-copy-draft.md", import.meta.url),
      "utf8"
    ),
  ]);
  const entries = [
    ...draft.matchAll(
      /## (?<animalName>[^\n]+)\n\n- 코드 key: `(?<animalKey>[^`]+)`\n- 핵심 기준: [^\n]+\n- oneLine: (?<oneLine>[^\n]+)\n- strength: (?<strength>[^\n]+)\n- moneyLeak: (?<moneyLeak>[^\n]+)\n- firstAction: (?<firstAction>[^\n]+)\n- unlockTeaser: (?<unlockTeaser>[^\n]+)/g
    ),
  ];

  assert.equal(entries.length, 9, "the final draft must contain nine types");

  for (const entry of entries) {
    const { animalName, animalKey, ...fields } = entry.groups;

    assert.equal(bank.includes(`${animalKey}: {`), true, `missing ${animalKey}`);
    assert.equal(
      bank.includes(`animalName: "${animalName}",`),
      true,
      `missing ${animalName} name`
    );

    for (const [field, value] of Object.entries(fields)) {
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      assert.equal(
        new RegExp(`${field}:\\s*"${escapedValue}",`).test(bank),
        true,
        `${animalName} ${field} does not match the approved draft`
      );
    }
  }

  for (const marker of [
    "export type FreeResultPreview",
    "import type { PaidReportAnimalKey }",
    "getFreeResultByAnimalKey",
  ]) {
    assert.equal(bank.includes(marker), true, `freeResultBank.ts is missing ${marker}`);
  }

  assert.match(
    bank,
    /Record\s*<\s*PaidReportAnimalKey,\s*FreeResultPreview\s*>/,
    "freeResultBank.ts must cover the paid report animal key union"
  );

  assert.equal(
    /import\s+(?!type\s+).*from\s+["'][^"']*paidReport(?:Bank|WeeklyPlans|s\/)/.test(bank),
    false,
    "free result bank must not import paid report runtime data"
  );
});

test("결과 화면은 기존 계산 결과의 animalKey로 새 무료 결과 bank를 조회한다", async () => {
  const source = await readFile(
    new URL("../../app/result/page.tsx", import.meta.url),
    "utf8"
  );
  const corePreview = source.match(
    /function CoreDecisionPreview[\s\S]*?(?=\nfunction InvalidResult)/
  )?.[0];

  assert.ok(corePreview, "CoreDecisionPreview is required");

  for (const marker of [
    "getFreeResultByAnimalKey",
    "const freeCopy = getFreeResultByAnimalKey(builtCopy.animalKey);",
    "freeCopy: FreeResultPreview",
    "{freeCopy.animalName}",
    "{freeCopy.oneLine}",
    "{freeCopy.strength}",
    "{freeCopy.moneyLeak}",
    "{freeCopy.firstAction}",
    "<LockedReportPreview teaser={freeCopy.unlockTeaser} />",
  ]) {
    assert.equal(source.includes(marker), true, `result/page.tsx is missing ${marker}`);
  }

  for (const legacyField of [
    "builtCopy.title",
    "builtCopy.archetype",
    "builtCopy.rankText",
    "builtCopy.firstImpression",
    "builtCopy.moneyFlow",
    "builtCopy.elementReading",
    "builtCopy.repeatedPatterns",
    "builtCopy.advice",
  ]) {
    assert.equal(
      corePreview.includes(legacyField),
      false,
      `CoreDecisionPreview still renders ${legacyField}`
    );
  }
});

test("상세 리포트는 모자이크 탐색 안내와 선택 상태를 제공한다", async () => {
  const [reportPage, navigator] = await Promise.all([
    readFile(new URL("../../app/report/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../../src/components/PaidReportSectionNavigator.tsx", import.meta.url),
      "utf8"
    ),
  ]);

  for (const marker of [
    "카드를 선택해 자세한 분석을 열어보세요.",
    'borderColor: expanded ? "#222222"',
    'aria-expanded="true"',
    'aria-expanded="false"',
    'data-report-card-grid="all"',
    'data-report-reading-mode={expandedSectionIndex !== null ? "true" : "false"}',
    'data-report-reading-surface="true"',
    'data-report-mobile-table="true"',
    "opacity-55",
    "data-report-reading-lead",
    'data-report-highlight-stage="true"',
    'data-report-next-section="true"',
    "다음 분석 읽기",
    "handleToggle(index + 1)",
  ]) {
    assert.equal(
      navigator.includes(marker),
      true,
      `PaidReportSectionNavigator.tsx is missing ${marker}`
    );
  }

  assert.equal(
    reportPage.includes("/result?${searchParams.toString()}"),
    true,
    "report/page.tsx must preserve the result query string"
  );
});

test("유료 리포트 모바일 renderer는 정보 성격별 시각 구조를 제공한다", async () => {
  const navigator = await readFile(
    new URL("../../src/components/PaidReportSectionNavigator.tsx", import.meta.url),
    "utf8"
  );

  for (const marker of [
    "MetricScale",
    "GrowthTimeline",
    "TalentNarrativeList",
    "ExpansionRoadmap",
    "SituationFlow",
    "PatternShift",
    "AvoidanceAlternatives",
    'data-report-mobile-format="metric-scale"',
    'data-report-mobile-format="growth-timeline"',
    'data-report-mobile-format="talent-list"',
    'data-report-mobile-format="expansion-roadmap"',
    'data-report-mobile-format="pattern-shift"',
    'data-report-mobile-format="avoid-alternatives"',
    'data-report-situation-flow="true"',
  ]) {
    assert.equal(navigator.includes(marker), true, `missing ${marker}`);
  }
});

test("유료 리포트는 9개 결과 유형을 모두 제공한다", async () => {
  const [bank, reportPage, ...reportSources] = await Promise.all([
    readFile(
      new URL("../../src/content/resultCopy/paidReportBank.ts", import.meta.url),
      "utf8"
    ),
    readFile(new URL("../../app/report/page.tsx", import.meta.url), "utf8"),
    ...[
      "fox",
      "ox",
      "squirrel",
      "hawk",
      "tiger",
      "rabbit",
      "deer",
      "swan",
      "otter",
    ].map((key) =>
      readFile(
        new URL(`../../src/content/resultCopy/paidReports/${key}.ts`, import.meta.url),
        "utf8"
      )
    ),
  ]);
  const keys = [
    "fox",
    "ox",
    "squirrel",
    "hawk",
    "tiger",
    "rabbit",
    "deer",
    "swan",
    "otter",
  ];

  for (const [index, key] of keys.entries()) {
    assert.equal(
      reportSources[index].includes(`animalKey: "${key}"`),
      true,
      `missing ${key} paid report`
    );
    assert.equal(
      bank.includes(`${key}: withWeeklyPlan(${key}Report)`),
      true,
      `missing ${key} report mapping`
    );
  }

  assert.equal(
    reportPage.includes("samplePaidReport"),
    false,
    "report page must not use swan sample"
  );
  assert.equal(
    reportPage.includes("getPaidReportByAnimalKey"),
    true,
    "report page must select a report by animal key"
  );
  assert.equal(
    reportPage.includes("상세 리포트를 준비하지 못했어요"),
    true,
    "report page must not substitute a different animal report"
  );
});

function extractReportSection(source, sectionId) {
  const nextSectionId = Number(sectionId.replace("section-", "")) + 1;
  const section = source.match(
    new RegExp(
      `"id": "${sectionId}"[\\s\\S]*?(?=\\n\\s*},\\n\\s*{\\n\\s*"id": "section-${nextSectionId}"|\\n\\s*}\\n\\s*]\\n\\s*})`
    )
  );

  return section?.[0] ?? "";
}

test("유료 리포트 section 8은 돈이 새는 상황을 설명하고 행동 지시를 포함하지 않는다", async () => {
  const keys = [
    "fox",
    "ox",
    "squirrel",
    "hawk",
    "tiger",
    "rabbit",
    "deer",
    "swan",
    "otter",
  ];
  const sources = await Promise.all(
    keys.map((key) =>
      readFile(
        new URL(`../../src/content/resultCopy/paidReports/${key}.ts`, import.meta.url),
        "utf8"
      )
    )
  );

  for (const [index, source] of sources.entries()) {
    assert.equal(
      /"order": 12/.test(source),
      true,
      `${keys[index]} must keep 12 sections`
    );
    assert.equal(
      /[.!?][가-힣]/.test(source),
      false,
      `${keys[index]} has joined sentences`
    );
    const section8 = extractReportSection(source, "section-8");
    const section10 = extractReportSection(source, "section-10");

    assert.notEqual(section8, "", `${keys[index]} needs section 8`);
    assert.equal(section8.includes('"order": 8'), true, `${keys[index]} keeps section 8 order`);
    assert.equal(section8.includes('"blocks": ['), true, `${keys[index]} keeps section 8 blocks`);
    assert.equal(
      /"(?:text|label)":\s*"\S/.test(section8),
      true,
      `${keys[index]} section 8 needs user-facing copy`
    );
    for (const phrase of [
      "적어 보세요",
      "확인해 보세요",
      "정해 보세요",
      "작성해 보세요",
      "시작해 보세요",
      "제안해 보세요",
      "해 보세요",
    ]) {
      assert.equal(section8.includes(phrase), false, `${keys[index]} section 8 contains ${phrase}`);
    }

    assert.notEqual(section10, "", `${keys[index]} needs section 10`);
    assert.equal(
      section10.includes('"title": "피해야 할 수익화 방식"'),
      true,
      `${keys[index]} section 10 title is current`
    );
  }
});

test("이번 주 맞춤 플랜은 모든 유형에서 3개 행동과 7일 disclosure 데이터를 사용한다", async () => {
  const keys = [
    "fox",
    "ox",
    "squirrel",
    "hawk",
    "tiger",
    "rabbit",
    "deer",
    "swan",
    "otter",
  ];
  const source = await readFile(
    new URL("../../src/content/resultCopy/paidReportWeeklyPlans.ts", import.meta.url),
    "utf8"
  );

  for (const key of keys) {
    for (const marker of [
      `${key}: {`,
      "focus:",
      "actions:",
      "days:",
      "caution:",
      'day: "월"',
      'day: "일"',
    ]) {
      assert.equal(
        source.includes(marker),
        true,
        `${key} weekly plan is missing ${marker}`
      );
    }

    assert.equal(
      (source.match(/title: "/g) ?? []).length >= 3,
      true,
      `${key} weekly plan needs three action titles`
    );
  }
});

test("주간 플랜은 문서 행 disclosure로 렌더링된다", async () => {
  const [navigator, types] = await Promise.all([
    readFile(
      new URL("../../src/components/PaidReportSectionNavigator.tsx", import.meta.url),
      "utf8"
    ),
    readFile(
      new URL("../../src/content/resultCopy/paidReportTypes.ts", import.meta.url),
      "utf8"
    ),
  ]);

  for (const marker of [
    "WeeklyPlan",
    "7일 계획 자세히 보기",
    "aria-controls",
    "aria-expanded={isPlanOpen}",
    "data-report-weekly-plan",
    "data-report-weekly-day",
    "min-h-11",
    "motion-reduce:transition-none",
  ]) {
    assert.equal(
      navigator.includes(marker),
      true,
      `PaidReportSectionNavigator.tsx is missing ${marker}`
    );
  }

  for (const marker of [
    "PaidReportWeeklyPlan",
    "PaidReportWeeklyAction",
    "PaidReportWeeklyDay",
    "weeklyPlan?:",
  ]) {
    assert.equal(types.includes(marker), true, `paid report types missing ${marker}`);
  }
});

test("동물 이미지는 성별별 중앙 resolver와 기존 결과 흐름을 사용한다", async () => {
  const [assets, landing, result, report, navigator] = await Promise.all([
    readFile(new URL("../../src/lib/animalAssets.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../app/result/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../app/report/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../../src/components/PaidReportSectionNavigator.tsx", import.meta.url),
      "utf8"
    ),
  ]);

  for (const marker of [
    'export type AnimalImageGender = "f" | "m"',
    "animalImagePaths",
    "resolveAnimalImageGender",
    "getAnimalImagePath",
    'female: "f"',
    'male: "m"',
    "hwak-f.webp",
    "hwak-m.webp",
  ]) {
    assert.equal(assets.includes(marker), true, `animalAssets.ts is missing ${marker}`);
  }

  assert.equal(assets.includes("-1.webp"), false, "numbered animal photo paths remain");
  assert.equal(assets.includes("animals/${key}"), false, "resolver must own asset paths");

  for (const key of [
    "deer",
    "tiger",
    "squirrel",
    "fox",
    "ox",
    "otter",
    "rabbit",
    "hawk",
    "swan",
  ]) {
    assert.equal(assets.includes(`${key}: {`), true, `missing ${key} gendered assets`);
  }

  for (const marker of [
    "getRandomLandingAnimalPreviews",
    "useState<LandingAnimalPreview[]>([])",
    "setLandingAnimalPreviews(getRandomLandingAnimalPreviews())",
    "data-animal-intro-card",
    'alt=""',
  ]) {
    assert.equal(landing.includes(marker), true, `landing is missing ${marker}`);
  }

  assert.equal(landing.includes("card.description"), false, "landing card description remains");
  assert.equal(landing.includes("card.name"), false, "landing card name remains");
  assert.match(
    landing,
    /useEffect\(\(\) => \{\s+const frame = window\.requestAnimationFrame\(\(\) => \{\s+setLandingAnimalPreviews\(getRandomLandingAnimalPreviews\(\)\);/,
    "landing random selection must wait until after hydration"
  );

  for (const source of [result, navigator]) {
    assert.equal(source.includes("resolveAnimalImageGender"), true, "image consumer misses gender mapping");
    assert.equal(source.includes("getAnimalImagePath"), true, "image consumer bypasses resolver");
  }

  assert.equal(report.includes("<PaidReportView report={report} gender={genderParam} />"), true, "report does not pass the existing gender query");
});

test("성별 미선택 결과는 기본 여성형 동물 이미지를 사용한다", async () => {
  const [assets, form, result, navigator] = await Promise.all([
    readFile(new URL("../../src/lib/animalAssets.ts", import.meta.url), "utf8"),
    readFile(new URL("../../src/components/BirthForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../app/result/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../../src/components/PaidReportSectionNavigator.tsx", import.meta.url),
      "utf8"
    ),
  ]);

  assert.equal(
    assets.includes('unknown: "f"'),
    true,
    "unknown gender must resolve to the default female image"
  );
  assert.equal(
    assets.includes("return genderMap[gender] ?? \"f\""),
    true,
    "missing gender must use the default female image"
  );
  assert.equal(
    form.includes('if (gender !== "male" && gender !== "female")'),
    false,
    "BirthForm must not block an unselected gender"
  );
  assert.equal(
    form.includes('{ label: "선택 안 함", value: "unknown" }'),
    true,
    "BirthForm must keep the unselected gender option"
  );

  for (const source of [result, navigator]) {
    assert.equal(source.includes("animal.webp"), false, "file-name fallback remains");
  }
});

test("유료 섹션 제목은 개요 카드 뒤에서 유형 접두어를 반복하지 않는다", async () => {
  const source = await readFile(
    new URL("../../src/components/PaidReportSectionNavigator.tsx", import.meta.url),
    "utf8"
  );

  for (const marker of [
    "function getSectionCardTitle",
    "const prefix = `${animalName} `;",
    "section.title.startsWith(prefix)",
    "getSectionCardTitle(section, animalName)",
    "getSectionCardTitle(nextSection, animalName)",
  ]) {
    assert.equal(source.includes(marker), true, `missing section title rule: ${marker}`);
  }
});

test("무료 결과 동물 카드는 이미지의 세로 비율에 따라 크기가 정해진다", async () => {
  const source = await readFile(
    new URL("../../app/result/page.tsx", import.meta.url),
    "utf8"
  );

  assert.equal(source.includes("min-h-[407px]"), false, "animal card must not force a fixed height");
  assert.equal(source.includes("w-full h-auto object-contain"), true, "animal image must drive card height");
});

test("랜딩 제목은 가로폭을 유지한 채 세로 비율을 높이고 섹션 간격을 압축한다", async () => {
  const source = await readFile(
    new URL("../../app/page.tsx", import.meta.url),
    "utf8"
  );

  for (const marker of [
    "origin-left scale-y-[1.06]",
    "const landingSectionRuleCompact = \"border-t border-[#DDD6C8] pt-8\"",
    "mx-auto max-w-[430px] space-y-6",
    "overflow-x-hidden overflow-y-visible pb-4 pt-2",
    "${landingSectionRuleCompact} space-y-4",
    "flex snap-x snap-mandatory gap-4 px-5 pt-0",
    "shrink-0 snap-start pt-0",
  ]) {
    assert.equal(source.includes(marker), true, `landing rhythm is missing ${marker}`);
  }
});
