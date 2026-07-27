# PatchTray SEO Plan

Status: Phases 1–6 implemented locally; production deployment and external account actions pending
Last updated: July 27, 2026
Primary site: `https://www.patchtray.io`

## Objective

Make every public PatchTray page easy to discover, render, index, and understand while preserving the current visual design and React implementation.

The first milestone is technical reliability: search crawlers should receive complete route-specific HTML, canonical URLs, valid status codes, and a sitemap without executing JavaScript. After that foundation is in place, improve performance and publish focused documentation that answers the searches PatchTray is built to serve.

## Current baseline

### Strengths

- Clear product positioning around Windows, ASIO, VST3, Voicemeeter, and live audio.
- Unique titles and descriptions are already defined for public routes.
- One clear `h1` per page with a logical heading hierarchy.
- Strong internal navigation, descriptive link text, and useful image alt text.
- Checkout, concept, and not-found pages are marked `noindex` in the rendered application.
- July 27, 2026 Lighthouse lab results:
  - SEO: 100
  - Accessibility: 100
  - Best practices: 100
  - Performance: 99
  - FCP: 1.36 seconds
  - LCP: 2.19 seconds
  - TBT: 0 milliseconds
  - CLS: 0

Lighthouse's SEO score only covers page-level basics. It does not clear the crawl, sitemap, status-code, or rendering issues below.

### Initial blocking issues

The following issues were found in the initial audit and are now addressed in
the local Phase 1–3 implementation. Deployment and Search Console verification
remain pending.

1. The apex domain redirects to `www`, but canonical URLs use the apex domain.
2. Every route initially returns the same empty React shell and homepage metadata.
3. `/sitemap.xml` returns HTML instead of a sitemap.
4. Unknown URLs return HTTP 200 and become soft 404s.
5. Uppercase and trailing-slash route variants return 200 instead of redirecting.
6. Open Graph and Twitter metadata are generic and not route-specific.
7. The homepage's intentional headline animation delays the LCP element.

## Success criteria

The technical milestone is complete when:

- Every public route returns complete, route-specific HTML without requiring JavaScript.
- Canonicals, redirects, sitemap URLs, and social metadata consistently use `https://www.patchtray.io`.
- Every canonical public URL returns HTTP 200.
- Every retired or unknown URL returns HTTP 404 or 410.
- Duplicate path variants redirect once to the canonical URL.
- `/sitemap.xml` returns valid XML and is referenced by `robots.txt`.
- Transactional and internal-only routes remain excluded from search.
- Mobile Lighthouse performance is at least 90 on the homepage and key landing pages.
- Lab LCP is at most 2.5 seconds, CLS at most 0.1, and TBT at most 200 milliseconds.
- Google Search Console reports all intended public pages as indexed without soft-404 or canonical conflicts.

Field Core Web Vitals should be evaluated at the 75th percentile once at least 28 days of production data are available.

## Phase 1: Crawl and index reliability

Priority: P0
Target: first implementation cycle

Implementation note, July 27, 2026: the codebase now pre-renders all known
routes, generates the sitemap from the public route table, emits a static 404,
uses the `www` canonical origin, and validates the artifacts during
`npm run build`. Production response and Search Console checks remain pending
until the next deployment.

### 1. Standardize the canonical host

Use `https://www.patchtray.io` as the primary origin because production currently redirects the apex domain there.

Tasks:

- Change the default `siteOrigin` in `src/config.ts`.
- Change the baseline canonical in `index.html`.
- Ensure the production `VITE_SITE_ORIGIN` is either unset or exactly `https://www.patchtray.io`.
- Keep the apex-to-`www` redirect as a single permanent 308 redirect.
- Use the `www` origin in the sitemap, structured data, Open Graph URLs, and documentation.

Acceptance checks:

```sh
curl -I https://patchtray.io/                 # 308 to https://www.patchtray.io/
curl -I https://www.patchtray.io/             # 200
curl -s https://www.patchtray.io/ | rg canonical
```

The canonical URL in the response must not redirect.

### 2. Pre-render every public route

Keep React for interactivity, but produce static HTML for each indexable route during the build.

Public routes:

- `/`
- `/download`
- `/guide`
- `/privacy`
- `/terms`
- `/refunds`
- `/support`

Requirements:

