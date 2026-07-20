import type { PaidReportAnimalKey } from "./paidReportTypes";

export type FreeResultAnimalKey = PaidReportAnimalKey;

export type FreeResultPreview = {
  animalName: string;
  oneLine: string;
  strength: string;
  moneyLeak: string;
  firstAction: string;
  unlockTeaser: string;
};

export const freeResultBank: Record<
  PaidReportAnimalKey,
  FreeResultPreview
> = {
  deer: {
    animalName: "사슴형",
    oneLine: "실제로 해낸 일을 보여줄 때, 쌓아 온 신뢰가 정식 의뢰로 이어져요.",
    strength: "결과를 꼼꼼히 만들고, 믿고 맡길 만한 인상을 남겨요.",
    moneyLeak: "계속 다듬기만 하면 공개가 늦어지고, 문의받을 기회도 놓칠 수 있어요.",
    firstAction: "완성한 결과물 하나에 가격과 문의 방법을 함께 붙여 공개해 보세요.",
    unlockTeaser: "결과물을 공개한 뒤, 어떤 반응을 보고 다음 작업을 정할지 유료 리포트에서 확인해요.",
  },
  tiger: {
    animalName: "호랑이형",
    oneLine: "기회가 보이면 빠르게 시작해요. 결제 전엔 비용과 작업량을 늘리지 마세요.",
    strength: "아이디어를 빠르게 정리해 실제 제안으로 내놓아요.",
    moneyLeak: "신청이나 결제가 없는데 비용부터 늘리면 지출이 매출보다 앞서요.",
    firstAction: "비용을 늘리기 전에 작은 제안 하나에 실제 결제가 들어오는지 확인해 보세요.",
    unlockTeaser: "어떤 반응이 보일 때 다음 비용을 써도 되는지 유료 리포트에서 다뤄요.",
  },
  squirrel: {
    animalName: "다람쥐형",
    oneLine: "모아 둔 자료를 다른 사람이 바로 쓸 수 있는 형태로 만들면 돈이 될 수 있어요.",
    strength: "흩어진 정보를 모으고, 자주 하는 일을 순서대로 정리해요.",
    moneyLeak: "자료를 더 채우는 동안, 이미 만든 자료를 보여줄 시기를 놓칠 수 있어요.",
    firstAction: "이미 가진 자료 하나를 바로 쓸 수 있는 체크리스트나 템플릿으로 만들어 보세요.",
    unlockTeaser: "자료를 어디까지 담고 어떻게 보여줄지 유료 리포트에서 이어서 살펴봐요.",
  },
  fox: {
    animalName: "여우형",
    oneLine: "고객이 받을 결과와 이유를 분명히 보여줄 때, 관심이 문의나 결제로 이어져요.",
    strength: "사람들의 시선을 붙잡는 표현을 잘 캐치해요.",
    moneyLeak: "반응이 좋을 때마다 문구와 제안을 바꾸면, 무엇이 문의를 만들었는지 알기 어려워요.",
    firstAction: "반응이 좋았던 문구 하나에 고객이 받을 결과를 한 줄로 붙여 보세요.",
    unlockTeaser: "반응을 보고 문구를 다듬는 기준은 유료 리포트에서 확인해요.",
  },
  ox: {
    animalName: "황소형",
    oneLine: "반복되는 일을 꼼꼼히 해내요. 계약 전에 해줄 일을 분명히 정하면 꾸준한 수입으로 이어지기 쉬워요.",
    strength: "남들이 번거로워하는 실무도 빠뜨리지 않고 챙겨요.",
    moneyLeak: "처음 말하지 않은 요청까지 계속 받으면 시간만 늘고 받은 돈은 그대로예요.",
    firstAction: "반복 업무 하나에서 해줄 일과 해주지 않을 일을 적어 보세요.",
    unlockTeaser: "반복 일을 월 단위로 맡는 기준은 유료 리포트에서 다뤄요.",
  },
  otter: {
    animalName: "수달형",
    oneLine: "사람이 자주 찾는 도움을 서비스로 정리할 때, 관계가 정식 의뢰로 이어져요.",
    strength: "도움을 찾는 사람과 알맞은 정보·방법을 자연스럽게 연결해요.",
    moneyLeak: "친한 사람의 부탁을 계속 공짜로 들어주면 정식 의뢰로 이어지기 어려워요.",
    firstAction: "자주 받는 부탁 하나를 골라, 돈을 받지 않고 답할 일과 돈을 받고 맡을 일을 나눠 보세요.",
    unlockTeaser: "자주 받는 부탁에 가격과 해줄 일을 정하는 방법은 유료 리포트에서 확인해요.",
  },
  rabbit: {
    animalName: "토끼형",
    oneLine: "문제가 생길 지점을 먼저 알아차려요. 예산과 마감일을 정하면 부담을 줄이고 작게 시작할 수 있어요.",
    strength: "새로운 일을 시작할 때 생길 수 있는 불안과 놓치기 쉬운 위험을 잘 찾아요.",
    moneyLeak: "완벽하다는 생각이 들 때까지 준비만 하면 실제 반응을 볼 시기를 놓쳐요.",
    firstAction: "이번 시도의 예산과 마감일을 먼저 적어 보세요.",
    unlockTeaser: "작게 시작한 뒤 계속할지 멈출지 판단하는 기준은 유료 리포트에서 확인해요.",
  },
  hawk: {
    animalName: "매형",
    oneLine: "복잡한 판단을 고객이 이해할 설명과 결과물로 정리하면, 다음 의뢰로 이어지기 쉬워요.",
    strength: "여러 정보 중 중요한 것과 덜 중요한 것을 빠르게 나눠요.",
    moneyLeak: "전문적인 결론만 말하면 상담이 길어져도 고객이 무엇을 받는지 알기 어려워요.",
    firstAction: "다룰 문제 하나와 고객에게 줄 결과물을 쉬운 말로 한 줄씩 적어 보세요.",
    unlockTeaser: "상담 내용을 고객이 다시 볼 수 있는 진단 결과로 남기는 방법은 유료 리포트에서 다뤄요.",
  },
  swan: {
    animalName: "백조형",
    oneLine: "신뢰를 주는 모습을 찾아, 바뀐 점을 보여주면 의뢰로 이어져요.",
    strength: "프로필이나 콘텐츠에서 어색한 인상을 찾아 더 나은 방향을 잡아요.",
    moneyLeak: "이미지만 계속 다듬고 전달할 결과를 정하지 않으면 시간만 쓰고 남는 것이 없어요.",
    firstAction: "수정 전과 수정 후를 한 장에 나란히 보여 주세요.",
    unlockTeaser: "수정 전후 비교와 진단 내용을 한 번에 보여주는 방법은 유료 리포트에서 다뤄요.",
  },
};

export function getFreeResultByAnimalKey(animalKey: string): FreeResultPreview {
  const preview = freeResultBank[animalKey as FreeResultAnimalKey];

  if (!preview) {
    throw new Error(`Unknown free result animal key: ${animalKey}`);
  }

  return preview;
}
