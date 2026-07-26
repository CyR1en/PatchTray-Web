# PatchTray marketing site

Marketing website for the PatchTray Windows VST3 host public beta. It is a React + TypeScript + Vite SPA.

Routes live in one table, [`src/lib/routes.ts`](src/lib/routes.ts) — path, page name, component, and whether the route is publicly listed. The router, the 404 page's route list, and the `/concepts` exclusion all read from it, so a new page is one row plus a `src/lib/pageMeta.ts` entry.

| Route | Listed | Notes |
| --- | --- | --- |
| `/` `/download` `/guide` | yes | primary navigation |
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

## Deploy to Vercel

1. Import `PatchTrayWeb` as a Vercel project.
2. Use the defaults: framework **Vite**, build command `npm run build`, output directory `dist`.
3. Deploy. `vercel.json` rewrites all non-`/api` request paths to `index.html`, so every route resolves on a direct load or refresh. It also sets `X-Robots-Tag: noindex` on `/checkout/success` and `/concepts` — the authoritative half of the noindex signal, since a crawler that does not run JavaScript never sees the meta tag.

## Release data

The version number and the Windows download link are **not** maintained by hand. They come from the `latest.json` updater manifest attached to the newest release of [CyR1en/PatchTray](https://github.com/CyR1en/PatchTray/releases/latest), so publishing a release updates the site without a redeploy.

| Piece | Role |
| --- | --- |
| `src/lib/release.ts` | manifest URL + parser, shared by browser, function, and build |
| `api/release.js` | Vercel function that proxies `latest.json` (release assets send no CORS headers) and caches it at the edge for 5 minutes, serving stale for a day while revalidating. Plain JS: Vercel compiles `api/*.ts` with the project's `typescript`, and TypeScript 7 removed the JS compiler API it calls |
| `vite.config.ts` | fetches the manifest at build time into `__RELEASE_MANIFEST__` so the first paint is already correct; also serves `/api/release` during `vite dev` |
| `src/hooks/useLatestRelease.ts` | shared store every version/download UI reads from |

If the release page is unreachable at both build and runtime, the site falls back to `VITE_RELEASE_VERSION` / `VITE_DOWNLOAD_URL`, and an empty download URL keeps the honest disabled-button state.

## Production destinations to replace

All release-owned links and public-beta text live in `src/config.ts`, sourced from Vite env (`VITE_*`). Empty destination values intentionally render disabled/pending UI instead of false links.

Set these on Vercel (or in `.env.local` for local work) before launch:

| Env key | Default / state | Required action |
| --- | --- | --- |
| `VITE_SITE_ORIGIN` | `https://patchtray.io` | set only on preview deployments, so they do not emit production canonical URLs |
| `VITE_RELEASE_VERSION` | `0.1.0` | fallback only — the live version comes from `latest.json` |
| `VITE_DOWNLOAD_URL` | empty | fallback only — the live installer link comes from `latest.json` |
| `VITE_RELEASE_MANIFEST_URL` | `/api/release` | change only to read the manifest from somewhere else |
| `VITE_RELEASE_STATE` | `public beta` | update when the release status changes |
| `VITE_PRO_MONTHLY_CHECKOUT_URL` | empty | set when monthly Pro checkout is published |
| `VITE_PRO_LIFETIME_CHECKOUT_URL` | empty | set when lifetime Pro checkout is published |
| `VITE_PRO_MONTHLY_PRICE` | `$4.99` | override only if the published price changes |
| `VITE_PRO_LIFETIME_PRICE` | `$29.99` | override only if the published price changes |
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

The app never references the Rust project at runtime. Captures are framed responsively and have descriptive alt text in `src/App.tsx`.

## Content guardrails

- Keep the core promise clear: “process live audio with your VST3 plugins.” Describe PatchTray as a visible Windows VST3 host for live ASIO audio. Voicemeeter is the primary example, not the only supported path.

- Keep claims to verified product facts. Do not add latency figures, hardware requirements, broad driver compatibility, user counts, testimonials, or a release date without a source of truth.
- Pro is unlimited VST3 nodes + unlimited presets; monthly `$4.99` or lifetime `$29.99`. Do not invent other prices or claims.

- Keep the carbon/steel/orange/green design system. No gradients, shadows, glass, rounded UI, or generic SaaS card grids.

## Project map

```text
src/App.tsx        route resolution + per-page document metadata
src/lib/routes.ts  the route table: path, page, component, public listing
src/lib/pageMeta.ts titles, descriptions, canonical paths, noindex flags
src/config.ts      external destinations + release fallbacks
src/lib/release.ts latest.json manifest URL and parser
api/release.js     serverless proxy for the release manifest
src/styles.css     tokens, components, responsive and motion rules
public/assets/     local product imagery and app mark
DESIGN_SPEC.md     visual and accessibility specification
vercel.json        SPA rewrite configuration
```
