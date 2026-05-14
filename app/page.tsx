import BirthForm from "../src/components/BirthForm";
import { uiTokens } from "../src/lib/uiTokens";

export default function Home() {
  return (
    <main className={uiTokens.page}>
      <section className={uiTokens.shell}>
        <section className="overflow-hidden rounded-[32px] bg-[#241A12] shadow-[0_18px_50px_rgba(36,26,18,0.18)]">
          <div className="px-6 pb-8 pt-7 text-[#FFFDF8]">
            <div className="mb-5 inline-flex rounded-full border border-[#E8D8C5]/20 bg-[#FFFDF8]/10 px-4 py-2 text-xs font-bold text-[#F7D8A7]">
              사주와 오행으로 보는 재물 동물 테스트
            </div>

            <h1 className="text-[34px] font-extrabold leading-[1.25]">
              돈 앞에서 사람은
              <br />
              자기만의 동물이 됩니다.
            </h1>

            <p className="mt-5 text-[16px] leading-8 text-[#FFFDF8]/78">
              누군가는 바로 낚아채고,
              <br />
              누군가는 차곡차곡 모으고,
              <br />
              누군가는 냄새를 맡고도 망설입니다.
            </p>

            <p className="mt-5 text-[16px] font-bold leading-8 text-[#FFFDF8]">
              나는 돈을 모으는 쪽일까요,
              <br />
              흘려보내는 쪽일까요?
            </p>

            <p className="mt-5 text-[15px] leading-7 text-[#FFFDF8]/70">
              사주와 오행으로 보는
              <br />
              나의 돈버는 동물 테스트.
            </p>

            <a
              href="#test-start"
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#FFFDF8] px-[22px] py-4 text-base font-bold text-[#241A12] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition active:scale-[0.98]"
            >
              내 유형 확인하기
            </a>
          </div>

          <div className="grid grid-cols-3 border-t border-[#FFFDF8]/10 text-center text-xs font-bold text-[#FFFDF8]">
            <div className="px-3 py-4">
              <p className="text-lg font-extrabold">12</p>
              <p className="mt-1 text-[#FFFDF8]/55">동물 유형</p>
            </div>

            <div className="border-x border-[#FFFDF8]/10 px-3 py-4">
              <p className="text-lg font-extrabold">오행</p>
              <p className="mt-1 text-[#FFFDF8]/55">밸런스</p>
            </div>

            <div className="px-3 py-4">
              <p className="text-lg font-extrabold">무료</p>
              <p className="mt-1 text-[#FFFDF8]/55">기본 결과</p>
            </div>
          </div>
        </section>

        <section id="test-start" className={`${uiTokens.card} mt-6 p-5`}>
          <div className="mb-5">
            <p className={uiTokens.eyebrow}>START</p>
            <h2 className={`${uiTokens.sectionTitle} mt-1`}>
              내 돈버는 동물 찾기
            </h2>
            <p className={`${uiTokens.body} mt-2`}>
              생년월일과 태어난 시간으로 오행의 강약, 재성 흐름, 돈이 새기 쉬운 패턴을 함께 봅니다.
            </p>
          </div>

          <BirthForm />
        </section>

        <section className={`${uiTokens.card} mt-6`}>
          <p className={uiTokens.eyebrow}>RESULT PREVIEW</p>

          <h2 className={`${uiTokens.sectionTitle} mt-2`}>
            동물은 장식이 아니라 돈의 패턴입니다
          </h2>

          <p className={`${uiTokens.body} mt-3`}>
            강한 오행, 부족한 오행, 재성의 상태를 바탕으로 돈 앞에서 드러나는 움직임을 하나의 동물 유형으로 정리합니다.
          </p>

          <div className="mt-5 grid gap-3">
            {[
              "기회를 바로 낚아채는 타입",
              "차곡차곡 모으는 타입",
              "잡기 직전 망설이는 타입",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-[#E8D8C5] bg-[#FDF7EC] px-4 py-3 text-[14px] font-bold text-[#241A12]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <p className={`${uiTokens.caption} mt-6 text-center`}>
          본 테스트는 정통 만세력 감정이 아닌 오락 및 자기이해 목적의
          콘텐츠형 변환입니다.
          <br />
          실제 금융, 투자, 법률, 직업 선택에 대한 전문 조언이 아닙니다.
        </p>
      </section>
    </main>
  );
}
