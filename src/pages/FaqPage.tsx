import { PageFrame } from "../components/layout/PageFrame";
import { ArrowMark } from "../components/marks";
import { SectionRule } from "../components/SectionRule";
import { faqEntries, faqReview } from "../lib/faqs";

const categories = [
  ["product", "product"],
  ["routing", "signal routing"],
  ["plugins", "plug-ins"],
  ["licensing", "free + pro"],
] as const;

export function FaqPage() {
  return (
    <PageFrame current="faq">
      <section className="faq-hero content-width">
        <div>
          <p className="terminal-label">patchtray / answers</p>
          <h1>the signal path, explained.</h1>
          <p className="page-lead">
            Direct answers about PatchTray, ASIO routing, VST3 effects, Voicemeeter, latency, and licensing.
            Start with the question closest to your setup.
          </p>
          <div className="faq-hero__meta" aria-label="FAQ coverage">
            <span className="faq-flag faq-flag--primary">faq / {faqEntries.length} answers</span>
            <span className="faq-flag"><i className="state-square state-square--green" aria-hidden="true" /> maintained</span>
            <span className="faq-flag">reviewed / PatchTray {faqReview.productVersion}</span>
            <span className="faq-flag">windows</span>
            <span className="faq-flag">asio</span>
            <span className="faq-flag">vst3</span>
          </div>
        </div>
      </section>

      <nav className="faq-jump content-width" aria-label="FAQ categories">
        <span>jump to</span>
        {categories.map(([id, label]) => <a key={id} href={`#${id}`}>[ {label} ]</a>)}
      </nav>

      <div className="faq-console content-width">
        <aside className="faq-console__rail" aria-label="Answer index">
          <p>question register</p>
          <span>{String(faqEntries.length).padStart(2, "0")} entries</span>
          <span>plain-language</span>
          <span>reviewed by / PatchTray</span>
          <time dateTime={faqReview.date}>last reviewed / {formatReviewDate(faqReview.date)}</time>
        </aside>

        <div className="faq-groups">
          {categories.map(([category, label], categoryIndex) => {
            const entries = faqEntries.filter((entry) => entry.category === category);
            return (
              <section id={category} className="faq-group" key={category} aria-labelledby={`${category}-title`}>
                <SectionRule>{String(categoryIndex + 1).padStart(2, "0")} / {label}</SectionRule>
                <h2 id={`${category}-title`}>{label}</h2>
                <div className="faq-list">
                  {entries.map((entry, entryIndex) => (
                    <details id={entry.id} key={entry.id}>
                      <summary>
                        <span>{String(entryIndex + 1).padStart(2, "0")}</span>
                        <h3>{entry.question}</h3>
                        <i aria-hidden="true" />
                      </summary>
                      <div className="faq-answer">
                        <p>{entry.answer}</p>
                        {entry.links?.map((link) => (
                          <a key={link.href} href={link.href}>
                            [ {link.label} ] <ArrowMark />
                          </a>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <section className="faq-close content-width" aria-labelledby="faq-close-title">
        <SectionRule>unresolved signal</SectionRule>
        <h2 id="faq-close-title">Still hearing something wrong?</h2>
        <p>Send the exact status text, your ASIO driver, Windows version, and PatchTray version.</p>
        <a className="button button--primary" href="/support">[ open support ] <ArrowMark /></a>
      </section>
    </PageFrame>
  );
}

function formatReviewDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
