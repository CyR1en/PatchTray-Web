import { siteConfig } from "../config";
import { ArrowMark, WindowsMark } from "../components/marks";
import { CaptureImage } from "../components/CaptureImage";
import { DownloadBuildButton } from "../components/DownloadBuildButton";
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
          Download the public beta and build a live VST3 chain around one compatible duplex audio device. Start
          with Free, then upgrade if you need more nodes or presets.
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
                <strong>choose a compatible duplex audio device</strong> through ASIO, Windows Audio, or
                DirectSound. PatchTray uses one logical device at a time.
              </span>
            </p>
            <p>
              <i aria-hidden="true">✓</i>
              <span>
                <strong>set up the input and output ports</strong> exposed by that device for the route you want
                to build.
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
          <div className="download-details__actions">
            <a className="button button--text" href="/guides/build-your-first-vst3-chain">
              [ read the setup guide ] <ArrowMark />
            </a>
            <a className="button button--text" href="/pricing">
              [ see pricing ] <ArrowMark />
            </a>
          </div>
        </div>
        <figure className="app-capture app-capture--settings">
          <CaptureImage
            baseName="patchtray-settings"
            sourceWidths={[640, 1280]}
            width={1280}
            height={720}
            sizes="(max-width: 980px) calc(100vw - 32px), 42vw"
            alt="PatchTray audio settings showing an ASIO device as one supported duplex-device configuration example."
          />
          <figcaption>
            <span>current app view</span>
            <strong>[ ASIO example / one supported backend ]</strong>
          </figcaption>
        </figure>
      </section>
    </PageFrame>
  );
}
