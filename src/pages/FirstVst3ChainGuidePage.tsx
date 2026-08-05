import { WindowsMark } from "../components/marks";
import { CaptureImage } from "../components/CaptureImage";
import {
  GuideArticleLayout,
  SignalFlow,
  type GuideArticleSection,
} from "../components/layout/GuideArticleLayout";
import { FIRST_VST3_CHAIN_GUIDE } from "../lib/guides";
import { analyticsEvents } from "../lib/analytics";

const sections: readonly GuideArticleSection[] = [
  {
    id: "start",
    nav: "get oriented",
    title: "The canvas holds the route.",
    body: (
      <>
        <SignalFlow
          label="Live audio source through a PatchTray VST3 chain to an output"
          nodes={["audio input", "VST3 nodes", "audio output"]}
        />
        <p>
          PatchTray is built around a visual node graph. An input node is where live audio enters. VST3 nodes
          are the processing chain. An output node is where the signal leaves for the rest of your setup.
        </p>
        <p>
          The product stays available in the system tray, so the canvas can be there when you need to change
          the chain without becoming another window you keep open.
        </p>
      </>
    ),
  },
  {
    id: "ports",
    nav: "choose ports",
    title: "Name the two ends before you connect them.",
    body: (
      <>
        <p>
          Open the audio device settings and choose one compatible logical duplex device. PatchTray supports
          compatible duplex ASIO and DirectSound devices, plus Windows Audio in Shared, Exclusive, and Low
          Latency modes. Then configure the input and output ports exposed by that device.
        </p>
        <div className="article-note">
          <strong>One logical duplex device at a time.</strong>
          <p>
            The exact ports depend on your selected backend and device. For expanded multichannel routing,{" "}
            <a href="/guides/voicemeeter-vst3-plugins">VoiceMeeter Patch Inserts</a> are an optional workflow.
          </p>
        </div>
        <figure className="app-capture article-capture">
          <CaptureImage
            baseName="patchtray-ports"
            sourceWidths={[640, 1280]}
            width={1280}
            height={720}
            sizes="(max-width: 980px) calc(100vw - 32px), 720px"
            alt="PatchTray port dialog showing a stereo VoiceMeeter Insert ASIO configuration as one supported setup example."
          />
          <figcaption>
            <span>current app view</span>
            <strong>[ port config ]</strong>
          </figcaption>
        </figure>
      </>
    ),
  },
  {
    id: "chain",
    nav: "build a chain",
    title: "Process the signal in the order you want.",
    body: (
      <ol>
        <li>
          <strong>Add the VST3 nodes.</strong> Use the plugin library to place the processors you want on
          the canvas.
        </li>
        <li>
          <strong>Connect the jacks.</strong> Route input to processors, then processors to output. The
          cables make the order visible.
        </li>
        <li>
          <strong>Adjust in context.</strong> Use in-node parameter controls when available, or open the
          plugin’s native editor window.
        </li>
        <li>
          <strong>Read the status.</strong> Use real-time telemetry and the state labels to understand what
          the engine is reporting.
        </li>
      </ol>
    ),
  },
  {
    id: "save",
    nav: "save the route",
    title: "Presets are for returns, not guesses.",
    body: (
      <>
        <p>
          Once the connection reads correctly, save a preset so you can return to the same chain.
        </p>
        <div className="article-note">
          <strong>Free and Pro</strong>
          <p>
            Free includes one preset and up to four VST3 nodes. Pro unlocks unlimited presets and
            unlimited VST3 nodes.
          </p>
        </div>
        <div className="article-cta">
          <a
            className="button button--primary"
            href="/download"
            data-analytics-event={analyticsEvents.guideConversion}
            data-analytics-detail="quickstart_download"
          >
            <WindowsMark /> [ download for windows ]
          </a>
          <a href="/guides" className="button button--text">
            [ browse workflow guides ]
          </a>
        </div>
      </>
    ),
  },
];

export function FirstVst3ChainGuidePage() {
  return (
    <GuideArticleLayout
      article={FIRST_VST3_CHAIN_GUIDE}
      lead="Choose a compatible duplex audio device, add the VST3 processors you want, connect its input and output ports, and save the route as a preset."
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
