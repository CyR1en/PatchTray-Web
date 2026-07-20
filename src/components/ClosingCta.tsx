import { siteConfig } from "../config";
import { ArrowMark, WindowsMark } from "./marks";
import { SectionRule } from "./SectionRule";

export function ClosingCta() {
  return (
    <section className="closing-cta content-width" aria-labelledby="closing-cta-title">
      <SectionRule>ready when you are</SectionRule>
      <h2 id="closing-cta-title">plug in.</h2>
      <p>
        PatchTray is in {siteConfig.releaseState}. Take the plugins you already own and put them on a live
        route.
      </p>
      <div className="closing-cta__actions">
        <a className="button button--primary" href="/download">
          <WindowsMark /> [ download for windows ]
        </a>
        <a className="button button--text" href="/guide">
          [ read the guide ] <ArrowMark />
        </a>
      </div>
    </section>
  );
}
