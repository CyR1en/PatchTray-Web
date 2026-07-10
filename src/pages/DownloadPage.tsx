import { siteConfig } from "../config";
import { ArrowMark, WindowsMark } from "../components/marks";
import { DownloadBuildButton } from "../components/DownloadBuildButton";
import { ProCheckoutActions } from "../components/ProCheckoutActions";
import { ProPriceNote } from "../components/ProPriceNote";
import { SectionRule } from "../components/SectionRule";
import { PageFrame } from "../components/layout/PageFrame";

export function DownloadPage() {
  return (
    <PageFrame current="download">
      <section className="page-hero content-width page-hero--download">
        <p className="terminal-label">patchtray / release channel</p>
        <h1>
          the public beta is
          <br />
          for windows.
        </h1>
        <p className="page-lead">
          PatchTray is a low-latency, system-tray VST3 host for Windows ASIO inserts. Start with the Free tier
          and make the route visible — Voicemeeter or any mixer that can take an ASIO patch.
        </p>
      </section>

      <section className="release-module content-width" aria-labelledby="release-title">
        <div className="release-module__top">
          <h2 id="release-title">available build</h2>
          <span>[ {siteConfig.releaseState} ]</span>
        </div>
        <div className="release-module__body">
          <div className="release-mark">
            <WindowsMark />
          </div>
          <div>
            <h3>PatchTray {siteConfig.releaseVersion}</h3>
            <p>Windows build · public beta</p>
          </div>
          <DownloadBuildButton />
        </div>
        <div className="release-module__foot">
          <span>requirements</span>
          <p>{siteConfig.requirementsText}</p>
        </div>
      </section>

      <section className="download-details content-width">
        <div className="download-details__main">
          <SectionRule>before you start</SectionRule>
          <h2>
            begin with the route,
            <br />
            not the plugin list.
          </h2>
          <div className="check-lines">
            <p>
              <i aria-hidden="true">✓</i>
              <span>
                <strong>choose your ASIO device</strong> in PatchTray before deciding where your signal goes.
              </span>
            </p>
            <p>
              <i aria-hidden="true">✓</i>
              <span>
                <strong>set up the input and output ports</strong> that match the channels you route through
                your mixer.
              </span>
            </p>
            <p>
              <i aria-hidden="true">✓</i>
              <span>
                <strong>then add VST3 processors</strong> and connect the nodes in the order you want to hear
                them.
              </span>
            </p>
          </div>
          <a className="button button--text" href="/guide">
            [ read the setup guide ] <ArrowMark />
          </a>
        </div>
        <figure className="app-capture app-capture--settings">
          <img
            src="/assets/patchtray-settings.png"
            alt="PatchTray audio device settings screen with ASIO device, sample rate, and buffer size fields."
          />
          <figcaption>
            <span>current app view</span>
            <strong>[ audio device ]</strong>
          </figcaption>
        </figure>
      </section>

      <section className="plan-module content-width">
        <SectionRule>license options</SectionRule>
        <div className="plan-module__grid">
          <div>
            <h2>the limits are stated plainly.</h2>
            <p>
              Free covers a compact mic chain: 2 VST3 nodes and 1 preset. Pro removes those limits with
              unlimited nodes and presets — pay monthly or buy once.
            </p>
          </div>
          <div className="plan-lines">
            <p>
              <strong>free</strong>
              <span>up to 2 VST3 nodes · 1 preset</span>
              <em className="plan-lines__price">[ included ]</em>
            </p>
            <p className="plan-lines__pro">
              <strong>pro</strong>
              <span>unlimited VST3 nodes · unlimited presets</span>
              <ProPriceNote />
            </p>
            <div className="plan-lines__action">
              <ProCheckoutActions />
            </div>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
