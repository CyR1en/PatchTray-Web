# PatchTray marketing site

Marketing website for the PatchTray Windows VST3 host public beta. It is a React + TypeScript + Vite SPA with production routes for Home, Download, and Guide, plus an unlinked `/concepts` review route.

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
3. Deploy. `vercel.json` rewrites all request paths to `index.html`, so direct requests to `/download`, `/guide`, and `/concepts` resolve correctly.

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
| `VITE_RELEASE_VERSION` | `0.1.0` | fallback only — the live version comes from `latest.json` |
| `VITE_DOWNLOAD_URL` | empty | fallback only — the live installer link comes from `latest.json` |
| `VITE_RELEASE_MANIFEST_URL` | `/api/release` | change only to read the manifest from somewhere else |
| `VITE_RELEASE_STATE` | `public beta` | update when the release status changes |
| `VITE_PRO_MONTHLY_CHECKOUT_URL` | empty | set when monthly Pro checkout is published |
| `VITE_PRO_LIFETIME_CHECKOUT_URL` | empty | set when lifetime Pro checkout is published |
| `VITE_PRO_MONTHLY_PRICE` | `$4.99` | override only if the published price changes |
| `VITE_PRO_LIFETIME_PRICE` | `$29.99` | override only if the published price changes |
| `VITE_SUPPORT_EMAIL` | empty | set the public support email address |
| `VITE_REPOSITORY_URL` | empty | set the public repository URL if one is published |
| `VITE_COMMUNITY_URL` | empty | set the public community destination if one is published |
| `VITE_PRIVACY_URL` | empty | set the privacy-policy URL |
| `VITE_TERMS_URL` | empty | set the terms URL |
| `VITE_REQUIREMENTS_TEXT` | public-beta wording | replace only with verified system requirements |

Do not replace a placeholder with `#`, `example.com`, or an unverified claim. The site has intentionally been built to show an honest unavailable state until a real destination exists.

**Monetization:** Free = 2 VST3 nodes + 1 preset. Pro = unlimited VST3 nodes + unlimited presets; monthly `$4.99` or lifetime `$29.99`.

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
src/App.tsx        routes, page content, interactive routing demo
src/config.ts      external destinations + release fallbacks
src/lib/release.ts latest.json manifest URL and parser
api/release.js     serverless proxy for the release manifest
src/styles.css     tokens, components, responsive and motion rules
public/assets/     local product imagery and app mark
DESIGN_SPEC.md     visual and accessibility specification
vercel.json        SPA rewrite configuration
```
