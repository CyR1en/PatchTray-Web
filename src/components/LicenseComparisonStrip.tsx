import { useEffect, useRef, useState } from "react";
import { ProCheckoutActions } from "./ProCheckoutActions";
import { ProPriceNote } from "./ProPriceNote";
import { SectionRule } from "./SectionRule";

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
      <SectionRule>start where you are</SectionRule>
      <div className="license-strip__head">
        <h2 id="license-strip-title">free to route. pro to keep building.</h2>
        <p>Start with a useful free signal path, then unlock room as your graph grows.</p>
      </div>

      <div className="license-strip__scroll" tabIndex={0} aria-label="PatchTray Free and Pro comparison">
        <div className={`license-strip__table${hasArrived ? " is-arrived is-booting" : ""}`} role="table" aria-label="PatchTray Free and Pro features">
          <div className="license-strip__plans" role="row">
            <div className="license-strip__corner" role="columnheader">
              <span>license / comparison</span>
              <strong>choose<br />your path</strong>
            </div>
            <div className="license-strip__plan license-strip__plan--free" role="columnheader">
              <span className="license-strip__kicker">free</span>
              <strong className="license-strip__price">free</strong>
              <span className="license-strip__term">no billing required</span>
            </div>
            <div className="license-strip__plan license-strip__plan--pro" role="columnheader">
              <div className={`license-strip__pro-readout${hasArrived ? " is-animated" : ""}`} key={motionRun}>
                <span className="license-strip__kicker"><i className="state-square state-square--green" />pro</span>
                <span className="license-strip__status"><ProPriceNote plan={billingPlan} /></span>
              </div>
              <div className="license-strip__billing" aria-label="Choose Pro billing">
                <button type="button" aria-pressed={billingPlan === "monthly"} onClick={() => selectBillingPlan("monthly")}>monthly</button>
                <button type="button" aria-pressed={billingPlan === "lifetime"} onClick={() => selectBillingPlan("lifetime")}>lifetime</button>
              </div>
            </div>
          </div>
          <div className="license-strip__rows" role="rowgroup">
            <div role="row"><span role="rowheader">VST3 nodes per graph</span><span role="cell">up to 2</span><span role="cell">unlimited nodes</span></div>
            <div role="row"><span role="rowheader">presets</span><span role="cell">1 preset</span><span role="cell">unlimited presets</span></div>
            <div role="row"><span role="rowheader">lifetime device use</span><span role="cell">—</span><span role="cell">{billingPlan === "lifetime" ? "up to 3 devices" : "available with lifetime"}</span></div>
          </div>
          <div className="license-strip__foot" role="row">
            <div role="cell"><span>windows VST3 host</span></div>
            <div role="cell"><span>[ free included ]</span></div>
            <div role="cell"><ProCheckoutActions plan={billingPlan} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
