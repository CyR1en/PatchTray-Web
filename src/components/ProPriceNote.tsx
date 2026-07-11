import { siteConfig } from "../config";

/** Compact dual-price marker for tables and plan lines. */
export function ProPriceNote({ plan }: { plan?: "monthly" | "lifetime" }) {
  if (plan === "monthly") {
    return <em className="pro-price-note">[ {siteConfig.proMonthlyPrice} / month ]</em>;
  }

  if (plan === "lifetime") {
    return <em className="pro-price-note">[ {siteConfig.proLifetimePrice} lifetime ]</em>;
  }

  return (
    <em className="pro-price-note">
      <span>
        [ {siteConfig.proMonthlyPrice} / month ]
      </span>
      <span className="pro-price-note__sep" aria-hidden="true">
        ·
      </span>
      <span>
        [ {siteConfig.proLifetimePrice} lifetime ]
      </span>
    </em>
  );
}
