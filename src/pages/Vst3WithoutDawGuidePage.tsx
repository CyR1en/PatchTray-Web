import { CaptureImage } from "../components/CaptureImage";
import {
  GuideArticleLayout,
  SignalFlow,
  type GuideArticleSection,
} from "../components/layout/GuideArticleLayout";
import { VST3_WITHOUT_DAW_GUIDE } from "../lib/guides";

const sections: readonly GuideArticleSection[] = [
  {
    id: "choose",
    nav: "choose the workflow",
    title: "Use a host when the job is a live path, not a session.",
    body: (
      <>
        <p>
          A VST3 effect cannot process live audio by itself. It needs a host to open the plug-in, provide audio
          buffers, expose parameters, and connect input to output. A DAW can do that, but its recording,
          timeline, project, and mixing tools may be unnecessary for an always-on voice or instrument chain.
        </p>
        <div className="article-compare" role="group" aria-label="Standalone host and DAW comparison">
          <div>
            <span>standalone host</span>
            <strong>Choose it for</strong>
            <p>One visible live route, quick adjustments, presets, and a chain that stays available.</p>
          </div>
          <div>
            <span>DAW</span>
            <strong>Choose it for</strong>
            <p>Recording, editing, arrangement, automation, multi-track production, or rendering.</p>
          </div>
        </div>
        <p>
          PatchTray is intentionally the first kind of tool. It is a Windows VST3 host for a live ASIO path,
          not a replacement for a DAW session.
        </p>
      </>
    ),
  },
  {
    id: "route",
    nav: "define the route",
    title: "Name the input and output before adding effects.",
    body: (
      <>
        <SignalFlow
          label="Live ASIO source through PatchTray effects to an ASIO destination"
          nodes={["ASIO input", "PatchTray graph", "VST3 effects", "ASIO output"]}
        />
        <p>
          Decide where the signal enters and where it must leave. That may be a hardware interface, an ASIO
          insert path exposed by a mixer, or another verified ASIO-capable route. The input and output channel
          choices belong to your driver and mixer configuration.
        </p>
        <figure className="app-capture article-capture">
          <CaptureImage
            baseName="patchtray-settings"
            sourceWidths={[640, 1280]}
            width={1280}
            height={720}
            sizes="(max-width: 980px) calc(100vw - 32px), 720px"
            alt="PatchTray audio settings with ASIO device, sample rate, and buffer size controls."
          />
          <figcaption>
            <span>PatchTray audio device</span>
            <strong>[ select the verified ASIO path ]</strong>
          </figcaption>
        </figure>
      </>
    ),
  },
  {
    id: "connect",
    nav: "connect the graph",
    title: "Get an unprocessed round trip working first.",
    body: (
      <>
        <ol>
          <li>Choose the ASIO device in PatchTray’s audio settings.</li>
          <li>Configure the input and output ports for the intended channel pair.</li>
          <li>Place one ASIO input node and one ASIO output node on the canvas.</li>
          <li>Connect input directly to output and confirm stable signal.</li>
          <li>Only then place a VST3 effect between the two nodes.</li>
        </ol>
        <p>
          This order separates routing problems from plug-in problems. If the direct cable is silent, changing
          EQ settings cannot fix the route. If the direct cable works and one effect stops it, the driver and
          ports have already been cleared.
        </p>
      </>
    ),
  },
  {
    id: "effects",
    nav: "add effects",
    title: "Build a small chain and keep every stage testable.",
    body: (
      <>
        <p>
          Scan the VST3 effects already installed on the machine, place the processors you need, and connect
          them in audible order. Start with one processor. Add the next only after the first passes signal and
          its bypass behavior is understood.
        </p>
        <figure className="app-capture article-capture">
          <CaptureImage
            baseName="patchtray-canvas"
            sourceWidths={[960, 1745]}
            width={1745}
            height={1073}
            sizes="(max-width: 980px) calc(100vw - 32px), 720px"
            alt="PatchTray canvas connecting an ASIO input through a VST3 effect to an ASIO output."
          />
          <figcaption>
            <span>visible live route</span>
            <strong>[ ASIO → VST3 → ASIO ]</strong>
          </figcaption>
        </figure>
        <p>
          Use the controls exposed on the node for quick changes. Open the plug-in’s native editor when the
          full interface is needed. Keep output level conservative while adding dynamics, saturation, gain, or
          other processors that can change level abruptly.
        </p>
      </>
    ),
  },
  {
    id: "keep",
    nav: "keep it available",
    title: "Save the known-good route, then move it to the tray.",
    body: (
      <>
        <p>
          Save a preset after the channel pair and plug-in order are confirmed. The preset is the return point
          for that route; give it a name that identifies the source and destination rather than only the effect
          style.
        </p>
        <p>
          PatchTray can remain in the Windows system tray while the chain continues running. Reopen it to
          adjust the graph, inspect status, or load another preset. Test this behavior before relying on it in a
          stream, rehearsal, or performance.
        </p>
        <div className="article-note">
          <strong>Free and Pro</strong>
          <p>
            Free supports up to four VST3 nodes and one preset. Pro removes the node and preset limits. The
            audio-routing model is the same on both plans.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "limits",
    nav: "know the limits",
    title: "A smaller host removes session work; it does not remove audio constraints.",
    body: (
      <>
        <ul>
          <li>
            Lower buffer sizes can reduce delay but may become unstable. There is no universal best value for
            every interface, driver, CPU, and plug-in chain.
          </li>
          <li>Sample-rate or channel mismatches can create silence even when the graph is connected.</li>
          <li>Some plug-ins add their own processing delay or behave differently on live input.</li>
          <li>A feedback loop is still possible when an output is returned to its own input through the mixer.</li>
          <li>Recording, editing, automation, and arrangement still belong in a DAW.</li>
        </ul>
        <div className="article-warning">
          <strong>Do not optimize while going live.</strong>
          <p>
            Prove the route at low monitoring level, increase the buffer if it crackles, and keep a bypass path
            available until the complete chain is stable.
          </p>
        </div>
        <p>
          For installation and port basics, use the <a href="/guide">PatchTray quick-start</a>. If the driver
          opens but the graph does not behave as described, collect the device name, sample rate, buffer, port
          pair, and failing node before contacting <a href="/support">support</a>.
        </p>
      </>
    ),
  },
];

export function Vst3WithoutDawGuidePage() {
  return (
    <GuideArticleLayout
      article={VST3_WITHOUT_DAW_GUIDE}
      lead="Use PatchTray as a focused Windows host when you need a live input-to-output VST3 chain, but not recording, arrangement, or a timeline."
      sections={sections}
      sources={[
        {
          href: "https://steinbergmedia.github.io/vst3_dev_portal/pages/What%2Bis%2BVST/Index.html",
          label: "Steinberg VST 3 developer portal",
          note: "Official overview of VST plug-ins, effects, and compatible host applications.",
        },
        {
          href: "https://steinbergmedia.github.io/vst3_dev_portal/pages/Technical%2BDocumentation/Locations%2BFormat/Plugin%2BLocations.html",
          label: "Steinberg VST3 plug-in locations",
          note: "Official reference for standard plug-in installation locations.",
        },
      ]}
      next={{ href: "/guides/voicemeeter-vst3-plugins", label: "build a Voicemeeter insert route" }}
    />
  );
}
