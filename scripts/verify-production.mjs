const origin = (process.env.SITE_ORIGIN ?? "https://www.patchtray.io").replace(/\/+$/, "");
const apex = "https://patchtray.io";
const publicPaths = [
  "/",
  "/download",
  "/guide",
  "/guides",
  "/guides/voicemeeter-vst3-plugins",
  "/guides/run-vst3-without-daw",
  "/privacy",
  "/terms",
  "/refunds",
  "/support",
];
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function request(url, init = {}) {
  try {
    return await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
      headers: { "user-agent": "PatchTray-production-verifier/1.0" },
      ...init,
    });
  } catch (error) {
    failures.push(`${url}: request failed (${error instanceof Error ? error.message : String(error)})`);
    return undefined;
  }
}

function canonical(pathname) {
  return `${origin}${pathname}`;
}

const apexResponse = await request(`${apex}/`);
if (apexResponse) {
  check([301, 308].includes(apexResponse.status), `apex: expected permanent redirect, received ${apexResponse.status}`);
  check(apexResponse.headers.get("location") === `${origin}/`, "apex: redirect does not target canonical www origin");
}

for (const pathname of publicPaths) {
  const response = await request(canonical(pathname));
  if (!response) continue;
  check(response.status === 200, `${pathname}: expected HTTP 200, received ${response.status}`);
  check(response.headers.get("content-type")?.includes("text/html"), `${pathname}: expected HTML response`);
  const html = await response.text();
  check(/<h1(?:\s[^>]*)?>/i.test(html), `${pathname}: initial HTML is missing h1`);
  check(
    html.includes(`rel="canonical" href="${canonical(pathname)}"`),
    `${pathname}: initial HTML is missing the exact canonical`,
  );
  check(!html.includes('name="robots" content="noindex'), `${pathname}: public page is unexpectedly noindex`);
}

const sitemapResponse = await request(`${origin}/sitemap.xml`);
if (sitemapResponse) {
  check(sitemapResponse.status === 200, `sitemap: expected HTTP 200, received ${sitemapResponse.status}`);
  check(sitemapResponse.headers.get("content-type")?.includes("xml"), "sitemap: response is not XML");
  const sitemap = await sitemapResponse.text();
  for (const pathname of publicPaths) {
    check(sitemap.includes(`<loc>${canonical(pathname)}</loc>`), `sitemap: missing ${pathname}`);
  }
}

const feedResponse = await request(`${origin}/guides/feed.xml`);
if (feedResponse) {
  check(feedResponse.status === 200, `guide feed: expected HTTP 200, received ${feedResponse.status}`);
  check(feedResponse.headers.get("content-type")?.includes("xml"), "guide feed: response is not XML");
  const feed = await feedResponse.text();
  check((feed.match(/<entry>/g) ?? []).length === 2, "guide feed: expected two entries");
}

const robotsResponse = await request(`${origin}/robots.txt`);
if (robotsResponse) {
  check(robotsResponse.status === 200, `robots: expected HTTP 200, received ${robotsResponse.status}`);
  check(
    (await robotsResponse.text()).includes(`Sitemap: ${origin}/sitemap.xml`),
    "robots: sitemap declaration drift",
  );
}

const missingResponse = await request(`${origin}/seo-verifier-this-route-must-not-exist`);
if (missingResponse) {
  check(missingResponse.status === 404, `unknown route: expected HTTP 404, received ${missingResponse.status}`);
}

const uppercaseResponse = await request(`${origin}/Download`);
if (uppercaseResponse) {
  check([301, 308].includes(uppercaseResponse.status), `uppercase route: expected permanent redirect`);
  check(uppercaseResponse.headers.get("location") === "/download", "uppercase route: bad redirect target");
}

for (const pathname of ["/checkout/success", "/concepts"]) {
  const response = await request(canonical(pathname));
  if (!response) continue;
  check(response.status === 200, `${pathname}: expected HTTP 200`);
  check(
    response.headers.get("x-robots-tag")?.toLowerCase().includes("noindex"),
    `${pathname}: missing noindex response header`,
  );
}

if (failures.length > 0) {
  console.error(`[verify:production] ${origin}: ${failures.length} failed checks`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `[verify:production] ${origin}: canonical redirect, ${publicPaths.length} public pages, sitemap, guide feed, 404, duplicate redirect, noindex headers`,
  );
}
