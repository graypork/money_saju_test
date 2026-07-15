export const palette = {
  honey: "#F3D58B",
  cream: "#FFF8ED",
  rose: "#D98E73",
  ink: "#33241D",
  body: "#82685D",
  roseSoft: "#E7C5B8",
} as const;

const buttonSurface =
  "bg-[#D98E73] text-[#FFF8ED] shadow-[0_14px_28px_rgba(51,36,29,0.14)]";
const secondaryButtonSurface =
  "border border-[rgba(217,142,115,0.42)] bg-[#FFF8ED] text-[#33241D] shadow-[0_10px_22px_rgba(51,36,29,0.08)]";
const controlSurface =
  "border border-[rgba(217,142,115,0.22)] bg-[rgba(255,248,237,0.86)] shadow-[0_12px_28px_rgba(51,36,29,0.08)]";
const sectionRule = "border-t border-[rgba(51,36,29,0.12)] pt-12";

export const uiTokens = {
  button:
    `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-black transition active:translate-y-0.5 ${buttonSurface}`,
  secondaryButton:
    `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-black transition active:translate-y-0.5 ${secondaryButtonSurface}`,
  eyebrow:
    "inline-flex rounded-full bg-[rgba(231,197,184,0.56)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#33241D]",
  controlSurface,
  greenButtonSurface: buttonSurface,
  secondaryButtonSurface,
  page:
    "relative min-h-screen overflow-x-hidden bg-[#F3D58B] text-[#33241D]",
  header:
    "rounded-[28px] border border-[rgba(255,248,237,0.62)] bg-[rgba(255,248,237,0.76)] px-5 py-4 text-[#33241D] shadow-[0_12px_28px_rgba(51,36,29,0.08)]",
  heroPanel:
    "rounded-[36px] border border-[rgba(255,248,237,0.72)] bg-[#FFF8ED] p-6 text-[#33241D] shadow-[0_22px_50px_rgba(51,36,29,0.12)]",
  sectionRule,
  sectionEyebrow:
    "text-[12px] font-black uppercase tracking-[0.14em] text-[#D98E73]",
  sectionTitle:
    "mt-2 text-[38px] font-black leading-[1.04] tracking-[-0.042em] text-[#33241D]",
  label: "text-[#33241D]",
  title: "text-[#33241D]",
  body: "text-[#82685D]",
  muted: "text-[#82685D]",
  border: "border-[rgba(51,36,29,0.12)]",
  surface: "bg-[#FFF8ED]",
  orangeText: "text-[#D98E73]",
  orangeSurface: "bg-[rgba(231,197,184,0.4)]",
  landing: {
    page:
      "relative min-h-screen overflow-x-hidden bg-[#F3D58B] text-[#33241D]",
    header:
      "rounded-[28px] border border-[rgba(255,248,237,0.62)] bg-[rgba(255,248,237,0.76)] px-5 py-4 text-[#33241D] shadow-[0_12px_28px_rgba(51,36,29,0.08)]",
    heroPanel:
      "rounded-[36px] border border-[rgba(255,248,237,0.72)] bg-[#FFF8ED] p-6 text-[#33241D] shadow-[0_22px_50px_rgba(51,36,29,0.12)]",
    surface:
      "rounded-[30px] border border-[rgba(217,142,115,0.18)] bg-[rgba(255,248,237,0.86)] p-5 shadow-[0_16px_36px_rgba(51,36,29,0.08)]",
    controlSurface,
    button:
      `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-black transition active:translate-y-0.5 ${buttonSurface}`,
    secondaryButton:
      `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-black transition active:translate-y-0.5 ${secondaryButtonSurface}`,
    primaryButtonSurface: buttonSurface,
    secondaryButtonSurface,
    sectionRule,
    sectionEyebrow:
      "text-[12px] font-black uppercase tracking-[0.14em] text-[#D98E73]",
    sectionTitle:
      "mt-2 text-[38px] font-black leading-[1.04] tracking-[-0.042em] text-[#33241D]",
    badge:
      "inline-flex rounded-full bg-[rgba(231,197,184,0.56)] px-4 py-2 text-[12px] font-black tracking-[-0.01em] text-[#33241D]",
    label:
      "text-[13px] font-black uppercase tracking-[0.08em] text-[#33241D]",
    ink: "text-[#33241D]",
    muted: "text-[#82685D]",
  },
};
