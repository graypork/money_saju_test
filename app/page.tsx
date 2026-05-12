import BirthForm from "../src/components/BirthForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f1e8] px-5 py-8 [word-break:keep-all]">
      <section className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[2rem] bg-[#21160f] shadow-2xl">
          <div className="px-6 pb-8 pt-7 text-white">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#f6d58b]">
              30초 재물 성향 테스트
            </div>

            <h1 className="text-[2.6rem] font-black leading-[1.08] tracking-tight">
              내 사주 속
              <br />
              돈그릇은
              <br />
              얼마나 클까?
            </h1>

            <p className="mt-5 text-base leading-7 text-white/75">
              생년월일과 태어난 시간으로 보는
              <br />
              나의 재물 포텐셜, 성공 방식, 돈이 새는 패턴.
            </p>

            <div className="mt-7 rounded-3xl bg-white px-5 py-5 text-[#21160f]">
              <p className="text-sm font-bold">이런 게 궁금했다면</p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                <li>• 나는 돈을 크게 벌 수 있는 타입일까?</li>
                <li>• 월급형이 맞을까, 사업형이 맞을까?</li>
                <li>• 왜 돈이 모이기 전에 자꾸 새는 걸까?</li>
                <li>• 내 성공 포텐셜은 어느 쪽에서 열릴까?</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-white/10 text-center text-xs font-semibold text-white">
            <div className="px-3 py-4">
              <p className="text-lg font-black">12</p>
              <p className="mt-1 text-white/60">재물 유형</p>
            </div>

            <div className="border-x border-white/10 px-3 py-4">
              <p className="text-lg font-black">30초</p>
              <p className="mt-1 text-white/60">빠른 결과</p>
            </div>

            <div className="px-3 py-4">
              <p className="text-lg font-black">무료</p>
              <p className="mt-1 text-white/60">기본 해석</p>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-xl">
          <div className="mb-5">
            <p className="text-sm font-bold text-gray-400">START</p>
            <h2 className="mt-1 text-2xl font-black text-gray-950">
              내 돈그릇 확인하기
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              양력/음력 생년월일과 태어난 시간으로 재물 성향을 가볍게 확인해보세요.
            </p>
          </div>

          <BirthForm />
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-gray-400">RESULT PREVIEW</p>

          <h2 className="mt-2 text-2xl font-black leading-tight text-gray-950">
            결과는 이런 식으로 나와요
          </h2>

          <div className="mt-5 space-y-3">
            <div className="rounded-3xl bg-[#f7f1e8] p-5">
              <p className="text-xs font-bold text-gray-500">예시 유형</p>
              <h3 className="mt-2 text-xl font-black text-gray-950">
                감각으로 버는 크리에이터형
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                단순 반복보다 감각, 표현력, 콘텐츠, 기획을 통해 돈을 만들 때 강해지는 타입입니다.
              </p>
            </div>

            <div className="rounded-3xl bg-[#f7f1e8] p-5">
              <p className="text-xs font-bold text-gray-500">확인 가능 항목</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-700">
                  재물 포텐셜
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-700">
                  돈 버는 방식
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-700">
                  주의 패턴
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-700">
                  성공 방향
                </span>
              </div>
            </div>
          </div>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          본 테스트는 정통 만세력 감정이 아닌 오락 및 자기이해 목적의
          콘텐츠형 변환입니다.
          <br />
          실제 금융, 투자, 법률, 직업 선택에 대한 전문 조언이 아닙니다.
        </p>
      </section>
    </main>
  );
}