- Use `src/lib/routes.ts` as the route source of truth.
- Use `src/lib/pageMeta.ts` as the metadata source of truth.
- Generate the title, description, canonical, social tags, visible headings, body copy, and internal links in the initial HTML.
- Hydrate the static output in the browser so existing interactive behavior continues to work.
- Do not create a separate crawler-only rendering path.
- Keep `/checkout/success` and `/concepts` out of the public pre-render list.

Preferred implementation:

1. Add a small build-time renderer to the current Vite project.
2. Render each public route into its own output document.
3. Refactor direct `window` access behind route or browser-safe helpers where needed.
4. Hydrate pre-rendered markup instead of always calling `createRoot`.

Only consider migrating to another framework if a small Vite pre-render step becomes difficult to maintain.

Acceptance checks:

```sh
curl -s https://www.patchtray.io/download | rg \
  'Download PatchTray for Windows|<h1|rel="canonical"'

curl -s https://www.patchtray.io/guide | rg \
  'build your first|<h1|rel="canonical"'
```

These checks must succeed with JavaScript disabled.

### 3. Generate a real sitemap

Generate `sitemap.xml` during the build from the public route table.

Requirements:

- Include only canonical, indexable URLs.
- Use absolute `https://www.patchtray.io` URLs.
- Exclude `/checkout/success`, `/concepts`, unknown routes, and fragment URLs.
- Add `lastmod` only when it reflects a real content change.
- Add `Sitemap: https://www.patchtray.io/sitemap.xml` to `public/robots.txt`.
- Return `application/xml` or `text/xml`, never the application shell.

Acceptance checks:

```sh
curl -I https://www.patchtray.io/sitemap.xml
curl -s https://www.patchtray.io/sitemap.xml
```

Validate the deployed response with an XML parser and submit it through Google Search Console and Bing Webmaster Tools.

### 4. Return real error statuses

Replace the catch-all rewrite that returns `index.html` for every path.

Requirements:

- Unknown paths return a branded 404 document with HTTP 404.
- The 404 document includes `noindex, follow`.
- `/checkout/success` and `/concepts` keep their `X-Robots-Tag: noindex, follow` headers.
- API routes continue to return their own status codes.

Acceptance checks:

```sh
curl -I https://www.patchtray.io/does-not-exist
curl -I https://www.patchtray.io/checkout/success
curl -I https://www.patchtray.io/concepts
```

Expected results:

- Unknown route: 404
- Checkout success: 200 plus `X-Robots-Tag: noindex, follow`
- Concepts: 200 plus `X-Robots-Tag: noindex, follow`

### 5. Normalize duplicate URLs

Redirect non-canonical variants before serving content.

Examples:

- `/Download` → `/download`
- `/download/` → `/download`
- `/Guide/` → `/guide`

Use one permanent redirect at most. Query parameters required for checkout must not be discarded.

## Phase 2: Metadata and entity clarity

Priority: P1
Target: immediately after Phase 1

Implementation note, July 27, 2026: every pre-rendered route now receives
route-specific Open Graph and Twitter metadata from the same model used during
browser navigation. The homepage emits `WebSite` JSON-LD, and `/download`
emits `SoftwareApplication` JSON-LD with Free, monthly, and lifetime offers
derived from the visible pricing configuration. Build verification rejects
stale or relative social URLs, invalid JSON-LD, pricing drift, or invented
reviews and ratings.

The application schema intentionally omits `review` and `aggregateRating`.
Until PatchTray has a genuine review or aggregate rating that is also visible
on the page, the entity is accurate but is not eligible for Google's
Software App rich result.

### 1. Expand the metadata model

Extend `PageMeta` so build-time rendering and browser navigation use the same fields:

- `title`
- `description`
- `canonicalPath`
- `noindex`
- `openGraphTitle`
- `openGraphDescription`
- `openGraphImage`
- `openGraphType`

Render these tags for every indexable route:

- `og:title`
- `og:description`
- `og:type`
- `og:url`
- `og:image`
- `og:image:width`
- `og:image:height`
- `twitter:card`
- `twitter:title`
- `twitter:description`
- `twitter:image`

All URL values should be absolute. Use a dedicated social image rather than a full application screenshot if the screenshot is difficult to read in a small preview.

### 2. Add structured data

Add valid JSON-LD that describes real, visible product information.

Homepage:

