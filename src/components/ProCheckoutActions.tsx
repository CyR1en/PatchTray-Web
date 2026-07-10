import { hasValue, siteConfig } from "../config";

/**
 * Honest Pro checkout actions. Each option stays disabled until its URL is set.
 */
export function ProCheckoutActions() {
  const monthlyLive = hasValue(siteConfig.proMonthlyCheckoutUrl);
  const lifetimeLive = hasValue(siteConfig.proLifetimeCheckoutUrl);

  return (
    <div className="pro-checkout" aria-label="Pro license options">
      <div className="pro-checkout__option">
        <div className="pro-checkout__meta">
          <strong>monthly</strong>
          <span>{siteConfig.proMonthlyPrice} / month</span>
        </div>
        {monthlyLive ? (
          <a className="pro-checkout__action" href={siteConfig.proMonthlyCheckoutUrl}>
            [ subscribe ]
          </a>
        ) : (
          <span className="pro-checkout__action pro-checkout__action--pending" aria-disabled="true">
            [ checkout pending ]
          </span>
        )}
      </div>
      <div className="pro-checkout__option">
        <div className="pro-checkout__meta">
          <strong>lifetime</strong>
          <span>{siteConfig.proLifetimePrice} one-time</span>
        </div>
        {lifetimeLive ? (
          <a className="pro-checkout__action" href={siteConfig.proLifetimeCheckoutUrl}>
            [ buy lifetime ]
          </a>
        ) : (
          <span className="pro-checkout__action pro-checkout__action--pending" aria-disabled="true">
            [ checkout pending ]
          </span>
        )}
      </div>
    </div>
  );
}
