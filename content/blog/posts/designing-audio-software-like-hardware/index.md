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
  alt: "PatchTray's node chain drawn as an engineering wireframe: ASIO input, a selected plugin node with labeled knobs and square jacks, ASIO output — dimensioned like a hardware part, state spelled out in words."
status: "draft"
featured: false
---

If you open a VST host or virtual mixer on Windows today, you usually hit one of two walls.

The first is fake analog nostalgia: brushed aluminum PNGs, wood side panels rendered in 3D, and glowing vacuum tubes that do nothing for your signal. You end up dragging your mouse in awkward vertical circles to adjust a 3D knob that offers none of the physical feedback of real iron and pots.

The second is spreadsheet gridlock: matrix dropdowns packed with `A1`, `B2`, and `Virtual Cable C` assignments hidden inside tabbed dialogs that feel like network diagnostic software from 2004.

When you're trying to fix a noisy mic or dial in a gate ten minutes before a stream, both get in the way. You don't want a fake rack mount, and you don't want to decipher a matrix bus. You need to see where your audio goes, change a setting, and get back to work.

When we built PatchTray, we looked to mid-century industrial design for a simpler question: what if software was honest about being software, but felt as tactile and immediate as physical hardware?

## Less design, better signal flow

Dieter Rams called his core principle *Weniger, aber besser*—less, but better. When he and Hans Gugelot designed the Braun SK 4 record player in 1956, they replaced the heavy wooden cabinet typical of turntables at the time with a clear acrylic cover. They didn't ornament the machine; they exposed the mechanism so the object explained itself.

In live audio, extra chrome is liability. If a plugin mutes itself mid-stream, you shouldn't be hunting through nested context menus to find the culprit. 

That's why we built PatchTray around one idea: the canvas *is* the interface.

Rather than hiding routes inside dropdowns, PatchTray draws your processing pipeline directly as a flat node graph. Audio enters from your ASIO driver or interface, passes through visible cables into nodes—gates, EQs, compressors, VST3 plugins—and routes straight out to your stream mix or headphones. 

If a cable is connected, it's visible. If a plugin is bypassed, it says `[ byp ]` in orange monospace text right on the node header. There are no invisible routing matrices or secret background buses.

## Honest state over visual tricks

Rams insisted that good design is honest—a product shouldn't pretend to be more complex or powerful than it is. His 1962 Braun T 1000 world receiver packed dense shortwave band switching into a clean, strictly labeled layout. Every dial had a clear job, and every label matched reality.

Skeuomorphic audio software fails because it copies hardware graphics without delivering physical utility. Skeuomorphism on a flat 4K screen isn't tactile—it's just inefficient UI.

We dropped the pastiche. PatchTray's canvas uses flat carbon surfaces framed by sharp 1px borders. No simulated drop shadows, no faux lighting, no fake wood grain.

State relies on explicit language and geometry rather than color alone. Color on its own should never be your single source of truth when asking if a channel is live. Every active route pairs green indicator lines with plain bracketed text like `[ active ]` or `[ idle ]`. It stays legible regardless of screen glare or color vision differences.

Level meters render as discrete, solid blocks alongside exact decibel readouts, giving you instant peak headroom. It's the same logic behind the segmented display on Braun's ABW 30 wall clock: every element carries data, nothing is filler.

## Staying out of the way

Rams stressed that tools should be neutral objects that make room for the user's work. His 606 Universal Shelving System for Vitsoe was designed to hold books and records, not draw attention to itself.

PatchTray isn't the focal point of your stream or recording session—it's the plumbing underneath it. Once your routing graph is set, you don't need a heavy window crowding your screen next to OBS, chat, or your DAW.

PatchTray runs its C++ audio engine in the background with lock-free real-time processing and sits quietly in the Windows system tray. When you need to tweak an EQ parameter or insert a VST3 node, the graph opens in a single click. Once adjusted, it gets out of your way.

## Teenage Engineering and modern utility

Teenage Engineering picked up Rams' thread decades later with instruments like the OP-1 and TX-6. Their interfaces are flat, grid-aligned, and starkly labeled. The controls feel deliberate because every millimeter has a function.

PatchTray adopts that same functional clarity for VST3 hosting. Nodes are dark, flat cards with monospace headers, explicit state badges, and square jacks. Cables are literal connections between labeled ports. It doesn't pretend to be a physical rack, but its layout precision makes it feel as reliable as hardware.

## A tool for routing

Software design today is buried in SaaS trends: soft gradients, glassmorphism, floating cards, and decorative empty states. Audio tools don't need marketing fluff inside their control surfaces.

We built PatchTray around clear signal routing, tactile precision, and functional honesty for anyone who wants a Windows audio chain that just works.

If you're setting up VST3 hosting without a DAW for the first time, check out our [VST3 without a DAW guide](/guides/run-vst3-without-daw) to see how the graph fits into your setup.

