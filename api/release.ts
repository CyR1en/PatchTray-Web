import { fetchLatestManifest } from "../src/lib/release";

/**
 * Serves the published `latest.json` to the browser.
 *
 * GitHub release assets are returned without CORS headers, so the site cannot
 * read the manifest directly. This function fetches it server-side and lets the
 * Vercel edge cache absorb the traffic (5 min fresh, stale served for a day
 * while it revalidates).
 */

/** Minimal Node response surface, so this file needs no `@vercel/node` types. */
type ResponseLike = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

export default async function handler(_request: unknown, response: ResponseLike) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const manifest = await fetchLatestManifest();
    response.statusCode = 200;
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    response.end(JSON.stringify(manifest));
  } catch (error) {
    response.statusCode = 502;
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify({ error: error instanceof Error ? error.message : "release manifest unavailable" }));
  }
}
