import BirthForm from "../../src/components/BirthForm";
import AppVersionBadge from "../../src/components/AppVersionBadge";
import { uiTokens } from "../../src/lib/uiTokens";

export default function InputPage() {
  return (
    <main className={`${uiTokens.page} py-6`}>
      <section className={`${uiTokens.shell} pb-8`}>
        <header className="px-1 pb-5 pt-2">
          <a
            href="/"
            aria-label="첫 화면으로 돌아가기"
            className="mb-5 grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-[#FFFDF8] text-xl font-extrabold text-[#5E4936] shadow-[0_8px_20px_rgba(31,42,34,0.05)] transition active:bg-[#F8F4EC]"
          >
            ←
          </a>

          <div className="rounded-[28px] border border-black/10 bg-[#FFFDF8] p-6 shadow-[0_12px_32px_rgba(31,42,34,0.07)]">
            <p className={uiTokens.eyebrow}>START</p>
            <h1 className={`${uiTokens.headline} mt-2`}>
              내 돈버는 동물
              <br />
              찾기
            </h1>
            <p className={`${uiTokens.body} mt-4`}>
              생년월일, 생시, 성별만 입력하면 돈을 대하는 방식과 새기 쉬운 지점을 동물 유형으로 정리합니다.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {["생년월일", "오행", "동물유형"].map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-[#EEF3EA] px-3 py-2 text-center text-[12px] font-extrabold text-[#285C42]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </header>

        <section className={`${uiTokens.card} p-6`}>
          <BirthForm />
        </section>
      </section>

      <AppVersionBadge />
    </main>
  );
}