- `WebSite`
- `Organization` or the actual legal publisher identity once finalized

Homepage or download page:

- `SoftwareApplication`
- `name`
- `operatingSystem: Windows`
- appropriate `applicationCategory`
- current version when reliable
- canonical download or landing-page URL
- Free, monthly, and lifetime offers that exactly match visible pricing

Do not add reviews, ratings, awards, user counts, or compatibility claims that are not independently true and visible on the page.

### 3. Strengthen page intent

Keep one primary search intent per page:

- `/`: Windows VST3 host for live ASIO processing
- `/download`: Download PatchTray for Windows
- `/guide`: PatchTray setup and first live VST3 chain
- `/support`: PatchTray license, activation, download, and billing help

Legal pages should remain descriptive but are not primary acquisition pages.

## Phase 3: Performance and page experience

Priority: P1
Target: alongside or immediately after Phase 2

Implementation note, July 27, 2026: the original clipped upward hero reveal was
restored as a user-approved design choice, while the unrelated orange scan
shapes were removed. The headline is fully visible by 1.63 seconds and the
complete hero sequence settles by 2.07 seconds with compositor-only transforms
and a smooth ease-out curve. Reduced-motion visitors receive a static, fully
visible hero. Geist and Geist Mono are self-hosted and preloaded, screenshots
use responsive AVIF/WebP sources with intrinsic dimensions, and the browser
downloads only the current route's JavaScript. The production preview serves
compressed text assets so local measurements match hosted delivery more
closely.

Mobile Lighthouse baseline results from the compressed production preview
before the hero reveal was restored:

| Route | Performance | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 99 | 1.36 s | 2.19 s | 0 ms | 0 | 167 KiB |
| `/download` | 99 | 1.51 s | 2.12 s | 0 ms | 0 | 155 KiB |
| `/guide` | 99 | 1.51 s | 2.12 s | 0 ms | 0 | 152 KiB |

The homepage baseline before Phase 3 scored 72 with 4.05-second FCP,
4.99-second LCP, zero TBT, and zero CLS. After restoring the optimized reveal,
a Chrome DevTools mobile trace with Slow 4G and 4× CPU throttling measured
1.64-second LCP and zero CLS. The build also scores 100 for accessibility, best
practices, and SEO in the Chrome audit. Production field data and deployment
verification remain pending.

### 1. Keep the intentional hero reveal inside the LCP target

The homepage headline is the LCP element and is initially translated out of
view. Its animation begins after JavaScript activates the hero. The design
exception is acceptable while the measured LCP remains below 2.5 seconds.

Tasks:

- Keep the headline reveal complete by 1.7 seconds and the full hero sequence complete by 2.5 seconds.
- Use only transform/opacity animation with a smooth easing curve.
- Keep decorative scan shapes out of the headline.
- Preserve a fully visible static state for reduced-motion visitors.
- Re-run a throttled mobile performance trace after timing changes.

### 2. Eliminate the font request chain

The Google Fonts CSS `@import` blocks rendering and creates a second request chain.

Preferred approach:

- Self-host the required Geist and Geist Mono WOFF2 files.
- Use `@font-face` with `font-display: swap`.
- Preload only the font files needed above the fold.
- Keep Segoe UI and system fonts as fallbacks.

If external hosting remains, replace CSS `@import` with head links and preconnect only to origins actually used.

### 3. Optimize screenshots

Tasks:

- Export AVIF and WebP versions of application screenshots.
- Provide responsive `srcset` and `sizes`.
- Add explicit intrinsic `width` and `height`.
- Keep PNG only where lossless detail is demonstrably necessary.
- Preserve meaningful alt text and empty alt text for decorative images.

Initial target: reduce the homepage canvas screenshot transfer by at least 150 KiB on a mobile viewport.

Result: the full-width AVIF is 31,129 bytes versus the 200,871-byte PNG, a
169,742-byte reduction. The responsive 960-pixel AVIF is 15,616 bytes.

### 4. Reduce route JavaScript

Before Phase 3, all route components were imported into one client bundle.

Tasks:

- Measure route-level bundle usage.
- Code-split non-current pages if it materially reduces the initial bundle.
- Remove verified unused JavaScript.
- Do not trade a small bundle reduction for unstable hydration or additional render delay.

