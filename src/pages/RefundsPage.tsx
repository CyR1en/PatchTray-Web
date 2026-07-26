import { DocPage, type DocSection } from "../components/layout/DocPage";
import { siteConfig } from "../config";

/** Update whenever the substance of this policy changes. */
const EFFECTIVE = "2026-07-25";

const sections: readonly DocSection[] = [
  {
    id: "policy",
    nav: "the policy",
    title: "fourteen days, on either plan.",
    body: (
      <>
        <p>
          If PatchTray Pro is not what you needed, ask for a refund within <strong>14 days</strong> of the charge
          and it will be refunded. That applies to both the {siteConfig.proMonthlyPrice} monthly subscription and
          the {siteConfig.proLifetimePrice} lifetime purchase.
        </p>
        <p>
          For a monthly subscription the window applies to each charge, so a renewal you did not intend to keep can
          be refunded within 14 days of that renewal.
        </p>
        <p>
          Statutory rights come first. Where the law where you live gives you a longer or stronger cancellation
          right, that right applies instead of this policy.
        </p>
      </>
    ),
  },
  {
    id: "request",
    nav: "how to ask",
    title: "email from the address you bought with.",
    body: (
      <>
        <p>
          Write to <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> from the email
          address you used at checkout. Include:
        </p>
        <ol>
          <li>which plan you bought — monthly or lifetime;</li>
          <li>roughly when you bought it;</li>
          <li>a sentence on what went wrong, if something did.</li>
        </ol>
        <div className="legal-note">
          <p>
            Do not send your license key, a recovery code, a password, or card details. The purchase email address
            is enough to find the order. Nobody at PatchTray will ask you for key material.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "after",
    nav: "after approval",
    title: "a refund ends the license it paid for.",
    body: (
      <>
        <p>
          When a refund is approved, the corresponding Pro license is revoked and every device activated on it
          loses Pro. This is automatic — it follows the refund itself, not a separate decision.
        </p>
        <p>
          PatchTray keeps working at the Free limits: 4 VST3 nodes and 1 preset. Nothing is uninstalled and your
          saved presets are not deleted, though presets beyond the Free limit cannot be loaded until you are on Pro
          again.
        </p>
        <p>Stripe returns the money to your original payment method on its own schedule, typically within days.</p>
      </>
    ),
  },
  {
    id: "cancelling",
    nav: "cancelling instead",
    title: "cancelling and refunding are different things.",
    body: (
      <p>
        Cancelling a monthly subscription stops future charges and leaves your Pro access in place until the period
        you already paid for runs out. A refund reverses a charge and revokes the license immediately. If you only
        want to stop paying, cancel — you keep what you paid for. See the{" "}
        <a href="/terms">terms</a> for how renewal works.
      </p>
    ),
  },
  {
    id: "disputes",
    nav: "payment disputes",
    title: "a dispute is slower and blunter than asking.",
    body: (
      <>
        <p>
          Opening a dispute or chargeback with your bank starts a process neither of us controls. While a dispute
          is open the license may be suspended, and if the dispute is resolved against the purchase the license is
          revoked.
        </p>
        <p>
          If a dispute was a mistake, or you resolve it with your bank, contact support — a suspended license can
          be restored once the payment record is settled, but a revoked one may need to be repurchased.
        </p>
        <p>
          Please email first. A refund request is usually resolved in less time than a dispute takes to open, and
          it does not put your license into a suspended state in the meantime.
        </p>
      </>
    ),
  },
  {
    id: "timing",
    nav: "response times",
    title: "no promised service level, but mail gets read.",
    body: (
      <p>
        PatchTray is a small operation and does not publish a guaranteed response time. Refund requests are worked
        through as they arrive. If you have not heard back in a few days, reply to your original message so it
        surfaces again rather than sending a new one.
      </p>
    ),
  },
  {
    id: "contact",
    nav: "contact",
    title: "where to send it.",
    body: (
      <div className="legal-contact">
        <p>
          refunds and billing · <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
        </p>
        <p>
          terms · <a href="/terms">product, license, and sale terms</a>
        </p>
        <p>
          privacy · <a href="/privacy">how data is handled</a>
        </p>
      </div>
    ),
  },
];

export function RefundsPage() {
  return (
    <DocPage
      page="refunds"
      label="patchtray / refunds and disputes"
      heading={
        <>
          fourteen days
          <br />
          to change your mind.
        </>
      }
      lead="How to ask for a refund on a PatchTray Pro purchase, what happens to your license afterwards, and why emailing works better than opening a payment dispute."
      effective={EFFECTIVE}
      sections={sections}
    />
  );
}
