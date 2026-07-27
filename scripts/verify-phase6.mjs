import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "dist");

function outputPath(pathname) {
  if (pathname === "/") return resolve(outputRoot, "index.html");
  return resolve(outputRoot, `${pathname.slice(1)}.html`);
}

const expected = [
  ["/", "Download page intent", "home_hero"],
  ["/", "Download page intent", "home_closing"],
  ["/download", "Installer download", "download_page"],
  ["/download", "Checkout start", "monthly"],
  ["/download", "Checkout start", "lifetime"],
  ["/guide", "Guide conversion", "quickstart_download"],
  ["/guides", "Guide conversion", "hub_quickstart"],
  ["/guides/voicemeeter-vst3-plugins", "Guide conversion", "article_download"],
  ["/guides/run-vst3-without-daw", "Guide conversion", "article_download"],
];

for (const [pathname, event, detail] of expected) {
  const html = await readFile(outputPath(pathname), "utf8");
  assert(
    html.includes(`data-analytics-event="${event}"`) && html.includes(`data-analytics-detail="${detail}"`),
    `${pathname}: missing ${event} / ${detail} outcome instrumentation`,
  );
}

const analyticsSource = await readFile(resolve(projectRoot, "src", "lib", "analytics.ts"), "utf8");
for (const forbidden of ["querySelector('input", "searchParams", "textContent", "innerText", "href:"]) {
  assert(!analyticsSource.includes(forbidden), `analytics: forbidden arbitrary or sensitive payload source "${forbidden}"`);
}
assert(analyticsSource.includes("route: window.location.pathname"), "analytics: missing clean route property");
assert(analyticsSource.includes("detail,"), "analytics: missing controlled detail property");

const mainSource = await readFile(resolve(projectRoot, "src", "main.tsx"), "utf8");
assert(mainSource.includes("installOutcomeTracking(track)"), "analytics: outcome listener is not installed");
assert(mainSource.includes("stripQuery(event.url)"), "analytics: pageview query redaction drift");
assert(
  mainSource.includes('window.location.hostname !== "www.patchtray.io"'),
  "analytics: telemetry must remain production-host gated",
);

const runbook = await readFile(resolve(projectRoot, "docs", "PRODUCTION_SEO_RUNBOOK.md"), "utf8");
for (const required of [
  "npm run verify:production",
  "Google Search Console",
  "sitemap.xml",
  "URL Inspection",
  "Download page intent",
  "Checkout start",
  "No personal data",
  "rollback",
]) {
  assert(runbook.includes(required), `production runbook: missing "${required}"`);
}

console.log(`[verify:phase6] ${expected.length} outcome placements, privacy guardrails, production verification, launch runbook`);
