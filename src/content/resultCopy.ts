import type { WealthResult } from "../lib/score";

type ResultMission = {
  title: string;
  body: string;
};

export type ResultCopy = {
  title: string;
  subtitle: string;
  openingScene: string;
  moneyPattern: string;
  elementReason: string;
  riskPoint: string;
  actionAdvice: string;
  missions: {
    threeDays: ResultMission;
    fiveDays: ResultMission;
    sevenDays: ResultMission;
  };
};

const ELEMENT_LABEL: Record<WealthResult["dominantElement"], string> = {
  fire: "화",
  wood: "목",
  water: "수",
  earth: "토",
  metal: "금",
};

const WEAK_ELEMENT_MISSION: Record<
  WealthResult["weakElement"],
  ResultMission
> = {
  fire: {
    title: "보여주지 못한 제안 점검",
    body: "상품 문구나 제안 글 하나를 밖으로 꺼내봅니다.",
  },
  water: {
    title: "흘러간 결제 기록 모으기",
    body: "자동결제와 미뤄둔 영수증을 한곳에 모읍니다.",
  },
  earth: {
    title: "고정지출 자리 확인",
    body: "구독료, 할부, 월 고정비를 먼저 표시합니다.",
  },
  metal: {
    title: "가격 없는 일 골라내기",
    body: "무료로 넘긴 일에 붙일 작은 가격을 정합니다.",
  },
  wood: {
    title: "멈춘 시작 하나 꺼내기",
    body: "올리지 못한 글이나 부업 메모 하나를 실행합니다.",
  },
};

const DOMINANT_ELEMENT_MISSION: Record<
  WealthResult["dominantElement"],
  ResultMission
> = {
  fire: {
    title: "기분 결제 하루 미루기",
    body: "돈이 들어온 날 떠오른 결제는 하루 뒤 다시 봅니다.",
  },
  wood: {
    title: "아이디어 하나만 남기기",
    body: "시작할 것 하나와 접을 것 하나를 나눕니다.",
  },
  water: {
    title: "정보 수집 멈추고 행동하기",
    body: "더 찾아보기 전에 작은 행동 하나를 끝냅니다.",
  },
  earth: {
    title: "묶인 돈과 쓸 돈 나누기",
    body: "필요한 지출과 멈출 지출을 한 줄씩 적습니다.",
  },
  metal: {
    title: "계산표 밖으로 보내기",
    body: "가격, 범위, 마감만 정해 작은 제안을 보냅니다.",
  },
};

export function getResultCopy(result: WealthResult): ResultCopy {
  const interpretation = result.interpretation;
  const strong = ELEMENT_LABEL[result.dominantElement];
  const weak = ELEMENT_LABEL[result.weakElement];
  const earning =
    interpretation.typePatternDetails.find(
      (detail) => detail.label === "돈 버는 방식",
    )?.text || interpretation.earningStyle;
  const risk =
    interpretation.typePatternDetails.find(
      (detail) => detail.label === "돈이 새는 지점",
    )?.text || interpretation.spendingRisk;

  return {
    title: interpretation.animalTitle,
    subtitle: interpretation.symbolicTitle,
    openingScene: `${interpretation.animalTitle} 결과입니다. 돈이 들어오는 방식과 새는 지점을 짧게 봅니다.`,
    moneyPattern: earning,
    elementReason: `${strong} 기운이 강하고 ${weak} 기운이 약하게 나타납니다.`,
    riskPoint: risk,
    actionAdvice: interpretation.directAdviceText,
    missions: {
      threeDays: WEAK_ELEMENT_MISSION[result.weakElement],
      fiveDays: DOMINANT_ELEMENT_MISSION[result.dominantElement],
      sevenDays: {
        title: "작게 팔 형태 만들기",
        body: `${interpretation.opportunityStyle}을 작은 제안 하나로 정리합니다.`,
      },
    },
  };
}
