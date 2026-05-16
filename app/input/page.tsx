import BirthForm from "../../src/components/BirthForm";
import AppVersionBadge from "../../src/components/AppVersionBadge";
import { uiTokens } from "../../src/lib/uiTokens";

export default function InputPage() {
  return (
    <main className={`${uiTokens.page} py-7`}>
      <section className={uiTokens.shell}>
        <header className="px-1 pb-5 pt-2">
          <a
            href="/"
            aria-label="첫 화면으로 돌아가기"
            className="mb-5 grid h-10 w-10 place-items-center rounded-full bg-[#FFFDF8] text-xl font-extrabold text-[#614A37] transition active:bg-[#F1EADE]"
          >
            ←
          </a>

          <div className="rounded-[24px] border border-[rgba(97,74,55,0.18)] bg-[#FFFDF8] p-6 shadow-[0_10px_28px_rgba(97,74,55,0.08)]">
            <p className={uiTokens.eyebrow}>START</p>
            <h1 className={`${uiTokens.headline} mt-2`}>
              내 돈버는 동물
              <br />
              찾기
            </h1>
            <p className={`${uiTokens.body} mt-4`}>
              생년월일, 생시, 성별을 입력하면 기존 결과 흐름으로 바로 이어집니다.
            </p>
          </div>
        </header>

        <section className={uiTokens.card}>
          <BirthForm />
        </section>
      </section>

      <AppVersionBadge />
    </main>
  );
}
