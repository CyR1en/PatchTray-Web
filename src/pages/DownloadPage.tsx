import { siteConfig } from "../config";
import { ArrowMark, WindowsMark } from "../components/marks";
import { CaptureImage } from "../components/CaptureImage";
import { DownloadBuildButton } from "../components/DownloadBuildButton";
import { ProCheckoutActions } from "../components/ProCheckoutActions";
import { ProPriceNote } from "../components/ProPriceNote";
import { SectionRule } from "../components/SectionRule";
import { PageFrame } from "../components/layout/PageFrame";
import { useLatestRelease } from "../hooks/useLatestRelease";

export function DownloadPage() {
  const release = useLatestRelease();

  return (
    <PageFrame current="download">
      <section className="page-hero content-width page-hero--download">
        <p className="terminal-label">patchtray / release channel</p>
        <h1>
          get PatchTray
          <br />
          for Windows.
        </h1>
        <p className="page-lead">
          Download the public beta and build a live VST3 chain between your ASIO input and output. Start with
          Free, then upgrade if you need more nodes or presets.
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
            <h3>PatchTray {release.version}</h3>
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
          <CaptureImage
            baseName="patchtray-settings"
            sourceWidths={[640, 1280]}
            width={1280}
            height={720}
            sizes="(max-width: 980px) calc(100vw - 32px), 42vw"
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
              Free covers a compact live-audio chain: 4 VST3 nodes and 1 preset. Pro removes those limits with
              unlimited nodes and presets — pay monthly or buy once.
            </p>
          </div>
          <div className="plan-lines">
            <p>
              <strong>free</strong>
              <span>up to 4 VST3 nodes · 1 preset</span>
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
