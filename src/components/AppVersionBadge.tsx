import packageInfo from "../../package.json";

const APP_VERSION = packageInfo.version;
const APP_VERSION_NOTE = "UI flow update";

export default function AppVersionBadge() {
  return <VersionBadgeBody />;
}

export function LandingVersionBadge() {
  return (
    <VersionBadgeBody
      className="fixed bottom-4 right-4 z-30 rounded-full border border-[rgba(217,142,115,0.24)] bg-[#FFF8ED] px-3 py-1.5 text-right shadow-[0_8px_22px_rgba(51,36,29,0.1)]"
      versionClassName="text-[11px] font-extrabold leading-4 text-[#33241D]"
      noteClassName="text-[10px] font-bold leading-3 text-[#82685D]"
    />
  );
}

function VersionBadgeBody({
  className = "fixed bottom-4 right-4 z-30 rounded-full border border-[rgba(217,142,115,0.24)] bg-[rgba(255,248,237,0.78)] px-3 py-1.5 text-right shadow-[0_6px_18px_rgba(51,36,29,0.08)]",
  versionClassName = "text-[11px] font-extrabold leading-4 text-[rgba(51,36,29,0.72)]",
  noteClassName = "text-[10px] font-bold leading-3 text-[rgba(130,104,93,0.72)]",
}: {
  className?: string;
  versionClassName?: string;
  noteClassName?: string;
}) {
  return (
    <div className={className}>
      <p className={versionClassName}>
        {APP_VERSION}
      </p>
      <p className={noteClassName}>
        {APP_VERSION_NOTE}
      </p>
    </div>
  );
}
