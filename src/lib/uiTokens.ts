const glassControl =
  "border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.08)_35%,rgba(255,255,255,0.03)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.68),inset_0_-1px_0_rgba(255,255,255,0.12),0_9px_22px_rgba(48,42,34,0.08)] [backdrop-filter:blur(16px)_saturate(150%)] [-webkit-backdrop-filter:blur(16px)_saturate(150%)]";
const glassGreenButton =
  "border border-white/64 bg-[linear-gradient(180deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.09)_34%,rgba(255,255,255,0.035)_100%),linear-gradient(180deg,rgba(24,134,82,0.28)_0%,rgba(24,134,82,0.18)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.76),inset_1px_0_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.16),0_12px_28px_rgba(36,84,59,0.15),0_2px_0_rgba(255,255,255,0.18)] [backdrop-filter:blur(16px)_saturate(150%)] [-webkit-backdrop-filter:blur(16px)_saturate(150%)]";

export const uiTokens = {
  button:
    `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-extrabold text-[#F7FFF9] transition active:translate-y-0.5 ${glassGreenButton}`,
  eyebrow:
    "inline-flex rounded-full bg-[#F3F8F4] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#1E6A48]",
  glassControl,
  glassGreenButton,
};
