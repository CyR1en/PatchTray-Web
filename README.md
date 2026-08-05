<p align="center">
  <img src="public/assets/patchtray-mark.svg" alt="PatchTray" width="96">
</p>

<p align="center">
  <a href="https://www.patchtray.io"><strong>Website</strong></a>
  ·
  <a href="https://github.com/PatchTray/PatchTray/releases/latest"><strong>Download</strong></a>
  ·
  <a href="https://www.patchtray.io/guides"><strong>Guides</strong></a>
  ·
  <a href="https://www.patchtray.io/support"><strong>Support</strong></a>
</p>

# PatchTray website

This repository contains the public website for PatchTray, a visual VST3 host
for live audio on Windows.

The site provides:

- a product overview and current Windows download;
- PatchTray setup and live-audio workflow guides;
- answers about VST3 hosting, audio routing, licensing, and compatibility; and
- support, privacy, terms, and refund information.

<p align="center">
  <img src="public/assets/patchtray-canvas.png" alt="PatchTray routing a Voicemeeter Insert ASIO input through a VST3 plugin to an output as one supported setup example" width="900">
</p>

## PatchTray

PatchTray connects an input, a live VST3 processing chain, and an output from
one logical duplex audio device in a visual route. It supports compatible
duplex ASIO and DirectSound devices, plus Windows Audio in Shared, Exclusive,
and Low Latency modes. VoiceMeeter Patch Inserts are an optional
expanded multichannel workflow. Processing can continue while the application
is minimized to the Windows system tray.

The public release repository contains downloads, updater metadata, approved
media assets, and issue tracking:

- [PatchTray releases](https://github.com/PatchTray/PatchTray/releases/latest)
- [PatchTray public repository](https://github.com/PatchTray/PatchTray)
- [Getting started](https://www.patchtray.io/guides/build-your-first-vst3-chain)
- [Support](https://www.patchtray.io/support)

## Website development

Install dependencies and start the published-content development server:

```sh
npm install
npm run dev
```

Use `npm run dev:blog` to review draft articles locally. See the
[blog authoring guide](content/blog/README.md) for the content format,
preview workflow, validation commands, and publication checklist.

© 2026 CyR1en.
