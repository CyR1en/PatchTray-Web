import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const productionOriginIndex = process.argv.indexOf("--origin");
const productionOrigin =
  productionOriginIndex === -1
    ? undefined
    : process.argv[productionOriginIndex + 1]?.replace(/\/+$/, "");
const minimumQuestionCount = 10;

function assert(condition, message) {
  if (!condition) throw new Error(`[verify:faq] ${message}`);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function structuredDataFrom(html) {
  return [...html.matchAll(
    /<script type="application\/ld\+json" data-patchtray-structured-data="true">([\s\S]*?)<\/script>/g,
  )].map((match) => JSON.parse(match[1]));
}

function verifyFaqDocument(html, sitemap, source) {
  assert(/<link rel="canonical" href="https:\/\/www\.patchtray\.io\/faq"\s*\/>/.test(html), `${source} has no FAQ canonical URL`);
  assert(/<title>PatchTray FAQ/.test(html), `${source} has the wrong document title`);

  const structuredData = structuredDataFrom(html);
  const faqPage = structuredData.find((item) => item["@type"] === "FAQPage");
  const breadcrumb = structuredData.find((item) => item["@type"] === "BreadcrumbList");
  assert(faqPage, `${source} has no FAQPage JSON-LD`);
  assert(breadcrumb, `${source} has no BreadcrumbList JSON-LD`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(faqPage.lastReviewed ?? ""), `${source} has no ISO lastReviewed date`);
  assert(faqPage.reviewedBy?.["@type"] === "Organization", `${source} has no Organization reviewer`);
  assert(faqPage.publisher?.["@type"] === "Organization", `${source} has no Organization publisher`);

  const questions = faqPage.mainEntity;
  assert(Array.isArray(questions), `${source} FAQPage has no mainEntity questions`);
  assert(questions.length >= minimumQuestionCount, `${source} has only ${questions.length} FAQ questions`);

  const detailsIds = [...html.matchAll(/<details id="([^"]+)">/g)].map((match) => match[1]);
  assert(detailsIds.length === questions.length, `${source} visible and structured question counts differ`);
  assert(new Set(detailsIds).size === detailsIds.length, `${source} contains duplicate FAQ ids`);

  for (const question of questions) {
    const answer = question.acceptedAnswer?.text;
    assert(typeof question.url === "string", `${source} question "${question.name}" has no URL`);
    const id = new URL(question.url).hash.slice(1);
    assert(question["@type"] === "Question", `${source} contains an invalid FAQ entity`);
    assert(typeof question.name === "string" && question.name.length > 0, `${source} contains an unnamed question`);
    assert(typeof answer === "string" && answer.length > 0, `${source} question "${question.name}" has no answer`);
    assert(detailsIds.includes(id), `${source} question "${question.name}" has no matching visible anchor`);
    assert(html.includes(`<h3>${escapeHtml(question.name)}</h3>`), `${source} question "${question.name}" is absent from visible HTML`);
    assert(html.includes(`<p>${escapeHtml(answer)}</p>`), `${source} answer for "${question.name}" differs from visible HTML`);
  }

  assert(sitemap.includes("<loc>https://www.patchtray.io/faq</loc>"), `${source} sitemap omits /faq`);
  const referenceUrls = [...html.matchAll(/<a[^>]+href="(\/[^"]+#[^"]+)"/g)].map((match) => match[1]);
  return { questionCount: questions.length, referenceUrls };
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "PatchTray-FAQ-Verification/1.0" },
    signal: AbortSignal.timeout(10_000),
  });
  assert(response.ok, `${url} returned HTTP ${response.status}`);
  return response.text();
}

async function readLocalRoute(pathname) {
  const filename = pathname === "/" ? "index.html" : `${pathname.slice(1)}.html`;
  return readFile(resolve(projectRoot, "dist", filename), "utf8");
}

async function verifyReferenceAnchors(referenceUrls, source) {
  const uniqueReferences = [...new Set(referenceUrls)];
  await Promise.all(uniqueReferences.map(async (referenceUrl) => {
    const url = new URL(referenceUrl, productionOrigin ?? "https://www.patchtray.io");
    const document = productionOrigin
      ? await fetchText(`${productionOrigin}${url.pathname}`)
      : await readLocalRoute(url.pathname);
    const fragment = decodeURIComponent(url.hash.slice(1));
    assert(
      document.includes(`id="${fragment}"`),
      `${source} evidence link ${referenceUrl} has no matching destination anchor`,
    );
  }));
  return uniqueReferences.length;
}

let html;
let sitemap;
let source;

if (productionOrigin) {
  assert(/^https?:\/\//.test(productionOrigin), "--origin must be an absolute HTTP(S) URL");
  [html, sitemap] = await Promise.all([
    fetchText(`${productionOrigin}/faq`),
    fetchText(`${productionOrigin}/sitemap.xml`),
  ]);
  source = productionOrigin;
} else {
  [html, sitemap] = await Promise.all([
    readFile(resolve(projectRoot, "dist", "faq.html"), "utf8"),
    readFile(resolve(projectRoot, "dist", "sitemap.xml"), "utf8"),
  ]);
  source = "dist";
}

const { questionCount, referenceUrls } = verifyFaqDocument(html, sitemap, source);
const referenceCount = await verifyReferenceAnchors(referenceUrls, source);
console.log(`[verify:faq] ${source}: ${questionCount} visible answers match FAQPage JSON-LD; review provenance, canonical URL, sitemap, and ${referenceCount} evidence anchors verified`);
