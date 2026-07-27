# PatchTray marketing site

Marketing website for the PatchTray Windows VST3 host public beta. It is a
React + TypeScript + Vite site that pre-renders every route at build time,
hydrates the existing interactions in the browser, and loads only the current
route's client code.

Routes live in one table, [`src/lib/routes.ts`](src/lib/routes.ts) — path, page
name, public-listing state, and optional listing copy. The router, component
loaders, 404 page's route list, and `/concepts` exclusion all read from it, so a
new page is one row plus a `src/lib/pageMeta.ts` entry and its server/client
component mappings.

| Route | Listed | Notes |
| --- | --- | --- |
| `/` `/download` `/guide` | yes | primary navigation and product quick-start |
| `/guides` | yes | search-focused workflow guide collection |
| `/guides/voicemeeter-vst3-plugins` | yes | Voicemeeter insert and VST3 routing guide |
| `/guides/run-vst3-without-daw` | yes | standalone live VST3 host guide |
| `/support` | yes | support hub, contact form, mailto fallback |
| `/privacy` `/terms` `/refunds` | yes | legal pages, linked from the footer |
| `/checkout/success` | no | Stripe return page; `noindex`, never in navigation |
| `/concepts` | no | unlinked design review; `noindex` |

## Run locally

Requires Node.js 20 or newer.

```powershell
npm install
npm run dev
```

Then open the Vite URL shown in the terminal. Production validation:

```powershell
npm run build
npm run preview
```

`npm run build` also runs the Phase 1–6 artifact verifiers. They
check pre-rendered content, canonical URLs, the sitemap, response configuration,
route-specific social metadata, structured data, self-hosted fonts, responsive
captures, evergreen-guide depth and sources, guide-feed syndication, public
identity signals, and route-level chunks. The preview server mirrors production clean
URLs, redirects, 404 responses, and compressed text delivery instead of falling
back to the homepage.

After an approved deployment, `npm run verify:production` checks the live
canonical redirect, public route responses, sitemap, guide feed, 404 behavior,
duplicate redirects, and noindex headers. The account-level sequence is in
[`docs/PRODUCTION_SEO_RUNBOOK.md`](docs/PRODUCTION_SEO_RUNBOOK.md).

## SEO output

`src/lib/pageMeta.ts` is the editorial source for page titles, descriptions,
canonical paths, and social copy. `src/lib/seo.ts` resolves those values into
absolute Open Graph and Twitter metadata for every generated route. It also
emits accurate `WebSite` JSON-LD on `/`, `SoftwareApplication` JSON-LD on
`/download`, `CollectionPage` JSON-LD on `/guides`, and `TechArticle` plus
breadcrumb JSON-LD on each evergreen guide. The software offers come from the
same pricing configuration used by the page.

The guide collection also publishes an Atom feed at `/guides/feed.xml`. It is
generated from `src/lib/guides.ts`, advertised through feed-autodiscovery
metadata, and checked during every production build.

The application schema deliberately has no rating or review. Those fields
should only be added after a genuine value is visible on the page.

## Outcome analytics

Vercel Analytics and Speed Insights load only on the two PatchTray production
hosts. Pageview URLs have their query strings removed. Fixed custom events
measure download-page intent, installer downloads, guide conversions, and
checkout starts using only the current pathname and a controlled source label.
No form values, arbitrary DOM text, link destinations, email addresses,
checkout identifiers, or license material enter these events.

Vercel custom events require a Pro or Enterprise plan. Pageviews remain useful
when custom events are unavailable.

## Performance output

The semantic homepage headline is present in the initial HTML and uses the
original clipped upward reveal. The two decorative orange scan shapes were
removed. The headline settles by 1.63 seconds and the complete hero sequence by
2.07 seconds, using compositor-only transforms and a smooth ease-out curve.
Reduced-motion visitors receive the fully visible static hero.

Geist and Geist Mono are served from `public/fonts/` and preloaded without an
external stylesheet chain. Product captures use responsive AVIF and WebP
sources with the source PNG as fallback. `src/lib/pageLoaders.ts` creates a
separate client chunk for every route while `src/lib/pageComponents.ts` keeps
server rendering synchronous.

The July 27, 2026 mobile Lighthouse production-preview baseline results were 99
performance on home, download, and guide, with zero TBT and zero CLS. The
homepage measured 1.36-second FCP and 2.19-second LCP. After restoring the hero
reveal, a Chrome DevTools mobile trace with Slow 4G and 4× CPU throttling
measured 1.64-second LCP and zero CLS.

