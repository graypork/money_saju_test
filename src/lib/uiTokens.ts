export const palette = {
  highlight: "#ffff00",
  panel: "#ccff00",
  ink: "#000000",
  surface: "#dfff00",
} as const;

const controlSurface =
  "border-2 border-[rgba(204,255,0,0.32)] bg-[rgba(0,0,0,0.72)]";
const buttonSurface =
  "border-2 border-[#000000] bg-[#000000] shadow-[6px_6px_0_#ffff00]";
const secondaryButtonSurface =
  "border-2 border-[#000000] bg-[#dfff00] shadow-[4px_4px_0_#000000]";
const sectionRule = "border-t border-[rgba(204,255,0,0.18)] pt-12";

export const uiTokens = {
  button:
    `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-black text-[#ccff00] transition active:translate-y-0.5 ${buttonSurface}`,
  secondaryButton:
    `flex min-h-14 w-full items-center justify-center rounded-full px-[22px] py-4 text-base font-black text-[#000000] transition active:translate-y-0.5 ${secondaryButtonSurface}`,
  eyebrow:
    "inline-flex rounded-full bg-[rgba(255,255,0,0.14)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#000000]",
  controlSurface,
  greenButtonSurface: buttonSurface,
  secondaryButtonSurface,
  page:
    "relative min-h-screen overflow-x-hidden bg-[#000000] text-[#dfff00]",
  header:
    "rounded-[28px] bg-[#000000] px-5 py-4 text-[#ccff00]",
  heroPanel:
    "rounded-[36px] border border-[rgba(204,255,0,0.24)] bg-[#000000] p-6 text-[#ccff00]",
  sectionRule,
  sectionEyebrow:
    "text-[12px] font-black uppercase tracking-[0.14em] text-[#ccff00]",
  sectionTitle:
    "mt-2 text-[38px] font-black leading-[1.02] tracking-[-0.045em] text-[#dfff00]",
  label: "text-[#ccff00]",
  title: "text-[#dfff00]",
  body: "text-[rgba(223,255,0,0.72)]",
  muted: "text-[rgba(223,255,0,0.56)]",
  border: "border-[rgba(204,255,0,0.22)]",
  surface: "bg-[rgba(0,0,0,0.72)]",
  orangeText: "text-[#ffff00]",
  orangeSurface: "bg-[rgba(255,255,0,0.08)]",
};
