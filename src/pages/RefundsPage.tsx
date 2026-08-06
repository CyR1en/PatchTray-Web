import { DocPage, type DocSection } from "../components/layout/DocPage";
import { siteConfig } from "../config";
import { legalEffective } from "../lib/contentDates";

/** Update whenever the substance of this policy changes. */
const EFFECTIVE = legalEffective.refunds;

const sections: readonly DocSection[] = [
  {
    id: "policy",
    nav: "the policy",
    title: "the rule is different on each plan.",
    body: (
      <>
        <ul className="legal-rows">
          <li>
            <strong>monthly</strong>
            <span>
              A {siteConfig.proMonthlyPrice} charge is refundable only while its license key is unused. Once the
              key has been activated, no charge on that subscription can be refunded — not the first one, and not
              a later renewal.
            </span>
          </li>
          <li>
            <strong>lifetime</strong>
            <span>
              The {siteConfig.proLifetimePrice} purchase is refundable within <strong>7 days</strong> of the
              charge, whether or not the key has been used.
            </span>
          </li>
        </ul>
        <p>
          If you are on monthly and the key is already in use, cancelling is the thing to do instead. It stops the
          next charge and you keep Pro through the period you paid for — see <a href="#cancelling">below</a>.
        </p>
        <p>
          A charge made before this policy took effect — the date is at the top of this page — is covered by the
          previous policy of 14 days on either plan.
        </p>
        <p>
          Statutory rights come first. Where the law where you live gives you a longer or stronger cancellation
          right, that right applies instead of this policy.
        </p>
      </>
    ),
  },
  {
    id: "used",
    nav: "what counts as used",
    title: "activation is what spends a key.",
    body: (
      <>
        <p>
          A key is <strong>used</strong> once it has been activated on a device. That is the moment PatchTray runs
          as Pro on a machine, and it is recorded against the license.
        </p>
        <p>Two things follow from that, and both catch people out:</p>
        <ul>
          <li>
            deactivating a device afterwards frees the slot, but it does not make the key unused again — the
            activation still happened;
          </li>
          <li>
            key recovery activates the device that asked for it, so recovering a key is itself a use of it.
          </li>
        </ul>
        <p>
          You do not have to prove any of this. The licensing record shows whether a key was ever activated, and
          that record is what a refund request is checked against.
        </p>
      </>
    ),
  },
  {
    id: "cancelling",
    nav: "cancelling instead",
    title: "cancelling and refunding are different things.",
    body: (
      <>
        <p>
          Cancelling a monthly subscription stops future charges and leaves your Pro access in place until the
          period you already paid for runs out. A refund reverses a charge and revokes the license immediately.
        </p>
        <p>
          Because a used monthly key cannot be refunded, cancelling is the remedy for a subscription you no longer
          want — and cancelling before the period ends is what prevents the next charge rather than arguing about
          it afterwards. See the <a href="/terms">terms</a> for how renewal works.
        </p>
        <p>
          A lifetime purchase does not renew and has nothing to cancel. Within its 7 days it is a refund or
          nothing.
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
          an unused key,
          <br />
          or seven days.
        </>
      }
      lead="What makes a PatchTray Pro charge refundable on each plan, how to ask, what happens to your license afterwards, and why emailing works better than opening a payment dispute."
      effective={EFFECTIVE}
      sections={sections}
    />
  );
}
