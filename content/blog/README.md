# PatchTray blog authoring guide

Blog articles are reviewed source files that ship with the PatchTray website.
Everything in this directory and its Git history is public. A draft is omitted
from generated website routes, but it is not private or embargoed.

Do not commit credentials, personal data, private announcements, unreleased
security information, or material that is not ready to be public source.

## Create an article

Create one directory per article:

```text
content/blog/posts/why-patchtray-runs-from-the-tray/
├── index.md
├── hero.png
└── signal-flow.png
```

The directory name becomes the permanent public slug. It must contain only
lowercase ASCII letters, numbers, and single hyphens; be 3–80 characters long;
start and end with a letter or number; and not use a reserved slug:

```text
feed
page
tags
authors
api
index
assets
```

Do not rename or delete a published slug without adding and reviewing a
permanent redirect in the same pull request.

## Frontmatter

Use strict YAML frontmatter. Unknown or misspelled keys fail generation.

```md
---
schemaVersion: 1
title: "Why PatchTray keeps processing from the system tray"
summary: "PatchTray separates the live audio engine from the full editor so a configured VST3 route can keep running while the main window is closed."
publishedAt: "2026-08-03T09:00:00-06:00"
updatedAt: "2026-08-03T09:00:00-06:00"
author:
  name: "PatchTray"
  type: "Organization"
  url: "https://www.patchtray.io/"
category: "engineering"
tags:
  - "VST3 hosting"
  - "Windows audio"
  - "system tray"
image:
  src: "./hero.png"
  alt: "PatchTray minimized to the Windows system tray while its ASIO to VST3 route remains active."
status: "draft"
featured: false
---

The visible introduction starts here and states the article's main point.

## What continues running when the window closes?

The article continues with normal Markdown.
```

Rules:

- `schemaVersion` must be `1`.
- Titles are plain text and 10–100 characters.
- Summaries are plain text and 70–220 characters.
- Published and updated times use ISO 8601 with `Z` or an explicit numeric
  timezone.
- `publishedAt` and the lead image are required before changing `status` to
  `published`.
- `updatedAt` must not precede `publishedAt`.
- Categories are `product`, `workflow`, `engineering`, `release`, or `company`.
- Add 1–8 unique, consistently spelled tags.
- At most one published article may set `featured: true`.
- A published timestamp may not be in the future.

The build derives the slug, canonical URL, reading time, heading IDs, table of
contents, image dimensions, responsive sources, and related articles.

## Markdown

Body headings start at `##`; the page template owns the article's only H1.
CommonMark and GitHub Flavored Markdown tables, task lists, and fenced code
blocks are supported.

Do not use:

- raw HTML, MDX, scripts, iframes, or forms;
- body-level H1 headings or headings deeper than H4;
- duplicate heading text;
- remote images, absolute image paths, or `../` traversal;
- JavaScript, data, preview-deployment, or non-canonical PatchTray links; or
- placeholder links to routes that do not exist.

Use root-relative links for PatchTray pages, fragment links for headings in the
current article, and HTTPS links for external sources. Images must use a
relative filename from the article directory, such as:

```md
![PatchTray signal flowing from an ASIO input through a VST3 processor.](./signal-flow.png)
```

## Media limits

- PNG, JPEG, WebP, and AVIF only.
- No SVG or animated article media.
- 8 MiB maximum per source image.
- 24 MiB maximum source media per article.
- 8,192 pixels maximum on either decoded axis.
- 100 KiB maximum for `index.md`.

The generator verifies decoded formats, strips unnecessary metadata, and emits
content-hashed AVIF, WebP, and PNG/JPEG fallback variants.

## Local checks

From the repository root:

```sh
npm run blog:test
npm run blog:generate
npm run build
```

`blog:generate` validates drafts as strictly as published articles. Only
published articles enter `catalog.json` or receive generated post JSON.

To review every draft in the real blog layout without changing its publication
status, run:

```sh
npm run dev:blog
```

Then open `http://localhost:5173/blog`. Draft pages display a persistent local
preview notice, use `noindex`, omit canonical and structured-data tags, and use
the existing PatchTray canvas as a temporary lead image when the draft has no
image yet. The preview feed contains published entries only.

`npm run dev:blog` writes an explicitly marked preview snapshot to
`.generated/blog`. Both `npm run dev` and `npm run build` replace it with the
normal published-only snapshot before starting. Production builds also reject a
stale preview snapshot if the normal generation step is skipped.

## Publication workflow

1. Create or update an article on a branch.
2. Run the local checks.
3. Review the Markdown, primary sources, claims, author, dates, alternative
   text, responsive layout, and next action.
4. Open a normal website pull request and review its Vercel preview.
5. Change `status` to `published` only when the article is approved and its
   timestamp is not in the future.
6. Merge through the normal website deployment path.
7. Verify the production article, sitemap, feed, metadata, and an unknown blog
   slug.