Result: the initial client entry fell from 298,110 bytes to 204,069 bytes.
Home is a 23,660-byte route chunk, while download and guide are each under
4,700 bytes. Cross-route browser checks completed without hydration or console
errors.

## Phase 4: Search-focused content

Priority: P2
Start only after technical indexing is reliable

Implementation note, July 27, 2026: the first content cluster is implemented
locally and covered by `npm run verify:phase4`. `/guides` is a pre-rendered
collection page, and the first two evergreen articles are complete with
original PatchTray captures, route-specific metadata, official references,
internal links, safety limits, `TechArticle` and breadcrumb structured data,
and sitemap entries. The pages are ready to deploy, but the publishing gate
below remains: confirm that the core site is indexed cleanly before releasing
this cluster to production.

### Content principles

- Answer a real setup or troubleshooting question completely.
- Use original PatchTray screenshots and concrete steps.
- State product limitations plainly.
- Link to the relevant download, guide, support, privacy, or refund page.
- Avoid thin keyword variants, mass-generated pages, and competitor comparison claims without evidence.
- Update articles when the product workflow changes.

### Initial content backlog

1. **How to use VST3 plugins with Voicemeeter** — implemented locally
   - ASIO insert flow
   - input and output channel selection
   - example microphone chain
   - latency and feedback warnings

2. **How to run VST3 effects without opening a DAW on Windows** — implemented locally
   - when a standalone host is useful
   - live input-to-output routing
   - system-tray workflow
   - limitations versus a DAW

3. **Voicemeeter ASIO inserts explained**
   - what an insert path is
   - channel mapping
   - common silent-signal and feedback mistakes
   - how PatchTray fits into the path

4. **Build a low-latency live microphone VST3 chain**
   - buffer-size tradeoffs
   - practical EQ, compression, and cleanup order
   - monitoring and troubleshooting
   - safe claims only; no universal latency promises

5. **PatchTray troubleshooting reference**
   - plugin scanning
   - missing ports
   - silent output
   - activation and recovery links

Use a `/guides/` path for new evergreen articles so the existing `/guide` remains the product quick-start page.

### Publishing cadence

- Deploy the first two completed articles only after Search Console confirms the core pages can be indexed.
- Publish one high-quality guide every two to four weeks.
- Review search queries after six to eight weeks before expanding the backlog.
- Consolidate overlapping pages instead of creating multiple pages for the same intent.

## Phase 5: Authority and distribution

Priority: P2

Implementation note, July 27, 2026: the local authority and distribution layer
is complete. The homepage now emits a stable `Organization` entity tied to the
canonical site, GitHub organization, public release repository, logo, and
support address. Guides have publication and review dates, the hub explains
the documentation standard and corrections path, and
`/guides/feed.xml` provides an Atom feed generated from the guide source of
truth. `docs/AUTHORITY_DISTRIBUTION_PLAYBOOK.md` records the canonical identity,
current public-profile gaps, release and community templates, campaign naming,
directory acceptance criteria, and measurement workflow. External profile
edits, release-note updates, posts, and directory submissions remain pending
and must follow the production indexing gate.

Tasks:

- [x] Define and verify one canonical identity for the site and public profiles.
- [x] Add a maintained guide feed and visible documentation standard.
- [x] Document release-note, community, campaign, and directory workflows.
- [ ] Change the GitHub organization and public repository website fields to the canonical `www` URL.
- [ ] Use the release-note template for future meaningful releases.
- [ ] Link product release notes back to a relevant guide or download page.
- Publish launch or update posts only in communities where the content is directly useful.
- Pursue accurate listings in relevant audio-software directories after the public beta requirements are stable.
- Do not buy links, automate forum posts, or create low-quality directory submissions.

## Phase 6: Production measurement and launch operations

Priority: P0 for the first production rollout

Implementation note, July 27, 2026: conversion measurement and the production
handoff are implemented locally. Fixed, non-personal Vercel Analytics events
cover download-page intent, installer downloads, guide conversions, and
checkout starts. Event payloads contain only the clean current pathname and a
controlled UI label; query strings, destinations, form values, and arbitrary
DOM content are excluded. `npm run verify:production` checks the deployed
canonical host, all public response documents, sitemap, guide feed, real 404,
redirects, and noindex headers. `docs/PRODUCTION_SEO_RUNBOOK.md` defines the
deployment gate, Search Console sequence, analytics verification, weekly
review, and rollback conditions.

