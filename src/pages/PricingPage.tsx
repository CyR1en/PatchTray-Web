import type { ReactNode } from "react";
import { hasValue, siteConfig } from "../config";
import { ArrowMark, WindowsMark } from "../components/marks";
import { SectionRule } from "../components/SectionRule";
import { PageFrame } from "../components/layout/PageFrame";
import { analyticsEvents } from "../lib/analytics";

type ProPlan = "monthly" | "lifetime";

function checkoutUrl(plan: ProPlan): string {
  return plan === "monthly" ? siteConfig.proMonthlyCheckoutUrl : siteConfig.proLifetimeCheckoutUrl;
}

/**
 * The buy control. It opens the published Stripe Payment Link for its plan and
 * nothing else — no cart, no account, no state held on this site.
 *
 * Same honesty rule as `ProCheckoutActions`: when a payment link is not
 * configured the control renders as a disabled state rather than a dead link,
 * so an unpublished storefront can never look purchasable.
 */
function BuyLicense({
  plan,
  variant,
  children,
}: {
  plan: ProPlan;
  variant: "primary" | "line";
  children: ReactNode;
}) {
  const url = checkoutUrl(plan);

  if (!hasValue(url)) {
    return (
      <span className="button pricing-cta pricing-cta--pending" aria-disabled="true">
        [ checkout pending ]
      </span>
    );
  }

  return (
    <a
      className={`button button--${variant} pricing-cta`}
      href={url}
      data-analytics-event={analyticsEvents.checkoutStart}
      data-analytics-detail={`pricing_${plan}`}
    >
      {children}
    </a>
  );
}

type ComparisonRow = {
  label: string;
  free: string;
  monthly: string;
  lifetime: string;
};

/**
 * Every published limit in one table. Values are the ones the terms already
 * state — device counts, offline leases, and the refund window — so the page a
 * buyer reads before paying cannot disagree with the agreement they accept.
 */
const comparisonRows: readonly ComparisonRow[] = [
  { label: "vst3 nodes", free: "up to 4", monthly: "unlimited", lifetime: "unlimited" },
  { label: "saved presets", free: "1 preset", monthly: "unlimited", lifetime: "unlimited" },
  { label: "active devices", free: "—", monthly: "up to 2", lifetime: "up to 3" },
  { label: "offline lease", free: "—", monthly: "7 days", lifetime: "30 days" },
  { label: "license key", free: "not required", monthly: "emailed at checkout", lifetime: "emailed at checkout" },
  {
    label: "billing",
    free: "none",
    monthly: `${siteConfig.proMonthlyPrice} each month`,
    lifetime: "one charge",
  },
  { label: "refund window", free: "—", monthly: "14 days per charge", lifetime: "14 days" },
];

