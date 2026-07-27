import { useSyncExternalStore } from "react";
import { siteConfig } from "../config";
import { parseLatestRelease, type LatestRelease } from "../lib/release";

/**
 * Live release metadata, shared by every component that shows a version or the
 * download link.
 *
 * Resolution order, most trusted first:
 *   1. `/api/release` — the manifest as published right now (fetched once per page load).
 *   2. `__RELEASE_MANIFEST__` — the same manifest, captured at build time by `vite.config.ts`.
 *      Renders correct values on first paint, so a live refresh is usually a no-op.
 *   3. `VITE_RELEASE_VERSION` / `VITE_DOWNLOAD_URL` — fallback when the release page is
 *      unreachable. An empty download url keeps the honest pending UI.
 *
 * The store is module-level rather than context so the fetch happens once no
 * matter how many components read it.
 */
const configFallback: LatestRelease = {
  version: siteConfig.releaseVersion,
  downloadUrl: siteConfig.downloadUrl,
};

let snapshot: LatestRelease = parseLatestRelease(__RELEASE_MANIFEST__) ?? configFallback;
let started = false;
const listeners = new Set<() => void>();

function publish(next: LatestRelease) {
  if (next.version === snapshot.version && next.downloadUrl === snapshot.downloadUrl) return;
  snapshot = next;
  for (const listener of listeners) listener();
}

function start() {
  if (started) return;
  started = true;

  // Vite dev serves the proxy locally, and the production domains have the
  // Vercel function. Static preview hosts intentionally use the build-time
  // snapshot instead of producing a known `/api/release` 404.
  const isProductionHost =
    window.location.hostname === "www.patchtray.io" || window.location.hostname === "patchtray.io";
  if (!import.meta.env.DEV && !isProductionHost) return;

  void fetch(siteConfig.releaseManifestUrl, { headers: { accept: "application/json" } })
    .then((response) => (response.ok ? (response.json() as Promise<unknown>) : null))
    .then((manifest) => {
      const release = parseLatestRelease(manifest);
      if (release) publish(release);
    })
    .catch(() => {
      /* Offline or the release page is down: keep the build-time / configured values. */
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

export function useLatestRelease(): LatestRelease {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}
