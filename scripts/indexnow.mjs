/**
 * IndexNow submission.
 *
 * Tells participating search engines — Bing, Yandex, Seznam, Naver — that a set
 * of URLs changed, instead of waiting to be crawled. Google does not participate,
 * so this never substitutes for earning links; it just stops Bing from being
 * weeks behind, which matters more than it sounds for a Windows desktop app.
 *
 * The key is public by design. IndexNow authenticates a submission by fetching
 * `keyLocation` and checking it contains the same key, which only works if the
 * file is served openly. `prerender.mjs` writes that file from this constant, so
 * the published key and the submitted key cannot drift apart.
 *
 * Run after a deploy is actually live:
 *
 *   npm run indexnow
 *   npm run indexnow -- --dry-run
 *   npm run indexnow -- --url https://www.patchtray.io/blog/some-new-post
 */
import { XMLParser } from "fast-xml-parser";

export const INDEXNOW_KEY = "0af55856bc7e369cb1a7ecac46d26409";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const DEFAULT_ORIGIN = "https://www.patchtray.io";

function parseArgs(argv) {
  const args = { dryRun: false, origin: DEFAULT_ORIGIN, urls: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--origin") args.origin = argv[++index] ?? args.origin;
    else if (arg === "--url") args.urls.push(argv[++index]);
    else throw new Error(`[indexnow] unknown argument ${arg}`);
  }
  args.origin = args.origin.replace(/\/+$/, "");
  return args;
}

async function fetchText(url, description) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`[indexnow] ${description} returned ${response.status} (${url})`);
  }
  return response.text();
}

async function sitemapUrls(origin) {
  const xml = await fetchText(`${origin}/sitemap.xml`, "sitemap");
  const parsed = new XMLParser().parse(xml);
  const entries = parsed?.urlset?.url;
  const list = Array.isArray(entries) ? entries : entries ? [entries] : [];
  const urls = list.map((entry) => String(entry.loc)).filter(Boolean);
  if (urls.length === 0) throw new Error("[indexnow] sitemap listed no URLs");
  return urls;
}

/**
 * A submission whose key file is missing is rejected wholesale, so confirm it is
 * being served before spending the quota.
 */
async function assertKeyPublished(keyLocation) {
  const response = await fetch(keyLocation, { redirect: "follow" });
  if (response.status === 404) {
    throw new Error(
      `[indexnow] no key file at ${keyLocation}.\n` +
        "  The key ships with the site, so a build carrying it has to be deployed\n" +
        "  before any submission can authenticate. Deploy first, then rerun.",
    );
  }
  if (!response.ok) {
    throw new Error(`[indexnow] key file returned ${response.status} (${keyLocation})`);
  }

  const published = (await response.text()).trim();
  if (published !== INDEXNOW_KEY) {
    throw new Error(
      `[indexnow] ${keyLocation} serves "${published.slice(0, 32)}" but this script submits "${INDEXNOW_KEY}"`,
    );
  }
}

async function main() {
  const { dryRun, origin, urls: explicitUrls } = parseArgs(process.argv.slice(2));
  const host = new URL(origin).host;
  const keyLocation = `${origin}/${INDEXNOW_KEY}.txt`;
  const urls = explicitUrls.length > 0 ? explicitUrls : await sitemapUrls(origin);

  const offSite = urls.filter((url) => new URL(url).host !== host);
  if (offSite.length > 0) {
    throw new Error(`[indexnow] refusing to submit URLs outside ${host}: ${offSite.join(", ")}`);
  }

  const payload = { host, key: INDEXNOW_KEY, keyLocation, urlList: urls };

  if (dryRun) {
    console.log(`[indexnow] dry run — would submit ${urls.length} URL(s) to ${ENDPOINT}`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  await assertKeyPublished(keyLocation);

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  // 200 accepted, 202 accepted but the key is still being validated.
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(
      `[indexnow] submission failed with ${response.status} ${response.statusText}: ${await response.text()}`,
    );
  }

  console.log(`[indexnow] submitted ${urls.length} URL(s) for ${host} (${response.status})`);
  for (const url of urls) console.log(`[indexnow]   ${url}`);
}

if (import.meta.filename === process.argv[1]) {
  await main();
}