Completed locally:

- [x] Instrument the four organic-product outcomes from the measurement plan.
- [x] Keep telemetry production-host-only and remove query strings.
- [x] Update the privacy policy for self-hosted fonts and anonymous outcome labels.
- [x] Add a repeatable production response verifier.
- [x] Add the deployment, Search Console, measurement, and rollback runbook.

External actions still required:

- [ ] Approve and deploy the accumulated implementation.
- [ ] Run `npm run verify:production` against the deployed version.
- [ ] Verify the canonical property in Google Search Console and Bing Webmaster Tools.
- [ ] Submit the sitemap and inspect the core URLs before requesting guide indexing.
- [ ] Confirm the Vercel plan supports custom events and verify all four event names.
- [ ] Save the deployment-day baseline and begin the six-week review cadence.

## Measurement plan

### Required setup

- Verify the `www` domain property in Google Search Console.
- Verify the site in Bing Webmaster Tools.
- Submit the sitemap to both.
- Keep Vercel Analytics and Speed Insights enabled.
- Track download clicks, guide-to-download clicks, and checkout starts as product outcomes.

### Weekly checks for the first six weeks

- Indexed versus submitted URLs
- Crawl and soft-404 errors
- Canonical conflicts
- Search impressions, clicks, click-through rate, and average position
- Queries producing impressions
- Download conversions from organic landing pages
- Field LCP, INP, and CLS when enough data exist

After the first six weeks, move to monthly reporting unless a deployment changes routing, metadata, or page performance.

### Initial targets

Targets are directional and should be revised once Search Console has enough data:

- 100% of submitted public routes indexed or explained
- Zero soft 404s on intended routes
- Zero duplicate-canonical conflicts
- All three field Core Web Vitals passing at the 75th percentile
- Organic visitors reaching `/download` or a checkout action at a measurable rate
- Growth in non-brand impressions for VST3, ASIO, Voicemeeter, and live-audio setup queries

Do not use ranking for a single keyword as the sole success metric.

## Release checklist

Run this checklist after every change to routing, metadata, or rendering:

- [ ] Production build succeeds.
- [ ] Every public URL returns HTTP 200.
- [ ] Unknown URLs return HTTP 404.
- [ ] Noindex routes return the expected header.
- [ ] Apex, casing, and trailing-slash variants redirect once.
- [ ] Initial HTML contains the route title, description, canonical, `h1`, and body copy.
- [ ] Canonical URLs resolve directly and use `www`.
- [ ] Sitemap XML validates and contains only public canonical URLs.
- [ ] `robots.txt` references the sitemap.
- [x] Open Graph and Twitter artifacts are verified for every generated route.
- [x] Structured data is valid, accurate, and covered by build verification.
- [ ] Production social previews are checked after deployment.
- [ ] Structured data is checked in Google's Rich Results Test where applicable.
- [ ] JavaScript-disabled pages remain readable and navigable.
- [x] Lighthouse is run on home, download, and guide using mobile settings.
- [ ] Keyboard navigation and reduced-motion behavior still work.
- [ ] Search Console is checked after deployment.

## Recommended implementation order

- [x] Standardize the `www` canonical origin in code.
- [x] Add static pre-rendering for public routes.
- [x] Replace the catch-all SPA rewrite with real route and 404 handling.
- [x] Generate the sitemap and advertise it in `robots.txt`.
- [x] Normalize trailing-slash and common uppercase URL variants.
- [x] Render route-specific social metadata.
- [x] Add accurate `WebSite` and `SoftwareApplication` structured data.
- [x] Keep the homepage hero reveal within the 2.5-second LCP target.
- [x] Self-host fonts and optimize screenshots.
- [ ] Connect webmaster tools, deploy, and submit the sitemap.
- [x] Build the `/guides` hub and first two search-focused articles locally.
- [x] Add Organization identity, guide syndication, and the distribution playbook.
- [x] Add outcome analytics and the production SEO runbook.
- [ ] Confirm core indexing, then deploy the completed guide cluster.
- [ ] Align the external GitHub profile fields and begin measured distribution.

Do not begin broad content production before the technical foundation is
deployed and verified. The first cluster is intentionally complete in the
codebase so it can ship immediately after that gate clears.
