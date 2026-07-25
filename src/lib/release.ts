/**
 * Release metadata published by the PatchTray desktop app.
 *
 * Each GitHub release attaches a `latest.json` updater manifest; it is the
 * source of truth for the version and the Windows installer link the site
 * advertises. Shape (only the fields the site reads):
 *
 * ```json
 * { "version": "0.3.2", "platforms": { "windows-x86_64": { "url": "https://…msi" } } }
 * ```
 *
 * This module is shared by the browser bundle, the `/api/release` function, and
 * the build-time fetch in `vite.config.ts`, so it must stay free of
 * `import.meta.env` and DOM access.
 */
export const RELEASE_REPOSITORY = "CyR1en/PatchTray";

export const LATEST_MANIFEST_URL = `https://github.com/${RELEASE_REPOSITORY}/releases/latest/download/latest.json`;

export type LatestRelease = {
  /** Version without a leading `v`, e.g. `0.3.2`. */
  version: string;
  /** Direct link to the Windows installer for that version. */
  downloadUrl: string;
};

type ManifestPlatform = { url?: unknown };

const readPlatforms = (raw: unknown): Record<string, ManifestPlatform> => {
  const platforms = (raw as { platforms?: unknown } | null)?.platforms;
  return platforms && typeof platforms === "object" ? (platforms as Record<string, ManifestPlatform>) : {};
};

const readWindowsUrl = (platforms: Record<string, ManifestPlatform>): string => {
  const key =
    "windows-x86_64" in platforms
      ? "windows-x86_64"
      : Object.keys(platforms).find((name) => name.startsWith("windows"));
  const url = key ? platforms[key]?.url : undefined;
  return typeof url === "string" ? url.trim() : "";
};

/**
 * Reads a `latest.json` payload. Returns `null` for anything unusable — a
 * partial or unexpected manifest must leave the site on its configured
 * fallback rather than render a broken version or a dead download link.
 */
export function parseLatestRelease(raw: unknown): LatestRelease | null {
  if (!raw || typeof raw !== "object") return null;

  const rawVersion = (raw as { version?: unknown }).version;
  const version = typeof rawVersion === "string" ? rawVersion.trim().replace(/^v/i, "") : "";
  const downloadUrl = readWindowsUrl(readPlatforms(raw));

  if (!version || !downloadUrl.startsWith("https://")) return null;
  return { version, downloadUrl };
}

/** Fetches and validates the published manifest. Rejects on network/parse failure. */
export async function fetchLatestManifest(timeoutMs = 8000): Promise<unknown> {
  const response = await fetch(LATEST_MANIFEST_URL, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`manifest request failed: HTTP ${response.status}`);

  const manifest: unknown = await response.json();
  if (!parseLatestRelease(manifest)) throw new Error("manifest is missing a version or a windows download url");
  return manifest;
}