export function PricingPage() {
  return (
    <PageFrame current="pricing">
      <section className="page-hero content-width page-hero--pricing">
        <p className="terminal-label">patchtray / pricing</p>
        <h1>
          two limits.
          <br />
          one price to lift them.
        </h1>
        <p className="page-lead">
          PatchTray is free to run, and stays free at 4 VST3 nodes and 1 preset. Pro removes both limits — pay
          monthly, or buy the license once.
        </p>
        <ul className="pricing-flags">
          <li>
            <span className="state-square state-square--green" aria-hidden="true" />
            14-day refund
          </li>
          <li>secure checkout by stripe</li>
          <li>no account on this site</li>
        </ul>
      </section>

      <section id="plans" className="pricing-plans content-width" aria-labelledby="pricing-plans-title">
        <SectionRule>license options</SectionRule>
        <h2 id="pricing-plans-title">choose the billing, not a feature list.</h2>
        <p className="pricing-plans__lead">
          Monthly and lifetime unlock exactly the same audio work. They differ in how you pay and how many
          machines a single key covers.
        </p>

        <div className="pricing-grid">
          <article className="pricing-card" aria-labelledby="plan-free">
            <header className="pricing-card__head">
              <span className="pricing-card__kicker" id="plan-free">
                free
              </span>
            </header>
            <p className="pricing-card__price">
              <strong>free</strong>
            </p>
            <p className="pricing-card__term">no billing · no license key</p>
            <ul className="pricing-card__lines">
              <li>
                <i aria-hidden="true">✓</i>
                <span>up to 4 VST3 nodes in a graph</span>
              </li>
              <li>
                <i aria-hidden="true">✓</i>
                <span>1 saved preset</span>
              </li>
              <li>
                <i aria-hidden="true">✓</i>
                <span>the full visual routing canvas</span>
              </li>
              <li>
                <i aria-hidden="true">✓</i>
                <span>runs from the system tray</span>
              </li>
            </ul>
            <a
              className="button button--line pricing-cta"
              href="/download"
              data-analytics-event={analyticsEvents.downloadPage}
              data-analytics-detail="pricing_free"
            >
              <WindowsMark /> [ download free ]
            </a>
            <p className="pricing-card__foot">install and build a chain before you decide.</p>
          </article>

          <article className="pricing-card pricing-card--pro" aria-labelledby="plan-monthly">
            <header className="pricing-card__head">
              <span className="pricing-card__kicker" id="plan-monthly">
                <i className="state-square state-square--green" aria-hidden="true" />
                pro monthly
              </span>
            </header>
            <p className="pricing-card__price">
              <strong>{siteConfig.proMonthlyPrice}</strong>
              <span>/ month</span>
            </p>
            <p className="pricing-card__term">renews each period · cancel anytime</p>
            <ul className="pricing-card__lines">
              <li>
                <i aria-hidden="true">✓</i>
                <span>unlimited VST3 nodes</span>
              </li>
              <li>
                <i aria-hidden="true">✓</i>
                <span>unlimited saved presets</span>
              </li>
              <li>
                <i aria-hidden="true">✓</i>
                <span>up to 2 active devices</span>
              </li>
              <li>
                <i aria-hidden="true">✓</i>
                <span>7-day offline lease</span>
              </li>
            </ul>
            <BuyLicense plan="monthly" variant="line">
              [ subscribe ]
            </BuyLicense>
            <p className="pricing-card__foot">cancel and you keep Pro until the period ends.</p>
          </article>

          <article className="pricing-card pricing-card--pro pricing-card--featured" aria-labelledby="plan-lifetime">
            <header className="pricing-card__head">
              <span className="pricing-card__kicker" id="plan-lifetime">
                <i className="state-square state-square--green" aria-hidden="true" />
                pro lifetime
              </span>
              <span className="pricing-card__tag">[ best value ]</span>
            </header>
            <p className="pricing-card__price">
              <strong>{siteConfig.proLifetimePrice}</strong>
              <span>one-time</span>
            </p>
            <p className="pricing-card__term">a single charge · never renews</p>
            <ul className="pricing-card__lines">
              <li>
                <i aria-hidden="true">✓</i>
                <span>unlimited VST3 nodes</span>
              </li>
              <li>
                <i aria-hidden="true">✓</i>
                <span>unlimited saved presets</span>
              </li>
              <li>
                <i aria-hidden="true">✓</i>
                <span>up to 3 active devices</span>
              </li>
              <li>
                <i aria-hidden="true">✓</i>
                <span>30-day offline lease</span>
              </li>
            </ul>
            <BuyLicense plan="lifetime" variant="primary">
              [ buy lifetime — {siteConfig.proLifetimePrice} ]
            </BuyLicense>
            <p className="pricing-card__foot">
              a later price change never re-charges a license you already own.
            </p>
          </article>
        </div>
      </section>

      <section id="compare" className="pricing-compare content-width" aria-labelledby="pricing-compare-title">
        <SectionRule>side by side</SectionRule>
        <h2 id="pricing-compare-title">the limits are stated plainly.</h2>
        <div className="pricing-table" role="table" aria-label="PatchTray Free, Pro monthly, and Pro lifetime limits">
          <div className="pricing-table__head" role="row">
            <span role="columnheader">compare</span>
            <span role="columnheader">free</span>
            <span role="columnheader">pro monthly</span>
            <span role="columnheader" className="pricing-table__pro">
              pro lifetime
            </span>
          </div>
          <div className="pricing-table__rows" role="rowgroup">
            {comparisonRows.map((row) => (
              <div role="row" key={row.label}>
                <span role="rowheader">{row.label}</span>
                <span role="cell">{row.free}</span>
                <span role="cell">{row.monthly}</span>
                <span role="cell" className="pricing-table__pro">
                  {row.lifetime}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="pricing-compare__note">
          Prices are charged in the currency Stripe presents at checkout and may exclude tax that Stripe
          calculates and adds. Full detail lives in the <a href="/terms#pricing">terms</a>.
        </p>
      </section>

      <section className="pricing-flow content-width" aria-labelledby="pricing-flow-title">
        <SectionRule>how buying works</SectionRule>
        <h2 id="pricing-flow-title">checkout, key, activation.</h2>
        <ol className="checkout-steps">
          <li>
            <strong>pay through stripe</strong>
            <span>
              The buy button opens a Stripe Payment Link. Card details are entered on Stripe&rsquo;s checkout,
              never on this site.
            </span>
          </li>
          <li>
            <strong>the key is emailed</strong>
            <span>
              The license key goes to the address you enter at checkout, once the payment is confirmed. There is
              no account to create here.
            </span>
          </li>
          <li>
            <strong>activate in patchtray</strong>
            <span>
              Enter the key in the app and the Free limits lift on that device. Deactivate a device inside
              PatchTray to free its slot for another machine.
            </span>
          </li>
        </ol>
      </section>

      <section className="pricing-answers content-width" aria-labelledby="pricing-answers-title">
        <SectionRule>before you buy</SectionRule>
        <h2 id="pricing-answers-title">the questions that come up first.</h2>
        <div className="pricing-answers__grid">
          <div>
            <h3>what does &ldquo;lifetime&rdquo; mean?</h3>
            <p>
              One charge for the life of PatchTray as a product. It is not a promise that the software is
              published or supported forever, and it never renews.
            </p>
            <a className="button button--text" href="/terms#pricing">
              [ read the sale terms ] <ArrowMark />
            </a>
          </div>
          <div>
            <h3>can I get a refund?</h3>
            <p>
              Yes — within 14 days of the charge, on either plan. A refund revokes the license it paid for, and
              PatchTray drops back to the Free limits.
            </p>
            <a className="button button--text" href="/refunds">
              [ read the refund policy ] <ArrowMark />
            </a>
          </div>
          <div>
            <h3>does Pro need to be online?</h3>
            <p>
              Only to validate. After activation a monthly license runs offline for 7 days and a lifetime license
              for 30, renewing the lease each time it validates.
            </p>
            <a className="button button--text" href="/faq#offline">
              [ see the offline answer ] <ArrowMark />
            </a>
          </div>
          <div>
            <h3>what happens to my presets?</h3>
            <p>
              Nothing is deleted if a license ends. Presets stay on disk, though the ones beyond the Free limit
              cannot be loaded until you are on Pro again.
            </p>
            <a className="button button--text" href="/support">
              [ ask support ] <ArrowMark />
            </a>
          </div>
        </div>
      </section>

      <section className="pricing-close content-width" aria-labelledby="pricing-close-title">
        <SectionRule>ready when you are</SectionRule>
        <h2 id="pricing-close-title">buy once.</h2>
        <p>
          {siteConfig.proLifetimePrice} for unlimited nodes and presets on up to three machines, with 14 days to
          change your mind.
        </p>
        <div className="pricing-close__actions">
          <BuyLicense plan="lifetime" variant="primary">
            [ buy lifetime — {siteConfig.proLifetimePrice} ]
          </BuyLicense>
          <a
            className="button button--text"
            href="/download"
            data-analytics-event={analyticsEvents.downloadPage}
            data-analytics-detail="pricing_close"
          >
            [ start with free instead ] <ArrowMark />
          </a>
        </div>
      </section>
    </PageFrame>
  );
}