## Deploy to Vercel

1. Import `PatchTrayWeb` as a Vercel project.
2. Use the defaults: framework **Vite**, build command `npm run build`, output directory `dist`.
3. Deploy. The build emits one HTML file per route, a static `404.html`, and `sitemap.xml`. `vercel.json` enables clean extensionless URLs, removes trailing slashes, normalizes common uppercase variants, and sets `X-Robots-Tag: noindex` on `/checkout/success` and `/concepts`.

There is deliberately no SPA catch-all rewrite. Unknown paths must reach `404.html` with HTTP 404 rather than receiving an indexable 200 response.

## Release data

The version number and the Windows download link are **not** maintained by hand. They come from the `latest.json` updater manifest attached to the newest release of [PatchTray/PatchTray](https://github.com/PatchTray/PatchTray/releases/latest), so publishing a release updates the site without a redeploy.

| Piece | Role |
| --- | --- |
| `src/lib/release.ts` | manifest URL + parser, shared by browser, function, and build |
| `api/release.js` | Vercel function that proxies `latest.json` (release assets send no CORS headers) and caches it at the edge for 5 minutes, serving stale for a day while revalidating. Plain JS: Vercel compiles `api/*.ts` with the project's `typescript`, and TypeScript 7 removed the JS compiler API it calls |
| `vite.config.ts` | fetches the manifest at build time into `__RELEASE_MANIFEST__` so the first paint is already correct; also serves `/api/release` during `vite dev` |
| `src/hooks/useLatestRelease.ts` | shared store every version/download UI reads from |

If the release page is unreachable at both build and runtime, the site falls back to `VITE_RELEASE_VERSION` / `VITE_DOWNLOAD_URL`, and an empty download URL keeps the honest disabled-button state.

## Production configuration

All release-owned links and public-beta text live in `src/config.ts`, sourced from Vite env (`VITE_*`). Published checkout links have verified public defaults; environment values can replace them without a code release. Other empty destination values intentionally render disabled/pending UI instead of false links.

Set these on Vercel (or in `.env.local` for local work) when overriding the published defaults:

| Env key | Default / state | Required action |
| --- | --- | --- |
| `VITE_SITE_ORIGIN` | `https://www.patchtray.io` | set only on preview deployments, so they do not emit production canonical URLs |
| `VITE_RELEASE_VERSION` | `0.1.0` | fallback only — the live version comes from `latest.json` |
| `VITE_DOWNLOAD_URL` | empty | fallback only — the live installer link comes from `latest.json` |
| `VITE_RELEASE_MANIFEST_URL` | `/api/release` | change only to read the manifest from somewhere else |
| `VITE_RELEASE_STATE` | `public beta` | update when the release status changes |
| `VITE_PRO_MONTHLY_CHECKOUT_URL` | active Stripe Payment Link | override only when replacing the monthly checkout |
| `VITE_PRO_LIFETIME_CHECKOUT_URL` | active Stripe Payment Link | override only when replacing the lifetime checkout |
| `VITE_PRO_MONTHLY_PRICE` | `$4.99` | override only if the published price changes |
| `VITE_PRO_LIFETIME_PRICE` | `$29.99` | override only if the published price changes |
| `VITE_PRO_PRICE_CURRENCY` | `USD` | ISO 4217 currency shared by the visible Pro prices and offer structured data |
| `VITE_SUPPORT_EMAIL` | `support@patchtray.io` | override only if the published contact address changes |
| `VITE_REQUIREMENTS_TEXT` | public-beta wording | replace only with verified system requirements |
| `VITE_TURNSTILE_SITE_KEY` | empty | set to show the `/support` form; empty leaves only the mailto path |

## Support form

`/support` posts to `api/support.js`, which verifies a Cloudflare Turnstile token, applies a per-sender rate limit, and relays the message through Resend. These are **server-side** variables — no `VITE_` prefix, so they never enter the browser bundle:

| Env key | Role |
| --- | --- |
| `RESEND_API_KEY` | Resend credential. Server-only, always. |
| `SUPPORT_TO_EMAIL` | Recipient. Read from the environment and never from the request — a request-controlled recipient would make this an open relay. |
| `SUPPORT_FROM_EMAIL` | Verified Resend sender, e.g. `PatchTray <noreply@patchtray.io>`. The customer's address goes in `reply_to`. |
| `TURNSTILE_SECRET_KEY` | Turnstile server-side siteverify secret. |
| `SUPPORT_RATELIMIT_PEPPER` | Optional but recommended: salts the IP hash used as the rate-limit key. Must not be either licensing-service pepper. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate-limit store. Injected by the Vercel + Upstash marketplace integration. |

The limit is 3 messages per hour per sender. If the Upstash variables are absent the endpoint still sends but logs that the limiter is disabled — treat that as a misconfiguration, not a mode. `vite preview` does not run Vercel functions, so the form only works against a deployment or `vercel dev`.

Do not replace a placeholder with `#`, `example.com`, or an unverified claim. The site has intentionally been built to show an honest unavailable state until a real destination exists.

**Not configurable, on purpose.** The footer's repository link is derived from `RELEASE_REPOSITORY` in `src/lib/release.ts`, so it cannot drift from the release manifest it shares a slug with — PatchTray's source is closed and lives in a separate private repository that must never be linked from the site. The `/support`, `/refunds`, `/privacy`, and `/terms` destinations are routes in `src/lib/routes.ts`; an env override would point the footer elsewhere while leaving the real route live as a second source of truth.

**Monetization:** Free = 4 VST3 nodes + 1 preset. Pro = unlimited VST3 nodes + unlimited presets; monthly `$4.99` or lifetime `$29.99`.

## Assets

`public/assets/` contains local copies of source-approved materials:

- `patchtray-mark.svg` — canonical PatchTray icon
- `patchtray-canvas.png` — app graph capture
- `patchtray-telemetry.png` — app telemetry capture
- `patchtray-settings.png` — ASIO settings capture
- `patchtray-ports.png` — ASIO port configuration capture

The canvas, settings, and ports captures also have responsive AVIF/WebP
derivatives used by the page. `public/fonts/` contains the self-hosted Geist
Latin subsets and their SIL Open Font License.

The app never references the Rust project at runtime. Captures are framed responsively and have descriptive alt text in `src/App.tsx`.

## Content guardrails

- Keep the core promise clear: “process live audio with your VST3 plugins.” Describe PatchTray as a visible Windows VST3 host for live ASIO audio. Voicemeeter is the primary example, not the only supported path.

- Keep claims to verified product facts. Do not add latency figures, hardware requirements, broad driver compatibility, user counts, testimonials, or a release date without a source of truth.
- Pro is unlimited VST3 nodes + unlimited presets; monthly `$4.99` or lifetime `$29.99`. Do not invent other prices or claims.

- Keep the carbon/steel/orange/green design system. No gradients, shadows, glass, rounded UI, or generic SaaS card grids.

## Project map

```text
src/App.tsx              route resolution + per-page document metadata
src/entry-server.tsx     server rendering + static route/sitemap descriptors
src/lib/routes.ts        route table: path, page, public listing
src/lib/pageLoaders.ts   browser-only route component dynamic imports
src/lib/pageComponents.ts server-only eager component map
src/lib/pageMeta.ts      titles, descriptions, canonical paths, noindex flags
src/lib/seo.ts           resolved social metadata + JSON-LD entities
src/lib/guides.ts        evergreen guide definitions and editorial metadata
src/config.ts            external destinations + release fallbacks
src/lib/release.ts       latest.json manifest URL and parser
scripts/prerender.mjs    route HTML + sitemap generation
scripts/verify-phase1.mjs generated SEO artifact checks
scripts/verify-phase2.mjs social metadata + structured-data checks
scripts/verify-phase3.mjs fonts, images, hero, and route-chunk guardrails
scripts/verify-phase4.mjs guide depth, sources, schema, links, and sitemap checks
scripts/verify-phase5.mjs identity, guide-feed, and distribution guardrails
scripts/verify-phase6.mjs outcome analytics, privacy, and launch-runbook checks
scripts/verify-production.mjs live status, canonical, sitemap, feed, and noindex checks
scripts/serve-static.mjs clean-URL production preview
api/release.js           serverless proxy for the release manifest
src/styles.css           tokens, components, responsive and motion rules
public/assets/           local product imagery and app mark
DESIGN_SPEC.md           visual and accessibility specification
vercel.json              clean URLs, redirects, and noindex headers
docs/AUTHORITY_DISTRIBUTION_PLAYBOOK.md external profile, release, community, and directory workflow
docs/PRODUCTION_SEO_RUNBOOK.md deployment gate, webmaster handoff, measurement, and rollback
```
