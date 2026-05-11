"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { calculateWealthResult } from "../../src/lib/score";

type DisplayType = {
  title: string;
  subtitle: string;
  summary: string;
  coreMessage: string;
  strengths: string[];
  cautions: string[];
  paidPreview: string;
  paidSections: {
    title: string;
    teaser: string;
  }[];
};

const DISPLAY_TYPES: Record<number, DisplayType> = {
  1: {
    title: "늦게 터지는 축적형 자산가",
    subtitle: "빨리 터지진 않지만, 한번 쌓이면 쉽게 무너지지 않는 타입",
    summary:
      "당신은 단기 한 방보다 실력, 신뢰, 경험이 쌓인 뒤 돈의 흐름이 커지는 사람입니다. 초반에는 답답할 수 있지만, 시간이 지날수록 돈그릇이 커지는 구조에 가깝습니다.",
    coreMessage:
      "당신은 돈을 못 버는 사람이 아니라, 돈이 붙기까지 시간이 필요한 사람입니다. 다만 문제는 그 시간을 버티기 전에 스스로를 너무 빨리 의심한다는 점입니다.",
    strengths: ["누적형 성장", "신뢰 기반 수익", "현실 감각", "장기전", "꾸준함"],
    cautions: [
      "초반 결과가 느리다고 방향을 너무 자주 바꾸기 쉽습니다.",
      "돈이 될 만한 흐름을 알아도 확신이 늦어 타이밍을 놓칠 수 있습니다.",
      "스스로를 과소평가하면 원래 벌 수 있는 돈보다 작게 움직이게 됩니다.",
    ],
    paidPreview:
      "전체 리포트에서는 당신이 언제부터 재물 흐름을 체감하기 쉬운지, 어떤 방식으로 돈을 쌓아야 오래 가는지 더 구체적으로 보여줍니다.",
    paidSections: [
      { title: "돈이 붙는 시기", teaser: "초반보다 후반에 강해지는 구간과 주의해야 할 시점이 드러납니다." },
      { title: "수익화 방식", teaser: "단기 알바형 수익보다 오래 쌓이는 수익 구조가 더 맞을 수 있습니다." },
      { title: "돈그릇 확장법", teaser: "지금보다 더 큰 돈을 다루기 위해 먼저 바꿔야 할 습관이 있습니다." },
    ],
  },
  2: {
    title: "감각으로 버는 크리에이터형",
    subtitle: "평범한 방식보다 감각, 표현, 콘텐츠에서 돈이 열리는 타입",
    summary:
      "당신은 정해진 틀 안에서 오래 버티는 것보다, 감각과 아이디어를 돈으로 바꾸는 쪽에 더 강합니다. 다만 흥미가 식으면 수익화 직전에 멈출 수 있습니다.",
    coreMessage:
      "당신은 돈이 안 되는 사람이 아닙니다. 문제는 아이디어가 돈이 되기 전에 질려버리거나, 완성도를 핑계로 공개를 늦추는 패턴입니다.",
    strengths: ["콘텐츠 감각", "기획력", "표현력", "브랜딩", "아이디어"],
    cautions: [
      "시작은 빠른데 지속이 약하면 돈이 되기 전에 끝납니다.",
      "남들과 다른 감각이 있어도 판매 구조가 없으면 취미로 남습니다.",
      "완벽하게 만들려다 공개 타이밍을 놓치기 쉽습니다.",
    ],
    paidPreview:
      "전체 리포트에서는 당신의 감각을 어떤 상품, 콘텐츠, 서비스로 바꿔야 돈이 되는지 구체적으로 분석합니다.",
    paidSections: [
      { title: "콘텐츠 수익화 방향", teaser: "당신에게 맞는 콘텐츠형 수익 구조가 따로 있습니다." },
      { title: "브랜딩 포인트", teaser: "사람들이 당신에게 돈을 쓰게 되는 매력 포인트를 분석합니다." },
      { title: "지속력 보완법", teaser: "질려서 접는 패턴을 줄이는 운영 방식이 필요합니다." },
    ],
  },
  3: {
    title: "안정적으로 쌓는 관리자형",
    subtitle: "큰 리스크보다 안정적인 축적에서 재물운이 강한 타입",
    summary:
      "당신은 무리한 도박형 선택보다 안정적인 구조 안에서 돈을 모으고 키우는 쪽에 강합니다. 돈을 크게 잃을 가능성은 낮지만, 너무 조심하면 기회를 작게 잡을 수 있습니다.",
    coreMessage:
      "당신의 강점은 안정성입니다. 하지만 안정만 고집하면 돈을 지키는 사람은 될 수 있어도, 돈을 크게 불리는 사람은 되기 어렵습니다.",
    strengths: ["관리력", "현실감각", "절제력", "안정성", "저축력"],
    cautions: [
      "리스크를 피하다가 성장 기회까지 같이 피할 수 있습니다.",
      "지출 관리는 잘해도 수익 확장에는 소극적일 수 있습니다.",
      "새로운 기회를 검토만 하다 끝내는 패턴이 생기기 쉽습니다.",
    ],
    paidPreview:
      "전체 리포트에서는 안정성을 유지하면서도 수익 규모를 키우는 방식과 피해야 할 재정 선택을 보여줍니다.",
    paidSections: [
      { title: "안정형 수익 전략", teaser: "무리하지 않고 돈을 늘리는 방식이 따로 있습니다." },
      { title: "투자/저축 균형", teaser: "지키는 돈과 불리는 돈의 비율을 점검합니다." },
      { title: "기회 회피 패턴", teaser: "너무 신중해서 놓치는 돈의 흐름을 분석합니다." },
    ],
  },
  4: {
    title: "기회 포착형 사업가",
    subtitle: "흐름을 보면 빠르게 움직여야 돈이 붙는 타입",
    summary:
      "당신은 가만히 기다리는 것보다 직접 움직일 때 돈의 가능성이 커집니다. 기회 감각은 있지만, 무리하게 치고 나가면 손실도 함께 커질 수 있습니다.",
    coreMessage:
      "당신은 작은 판보다 직접 판을 만들 때 강합니다. 다만 계산 없이 움직이면 돈을 버는 속도만큼 잃는 속도도 빨라질 수 있습니다.",
    strengths: ["기회 포착", "실행력", "사업 감각", "속도", "도전성"],
    cautions: [
      "확신이 생기면 검증 없이 밀어붙일 수 있습니다.",
      "초반 반응이 좋으면 과투자하기 쉽습니다.",
      "기분과 확신을 구분하지 못하면 돈이 새기 쉽습니다.",
    ],
    paidPreview:
      "전체 리포트에서는 당신이 어떤 판에서 돈을 벌기 쉬운지, 어떤 선택을 피해야 손실을 줄일 수 있는지 분석합니다.",
    paidSections: [
      { title: "사업 적성", teaser: "당신이 직접 판을 벌였을 때 강해지는 영역이 있습니다." },
      { title: "리스크 관리", teaser: "기회와 무모함을 구분하는 기준이 필요합니다." },
      { title: "돈이 붙는 행동 패턴", teaser: "움직여야 할 때와 멈춰야 할 때가 갈립니다." },
    ],
  },
  5: {
    title: "네트워크 수익형",
    subtitle: "사람, 관계, 소개, 협업에서 돈의 길이 열리는 타입",
    summary:
      "당신은 혼자 고립돼서 돈을 버는 구조보다 사람과 연결될 때 기회가 커지는 타입입니다. 다만 관계에 에너지를 많이 쓰면 정작 내 수익 구조가 약해질 수 있습니다.",
    coreMessage:
      "당신에게 돈은 사람을 타고 들어올 가능성이 큽니다. 하지만 모두에게 좋은 사람으로 남으려 하면, 정작 돈이 되는 관계를 놓칠 수 있습니다.",
    strengths: ["관계 자산", "협업", "설득력", "소개운", "호감도"],
    cautions: [
      "사람을 도와주기만 하고 돈으로 연결하지 못할 수 있습니다.",
      "거절을 못하면 내 시간과 에너지가 먼저 소진됩니다.",
      "관계는 많은데 수익 구조가 없으면 바쁘기만 하고 남는 게 적습니다.",
    ],
    paidPreview:
      "전체 리포트에서는 당신에게 돈이 되는 관계와 에너지만 빼앗는 관계를 구분하는 기준을 제시합니다.",
    paidSections: [
      { title: "돈이 되는 인맥", teaser: "어떤 사람과 연결될 때 기회가 커지는지 분석합니다." },
      { title: "협업 수익화", teaser: "관계를 실제 수익으로 바꾸는 방식이 필요합니다." },
      { title: "에너지 누수", teaser: "좋은 사람 콤플렉스가 돈을 막는 지점을 봅니다." },
    ],
  },
  6: {
    title: "전문성 수익화형",
    subtitle: "실력과 지식을 쌓을수록 돈그릇이 커지는 타입",
    summary:
      "당신은 감으로만 움직이기보다 전문성, 기술, 지식이 쌓일수록 돈을 벌 가능성이 커지는 타입입니다. 문제는 배우기만 하고 팔지 않으면 수익이 늦어진다는 점입니다.",
    coreMessage:
      "당신은 실력이 돈이 되는 타입입니다. 하지만 공부와 준비에 숨어 있으면, 실력은 늘어도 통장에는 변화가 늦게 옵니다.",
    strengths: ["전문성", "분석력", "기술 습득", "문제 해결", "신뢰"],
    cautions: [
      "준비가 더 필요하다는 생각으로 시작을 미룰 수 있습니다.",
      "실력은 있는데 가격을 낮게 부르는 패턴이 생기기 쉽습니다.",
      "배우는 시간과 파는 시간을 분리하지 않으면 수익화가 늦어집니다.",
    ],
    paidPreview:
      "전체 리포트에서는 당신의 전문성을 어떤 형태로 팔아야 돈이 되는지 구체적으로 보여줍니다.",
    paidSections: [
      { title: "전문성 수익화", teaser: "기술과 지식을 돈으로 바꾸는 구조를 분석합니다." },
      { title: "가격 책정", teaser: "너무 싸게 팔고 있는 영역이 있을 수 있습니다." },
      { title: "성장 루트", teaser: "실력을 쌓는 순서와 수익화 순서를 나눠봅니다." },
    ],
  },
  7: {
    title: "돈은 벌지만 새기 쉬운 변동형",
    subtitle: "수입 기회는 있지만 소비와 충동 관리가 핵심인 타입",
    summary:
      "당신은 돈을 아예 못 버는 구조는 아닙니다. 오히려 기회가 생기면 수입은 만들 수 있지만, 감정적 소비나 즉흥 선택으로 남는 돈이 적어질 수 있습니다.",
    coreMessage:
      "당신의 문제는 돈을 못 버는 게 아니라 돈이 머무르지 않는 구조입니다. 버는 능력보다 새는 구멍을 막는 게 먼저입니다.",
    strengths: ["빠른 반응", "감각", "기회 대응", "적응력", "소비 안목"],
    cautions: [
      "기분에 따라 돈을 쓰면 수입이 늘어도 남는 게 없습니다.",
      "갑자기 꽂힌 것에 시간과 돈을 몰아넣기 쉽습니다.",
      "수익보다 소비 만족이 앞서면 재물운 체감이 약해집니다.",
    ],
    paidPreview:
      "전체 리포트에서는 돈이 새는 패턴과 당신에게 맞는 현실적인 재정 통제 방식을 분석합니다.",
    paidSections: [
      { title: "소비 패턴", teaser: "돈이 어디서 새는지 핵심 패턴을 봅니다." },
      { title: "수입 유지법", teaser: "벌어도 남지 않는 구조를 바꾸는 방식이 필요합니다." },
      { title: "충동 관리", teaser: "감정적 선택이 돈에 미치는 영향을 분석합니다." },
    ],
  },
  8: {
    title: "후반부 대기만성형",
    subtitle: "초반보다 시간이 갈수록 돈의 흐름이 정리되는 타입",
    summary:
      "당신은 초반부터 강하게 치고 나가기보다 시행착오를 지나면서 돈의 방향이 잡히는 타입입니다. 지금 당장 결과가 약해도, 방향을 잡으면 후반부에 힘이 붙습니다.",
    coreMessage:
      "당신은 늦은 사람이 아닙니다. 다만 초반에 헤매는 시간이 길 수 있습니다. 이 시기를 실패로 보면 멈추고, 데이터로 보면 돈이 됩니다.",
    strengths: ["후반 성장", "경험 축적", "적응력", "관찰력", "방향 전환"],
    cautions: [
      "초반 시행착오를 실패로 받아들이면 쉽게 꺾입니다.",
      "방향을 너무 자주 바꾸면 쌓이는 힘이 약해집니다.",
      "남과 비교하면 원래 속도보다 더 느려질 수 있습니다.",
    ],
    paidPreview:
      "전체 리포트에서는 당신이 언제부터 흐름을 잡기 쉬운지, 지금의 시행착오를 어떻게 돈으로 바꿀지 보여줍니다.",
    paidSections: [
      { title: "후반 운 흐름", teaser: "시간이 갈수록 강해지는 구간을 분석합니다." },
      { title: "시행착오 활용법", teaser: "버린 경험처럼 보이는 것들이 돈이 되는 지점을 봅니다." },
      { title: "방향 고정 전략", teaser: "흔들림을 줄이고 쌓이게 만드는 방식이 필요합니다." },
    ],
  },
  9: {
    title: "지식/자격 기반 수익형",
    subtitle: "자격, 공부, 제도권 실력이 돈으로 연결되기 쉬운 타입",
    summary:
      "당신은 말만 앞서는 타입보다 근거, 자격, 실력, 시스템 안에서 강해지는 사람입니다. 다만 자격만 모으고 실제 수익 연결을 미루면 답답해질 수 있습니다.",
    coreMessage:
      "당신은 공부하면 돈이 되는 타입입니다. 하지만 자격증이 돈을 벌어주는 게 아니라, 자격을 어떻게 팔고 연결하느냐가 핵심입니다.",
    strengths: ["학습력", "자격 기반 신뢰", "분석력", "성실함", "제도 이해"],
    cautions: [
      "자격을 더 따야 한다는 생각으로 실전 진입을 늦출 수 있습니다.",
      "공부량에 비해 수익화 시도가 적으면 체감이 낮습니다.",
      "안전한 길만 고르면 성장 속도가 느려질 수 있습니다.",
    ],
    paidPreview:
      "전체 리포트에서는 지금 가진 지식과 자격을 어떤 수익 구조로 연결해야 하는지 분석합니다.",
    paidSections: [
      { title: "자격 수익화", teaser: "공부한 것을 돈으로 바꾸는 연결점이 있습니다." },
      { title: "커리어 방향", teaser: "안정성과 확장성 중 어디에 무게를 둬야 하는지 봅니다." },
      { title: "실전 진입 타이밍", teaser: "더 준비해야 할 때와 바로 움직여야 할 때를 나눕니다." },
    ],
  },
  10: {
    title: "영업/설득 수익형",
    subtitle: "말, 설득, 제안, 사람의 마음을 움직일 때 돈이 붙는 타입",
    summary:
      "당신은 무언가를 혼자 조용히 만드는 것보다 사람을 설득하고 움직일 때 수익 가능성이 커집니다. 다만 자신감이 떨어지면 가진 매력을 제대로 쓰지 못합니다.",
    coreMessage:
      "당신은 팔 수 있는 사람입니다. 그런데 스스로를 너무 낮게 보면, 좋은 제안도 부탁처럼 말하게 되고 돈 받을 기회를 놓칩니다.",
    strengths: ["설득력", "제안력", "호감", "영업 감각", "관계 활용"],
    cautions: [
      "좋은 제안을 하면서도 가격을 말할 때 약해질 수 있습니다.",
      "거절이 두려워 기회 자체를 만들지 않을 수 있습니다.",
      "상대 반응에 흔들리면 돈이 되는 대화를 끝까지 끌고 가기 어렵습니다.",
    ],
    paidPreview:
      "전체 리포트에서는 당신이 어떤 방식으로 제안하고 팔아야 돈이 되는지 분석합니다.",
    paidSections: [
      { title: "설득 포인트", teaser: "상대가 당신에게 끌리는 지점을 분석합니다." },
      { title: "제안 방식", teaser: "부탁이 아니라 거래로 보이게 만드는 방식이 필요합니다." },
      { title: "가격 저항", teaser: "돈 얘기에서 약해지는 패턴을 봅니다." },
    ],
  },
  11: {
    title: "투자/분석 감각형",
    subtitle: "흐름을 읽고 계산할 때 돈의 가능성이 커지는 타입",
    summary:
      "당신은 무작정 움직이는 것보다 정보를 모으고 흐름을 읽을 때 돈 감각이 살아나는 타입입니다. 다만 분석이 길어지면 실행 타이밍을 놓칠 수 있습니다.",
    coreMessage:
      "당신은 돈 냄새를 맡는 감각이 있습니다. 하지만 너무 오래 재면 기회는 지나갑니다. 분석은 강점이지만, 실행을 미루는 핑계가 되면 약점입니다.",
    strengths: ["분석력", "돈 감각", "흐름 파악", "정보력", "판단력"],
    cautions: [
      "분석만 하다 실행 타이밍을 놓칠 수 있습니다.",
      "확신이 생길 때쯤 이미 좋은 가격이 지나갔을 수 있습니다.",
      "정보를 많이 볼수록 오히려 결정이 느려질 수 있습니다.",
    ],
    paidPreview:
      "전체 리포트에서는 당신의 분석 감각을 실제 수익으로 연결하는 타이밍과 의사결정 기준을 보여줍니다.",
    paidSections: [
      { title: "투자 감각", teaser: "당신이 흐름을 잘 읽는 영역을 분석합니다." },
      { title: "결정 타이밍", teaser: "분석을 멈추고 움직여야 하는 기준이 필요합니다." },
      { title: "기회 선별법", teaser: "좋은 기회와 착각을 구분하는 포인트를 봅니다." },
    ],
  },
  12: {
    title: "독립 사업가형",
    subtitle: "남이 만든 판보다 직접 판을 만들 때 돈이 커지는 타입",
    summary:
      "당신은 지시받는 구조보다 직접 기획하고 실행할 때 재물 가능성이 커집니다. 다만 책임도 같이 커지기 때문에 시스템 없이 감으로만 움직이면 쉽게 지칠 수 있습니다.",
    coreMessage:
      "당신은 작은 안전지대에 오래 있으면 오히려 힘이 빠지는 타입입니다. 돈은 직접 판을 만들 때 커지지만, 감이 아니라 구조로 굴려야 오래 갑니다.",
    strengths: ["독립성", "사업성", "기획력", "실행력", "확장성"],
    cautions: [
      "아이디어만 많고 운영 구조가 없으면 금방 흩어집니다.",
      "혼자 다 하려 하면 속도는 나지만 오래 못 갑니다.",
      "초반 반응에 취하면 검증 없이 확장할 수 있습니다.",
    ],
    paidPreview:
      "전체 리포트에서는 당신에게 맞는 사업 방식, 수익 모델, 피해야 할 확장 실수를 구체적으로 분석합니다.",
    paidSections: [
      { title: "사업화 방향", teaser: "당신이 직접 판을 만들 때 강해지는 영역이 있습니다." },
      { title: "수익 모델", teaser: "콘텐츠형, 서비스형, 상품형 중 맞는 구조를 봅니다." },
      { title: "확장 리스크", teaser: "커지기 전에 반드시 잡아야 할 약점이 있습니다." },
    ],
  },
};

