export const palette = {
  page: "#FBF5E7",
  surface: "#EFE9DB",
  textPrimary: "#202020",
  textSecondary: "#746F67",
  actionPrimary: "#222222",
  textOnDark: "#FFF9ED",
  accentBlue: "#BACCEC",
  accentPink: "#F6BBDD",
  accentYellow: "#F6DA6E",
  accentSage: "#A2AE6E",
  borderSubtle: "#DDD6C8",
} as const;

const buttonSurface =
  "bg-[#222222] text-[#FFF9ED] shadow-[0_14px_28px_rgba(32,32,32,0.16)]";
const secondaryButtonSurface =
  "border border-[#DDD6C8] bg-[#EFE9DB] text-[#202020] shadow-[0_10px_22px_rgba(32,32,32,0.08)]";
const controlSurface =
  "border border-[#DDD6C8] bg-[rgba(239,233,219,0.86)] text-[#202020] shadow-[0_12px_28px_rgba(32,32,32,0.08)]";
const sectionRule = "border-t border-[#DDD6C8] pt-12";

export const uiTokens = {
  button:
    `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-bold transition active:translate-y-0.5 ${buttonSurface}`,
  secondaryButton:
    `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-bold transition active:translate-y-0.5 ${secondaryButtonSurface}`,
  eyebrow:
    "inline-flex rounded-full bg-[#F6BBDD] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#202020]",
  controlSurface,
  greenButtonSurface: buttonSurface,
  secondaryButtonSurface,
  page:
    "relative min-h-screen overflow-x-hidden bg-[#FBF5E7] text-[#202020]",
  header:
    "rounded-[28px] border border-[#DDD6C8] bg-[rgba(239,233,219,0.86)] px-5 py-4 text-[#202020] shadow-[0_12px_28px_rgba(32,32,32,0.08)]",
  heroPanel:
    "rounded-[36px] border border-[#DDD6C8] bg-[#EFE9DB] p-6 text-[#202020] shadow-[0_22px_50px_rgba(32,32,32,0.12)]",
  sectionRule,
  sectionEyebrow:
    "text-[12px] font-semibold uppercase tracking-[0.14em] text-[#202020]",
  sectionTitle:
    "mt-2 text-[38px] font-bold leading-[1.04] tracking-[-0.042em] text-[#202020]",
  label: "text-[#202020]",
  title: "text-[#202020]",
  body: "text-[#202020]",
  muted: "text-[#746F67]",
  border: "border-[#DDD6C8]",
  surface: "bg-[#EFE9DB]",
  coreSurface: "bg-[#BACCEC]",
  smallAccentPink: "bg-[#F6BBDD] text-[#202020]",
  smallAccentYellow: "bg-[#F6DA6E] text-[#202020]",
  smallAccentSage: "bg-[#A2AE6E] text-[#202020]",
  landing: {
    page:
      "relative min-h-screen overflow-x-hidden bg-[#FBF5E7] text-[#202020]",
    header:
      "rounded-[28px] border border-[#DDD6C8] bg-[rgba(239,233,219,0.86)] px-5 py-4 text-[#202020] shadow-[0_12px_28px_rgba(32,32,32,0.08)]",
    heroPanel:
      "rounded-[36px] border border-[#DDD6C8] bg-[#EFE9DB] p-6 text-[#202020] shadow-[0_22px_50px_rgba(32,32,32,0.12)]",
    surface:
      "rounded-[30px] border border-[#DDD6C8] bg-[rgba(239,233,219,0.86)] p-5 shadow-[0_16px_36px_rgba(32,32,32,0.08)]",
    controlSurface,
    button:
      `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-bold transition active:translate-y-0.5 ${buttonSurface}`,
    secondaryButton:
      `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-bold transition active:translate-y-0.5 ${secondaryButtonSurface}`,
    primaryButtonSurface: buttonSurface,
    secondaryButtonSurface,
    sectionRule,
    sectionEyebrow:
      "text-[12px] font-semibold uppercase tracking-[0.14em] text-[#202020]",
    sectionTitle:
      "mt-2 text-[38px] font-bold leading-[1.04] tracking-[-0.042em] text-[#202020]",
    badge:
      "inline-flex rounded-full bg-[#F6BBDD] px-4 py-2 text-[12px] font-semibold tracking-[-0.01em] text-[#202020]",
    label:
      "text-[13px] font-semibold uppercase tracking-[0.08em] text-[#202020]",
    ink: "text-[#202020]",
    muted: "text-[#746F67]",
  },
};
