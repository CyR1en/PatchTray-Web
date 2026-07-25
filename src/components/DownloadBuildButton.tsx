import { hasValue } from "../config";
import { useLatestRelease } from "../hooks/useLatestRelease";
import { WindowsMark } from "./marks";

export function DownloadBuildButton({ className = "" }: { className?: string }) {
  const { downloadUrl } = useLatestRelease();

  if (hasValue(downloadUrl)) {
    return (
      <a className={`button button--primary ${className}`} href={downloadUrl}>
        <WindowsMark /> [ download for windows ]
      </a>
    );
  }

  return (
    <div className="download-unavailable">
      <button className={`button button--primary ${className}`} disabled aria-describedby="download-pending-note">
        <WindowsMark /> [ download for windows ]
      </button>
      <p id="download-pending-note">[ download link being prepared ]</p>
    </div>
  );
}
