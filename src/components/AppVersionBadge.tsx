import packageInfo from "../../package.json";

const APP_VERSION = packageInfo.version;
const APP_VERSION_NOTE = "UI flow update";

export default function AppVersionBadge() {
  return <VersionBadgeBody />;
}

export function LandingVersionBadge() {
  return (
    <VersionBadgeBody
      className="fixed bottom-4 right-4 z-30 rounded-full border border-[#DDD6C8] bg-[#EFE9DB] px-3 py-1.5 text-right shadow-[0_8px_22px_rgba(32,32,32,0.1)]"
      versionClassName="text-[11px] font-extrabold leading-4 text-[#202020]"
      noteClassName="text-[10px] font-bold leading-3 text-[#746F67]"
    />
  );
}

function VersionBadgeBody({
  className = "fixed bottom-4 right-4 z-30 rounded-full border border-[#DDD6C8] bg-[rgba(239,233,219,0.78)] px-3 py-1.5 text-right shadow-[0_6px_18px_rgba(32,32,32,0.08)]",
  versionClassName = "text-[11px] font-extrabold leading-4 text-[#202020]",
  noteClassName = "text-[10px] font-bold leading-3 text-[#746F67]",
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
