import { hasValue, siteConfig } from "../config";

/**
 * Honest Pro checkout actions. Each option stays disabled until its URL is set.
 */
type ProPlan = "monthly" | "lifetime";

export function ProCheckoutActions({ plan }: { plan?: ProPlan }) {
  const monthlyLive = hasValue(siteConfig.proMonthlyCheckoutUrl);
  const lifetimeLive = hasValue(siteConfig.proLifetimeCheckoutUrl);
  const plans: ProPlan[] = plan ? [plan] : ["monthly", "lifetime"];

  return (
    <div className={`pro-checkout${plan ? " pro-checkout--single" : ""}`} aria-label="Pro license options">
      {plans.map((option) => {
        const monthly = option === "monthly";
        const live = monthly ? monthlyLive : lifetimeLive;
        const url = monthly ? siteConfig.proMonthlyCheckoutUrl : siteConfig.proLifetimeCheckoutUrl;
        return (
          <div className="pro-checkout__option" key={option}>
            <div className="pro-checkout__meta">
              <strong>{option}</strong>
              <span>{monthly ? `${siteConfig.proMonthlyPrice} / month` : `${siteConfig.proLifetimePrice} one-time`}</span>
            </div>
            {live ? (
              <a className="pro-checkout__action" href={url}>
                {monthly ? "[ subscribe ]" : "[ buy lifetime ]"}
              </a>
            ) : (
              <span className="pro-checkout__action pro-checkout__action--pending" aria-disabled="true">
                [ checkout pending ]
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
