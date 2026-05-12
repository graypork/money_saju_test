import type { TemplateId } from "./score";

export type PaidReportPreview = {
  title: string;
  teaser: string;
};

export type PaidReport = {
  id: TemplateId;
  title: string;
  overview: string;
  moneyPattern: string;
  earningStyle: string;
  moneyLeakPattern: string;
  timingAdvice: string;
  careerAndBusinessFit: string;
  relationshipAndMoney: string;
  actionPlan: {
    sevenDays: string[];
    thirtyDays: string[];
  };
  warning: string;
  finalMessage: string;
  previewSections: PaidReportPreview[];
};

export const paidReportTemplateMap: Record<TemplateId, PaidReport> = {
  1: {
    id: 1,
    title: "축적형 자산가 상세 리포트",
    overview: "느리게 쌓이는 대신 한 번 구조가 잡히면 유지력이 강한 재물 패턴입니다.",
    moneyPattern: "신뢰, 반복 거래, 경력, 기록이 돈으로 바뀌는 흐름이 강합니다.",
    earningStyle: "정기 고객, 유지보수, 장기 콘텐츠, 운영 대행처럼 누적되는 수익과 잘 맞습니다.",
    moneyLeakPattern: "성과가 늦다는 이유로 방향을 자주 바꾸면 쌓이던 흐름이 끊깁니다.",
    timingAdvice: "초반 반응보다 3주 이상 반복했을 때 남는 데이터를 기준으로 판단하는 편이 좋습니다.",
    careerAndBusinessFit: "전문 서비스, B2B 운영, 장기 구독형 상품, 신뢰 기반 커리어에 강점이 있습니다.",
    relationshipAndMoney: "당장 큰 반응보다 오래 거래할 사람을 남기는 관계에서 돈이 붙습니다.",
    actionPlan: {
      sevenDays: ["반복 가능한 수익 루틴 하나를 정합니다.", "최근 3개월 성과를 숫자로 정리합니다.", "오래 유지할 고객군을 한 문장으로 정의합니다."],
      thirtyDays: ["한 가지 채널에 주 3회 이상 기록을 쌓습니다.", "기존 고객이나 지인에게 재구매 제안을 보냅니다.", "수익 루틴을 가격표와 일정표로 고정합니다."],
    },
    warning: "느린 속도를 실패로 단정하면 가장 강한 무기인 누적성이 사라집니다.",
    finalMessage: "당신에게 필요한 건 더 큰 확신보다, 중간에 접지 않을 구조입니다.",
    previewSections: [
      { title: "누적 수익 지도", teaser: "어떤 반복 활동이 돈으로 쌓이는지 우선순위를 보여줍니다." },
      { title: "흔들리는 시점", teaser: "포기하기 쉬운 구간과 버텨야 하는 구간을 나눕니다." },
      { title: "30일 축적 플랜", teaser: "지금 바로 고정할 루틴과 점검 지표를 제안합니다." },
    ],
  },
  2: {
    id: 2,
    title: "크리에이터형 상세 리포트",
    overview: "감각과 아이디어를 결과물로 바꿀 때 재물 가능성이 커지는 패턴입니다.",
    moneyPattern: "기획, 표현, 브랜딩, 콘텐츠화 능력이 수익의 출발점이 됩니다.",
    earningStyle: "숏폼, 디지털 상품, 상세페이지, 브랜딩, 컨셉 기획처럼 감각을 포장하는 일과 잘 맞습니다.",
    moneyLeakPattern: "완성도에 갇히거나 흥미가 식어 출시 전 멈추면 수익 전환이 늦어집니다.",
    timingAdvice: "완성 후 공개보다 60퍼센트 완성도에서 반응을 보는 방식이 유리합니다.",
    careerAndBusinessFit: "콘텐츠 마케팅, 디자인, 브랜드 기획, 1인 미디어, 템플릿 상품에 적성이 있습니다.",
    relationshipAndMoney: "당신의 감각을 알아보는 팬, 고객, 협업자와 만났을 때 돈의 속도가 빨라집니다.",
    actionPlan: {
      sevenDays: ["팔 수 있는 아이디어 3개를 적습니다.", "가장 쉬운 아이디어를 무료 샘플로 공개합니다.", "반응이 온 문장을 따로 저장합니다."],
      thirtyDays: ["반응이 온 주제로 작은 유료 상품을 만듭니다.", "콘텐츠 발행 요일을 고정합니다.", "대표 포트폴리오 3개를 한 화면에 정리합니다."],
    },
    warning: "감각만 믿고 판매 구조를 만들지 않으면 결과가 계속 취미에 머뭅니다.",
    finalMessage: "당신의 돈길은 더 잘 만드는 것보다 더 빨리 보여주는 데서 열립니다.",
    previewSections: [
      { title: "팔리는 감각 포맷", teaser: "콘텐츠, 상품, 서비스 중 어디에 먼저 얹을지 분석합니다." },
      { title: "출시 지연 패턴", teaser: "완벽주의가 돈을 늦추는 지점을 짚습니다." },
      { title: "30일 공개 플랜", teaser: "작게 공개하고 반응을 유료화하는 순서를 제안합니다." },
    ],
  },
  3: {
    id: 3,
    title: "관리자형 상세 리포트",
    overview: "지출 통제와 시스템화가 강해 안정적인 돈 관리에 유리한 패턴입니다.",
    moneyPattern: "흐름을 정리하고 반복 가능한 구조를 만들 때 돈이 남습니다.",
    earningStyle: "운영, 정산, 관리 대행, 프로세스 개선, 안정형 투자 공부와 잘 맞습니다.",
    moneyLeakPattern: "너무 안전하게만 판단하면 수익 확장의 기회까지 같이 줄일 수 있습니다.",
    timingAdvice: "손실 한도를 정한 작은 실험을 열어둘 때 안정성과 성장성이 함께 살아납니다.",
    careerAndBusinessFit: "운영 관리자, 재무 관리, B2B 지원, 자동화 세팅, 관리형 서비스에 적성이 있습니다.",
    relationshipAndMoney: "약속을 지키는 사람과 장기 거래에서 신뢰 수익이 커집니다.",
    actionPlan: {
      sevenDays: ["고정 지출과 변동 지출을 분리합니다.", "작은 성장 실험 하나의 손실 한도를 정합니다.", "반복 업무 중 돈이 되는 항목을 표시합니다."],
      thirtyDays: ["주간 정산 루틴을 만듭니다.", "관리 능력을 서비스 메뉴로 정리합니다.", "안전한 실험 예산을 한 달 단위로 배정합니다."],
    },
    warning: "안전이 강점이지만, 모든 위험을 피하면 수익의 크기도 같이 작아집니다.",
    finalMessage: "당신은 무리할 필요가 없습니다. 다만 작게라도 열어둔 성장판은 필요합니다.",
    previewSections: [
      { title: "안정 수익 구조", teaser: "관리력으로 돈이 남는 영역을 정리합니다." },
      { title: "기회 회피 지점", teaser: "너무 신중해서 놓치는 선택을 분석합니다." },
      { title: "작은 실험 예산", teaser: "안정성을 해치지 않는 성장 실험을 설계합니다." },
    ],
  },
  4: {
    id: 4,
    title: "기회 포착형 상세 리포트",
    overview: "빠르게 흐름을 읽고 움직일 때 수익 가능성이 커지는 패턴입니다.",
    moneyPattern: "시장의 빈틈, 사람들의 불편, 빠른 검증에서 돈의 실마리를 잡습니다.",
    earningStyle: "MVP, 소형 브랜드, 빠른 외주, 트렌드 상품, 실험형 서비스와 잘 맞습니다.",
    moneyLeakPattern: "초반 반응에 취해 검증 없이 확장하면 현금흐름이 흔들릴 수 있습니다.",
    timingAdvice: "크게 키우기 전 10명 반응, 3건 결제, 1회 재구매 같은 작은 기준이 필요합니다.",
    careerAndBusinessFit: "사업 개발, 세일즈, 신사업, 창업, 프로젝트 리드 역할에서 강점이 살아납니다.",
    relationshipAndMoney: "속도를 맞춰줄 실행형 파트너와 만나면 수익화가 빨라집니다.",
    actionPlan: {
      sevenDays: ["아이디어 하나를 1문장 제안으로 줄입니다.", "잠재 고객 10명에게 반응을 확인합니다.", "돈을 쓰기 전 검증 기준 3개를 정합니다."],
      thirtyDays: ["가장 반응이 온 아이디어를 작은 유료 제안으로 만듭니다.", "초기 비용 상한선을 정합니다.", "반응 데이터를 보고 유지/중단을 결정합니다."],
    },
    warning: "빠른 실행은 강점이지만, 기준 없는 확장은 수익보다 지출을 먼저 키웁니다.",
    finalMessage: "당신은 움직여야 돈이 붙습니다. 대신 움직이기 전에 기준을 하나 세워야 합니다.",
    previewSections: [
      { title: "기회 검증표", teaser: "바로 밀어붙여도 되는 신호와 멈춰야 할 신호를 구분합니다." },
      { title: "확장 리스크", teaser: "초반 반응 뒤에 돈이 새는 지점을 봅니다." },
      { title: "30일 MVP 플랜", teaser: "작게 팔고 반응으로 키우는 순서를 제안합니다." },
    ],
  },
  5: {
    id: 5,
    title: "네트워크형 상세 리포트",
    overview: "사람, 소개, 협업을 통해 돈의 기회가 열리는 재물 패턴입니다.",
    moneyPattern: "평판, 신뢰, 소개, 커뮤니티 접점이 예상 밖의 수익으로 이어질 수 있습니다.",
    earningStyle: "제휴, 영업, 커뮤니티 운영, 협업형 콘텐츠, 파트너십 상품과 잘 맞습니다.",
    moneyLeakPattern: "모두에게 좋은 사람으로 남으려 하면 시간과 에너지가 먼저 새어 나갑니다.",
    timingAdvice: "관계가 돈이 되려면 초반에 역할, 보상, 결과물을 정리해야 합니다.",
    careerAndBusinessFit: "영업, 제휴, HR, 커뮤니티, 상담, 협업형 프로젝트에서 강점이 살아납니다.",
    relationshipAndMoney: "돈이 되는 관계는 편한 관계가 아니라 기준이 선명한 관계입니다.",
    actionPlan: {
      sevenDays: ["최근 도움을 준 관계를 적고 보상 없는 일을 표시합니다.", "소개받고 싶은 고객군을 정합니다.", "협업 제안 문장을 하나 만듭니다."],
      thirtyDays: ["관계 기반 제안 5건을 보냅니다.", "무상 도움의 기준을 정합니다.", "협업 후 정산 방식 템플릿을 만듭니다."],
    },
    warning: "관계가 많아도 기준이 없으면 수익보다 피로가 먼저 쌓입니다.",
    finalMessage: "당신의 관계운은 자산이 될 수 있습니다. 단, 선을 그어야 돈이 됩니다.",
    previewSections: [
      { title: "돈 되는 관계", teaser: "기회를 주는 관계와 에너지만 쓰는 관계를 구분합니다." },
      { title: "협업 정산법", teaser: "좋은 관계를 망치지 않는 돈 기준을 정합니다." },
      { title: "제안 문장", teaser: "부담스럽지 않게 거래로 연결하는 문장을 제안합니다." },
    ],
  },
  6: {
    id: 6,
    title: "전문성형 상세 리포트",
    overview: "기술, 지식, 문제 해결 능력이 돈으로 전환되기 쉬운 패턴입니다.",
    moneyPattern: "실력과 신뢰가 쌓일수록 가격을 올릴 여지가 생깁니다.",
    earningStyle: "컨설팅, 외주, 강의, 템플릿, 자동화, 문제 해결형 서비스와 잘 맞습니다.",
    moneyLeakPattern: "계속 배우기만 하고 제안하지 않으면 실력이 통장으로 옮겨가지 않습니다.",
    timingAdvice: "더 배운 뒤가 아니라, 이미 해결 가능한 문제부터 작게 팔아야 합니다.",
    careerAndBusinessFit: "전문직, 개발, 데이터, 교육, 운영 자동화, B2B 문제 해결에 강점이 있습니다.",
    relationshipAndMoney: "당신의 실력을 알아보고 반복 의뢰하는 고객과 길게 가는 것이 좋습니다.",
    actionPlan: {
      sevenDays: ["이미 해결 가능한 문제 5개를 적습니다.", "그중 하나를 1시간 서비스로 만듭니다.", "가격을 낮추기 전에 결과물을 명확히 씁니다."],
      thirtyDays: ["작은 유료 제안 3건을 보냅니다.", "자주 받는 질문을 콘텐츠로 정리합니다.", "반복 가능한 작업을 템플릿화합니다."],
    },
    warning: "준비만 오래 하면 실력은 늘지만 수익은 늦어집니다.",
    finalMessage: "당신의 돈은 더 배우는 순간보다, 배운 것을 팔기 시작하는 순간 움직입니다.",
    previewSections: [
      { title: "전문성 상품화", teaser: "지금 가진 능력을 팔 수 있는 단위로 쪼갭니다." },
      { title: "가격 저평가", teaser: "싸게 부르게 되는 지점과 기준 가격을 봅니다." },
      { title: "30일 제안 플랜", teaser: "작은 유료 제안을 보내는 순서를 제안합니다." },
    ],
  },
  7: {
    id: 7,
    title: "변동형 상세 리포트",
    overview: "수입 기회는 만들 수 있지만 돈이 머무는 구조가 흔들리기 쉬운 패턴입니다.",
    moneyPattern: "빠른 반응, 감각, 적응력이 수입 기회를 만듭니다.",
    earningStyle: "단기 프로젝트, 이벤트성 판매, 빠른 외주, 시즌성 수익과 잘 맞습니다.",
    moneyLeakPattern: "기분 소비, 즉흥 결제, 수입 직후 지출이 재물 체감을 낮춥니다.",
    timingAdvice: "돈이 들어온 직후 24시간 안에 분리해두는 규칙이 가장 중요합니다.",
    careerAndBusinessFit: "변화가 많은 현장, 콘텐츠, 판매, 프리랜스, 단기 캠페인에 적성이 있습니다.",
    relationshipAndMoney: "분위기에 휩쓸린 지출과 즉흥 약속을 조심해야 합니다.",
    actionPlan: {
      sevenDays: ["최근 충동 지출 5개를 적습니다.", "수입이 들어오면 자동으로 묶을 비율을 정합니다.", "결제 전 10분 보류 규칙을 시작합니다."],
      thirtyDays: ["수입 통장과 생활비 통장을 분리합니다.", "단기 수익 기회 2개를 실험합니다.", "새는 돈 상위 3개를 차단합니다."],
    },
    warning: "수입을 만드는 감각이 있어도 관리 구조가 없으면 계속 제자리처럼 느껴질 수 있습니다.",
    finalMessage: "당신은 못 버는 타입이 아닙니다. 남기는 시스템이 붙을 때 체감이 달라집니다.",
    previewSections: [
      { title: "돈 새는 구멍", teaser: "수입이 생긴 뒤 어디서 사라지는지 추적합니다." },
      { title: "고수익 유지법", teaser: "변동성 있는 수입을 안정화하는 방식을 봅니다." },
      { title: "30일 지출 통제", teaser: "감정 지출을 줄이는 현실적인 규칙을 제안합니다." },
    ],
  },
  8: {
    id: 8,
    title: "대기만성형 상세 리포트",
    overview: "초반의 흔들림이 후반의 방향성으로 바뀔 때 돈의 흐름이 살아나는 패턴입니다.",
    moneyPattern: "경험, 시행착오, 관찰력이 나중에 팔 수 있는 노하우로 바뀝니다.",
    earningStyle: "경험 기반 콘텐츠, 장기 브랜드, 상담, 교육, 성장형 커리어와 잘 맞습니다.",
    moneyLeakPattern: "방향을 자주 바꾸면 경험이 쌓이지 못하고 계속 초기화됩니다.",
    timingAdvice: "새로운 시작보다 기존 시행착오를 재해석하는 시점에 돈의 힌트가 있습니다.",
    careerAndBusinessFit: "누적 경험을 설명하고 정리하는 일, 장기 서비스, 성장형 직무에 강점이 있습니다.",
    relationshipAndMoney: "당장 성과를 재촉하지 않는 관계에서 안정적으로 성장합니다.",
    actionPlan: {
      sevenDays: ["최근 실패한 시도 3개를 적습니다.", "반복된 문제를 하나 고릅니다.", "그 문제를 해결한 과정을 짧게 기록합니다."],
      thirtyDays: ["경험 기반 콘텐츠를 주 2회 발행합니다.", "하나의 방향을 30일간 고정합니다.", "시행착오를 체크리스트나 가이드로 바꿉니다."],
    },
    warning: "늦었다는 생각이 가장 큰 방해입니다. 방향이 잡히기 전에 멈추면 후반 힘을 못 씁니다.",
    finalMessage: "당신에게 필요한 건 빠른 증명이 아니라, 경험을 돈으로 바꾸는 편집력입니다.",
    previewSections: [
      { title: "후반 성장 구간", teaser: "경험이 돈으로 바뀌기 쉬운 흐름을 봅니다." },
      { title: "시행착오 자산화", teaser: "버린 경험처럼 보이는 것의 수익화 지점을 찾습니다." },
      { title: "방향 고정 플랜", teaser: "30일간 흔들림을 줄이는 기준을 제안합니다." },
    ],
  },
  9: {
    id: 9,
    title: "지식/자격형 상세 리포트",
    overview: "학습, 자격, 체계화된 지식이 신뢰와 수익으로 연결되는 패턴입니다.",
    moneyPattern: "검증된 지식과 문서화된 노하우가 돈의 근거가 됩니다.",
    earningStyle: "강의, 전자책, 컨설팅, 자격 기반 커리어, 전문 블로그와 잘 맞습니다.",
    moneyLeakPattern: "자격을 더 따야 한다는 생각으로 실전 판매를 미루면 수익 전환이 늦습니다.",
    timingAdvice: "공부와 판매를 분리하지 말고, 배우는 내용을 바로 정리해 공개하는 편이 좋습니다.",
    careerAndBusinessFit: "교육, 제도권 전문직, 문서화, 심사, 분석, 자문 역할에 적성이 있습니다.",
    relationshipAndMoney: "당신의 근거와 성실함을 신뢰하는 고객과 안정적으로 연결됩니다.",
    actionPlan: {
      sevenDays: ["가진 자격과 지식을 목록화합니다.", "사람들이 자주 묻는 질문 5개를 적습니다.", "답변 하나를 짧은 글로 공개합니다."],
      thirtyDays: ["질문 10개를 묶어 미니 가이드로 만듭니다.", "상담이나 강의 형태의 작은 상품을 만듭니다.", "실전 사례를 포트폴리오로 정리합니다."],
    },
    warning: "공부가 돈이 되려면 결과물이 있어야 합니다. 지식만 쌓으면 수익은 늦습니다.",
    finalMessage: "당신의 지식은 충분히 자산이 될 수 있습니다. 이제 팔리는 형태가 필요합니다.",
    previewSections: [
      { title: "지식 자산화", teaser: "지금 가진 지식을 상품 단위로 바꾸는 법을 봅니다." },
      { title: "준비 과다 패턴", teaser: "공부가 실행을 밀어내는 지점을 분석합니다." },
      { title: "30일 콘텐츠 플랜", teaser: "질문을 모아 유료 가이드로 바꾸는 순서를 제안합니다." },
    ],
  },
  10: {
    id: 10,
    title: "영업/설득형 상세 리포트",
    overview: "말, 제안, 설득으로 가치를 전달할 때 돈의 흐름이 열리는 패턴입니다.",
    moneyPattern: "상대의 욕구를 읽고 가치를 설명하는 능력이 수익으로 이어집니다.",
    earningStyle: "세일즈, 상담, 제휴, 발표, 마케팅 콘텐츠, 커뮤니티 판매와 잘 맞습니다.",
    moneyLeakPattern: "거절을 두려워하거나 가격을 말할 때 약해지면 기회가 줄어듭니다.",
    timingAdvice: "관계가 따뜻할 때 제안을 미루지 않는 것이 중요합니다.",
    careerAndBusinessFit: "영업, 마케팅, 상담, 교육, 제휴, PR 역할에서 강점이 살아납니다.",
    relationshipAndMoney: "호감을 돈으로 연결하려면 친절함보다 조건이 선명해야 합니다.",
    actionPlan: {
      sevenDays: ["팔고 싶은 제안을 한 문장으로 정리합니다.", "가격을 포함한 제안 문장을 연습합니다.", "관심 있을 사람 5명을 적습니다."],
      thirtyDays: ["제안 10건을 보냅니다.", "거절 사유를 기록해 문장을 수정합니다.", "성공한 대화를 스크립트로 저장합니다."],
    },
    warning: "좋은 사람으로 보이려다 거래 조건을 흐리면 돈 받을 기회를 놓칩니다.",
    finalMessage: "당신은 팔 수 있는 사람입니다. 이제 부탁이 아니라 제안으로 말하면 됩니다.",
    previewSections: [
      { title: "팔리는 제안 문장", teaser: "당신에게 맞는 판매 문장 구조를 제안합니다." },
      { title: "가격 말하기", teaser: "돈 얘기에서 약해지는 지점을 봅니다." },
      { title: "30일 세일즈 플랜", teaser: "부담 없이 제안을 늘리는 순서를 정리합니다." },
    ],
  },
  11: {
    id: 11,
    title: "투자/분석형 상세 리포트",
    overview: "숫자, 흐름, 기준을 읽을 때 재물 판단력이 살아나는 패턴입니다.",
    moneyPattern: "정보를 비교하고 흐름을 해석하는 능력이 기회 선별로 이어집니다.",
    earningStyle: "리서치, 데이터 분석, 투자 공부, 비교 콘텐츠, 금융/경제 콘텐츠와 잘 맞습니다.",
    moneyLeakPattern: "확신 과잉 또는 분석 지연이 모두 손실로 이어질 수 있습니다.",
    timingAdvice: "들어갈 조건, 빠질 조건, 손실 한도를 먼저 정해야 감정이 덜 흔들립니다.",
    careerAndBusinessFit: "리서치, 기획, 데이터, 금융, 전략, 시장 분석 역할에서 강점이 있습니다.",
    relationshipAndMoney: "정보를 함께 검증해줄 사람과 연결될 때 판단 품질이 올라갑니다.",
    actionPlan: {
      sevenDays: ["관심 기회 하나를 정합니다.", "진입 조건과 중단 조건을 씁니다.", "감정이 아닌 숫자 기준 3개를 정합니다."],
      thirtyDays: ["관찰 기록을 주 2회 남깁니다.", "작은 금액이나 모의 방식으로 기준을 테스트합니다.", "성공/실패 판단표를 만듭니다."],
    },
    warning: "분석력이 좋아도 기준 없는 확신은 위험합니다. 오래 재는 습관도 기회를 놓치게 합니다.",
    finalMessage: "당신에게 필요한 건 더 많은 정보보다, 움직일 기준과 멈출 기준입니다.",
    previewSections: [
      { title: "기회 선별 기준", teaser: "좋은 기회와 착각을 구분하는 지표를 잡습니다." },
      { title: "타이밍 판단", teaser: "분석을 멈추고 결정해야 할 신호를 봅니다." },
      { title: "30일 관찰표", teaser: "감정 대신 숫자로 판단하는 루틴을 제안합니다." },
    ],
  },
  12: {
    id: 12,
    title: "독립 사업가형 상세 리포트",
    overview: "직접 판을 만들고 실험할 때 재물 가능성이 커지는 패턴입니다.",
    moneyPattern: "기획, 실행, 실험, 구조화가 결합될 때 수익의 크기가 커집니다.",
    earningStyle: "1인 사업, 디지털 상품, 자동화 서비스, 소형 브랜드, 외주 기반 사업과 잘 맞습니다.",
    moneyLeakPattern: "운영 시스템 없이 감으로 확장하면 몸만 바쁘고 돈이 남지 않을 수 있습니다.",
    timingAdvice: "처음부터 크게 벌이기보다 수익 모델 하나를 작게 반복 검증해야 합니다.",
    careerAndBusinessFit: "창업, PM, 기획, 사업 개발, 자동화, 독립형 프리랜스에 강점이 있습니다.",
    relationshipAndMoney: "모든 걸 혼자 하려 하기보다 약점을 보완할 파트너를 정하는 것이 중요합니다.",
    actionPlan: {
      sevenDays: ["사업 아이디어 하나를 고객, 문제, 가격으로 나눕니다.", "가장 작은 판매 단위를 정합니다.", "운영에 필요한 반복 업무를 적습니다."],
      thirtyDays: ["첫 유료 제안 5건을 보냅니다.", "반복 업무를 템플릿화합니다.", "수익과 시간을 함께 기록해 남는 구조를 봅니다."],
    },
    warning: "독립성은 강점이지만, 시스템 없는 독립은 쉽게 지칩니다.",
    finalMessage: "당신은 직접 만들 때 강합니다. 오래 가려면 감각보다 구조가 먼저입니다.",
    previewSections: [
      { title: "사업화 우선순위", teaser: "아이디어 중 먼저 팔아볼 것을 좁힙니다." },
      { title: "수익 모델 점검", teaser: "돈이 남는 구조인지, 바쁘기만 한 구조인지 봅니다." },
      { title: "30일 검증 플랜", teaser: "작게 팔고 반복 가능한 사업으로 만드는 순서를 제안합니다." },
    ],
  },
};

export const paidReportTemplates = Object.values(paidReportTemplateMap);

export function getPaidReportTemplate(templateId: number) {
  return paidReportTemplateMap[(templateId as TemplateId) || 8] ?? paidReportTemplateMap[8];
}
