import packageInfo from "../../package.json";

const APP_VERSION = packageInfo.version;
const APP_VERSION_NOTE = "UI flow update";

export default function AppVersionBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-30 rounded-full border border-[rgba(30,111,92,0.28)] bg-[rgba(240,247,244,0.74)] px-3 py-1.5 text-right shadow-[0_6px_18px_rgba(14,27,20,0.08)]">
      <p className="text-[11px] font-extrabold leading-4 text-[rgba(14,27,20,0.72)]">
        {APP_VERSION}
      </p>
      <p className="text-[10px] font-bold leading-3 text-[rgba(14,27,20,0.56)]">
        {APP_VERSION_NOTE}
      </p>
    </div>
  );
}
