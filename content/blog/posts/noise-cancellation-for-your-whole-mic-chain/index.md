---
schemaVersion: 1
title: "Noise cancellation for your whole mic chain, not just one app"
summary: "Discord's noise suppression only works inside Discord. A noise-cancelling VST3 plugin cleans the microphone signal itself, so every app that hears the mic gets the clean version."
publishedAt: "2026-07-28T16:30:32-06:00"
author:
  name: "PatchTray"
  type: "Organization"
  url: "https://www.patchtray.io/"
category: "workflow"
tags:
  - "noise cancellation"
  - "DeepFilterNet"
  - "RNNoise"
  - "VST3 hosting"
  - "microphone processing"
image:
  src: "./hero.png"
  alt: "One spectrogram of the same voice, before and after. Left of the orange line the mic signal is buried in fan noise and keyboard strikes; right of it, suppression on the mic leaves only speech."
status: "published"
featured: true
---

Your microphone is honest in a way you would prefer it not to be. It hears the
mechanical keyboard, the case fans, the air conditioner cycling on, the dog
negotiating with the hallway, and—somewhere in the middle of all that—your
voice.

Most people meet noise cancellation for the first time inside a specific app.
Discord ships built-in noise suppression. So do Zoom and Teams. Toggle it on
and, like magic, the keyboard disappears.

The catch is in the phrase "built-in." That processing lives inside the
application. It cleans the copy of your voice that Discord sends to your
friends, and nothing else. Your streaming software still hears the raw mic.
Your game recording still hears the raw mic. The meeting app you just joined,
the DAW tracking your podcast, the browser tab asking for microphone
permission: every one of them gets the unfiltered signal, fans and all.

The problem, in other words, is placement. Noise cancellation that lives
inside one application can only ever clean that application.

## The two ways to place noise suppression

An app that cleans its own copy of your voice sits at the end of the chain. By
the time Discord's suppressor runs, every other application has already
received the dirty signal. Cleaning there is like filtering water at one tap
while the rest of the house drinks from the mains.

The alternative is to clean the signal once, early, before any application
touches it. On Windows, that means inserting processing into the microphone's
path itself:

```text
microphone → noise suppression → every application
```

That is what VST3 plugins make possible. A VST3 noise suppressor is not tied
to any one program. Hosted in the right place, it processes the live mic
signal and hands a clean version to whatever listens downstream, whether that
is one application or all of them. The rest of this article is about which
algorithms are good enough to trust with that job, and how to wire one up.

## Before neural networks: subtraction and gating

Traditional noise reduction predates machine learning, and its failure modes
explain why the neural approaches won.

The classic technique is **spectral subtraction**. During a pause in speech,
the processor takes a fingerprint of the noise floor (the steady hiss, hum,
and fan whir). From then on, it subtracts that fingerprint from the incoming
signal, frame by frame, on the theory that what remains is voice.

It works well on stationary noise, meaning sounds that hold their character
from second to second. Everything else is harder. Subtract too
aggressively and the speech develops a warbling, underwater quality that
engineers call *musical noise*: random spectral leftovers of the subtraction
itself, bubbling up as ghost tones. Subtract too gently and the keyboard
clicks straight through, because a key press is not stationary noise. It
arrives and leaves faster than the fingerprint can adapt.

The noise gate is the blunter cousin: mute everything below a threshold,
pass everything above it. A gate does not remove noise at all. It hides noise
in the silences between your sentences, and lets all of it back in the moment
you speak. For a constant fan under constant speech, the fan is there the
whole time you are talking. You only stop hearing it in the gaps.

These tools earned their place, and gates in particular still belong in a
serious chain. But they all share a limitation: they know what noise looks
like in general, and nothing about what *speech* looks like.

## RNNoise: a small network that learned speech

