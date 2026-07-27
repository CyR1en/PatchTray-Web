import { CaptureImage } from "../components/CaptureImage";
import { PageFrame } from "../components/layout/PageFrame";
import { ArrowMark } from "../components/marks";
import { SectionRule } from "../components/SectionRule";
import { guideArticles } from "../lib/guides";
import { analyticsEvents } from "../lib/analytics";

export function GuidesPage() {
  return (
    <PageFrame current="guide">
      <section className="guides-hero content-width">
        <div>
          <p className="terminal-label">patchtray / field notes</p>
          <h1>guides for live VST3 audio on Windows.</h1>
          <p className="page-lead">
            Practical routes for Voicemeeter inserts, standalone effects, and ASIO signal chains. Each guide
            shows the actual PatchTray interface, names the assumptions, and leaves configuration-specific
            choices with your system.
          </p>
        </div>
        <aside className="guides-hero__index" aria-label="Guide collection summary">
          <span>collection</span>
          <strong>{String(guideArticles.length).padStart(2, "0")} guides</strong>
          <span>platform</span>
          <strong>Windows / ASIO</strong>
          <span>status</span>
          <strong>maintained</strong>
        </aside>
      </section>

      <section className="guide-register content-width" aria-labelledby="guide-register-title">
        <SectionRule>workflow register</SectionRule>
        <h2 id="guide-register-title">Start with the route you are trying to build.</h2>
        <div className="guide-register__rows">
          {guideArticles.map((article, index) => (
            <article key={article.path}>
              <span className="guide-register__number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{article.category}</p>
                <h3>
                  <a href={article.path}>{article.cardTitle}</a>
                </h3>
                <p>{article.description}</p>
              </div>
              <div className="guide-register__meta">
                <span>{article.readingTime}</span>
                <a href={article.path} aria-label={`Read ${article.title}`}>
                  read guide <ArrowMark />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="guides-proof content-width" aria-labelledby="guides-proof-title">
        <div className="guides-proof__copy">
          <SectionRule>the interface in the guide</SectionRule>
          <h2 id="guides-proof-title">The nodes and cables are the product.</h2>
          <p>
            The screenshots are current PatchTray captures. The example route is deliberately small: one ASIO
            input, one processor, and one ASIO output. Add complexity only after that path passes audio.
          </p>
          <a
            className="button button--text"
            href="/guide"
            data-analytics-event={analyticsEvents.guideConversion}
            data-analytics-detail="hub_quickstart"
          >
            [ start with the product quick-start ] <ArrowMark />
          </a>
        </div>
        <figure className="app-capture">
          <CaptureImage
            baseName="patchtray-canvas"
            sourceWidths={[960, 1745]}
            width={1745}
            height={1073}
            sizes="(max-width: 980px) calc(100vw - 32px), 56vw"
            alt="PatchTray canvas showing an ASIO input connected through a VST3 plugin node to an ASIO output."
          />
          <figcaption>
            <span>guide reference</span>
            <strong>[ input → VST3 → output ]</strong>
          </figcaption>
        </figure>
      </section>

      <section className="guides-method content-width" aria-labelledby="guides-method-title">
        <div>
          <SectionRule>documentation standard</SectionRule>
          <h2 id="guides-method-title">Built from the route, checked against the source.</h2>
          <p>
            PatchTray guides document workflows we can show in the product. Configuration-specific choices
            stay with your driver, mixer, hardware, and plug-ins.
          </p>
        </div>
        <dl>
          <div>
            <dt>01 / original evidence</dt>
            <dd>Product captures and graph examples come from PatchTray, not stock interfaces.</dd>
          </div>
          <div>
            <dt>02 / primary references</dt>
            <dd>External behavior is checked against the vendor’s current manual or technical documentation.</dd>
          </div>
          <div>
            <dt>03 / visible review date</dt>
            <dd>Every article shows when PatchTray last reviewed the workflow and its product boundaries.</dd>
          </div>
          <div>
            <dt>04 / corrections</dt>
            <dd>
              Found a workflow that changed? Send the driver, version, and affected step through{" "}
              <a href="/support">PatchTray support</a>.
            </dd>
          </div>
        </dl>
        <a className="button button--text guides-method__feed" href="/guides/feed.xml">
          [ subscribe to the guide feed ] <ArrowMark />
        </a>
      </section>
    </PageFrame>
  );
}
