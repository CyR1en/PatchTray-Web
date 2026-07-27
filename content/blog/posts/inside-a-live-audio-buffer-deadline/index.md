---
schemaVersion: 1
title: "Inside a 2.67 ms deadline: how a Windows VST3 host keeps audio from crackling"
summary: "A 128-sample buffer at 48 kHz gives a live host 2.67 milliseconds per processing block. Here is what must happen before that clock runs out."
publishedAt: "2026-07-27T22:15:55Z"
author:
  name: "PatchTray"
  type: "Organization"
  url: "https://www.patchtray.io/"
category: "engineering"
tags:
  - "real-time audio"
  - "ASIO"
  - "VST3 hosting"
  - "audio latency"
image:
  src: "./hero.png"
  alt: "Audio buffer blocks passing through three VST3 processing stages just before an orange real-time deadline."
status: "published"
featured: true
---

Audio software has a fairly brutal definition of “fast enough.”

If a web page takes an extra 20 milliseconds to respond, nobody notices. If a
live audio engine finishes a buffer 20 milliseconds late, the result is not a
slightly slower buffer. The buffer has already missed its turn. What reaches
the output may be a pop, a crackle, a short silence, or whatever recovery
behavior the driver and host can manage.

That is the part of low-latency audio that a buffer-size control tends to hide.
The setting is not just a latency preference. It is a deadline that comes back
again and again for as long as the route is running.

At 48 kHz with a 128-sample buffer, that deadline is about 2.67 milliseconds.
What, exactly, has to happen during that time?

## The buffer sets a clock, not the whole latency

The basic calculation is simple:

`block duration in milliseconds = buffer samples / sample rate × 1,000`

| Buffer | 44.1 kHz | 48 kHz | 96 kHz |
| ---: | ---: | ---: | ---: |
| 64 samples | 1.45 ms | 1.33 ms | 0.67 ms |
| 128 samples | 2.90 ms | 2.67 ms | 1.33 ms |
| 256 samples | 5.80 ms | 5.33 ms | 2.67 ms |

These numbers are useful, but they are easy to misread. A 128-sample buffer at
48 kHz does **not** mean that microphone-to-headphone latency is 2.67 ms.

The complete trip can include input buffering, driver behavior, converter
latency, host processing, latency introduced by individual plug-ins, output
buffering, and another conversion back to analog. Some drivers also use safety
buffers that are not obvious from the number shown in the control panel.

The 2.67 ms figure is better understood as the length of one processing block.
Once the driver makes the next block available, the host has a narrow window in
which to consume the input, process the graph, and prepare the output. Then the
same job arrives again.

This distinction matters. Latency describes how late the signal is. A deadline
miss means the signal was not ready at all.

## What has to fit inside one block

Take a small PatchTray route:

```text
ASIO input → noise suppression → compressor → ASIO output
```

The graph is a useful picture for a person, but the audio engine needs an
execution plan. It has to know that the input comes first, that the compressor
cannot run until the noise suppressor has produced its output, and that the
final buffer belongs at the selected ASIO output.

Conceptually, one trip through the processing callback looks something like
this:

1. Receive or expose the current input buffers from the ASIO driver.
2. Find the nodes that are ready to run.
3. Prepare the audio buses and parameter changes for the first VST3 processor.
4. Run that processor for the current block.
5. Pass its output to the next ready node.
6. Repeat until the route reaches its output.
7. Return the completed output before the driver needs it.

The real version has more edge cases. A plug-in may accept mono, stereo, or
several bus arrangements. It may process 32-bit samples but not 64-bit samples.
Input and output buffers may share memory. A plug-in may report silence, keep a
tail after its input stops, or expose a side-chain bus that is not connected.

