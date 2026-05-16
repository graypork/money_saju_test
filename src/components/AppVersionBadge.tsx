const APP_VERSION = "v0.9.10";
const APP_VERSION_NOTE = "UI flow update";

export default function AppVersionBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-30 rounded-full border border-[rgba(97,74,55,0.18)] bg-[#FFFDF8] px-3 py-1.5 text-right shadow-[0_6px_18px_rgba(97,74,55,0.08)]">
      <p className="text-[11px] font-extrabold leading-4 text-[rgba(97,74,55,0.72)]">
        {APP_VERSION}
      </p>
      <p className="text-[10px] font-bold leading-3 text-[rgba(97,74,55,0.52)]">
        {APP_VERSION_NOTE}
      </p>
    </div>
  );
}
