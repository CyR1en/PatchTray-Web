# PatchTray web design specification

## Intent

This site establishes PatchTray as a literal, tactile, generous Windows audio tool. It speaks to people with a live mic chain — often Voicemeeter and OBS, and any mixer that can take an ASIO insert — not to a generic software-buying audience. The central promise is deliberately plain: **“stop fighting the signal path.”**

The website presents the product as a clear system: microphone / ASIO input → VST3 processing → Voicemeeter / stream output. The interactive routing view is the principal demonstration and the visual anchor of the home page.

## Reference translation

- **Teenage Engineering:** translated into artifact-like framing, strict 1px rules, edge-to-edge application captures, a restrained material palette, and deliberate negative space. It does *not* borrow the light canvas or ultra-thin display typography.
- **midlife.engineering:** translated into a product mechanic that tells the story and bracketed device-like actions. It does *not* borrow hidden navigation or inaccessible fake-hardware controls.
- **PatchTray first:** the graph, system-tray behavior, telemetry, and actual app captures determine the composition. No reference visual is copied.

## Tokens

All values live at the top of `src/styles.css`.

| Token | Value | Purpose |
| --- | --- | --- |
| `--carbon` | `#0f0e12` | site floor and graph canvas |
| `--surface` | `#131217` | flat product and module surface |
| `--popover` | `#0a090d` | header, footer, recessed areas |
| `--graphite` | `#b2b2b2` | readable secondary copy |
| `--steel` | `#e5e5e5` | primary text and hairline detail |
| `--line` / `--line-strong` / `--line-quiet` | `#2e2e34` / `#3a3a41` / `#232328` | boundary hierarchy and recessed detail |
| `--off` | `#27272a` | inactive signal and disabled-control surface |
| `--canvas-coordinate` | `#75757d` | intentionally quiet, decorative graph coordinates only |
| `--orange` | `#ff6600` | primary action, input marker, focus |
| `--green` | `#00ff66` | routed signal and active meter state |
| `--ink` | `#000` | black text on the orange action surface |

`--graphite` is the minimum text token for functional labels, pending states, table headers, and footer/guide status language. The only saturated brand or state colors are `--orange` and `--green`; primary-button hover keeps the same orange rather than introducing a lighter orange.

Corners are always square. There are no shadows, gradients, glows, blur, glass effects, or 3D rack cues. The existing rounded app mark is the intentional brand-asset exception.

## Typography

- **Geist Sans** carries readable prose: explanations, requirements, and guide steps.
- **Geist Mono** carries system language: labels, versions, state flags, route labels, and bracket actions.
- Main headings are lower-case Geist Mono, capped at `6rem` with `-0.04em` as the tightest display tracking. They have enough scale to establish the page without relying on gradient treatment.
- At phone widths, heading measures contract before a forced line can exceed the content column. The home hero keeps the promise phrase on its own span so it can scale and wrap cleanly on 320px–375px screens.

- UI labels and controls are lower-case. State uses a label and a square/route treatment as well as color.

The font import is web-hosted for the initial release. If the deployment requires fully offline assets, replace that import with licensed self-hosted font files while preserving the two-family roles.

## Composition and pages

### Home (`/`)

1. A broad, asymmetric promise plus a compact system readout.
2. The interactive route demonstration directly under the hero.
3. A large current-product capture framed as an artifact, not as a floating SaaS card.
4. A three-part signal explanation using distinct line-based glyphs.
5. A telemetry/app capture and a plain Free / Pro comparison.

### Download (`/download`)

The release module is intentionally a single concrete object: version, channel, Windows target, requirements, and download state. It shows a disabled, labelled state until a real `downloadUrl` exists. Free / Pro is a line-based specification rather than sales cards.

### Guide (`/guide`)

The guide uses a sticky contents rail at wide widths and an in-flow two-column contents list on small screens. Its content follows the real product model: choose endpoints, build the graph, adjust in context, save a preset. It never invents device compatibility or configuration details.

### Concepts (`/concepts`)

This is a deliberately unlinked design-review route. It switches between wide-canvas and compact-lane compositions to review responsive behavior without adding experimental navigation to the public pages.

## Components

- **Site header:** clear text navigation with an active orange hairline; mobile uses a labelled native button and visible menu.
- **Bracket controls:** native links/buttons with a minimum 44px target when used as primary controls.
- **Routing demo:** app-faithful graph recreation (ASIO 192px / plugin 320px / SVG knobs / footer jacks). Cubic-bezier cables attach jack-to-jack. Scroll progress reveals nodes, then draws cables; pause/replay controls remain available. It is an explanatory demonstration, not a live audio host.
- **Node:** a dark flat surface, mono header, labelled state, protruding square jacks, optional in-node controls.
- **Meter:** discrete flat blocks plus a text context; it is never only a color bar.
- **Capture frame:** app screenshot with meaningful alt text and an honest `current app view` caption.
- **Unavailable destination:** a disabled button or `[ pending ]` label, never an `#` or placeholder link that pretends to work.

## Motion

The home hero uses a one-time boot sequence inspired by the app’s SetupIntro: canvas speaker-grill fade, staggered plug-mark sockets, plug pop + cable draw + quiet LED breath, and clipped H1 line reveals with staggered lead/actions/aside. Motion uses only opacity, transform, and stroke-dashoffset, with ease-out-expo timing. There is no orange signal path, crosshair axis, parallax, or scroll-jacking on the hero.

The route demonstration animates only an actual user state change: cable fill scales from its origin with transform and opacity, horizontally on desktop and vertically on phone. Hover/press transitions are 160–220ms and only alter transform, background, border, or color.

`prefers-reduced-motion: reduce` disables animation and makes transitions essentially instant, showing the composed hero end state immediately. No autoplay media is used.

## Responsive behavior

- **Desktop:** hero copy and system-readout column create intentional asymmetry. The routing graph runs horizontally.
- **Tablet:** content columns collapse before controls get cramped; app captures retain their framing.
- **Phone (600px and below):** the routing demonstration becomes a vertical signal lane. Cables become vertical, nodes remain full width, controls keep usable target sizes, and the header exposes a direct mobile navigation button.
- Wide screenshot crops use `object-fit: cover` only within an explicitly framed product capture. Alt text identifies what each cropped capture contains.

## Accessibility

- The dark palette preserves strong text contrast: steel and graphite are used on carbon/surface backgrounds, not muted toward black. Functional microcopy—including pending states, table headers, guide labels, and footer status—uses graphite or steel; only decorative graph coordinates use the quieter coordinate token.
- Focus uses a 2px orange outline with offset on every native link, button, and control.
- A skip link moves keyboard users past the header.
- Navigation uses semantic `nav`, current-page state, and a button with `aria-expanded` for the mobile menu.
- The routing toggle uses `aria-pressed`; its active/paused state is written out and marked by more than color.
- Decorative SVG icons are `aria-hidden`; app imagery has descriptive alt text.
- The full route and status language remain readable without distinguishing orange from green.

## Research guidance applied

The `ui-ux-pro-max` design-system and accessibility search was used for the responsive, focus, keyboard-order, reduced-motion, skip-link, and sticky-header checks. Its generic dark “cinema/glass” style recommendation was intentionally rejected because it conflicts with PatchTray’s source design system. The `ui-styling` guidance informed tokenized styling, mobile-first breakpoints, semantic primitives, and accessible controls. The unavailable `impeccable` skill was requested but blocked by the local tool policy; no substitute rules were claimed as its output.
