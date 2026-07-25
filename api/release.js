/**
 * Serves the published `latest.json` to the browser.
 *
 * GitHub release assets are returned without CORS headers, so the site cannot
 * read the manifest directly. This function fetches it server-side and lets the
 * Vercel edge cache absorb the traffic (5 min fresh, stale served for a day
 * while it revalidates).
 *
 * Plain JavaScript on purpose: Vercel compiles `api/*.ts` with the project's
 * own `typescript`, and TypeScript 7 dropped the classic JS compiler API that
 * compile step calls — it fails the deploy with "Cannot read properties of
 * undefined (reading 'readFile')". A .js function skips that path entirely.
 *
 * The manifest is forwarded as published. `parseLatestRelease` in
 * `src/lib/release.ts` is the single validator, since it has to vet the
 * build-time seed anyway; a malformed manifest leaves the site on its
 * configured fallback either way. Keep this URL in step with
 * `LATEST_MANIFEST_URL` there.
 */
const LATEST_MANIFEST_URL = "https://github.com/CyR1en/PatchTray/releases/latest/download/latest.json";

export default async function handler(_request, response) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const upstream = await fetch(LATEST_MANIFEST_URL, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) throw new Error(`manifest request failed: HTTP ${upstream.status}`);

    const manifest = await upstream.json();
    response.statusCode = 200;
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    response.end(JSON.stringify(manifest));
  } catch (error) {
    response.statusCode = 502;
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify({ error: error instanceof Error ? error.message : "release manifest unavailable" }));
  }
}