In 2017, Jean-Marc Valin at Xiph.Org published
[RNNoise](https://jmvalin.ca/demo/rnnoise/), and it changed what people
expected from a free, real-time noise suppressor.

The idea is a hybrid. Classic digital signal processing handles the
front-end, the frequency analysis that converts raw samples into a compact
description of each audio frame. A small recurrent neural network sits in the
middle, and its job is to answer one question per frame: in each frequency
band, how much of what we are hearing right now is speech, and how much is
noise? The output is a set of gains, one per band, that suppress the
noise-dominated bands and preserve the speech-dominated ones. Traditional DSP
then reconstructs the cleaned audio.

"Recurrent" is the key word. A recurrent network carries state from one frame
to the next, so it does not judge each 10-millisecond slice in isolation. It
builds a running sense of the scene: "that rumble has been constant for three
seconds, that burst was a key press, this harmonic pattern is a voice." That
memory is what lets it separate speech from noise that a static fingerprint
cannot.

RNNoise's other achievement is its size. The model is tiny, tens of thousands
of parameters, and runs comfortably on a CPU in real time with about 10 ms of
algorithmic latency. That made it practical to embed everywhere, and it has
been: OBS Studio ships it by name as one of its noise-suppression methods, and
it has been folded into voice-chat and conferencing stacks for years.

Its limits follow from its design. The band gains are applied uniformly
within each band, which keeps the math cheap but coarsens the result. Fine
detail inside a band lives or dies together. The training target emphasized
suppressing noise, sometimes at the expense of speech texture. On a quiet
room with a decent mic, RNNoise is transparent. On a loud keyboard or a bad
headset mic, you can hear it working: consonants soften, sibilance dulls, and
loud transients can momentarily confuse the estimate. It is still a very good
suppressor for what it costs, and it is also most of a decade old now.

## DeepFilterNet: enhance the speech, not just the noise

[DeepFilterNet](https://github.com/Rikorose/DeepFilterNet), from Hendrik
Schröter and colleagues at Friedrich-Alexander-Universität Erlangen-Nürnberg,
is the follow-up generation, an open-source deep noise suppression framework
built to attack the places where band-gain models like RNNoise lose quality.

The architecture keeps the same overall shape—DSP front-end, neural network in
the middle, reconstruction at the end—but it does the suppression in two
passes instead of one.

The first pass is the familiar one: coarse gains across perceptually spaced
frequency bands, much like RNNoise. On its own that would inherit the same
weakness, because a single gain per band means everything inside that band
lives or dies together, and speech that happens to share a band with heavy
noise gets suppressed along with it.

The second pass is where the name comes from. Instead of another gain,
DeepFilterNet predicts a short learned filter per band that also draws on
neighboring frames. Suppression can then be shaped in time as well as in
frequency inside a single band, and speech components the first pass would
have flattened get recovered rather than discarded. That is the audible
difference: voices come through fuller and less "processed," because the
algorithm is not only subtracting the room, it is putting back the consonants
and breath that subtraction costs you.

The family also scales. It ranges from small models suited to low-power
devices up to DeepFilterNet3, which handles full-band 48 kHz audio. That last
point matters for a live mic chain: speech captured for streaming, recording,
or voice chat is full-band content, and a model tuned for narrowband telephony
leaves quality on the table.

In published evaluations the DeepFilterNet models out-score RNNoise on
standard perceptual quality metrics, and the difference is audible in exactly
the scenario you care about: aggressive noise. A clacky keyboard under
continuous speech is where RNNoise starts to sound strained and DeepFilterNet
stays composed.

And despite the bigger ideas, it remains a real-time algorithm. DeepFilterNet
runs on the CPU, in 10 ms frames, at a cost a modern desktop absorbs without
complaint. That is what makes it usable live, not just in offline cleanup
tools.

## Alt Denoiser: DeepFilterNet as a VST3 plugin

A great model is not the same thing as a usable tool. DeepFilterNet ships as
source code and command-line binaries. That is fine for researchers and no
help at all if you just want a quieter mic in Discord.

Alt Denoiser closes that gap. It wraps DeepFilterNet in a standard VST3
plugin: the neural network, the frame buffering, and the sample-rate handling
all live inside the plugin, and what you see is a normal processor with a
couple of controls. Install it, and it appears in any VST3 host next to your
compressors and EQs.

That packaging decision is what unlocks the placement argument from the top
of this article. Once noise suppression is a VST3 processor, it stops
belonging to any one application. It can sit directly on your microphone
signal, upstream of everything.

## Running it live with PatchTray

PatchTray is a visual VST3 host for live audio on Windows that runs from the
system tray. It builds a chain around one compatible logical duplex device;
supported backends include duplex ASIO and DirectSound, plus Windows Audio in
Shared, Exclusive, and Low Latency modes. This walkthrough uses ASIO for its
specific microphone route. If the routing concepts are new, the
[Run VST3 effects without a DAW](/guides/run-vst3-without-daw) guide covers
the basic signal path; what follows is the noise-suppression-specific part.

The chain looks like this:

```text
ASIO input (your mic) → Alt Denoiser → ASIO output (to your mixer/apps)
```

Set it up once:

1. **Select your ASIO device and ports.** Choose the input channels carrying
   your microphone and the output channels feeding your mixer or virtual
   audio device, matching whatever pair your setup already uses.
2. **Add Alt Denoiser to the canvas.** It appears in the plugin library like
   any other processor.
3. **Connect input to Alt Denoiser, Alt Denoiser to output.** Keep the
   denoiser first in the chain. Noise suppression works best on the dry
   signal—before compression, EQ, or saturation has reshaped the noise floor
   it is trying to identify.
4. **Set the attenuation.** Start moderate. Enough to pull the keyboard and
   fans under the speech, not so much that quiet words lose their edges. Every
   suppressor has a setting past which the cure becomes audible.
5. **Save the preset.** A configured route keeps running while the main window
   is closed, because the tray keeps the engine alive. The chain is then
   waiting the next time you sit down, rather than something you rebuild at
   the start of every session.

From there, point your applications at the processed signal. On most Windows
setups that means the PatchTray output feeds a virtual cable or mixer input,
and Discord, OBS, the game, and the meeting app all select that device as
their microphone. Each app can keep its own noise suppression *off*. The
signal arriving at it is already clean, and double suppression is a recipe
for exactly the warbling artifacts you set out to avoid.

A few honest caveats. Every neural suppressor adds latency: DeepFilterNet
works in 10 ms frames plus buffering, so account for that delay when evaluating
the monitored signal for your own workflow. CPU cost also depends on the system
and the rest of the chain. And no algorithm creates
information. If the noise is louder than your voice, no amount of attenuation
will make the result sound good, and the fix is to move the mic closer rather
than to turn the knob further.

## Clean once, everywhere

Noise suppression on the desktop has been moving upstream for years. Spectral
subtraction cleaned recordings after the fact. RNNoise put a neural network
inside whichever app you happened to be using. DeepFilterNet improved the
model, and wrapping it in VST3 takes it out of any single app entirely and
puts it on the microphone signal itself, where one cleanup serves every
program that listens.

The newer model is a real improvement and worth having. But the larger part of
the benefit comes from the cheaper decision: doing the cleanup once, early,
instead of asking every application to solve the same problem separately and
only for itself.
