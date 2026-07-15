import { siteConfig } from "../config";
import { WindowsMark } from "../components/marks";
import { SectionRule } from "../components/SectionRule";
import { PageFrame } from "../components/layout/PageFrame";

export function GuidePage() {
  return (
    <PageFrame current="guide">
      <section className="page-hero content-width page-hero--guide">
        <p className="terminal-label">patchtray / starter guide</p>
        <h1>
          build your first
          <br />
          live plugin chain.
        </h1>
        <p className="page-lead">
          Choose your ASIO input and output, add the VST3 processors you want, connect the route, and save it as
          a preset.
        </p>
      </section>

      <div className="content-width guide-layout">
        <aside className="guide-toc" aria-label="Guide contents">
          <p>on this page</p>
          <a href="#start">[ get oriented ]</a>
          <a href="#ports">[ choose ports ]</a>
          <a href="#chain">[ build a chain ]</a>
          <a href="#save">[ save the route ]</a>
        </aside>
        <div className="guide-content">
          <section id="start">
            <SectionRule>get oriented</SectionRule>
            <h2>the canvas holds the route.</h2>
            <p>
              PatchTray is built around a visual node graph. An ASIO input node is where the live audio enters.
              VST3 nodes are the processing chain. An ASIO output node is where the finished signal leaves for
              the rest of your setup.
            </p>
            <p>
              The product stays available in the system tray, so the canvas can be there when you need to change
              the chain without becoming another window you keep open.
            </p>
          </section>

          <section id="ports" className="guide-section--split">
            <div>
              <SectionRule>choose ports</SectionRule>
              <h2>name the two ends before you connect them.</h2>
              <p>
                Open the audio device settings and choose the ASIO device. Then configure the input and output
                ports that match the channels you intend to route through your mixer.
              </p>
              <p className="guide-note">
                The exact device and channel choice depend on your local ASIO and mixer configuration. Voicemeeter
                ASIO inserts are a common setup; other ASIO-capable mixers that accept insert patching can work the
                same way.
              </p>
            </div>
            <figure className="app-capture app-capture--ports">
              <img
                src="/assets/patchtray-ports.png"
                alt="PatchTray dialog for configuring stereo ASIO input ports and selecting channel assignments."
              />
              <figcaption>
                <span>current app view</span>
                <strong>[ port config ]</strong>
              </figcaption>
            </figure>
          </section>

          <section id="chain">
            <SectionRule>build a chain</SectionRule>
            <h2>process the signal in the order you want.</h2>
            <ol className="guide-steps">
              <li>
                <strong>add the VST3 nodes</strong>
                <span>Use the plugin library to place the processors you want on the canvas.</span>
              </li>
              <li>
                <strong>connect the jacks</strong>
                <span>Route input to processors, then processors to output. The cables make the order visible.</span>
              </li>
              <li>
                <strong>adjust in context</strong>
                <span>
                  Use in-node parameter controls when available, or open the plugin’s native editor window.
                </span>
              </li>
              <li>
                <strong>read the status</strong>
                <span>
                  Use real-time telemetry and the state labels to understand what the engine is reporting.
                </span>
              </li>
            </ol>
          </section>

          <section id="save">
            <SectionRule>save the route</SectionRule>
            <h2>presets are for returns, not guesses.</h2>
            <p>
              Once the connection reads correctly, save a preset so you can return to the same chain. Free
              includes one preset and up to two VST3 nodes. Pro unlocks unlimited presets and unlimited VST3
              nodes.
            </p>
            <div className="guide-end">
              <a href="/download" className="button button--primary">
                <WindowsMark /> [ download for windows ]
              </a>
              <p>
                PatchTray {siteConfig.releaseVersion} · {siteConfig.releaseState}
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageFrame>
  );
}
