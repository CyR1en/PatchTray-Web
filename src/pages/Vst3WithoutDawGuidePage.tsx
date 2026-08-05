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
          PatchTray is intentionally the first kind of tool. It is a visual VST3 host for live audio around
          one compatible logical duplex device, not a replacement for a DAW session.
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
          label="Live audio source through PatchTray effects to an output"
          nodes={["audio input", "PatchTray graph", "VST3 effects", "audio output"]}
        />
        <p>
          Decide where the signal enters and where it must leave on the selected logical duplex device. PatchTray
          supports compatible duplex ASIO and DirectSound devices, plus Windows Audio in Shared, Exclusive, and
          Low Latency modes. The available input and output ports belong to the selected backend and device
          configuration.
        </p>
        <figure className="app-capture article-capture">
          <CaptureImage
            baseName="patchtray-settings"
            sourceWidths={[640, 1280]}
            width={1280}
            height={720}
            sizes="(max-width: 980px) calc(100vw - 32px), 720px"
            alt="PatchTray audio settings showing an ASIO device as one supported duplex-device configuration example."
          />
          <figcaption>
            <span>PatchTray audio device</span>
            <strong>[ ASIO example / one supported backend ]</strong>
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
          <li>Choose one compatible logical duplex device in PatchTray’s audio settings.</li>
          <li>Configure its input and output ports for the intended route.</li>
          <li>Place one input node and one output node on the canvas.</li>
          <li>Connect input directly to output and confirm stable signal.</li>
          <li>Only then place a VST3 effect between the two nodes.</li>
        </ol>
        <p>
          This order separates routing problems from plug-in problems. If the direct cable is silent, changing
          EQ settings cannot fix the route. If the direct cable works and one effect stops it, the backend,
          device, and ports have already been cleared.
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
            alt="PatchTray canvas showing a VoiceMeeter Insert ASIO route through a VST3 effect as one supported setup example."
          />
          <figcaption>
            <span>visible live route</span>
            <strong>[ ASIO example / input → VST3 → output ]</strong>
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
            Buffer controls and behavior vary by backend and device. There is no universal best value for every
            device, CPU, and plug-in chain.
          </li>
          <li>Sample-rate or channel mismatches can create silence even when the graph is connected.</li>
          <li>Some plug-ins add their own processing delay or behave differently on live input.</li>
          <li>A feedback loop is still possible when an output is returned to its own input through the mixer.</li>
          <li>Recording, editing, automation, and arrangement still belong in a DAW.</li>
        </ul>
        <div className="article-warning">
          <strong>Do not optimize while going live.</strong>
          <p>
            Prove the route at low monitoring level, adjust the buffer only when the selected backend and device
            expose that control, and keep a bypass path available until the complete chain is stable.
          </p>
        </div>
        <p>
          For installation and port basics, use the <a href="/guides/build-your-first-vst3-chain#ports">PatchTray quick-start</a>. If the backend
          and device open but the graph does not behave as described, collect their names, the relevant audio
          settings, ports, and failing node before contacting <a href="/support">support</a>.
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
      next={{ href: "/guides/build-your-first-vst3-chain", label: "start with the PatchTray quick-start" }}
    />
  );
}
