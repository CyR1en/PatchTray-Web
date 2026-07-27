import { CaptureImage } from "../components/CaptureImage";
import {
  GuideArticleLayout,
  SignalFlow,
  type GuideArticleSection,
} from "../components/layout/GuideArticleLayout";
import { VOICEMEETER_VST3_GUIDE } from "../lib/guides";

const sections: readonly GuideArticleSection[] = [
  {
    id: "understand",
    nav: "understand the insert",
    title: "The insert is a round trip, not a second mix.",
    body: (
      <>
        <p>
          Voicemeeter can expose selected input channels through its Insert Virtual ASIO driver. PatchTray
          opens that driver as the ASIO client, receives the selected channel pair, processes it through the
          graph, and returns the result on the matching pair.
        </p>
        <SignalFlow
          label="Voicemeeter input strip to PatchTray and back to the same Voicemeeter insert return"
          nodes={["Voicemeeter strip", "Insert ASIO send", "PatchTray VST3 chain", "Insert ASIO return"]}
        />
        <div className="article-note">
          <strong>Edition matters.</strong>
          <p>
            Banana and Potato expose different insert drivers and channel counts. Use the driver whose name
            matches your installed Voicemeeter edition. Do not copy channel numbers from another person’s
            screenshot.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "prepare",
    nav: "prepare the route",
    title: "Begin with one strip and one stereo pair.",
    body: (
      <>
        <p>Before opening the route, reduce the number of variables:</p>
        <ul>
          <li>Confirm the microphone or other source already reaches the intended Voicemeeter strip.</li>
          <li>Lower monitoring volume before enabling a new return path.</li>
          <li>Close any DAW or host that may already be using the Voicemeeter insert driver.</li>
          <li>Bypass nonessential plug-ins until the unprocessed round trip works.</li>
        </ul>
        <p>
          The Voicemeeter insert driver is a single-client ASIO device. If another application owns it,
          PatchTray cannot open the same driver at the same time.
        </p>
      </>
    ),
  },
  {
    id: "patch",
    nav: "enable the insert",
    title: "Activate the strip in Voicemeeter first.",
    body: (
      <>
        <ol>
          <li>
            Open Voicemeeter’s <strong>System Settings / Options</strong>.
          </li>
          <li>
            Find the <strong>PATCH INSERT</strong> area and enable the left and right channels for the one
            strip you want to process.
          </li>
          <li>
            Note the pair’s labels or numbers. Those two ends must match the PatchTray input and output port
            configuration.
          </li>
          <li>
            Leave additional strips unpatched until the first route is stable.
          </li>
        </ol>
        <p>
          Current Voicemeeter manuals describe the insert as pre-fader and show an insert-return indicator on
          the strip while an ASIO application is connected. The exact control labels can change between
          editions and releases, so use the manual for your installed edition.
        </p>
      </>
    ),
  },
  {
    id: "match",
    nav: "match the ports",
    title: "Use the same pair on both ends of PatchTray.",
    body: (
      <>
        <p>
          In PatchTray’s audio settings, choose the Voicemeeter Insert Virtual ASIO driver that matches your
          edition. Then configure an ASIO input and ASIO output with the same channel pair you enabled in
          Voicemeeter.
        </p>
        <figure className="app-capture article-capture">
          <CaptureImage
            baseName="patchtray-ports"
            sourceWidths={[640, 1280]}
            width={1280}
            height={720}
            sizes="(max-width: 980px) calc(100vw - 32px), 720px"
            alt="PatchTray stereo port configuration showing the channel assignments used by an ASIO input."
          />
          <figcaption>
            <span>PatchTray port configuration</span>
            <strong>[ match the insert pair ]</strong>
          </figcaption>
        </figure>
        <p>
          If the send uses one pair and the return uses another, the graph can look connected while the
          audible route remains silent. Treat the pair as one label carried through the entire setup.
        </p>
      </>
    ),
  },
  {
    id: "build",
    nav: "build the chain",
    title: "Prove the cable before shaping the sound.",
    body: (
      <>
        <ol>
          <li>Add an ASIO input node using the configured insert pair.</li>
          <li>Add an ASIO output node using the matching return pair.</li>
          <li>Connect input directly to output and confirm the round trip.</li>
          <li>Add one VST3 effect between those nodes, then test again.</li>
          <li>Add the remaining processors one at a time.</li>
        </ol>
        <p>
          A practical microphone starting point is corrective EQ, compression, then any de-essing or cleanup
          that your specific signal needs. That is a starting order, not a universal prescription; listen at
          matched output level and keep each processor bypassable while testing.
        </p>
      </>
    ),
  },
  {
    id: "verify",
    nav: "verify safely",
    title: "Check level, feedback, and stability before going live.",
    body: (
      <>
        <ul>
          <li>
            <strong>Feedback:</strong> make sure the processed output is not routed back into the same insert
            input or monitored through a second duplicate path.
          </li>
          <li>
            <strong>Level:</strong> compare bypassed and processed volume. A louder result can sound better
            even when the processing is not helping.
          </li>
          <li>
            <strong>Crackles:</strong> confirm sample-rate agreement, then raise the ASIO buffer if the current
            value is unstable.
          </li>
          <li>
            <strong>Silence:</strong> confirm PATCH INSERT is enabled, PatchTray owns the correct driver, and
            the same channel pair appears at both nodes.
          </li>
        </ul>
        <div className="article-warning">
          <strong>Start quiet.</strong>
          <p>
            Never troubleshoot a new return path at performance volume. Lower monitoring first, enable one
            route, and bring the level up only after confirming it cannot loop.
          </p>
        </div>
        <p>
          If the direct input-to-output graph works but adding one plug-in breaks audio, bypass that plug-in
          and test it separately. For a PatchTray-specific failure, collect the driver name, channel pair, and
          the point where signal stops before contacting <a href="/support">support</a>.
        </p>
      </>
    ),
  },
];

export function VoicemeeterVst3GuidePage() {
  return (
    <GuideArticleLayout
      article={VOICEMEETER_VST3_GUIDE}
      lead="Build a controlled round trip from one Voicemeeter strip, through a visible PatchTray VST3 chain, and back to the matching insert return."
      sections={sections}
      sources={[
        {
          href: "https://vb-audio.com/Voicemeeter/VoicemeeterBanana_UserManual.pdf",
          label: "VB-Audio Voicemeeter Banana user manual",
          note: "Official PATCH INSERT, ASIO driver, buffer, and sample-rate behavior.",
        },
        {
          href: "https://vb-audio.com/Voicemeeter/VoicemeeterPotato_UserManual.pdf",
          label: "VB-Audio Voicemeeter Potato user manual",
          note: "Official Potato insert-driver and channel guidance.",
        },
      ]}
      next={{ href: "/guides/run-vst3-without-daw", label: "run VST3 effects without a DAW" }}
    />
  );
}