const ELEMENT_LABELS: Record<string, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

function parseBirthDate(birthDate: string) {
  const parts = birthDate.split("-").map(Number);

  return {
    year: parts[0] || 2000,
    month: parts[1] || 1,
    day: parts[2] || 1,
  };
}

function parseBirthTime(birthTime: string) {
  if (!birthTime) return 0;

  if (birthTime.includes(":")) {
    const [hour] = birthTime.split(":").map(Number);
    return Number.isFinite(hour) ? hour : 0;
  }

  const hour = Number(birthTime);
  return Number.isFinite(hour) ? hour : 0;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const birthDate = searchParams.get("birthDate") || "";
  const birthTime = searchParams.get("birthTime") || "0";
  const genderParam = searchParams.get("gender") || "unknown";

  const { year, month, day } = parseBirthDate(birthDate);
  const hour = parseBirthTime(birthTime);

  const result = calculateWealthResult({
    year,
    month,
    day,
    hour,
    gender:
      genderParam === "male" || genderParam === "female"
        ? genderParam
        : "unknown",
  });

  const type = DISPLAY_TYPES[result.templateId] || DISPLAY_TYPES[8];

  const handleCopy = async () => {
    const text = `나는 "${type.title}", 재물 포텐셜 상위 ${result.topPercent}%가 나왔어요. 내 사주 속 돈그릇도 확인해보세요.`;

    try {
      await navigator.clipboard.writeText(text);
      alert("공유 문구가 복사되었습니다.");
    } catch {
      alert("복사에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-5 py-8">
      <section className="mx-auto max-w-md pb-28">
        <div className="overflow-hidden rounded-[2rem] bg-[#15110d] shadow-2xl">
          <div className="px-6 pb-7 pt-7 text-white">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#f5e7c6]">
              RESULT
            </div>

            <p className="text-sm font-semibold text-white/60">
              당신의 재물 포텐셜
            </p>

            <div className="mt-4 flex items-center justify-between gap-5">
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black tracking-tight">
                  상위 {result.topPercent}
                </span>
                <span className="mb-2 text-2xl font-black text-white/70">
                  %
                </span>
              </div>

              <WealthPyramid percent={result.topPercent} />
            </div>

            <p className="mt-4 text-xs leading-5 text-white/45">
              실제 인구 통계 기반 순위가 아닌, 입력값을 바탕으로 만든
              콘텐츠형 포텐셜 지표입니다.
            </p>
          </div>

          <div className="border-t border-white/10 px-6 py-5 text-white">
            <p className="text-sm font-semibold text-white/50">
              당신의 재물 유형
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight">
              {type.title}
            </h1>

            <p className="mt-3 text-base font-semibold leading-7 text-[#f5e7c6]">
              {type.subtitle}
            </p>
          </div>
        </div>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-xl">
          <p className="text-sm font-bold text-gray-400">SUMMARY</p>

          <h2 className="mt-2 text-2xl font-black text-gray-950">
            한 줄로 보면 이런 타입이에요
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-700">
            {type.summary}
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-[#15110d] p-6 text-white shadow-xl">
          <p className="text-sm font-bold text-[#f5e7c6]">CORE MESSAGE</p>

          <h2 className="mt-2 text-2xl font-black leading-tight">핵심 해석</h2>

          <p className="mt-4 text-base font-bold leading-8 text-white/90">
            {type.coreMessage}
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">WHY THIS RESULT</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            왜 이런 결과가 나왔을까?
          </h2>

          <div className="mt-5 space-y-3">
            {result.logic.map((item, index) => (
              <p
                key={index}
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold leading-6 text-gray-700"
              >
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">ELEMENT BALANCE</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            재물 성향 오행 분석
          </h2>

          <div className="mt-5 space-y-4">
            {Object.entries(result.elements).map(([key, value]) => (
              <div key={key}>
                <div className="mb-2 flex justify-between text-sm font-bold text-gray-700">
                  <span>{ELEMENT_LABELS[key] || key}</span>
                  <span>{value}%</span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#15110d]"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-400">
            오행 수치는 전통 명리 해석을 그대로 단정하는 값이 아니라, 재물
            성향을 설명하기 위한 콘텐츠형 변환 지표입니다.
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">STRENGTH</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            돈으로 바뀌기 쉬운 강점
          </h2>

          <div className="mt-5 flex flex-wrap gap-2">
            {type.strengths.map((item) => (
              <span
                key={item}
                className="rounded-full bg-[#f4f1ea] px-4 py-2 text-sm font-bold text-gray-800"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">CAUTION</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            돈이 새기 쉬운 패턴
          </h2>

          <ul className="mt-5 space-y-3">
            {type.cautions.map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold leading-6 text-gray-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 rounded-[2rem] border border-[#dfd3bf] bg-[#fffaf0] p-6 shadow-lg">
          <div className="inline-flex rounded-full bg-[#15110d] px-4 py-2 text-xs font-bold text-[#f5e7c6]">
            LOCKED REPORT
          </div>

          <h2 className="mt-4 text-2xl font-black leading-tight text-gray-950">
            전체 리포트에서는
            <br />
            더 깊게 볼 수 있어요
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-700">
            {type.paidPreview}
          </p>

          <div className="mt-5 space-y-3">
            {type.paidSections.map((section) => (
              <div
                key={section.title}
                className="rounded-3xl border border-[#eadfca] bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-black text-gray-950">
                    {section.title}
                  </h3>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-500">
                    잠김
                  </span>
                </div>

                <p className="mt-3 select-none text-sm leading-6 text-gray-500 blur-[2px]">
                  {section.teaser}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-2xl bg-[#15110d] px-5 py-4 text-base font-black text-white shadow-lg transition active:scale-[0.98]"
          >
            출시 기념 전체 리포트 보기 ₩2,500
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-gray-500">
            현재는 MVP 단계라 결제 기능은 아직 연결하지 않았습니다.
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">SHARE</p>

          <h2 className="mt-1 text-2xl font-black text-gray-950">
            친구에게 결과 공유하기
          </h2>

          <div className="mt-5 rounded-3xl bg-[#f4f1ea] p-5">
            <p className="text-sm leading-7 text-gray-700">
              나는{" "}
              <strong className="font-black text-gray-950">{type.title}</strong>,
              <br />
              재물 포텐셜{" "}
              <strong className="font-black text-gray-950">
                상위 {result.topPercent}%
              </strong>
              가 나왔어요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="mt-5 w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-base font-black text-gray-900 transition active:scale-[0.98]"
          >
            공유 문구 복사하기
          </button>
        </section>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-5 w-full rounded-2xl bg-white px-5 py-4 text-base font-black text-gray-900 shadow-lg transition active:scale-[0.98]"
        >
          다시 테스트하기
        </button>

        <div className="fixed inset-x-0 bottom-0 z-20 bg-white/90 px-5 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-md gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-1/3 rounded-2xl border border-gray-300 bg-white px-3 py-4 text-sm font-black text-gray-800"
            >
              다시
            </button>

            <button
              type="button"
              className="w-2/3 rounded-2xl bg-[#15110d] px-3 py-4 text-sm font-black text-white"
            >
              전체 리포트 보기 ₩2,500
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
function WealthPyramid({ percent }: { percent: number }) {
  const safePercent = Math.max(1, Math.min(100, percent));

  // 실제 삼각형 면적 기준 보정
  const fillRatio = Math.sqrt(safePercent / 100);

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="relative h-28 w-24">
        {/* 전체 삼각형 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            background:
              "linear-gradient(to bottom, #f5e7c6 0%, #f5e7c6 " +
              `${fillRatio * 100}%` +
              `, rgba(255,255,255,0.08) ${fillRatio * 100}%` +
              ", rgba(255,255,255,0.08) 100%)",
          }}
        />

        {/* 외곽선 */}
        <div
          className="absolute inset-0 border border-white/20"
          style={{
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          }}
        />

        {/* 중앙 빛 느낌 */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />
      </div>

      <p className="mt-2 text-[10px] font-bold tracking-widest text-white/40">
        TOP {safePercent}%
      </p>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="p-10">결과를 불러오는 중입니다...</div>}>
      <ResultContent />
    </Suspense>
  );
}