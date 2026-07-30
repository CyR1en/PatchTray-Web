---
schemaVersion: 1
title: "What Dieter Rams taught us about designing a Windows audio tool"
summary: "Most Windows audio tools imitate 90s rack gear or hide routing behind dense bus matrices. Applying industrial design principles helped us build a visual, honest VST3 host."
publishedAt: "2026-07-29T20:00:00-06:00"
author:
  name: "PatchTray"
  type: "Organization"
  url: "https://www.patchtray.io/"
category: "product"
tags:
  - "design"
  - "Dieter Rams"
  - "VST3 hosting"
  - "Windows audio"
image:
  src: "./hero.png"
  alt: "PatchTray node graph on a flat dark canvas with orange and green state indicators, showing a mic chain routed through VST3 processors."
status: "draft"
featured: false
---

If you open almost any VST plugin host or virtual audio mixer on Windows today, you are usually met with one of two visual tropes.

The first is fake analog nostalgia. Brushed aluminum graphics, rendered wood side panels, fake vacuum tubes that glow red even though they are just PNG files, and 3D knobs that force you to drag your mouse in awkward circles just to turn down a gain stage.

The second is spreadsheet-style density. Dropdown menus full of `A1`, `B2`, and `Virtual Cable C` routings, buried behind tabbed dialogs that look like a network telemetry tool from 2004.

When you are trying to set up your mic chain 10 minutes before going live, neither of these helps. You do not want to play pretend with a virtual rack unit, and you do not want to memorize a grid of matrix buses. You just want to see where your voice goes, tweak your processing, and start streaming.

When we started building PatchTray, we turned to mid-century industrial design to answer a basic question: what if software was honest about being software, but felt as tactile and clear as physical gear?

## Less design, better signal flow

Dieter Rams argued that good design is as little design as possible. He called the principle *Weniger, aber besser*, and it guided four decades of products at Braun and Vitsoe. The SK 4 record player he designed with Hans Gugelot in 1956 stripped away the heavy wooden cabinet that every turntable had at the time and replaced it with a transparent acrylic lid. The mechanism was visible. The object explained itself.

In live audio, every extra button or decorative panel gets in the way of solving real problems. When an audio route breaks mid-stream, you should not have to hunt through nested context menus to find out which plugin muted itself.

We built PatchTray around a simple principle: the canvas is the product.

Instead of hiding signal paths in dropdown matrices, PatchTray exposes your entire routing setup as a visual node graph on a flat dark surface. Audio comes in from your interface or ASIO driver. Cables draw directly into processing nodes like a gate, EQ, compressor, or VST3 plugin. Processed audio flows directly out to your stream mix or headphones.

If a cable is connected, you see it. If a plugin is bypassed, it says `[ bypass ]` in plain orange text right on the node. There are no surprise routing paths or background bus mappings.

## Honest state over visual tricks

Rams maintained that good design is honest. A product should not try to look more powerful or complex than it actually is. His 1962 T 1000 world receiver for Braun packed serious shortwave capability into a clean, labeled control surface. Every dial had a purpose. Nothing pretended to do more than it did.

Skeuomorphic audio software fails because it imitates the physical surface of hardware without offering any of its physical benefits. A 3D knob on a flat 4K monitor is not tactile. It is just a less efficient slider.

In PatchTray, we discarded decorative pastiche entirely. Surfaces are flat graphite and carbon bounded by sharp 1px hairline borders. There are no fake lighting effects, no drop shadows, no rendered wood grain.

State relies on text and shape, not just color. Color alone should never tell you if your mic is live. Every routed path pairs green indicator lines with explicit bracketed text labels like `[ active ]` or `[ idle ]`. This keeps the UI readable for deuteranopic users and works under any lighting conditions.

Audio levels render as discrete, solid blocks alongside exact numerical readouts, so you know your peak headroom at a glance. This is the same instinct behind the segmented display on a Braun ABW 30 wall clock: each element carries information, nothing is decorative.

## Staying out of the way

Rams emphasized that tools should be unobtrusive and neutral, leaving room for the user's actual work. His 606 Universal Shelving System, designed with Vitsoe in 1960, was meant to hold what mattered. The shelves themselves were not the point. The books, records, and objects on them were.

As a creator or engineer, PatchTray is not the main event of your stream or recording session. It is the foundation underneath it. Once your routing graph is set, you do not need a large window taking up screen space alongside OBS, chat, and game windows.

PatchTray minimizes to the Windows system tray and runs its C++ audio engine in the background with lock-free real-time processing. When you need to adjust a noise gate or patch in a new VST3 plugin, the graph pops open instantly. When you are done, it gets out of your way.

## Teenage Engineering as a modern translation

Rams retired from Braun in 1995, but the thread continued. Teenage Engineering picked it up with products like the OP-1 and the TX-6. Their surfaces are flat, labeled, and precise. The controls feel deliberate because they are. There are no decorative bezels, no fake depth, no visual noise.

PatchTray borrows that same instinct for its node graph. Nodes are dark, flat surfaces with monospace headers, labeled state, and protruding square jacks. Cables are literal connections between labeled ports. The aesthetic is honest about being software, but the precision and intentional spacing make it feel like something you could pick up.

Three words capture what we aimed for: literal, tactile, generous.

## A tool, not a toy

Modern software is full of SaaS noise: gradient accent borders, hero cards, glassmorphism, and cartoon illustrations. Audio tools do not need any of that.

By focusing on clear signal flow, tactile precision, and functional honesty, we built PatchTray for people who just want their audio chain to work.

If the host and ASIO route are new territory, start with the [VST3 without a DAW guide](/guides/run-vst3-without-daw), then come back and build from there.