This is why hosting a VST3 plug-in means more than loading a DLL and calling a
single function. Before processing begins, the host negotiates the processing
setup, bus arrangement, sample format, maximum block size, and active state.
Only then does it enter the repeating processing phase described in
[Steinberg’s VST3 processor call sequence](https://steinbergmedia.github.io/vst3_dev_portal/pages/Technical%2BDocumentation/Workflow%2BDiagrams/Audio%2BProcessor%2BCall%2BSequence.html).

Most of that setup belongs outside the live callback. The callback should be
boring. In real-time audio, boring is good.

## The audio thread cannot wait politely

A normal application thread can ask the operating system for memory, wait for
a lock, write a log file, or pause while another task finishes. The audio
thread has the same technical ability to do those things, but not the time.

Suppose it tries to acquire a lock held by the plug-in editor. The editor is
busy redrawing an analyzer and keeps the lock for four milliseconds. Nothing
is technically broken: the lock is eventually released and the audio thread
continues. But our 2.67 ms block is already late.

The same problem can appear as:

- memory allocation that occasionally asks the operating system for more work;
- file or network access from the processing path;
- an audio-thread log message waiting on a shared logger;
- a plug-in synchronizing directly with its editor;
- a driver or another high-priority task occupying the CPU at the wrong time;
- a large piece of work whose average cost looks fine but whose worst case does
  not.

The official VST3 documentation is blunt about this: `process()` and
`setProcessing()` may be called on the audio thread, and implementations should
avoid memory allocation there. The VST3
[data-exchange guidance](https://steinbergmedia.github.io/vst3_dev_portal/pages/Technical%2BDocumentation/Data%2BExchange/Index.html)
also explains why the processor and editor should not simply share data behind
a mutex. A mutex has no dependable completion time.

A host can keep its own processing path disciplined. It cannot force every
third-party plug-in to behave well. That is one reason a plug-in can be stable
in one route and troublesome in another, especially after the buffer is
reduced.

## Plug-in latency and a missed deadline are different problems

A plug-in can finish every callback on time and still add noticeable latency.

Look-ahead processors are the clearest example. A limiter cannot react to a
peak before seeing it, so it deliberately delays the signal while it examines
future samples. Linear-phase processing and some oversampling designs can add
their own delay as well.

VST3 gives a plug-in a way to report this value in samples. A host can use the
reported latency to keep parallel paths aligned by delaying the earlier path.
What it cannot do is make future audio arrive sooner. If a plug-in needs 512
samples of look-ahead, that is 10.67 ms at 48 kHz before driver and converter
latency enter the picture.

This leads to two different troubleshooting questions:

- **Is the route late?** The engine missed a processing deadline, which is
  likely to sound like a crackle or dropout.
- **Is the route delayed?** Every block arrived intact, but buffering or a
  plug-in’s algorithm moved the signal later in time.

Increasing the ASIO buffer may help the first problem because it gives each
callback more room. It will make the second problem worse by adding more
buffering. That is not a contradiction. It is a trade.

## Why a calm CPU meter can still accompany crackles

An average CPU number smooths time out. Audio failures happen at particular
moments.

Imagine that 999 callbacks finish comfortably and one callback stalls long
enough to miss its output window. Average CPU usage may still look excellent.
The listener hears the one failure.

This is also why a stress test should resemble the route’s real use. Opening a
plug-in editor, moving several parameters, starting a screen capture, or
changing windows may reveal timing problems that never appear while the
computer sits untouched. The point is not to make the machine suffer for sport.
It is to test the work that will actually happen during a stream, performance,
or call.

Microsoft’s documentation on
[low-latency Windows audio](https://learn.microsoft.com/en-us/windows-hardware/drivers/audio/low-latency-audio)
makes the same broader point: low buffer sizes require the application, driver,
hardware, and system scheduling to meet tighter timing constraints. No single
buffer value is universally safe.

There is another non-obvious detail here. A plug-in’s bypass button may not
remove its processing cost or reported latency. Under VST3, bypass is generally
a parameter implemented by the plug-in, and the host may continue calling
`process()`. Steinberg covers this in its
[VST3 processing FAQ](https://steinbergmedia.github.io/vst3_dev_portal/pages/FAQ/Processing.html).
When isolating a suspicious processor, testing the route with the node removed
is more conclusive than trusting the bypass light.

## Higher sample rates tighten the same deadline

Moving from 48 kHz to 96 kHz doubles the number of samples processed each
second. If the buffer remains at 128 samples, its duration falls from 2.67 ms
to 1.33 ms.

That can reduce one part of the latency, but the engine now has half as much
wall-clock time per block and twice as many samples to move through the system
each second. Some plug-ins also do more internal work at the higher rate.

Higher is not automatically better. Lower is not automatically cleaner.
Sample rate and buffer size have to be considered together, with the actual
driver and plug-in chain in the loop.

For a live voice route, 48 kHz at a stable buffer is often more useful than a
more impressive setting that crackles when a plug-in window opens. The right
number is the lowest one that survives the whole job, not the lowest one the
control panel will accept.

## A practical way to tune a live route

Start with evidence, not with the smallest available number.

1. Match the sample rate across the interface, ASIO driver, mixer, and host.
2. Choose a conservative buffer such as 256 samples.
3. Build the shortest possible input-to-output route with no VST3 processors.
4. Confirm the clean route at low monitoring volume.
5. Add processors one at a time and test after each addition.
6. Exercise the plug-in editors and the other applications used during the
   real session.
7. Lower the buffer one step, test again, and stop when the next step loses
   repeatable stability.

If the route becomes unstable after one plug-in is added, remove that node and
repeat the test. If the audio is clean but monitoring suddenly feels late,
check whether the plug-in uses look-ahead, linear-phase processing, or reports
substantial latency.

The goal is not to prove that the machine can run 64 samples for thirty quiet
seconds. The goal is to find a setting that still works forty minutes into the
session when every part of the normal workflow is active.

## Measure the route you actually use

Round-trip latency is measurable, but the test setup has to be named.

A basic hardware loopback test sends a sharp transient through an output,
returns it to an input, records both the original and returned signal, and
measures the sample offset between them:

`measured latency in milliseconds = offset samples / sample rate × 1,000`

The result includes the specific interface, driver, converters, buffer
configuration, and route used for the test. Add a plug-in chain and measure
again to see what that chain changes.

Keep the monitoring level low and make sure the route cannot feed its own
output back indefinitely. A loopback test that turns into feedback will teach
the wrong lesson very quickly.

Any published latency number should include at least:

- audio interface and driver version;
- sample rate and reported buffer size;
- input and output path;
- plug-ins in order;
- whether plug-in editors and the normal companion applications were open;
- the measurement method.

Without that context, a latency number is mostly decoration.

## The useful target is predictable audio

There is nothing sacred about 2.67 ms. It is simply the block duration produced
by one common combination: 128 samples at 48 kHz.

What matters is everything that has to happen before those 2.67 milliseconds
expire, and whether it can happen on time for every block—not merely on
average. A visible signal graph helps explain the order of the work. It does
not repeal the clock.

That is the practical bargain behind low-latency audio: smaller buffers reduce
delay by allowing less time for mistakes. Larger buffers buy stability by
making the route wait longer. A good live setup is not the one with the
smallest number in its settings panel. It is the one that remains clean when
the session stops being a test and starts being real.

If the host and ASIO route are new territory, start with the
[VST3 without a DAW guide](/guides/run-vst3-without-daw), then return to the
buffer once the basic signal path is working.
