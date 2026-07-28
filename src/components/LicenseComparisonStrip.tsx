import { useEffect, useRef, useState } from "react";
import { ProCheckoutActions } from "./ProCheckoutActions";
import { ProPriceNote } from "./ProPriceNote";
import { SectionRule } from "./SectionRule";
import { analyticsEvents } from "../lib/analytics";
import { siteConfig } from "../config";

type BillingPlan = "monthly" | "lifetime";

export function LicenseComparisonStrip() {
  const [billingPlan, setBillingPlan] = useState<BillingPlan>("monthly");
  const [hasArrived, setHasArrived] = useState(false);
  const [motionRun, setMotionRun] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setHasArrived(true);
      setMotionRun(1);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setHasArrived(true);
        setMotionRun(1);
        observer.unobserve(entry.target);
      },
      { threshold: 0.6 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const selectBillingPlan = (plan: BillingPlan) => {
    if (plan === billingPlan) return;
    setBillingPlan(plan);
    if (hasArrived) setMotionRun((run) => run + 1);
  };

  return (
    <section className="license-strip content-width" ref={sectionRef} aria-labelledby="license-strip-title">
      <SectionRule>start free</SectionRule>
      <div className="license-strip__head">
        <h2 id="license-strip-title">start with a small chain. expand when you need more.</h2>
        <p>
          Free includes 4 VST3 nodes and 1 preset. Pro unlocks unlimited nodes and presets with monthly or
          lifetime options.
        </p>
      </div>

      <div className={`license-strip__table${hasArrived ? " is-arrived is-booting" : ""}`} role="table" aria-label="PatchTray Free and Pro features">
        <div className="license-strip__plans" role="row">
          <div className="license-strip__label" role="columnheader">
            <span>compare</span>
          </div>
          <div className="license-strip__plan license-strip__plan--free" role="columnheader">
            <span className="license-strip__kicker">free</span>
            <strong className="license-strip__price">free</strong>
            <span className="license-strip__term">no billing required</span>
          </div>
          <div className="license-strip__plan license-strip__plan--pro" role="columnheader">
            <span className="license-strip__kicker">
              <i className="state-square state-square--green" />pro
              <span className="license-strip__tag">[ recommended ]</span>
            </span>
            <div className={`license-strip__pro-readout${hasArrived ? " is-animated" : ""}`} key={motionRun}>
              <span className="license-strip__status"><ProPriceNote plan={billingPlan} /></span>
            </div>
            <div className="license-strip__billing" role="group" aria-label="pro billing period">
              <span className="license-strip__billing-label" aria-hidden="true">billing</span>
              <button type="button" aria-pressed={billingPlan === "monthly"} onClick={() => selectBillingPlan("monthly")}>monthly</button>
              <button type="button" aria-pressed={billingPlan === "lifetime"} onClick={() => selectBillingPlan("lifetime")}>lifetime</button>
            </div>
            <span className="visually-hidden" role="status">
              {billingPlan === "lifetime"
                ? `lifetime selected: ${siteConfig.proLifetimePrice} one-time, up to 3 devices`
                : `monthly selected: ${siteConfig.proMonthlyPrice} per month, up to 2 devices`}
            </span>
          </div>
        </div>
        <div className="license-strip__rows" role="rowgroup">
          <div role="row"><span role="rowheader">vst3 nodes</span><span role="cell">up to 4</span><span role="cell">unlimited nodes</span></div>
          <div role="row"><span role="rowheader">saved presets</span><span role="cell">1 preset</span><span role="cell">unlimited presets</span></div>
          <div role="row"><span role="rowheader">active devices</span><span role="cell">—</span><span role="cell">{billingPlan === "lifetime" ? "up to 3 devices" : "up to 2 devices"}</span></div>
          <div role="row"><span role="rowheader">license key</span><span role="cell">not required</span><span role="cell">emailed at checkout</span></div>
        </div>
        <div className="license-strip__foot" role="row">
          <div role="cell"><span>get started</span></div>
          <div role="cell">
            <a
              className="license-strip__free-cta"
              href="/download"
              data-analytics-event={analyticsEvents.downloadPage}
              data-analytics-detail="home_license"
            >
              [ download free ]
            </a>
          </div>
          <div role="cell"><ProCheckoutActions plan={billingPlan} /></div>
        </div>
      </div>
    </section>
  );
}
