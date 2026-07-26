import { DocPage, type DocSection } from "../components/layout/DocPage";
import { SupportContactForm } from "../components/SupportContactForm";
import { siteConfig } from "../config";

const sections: readonly DocSection[] = [
  {
    id: "start",
    nav: "before you write",
    title: "your purchase email and a sentence are enough.",
    body: (
      <>
        <p>
          Support looks up a license by the email address used at checkout. Tell us what happened and roughly when
          you bought it, and that is enough to start. Screenshots help for anything visual.
        </p>
        <div className="legal-note">
          <p>
            <strong>Never send a license key, a recovery code, a password, or card details.</strong> Support does
            not need them and will never ask for them. A message asking you for any of those did not come from
            PatchTray.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "no-license",
    nav: "paid, no license",
    title: "paid, but the license email has not arrived.",
    body: (
      <>
        <p>
          Payment and delivery are separate steps, and some payment methods settle a while after checkout
          finishes. Before writing in, check the two things that explain most missing emails:
        </p>
        <ol>
          <li>your spam, junk, and promotions folders;</li>
          <li>
            the address you actually typed at checkout — a typo there sends the license somewhere you cannot read.
          </li>
        </ol>
        <p>
          If it still has not arrived after a few hours, write in with the address you meant to use and we will
          find the order.
        </p>
      </>
    ),
  },
  {
    id: "recovery",
    nav: "lost key",
    title: "key recovery happens inside PatchTray.",
    body: (
      <>
        <p>
          If you have lost your key, start recovery from within PatchTray on the device you want to use. Recovery
          issues a new key, signs every device out, and activates the device that asked for it.
        </p>
        <p>
          This is deliberately not a web page. Recovery is bound to a real device, so there is nothing to fill in
          here and no way for someone who has your email address alone to take a license from you. Support cannot
          email you an existing key.
        </p>
      </>
    ),
  },
  {
    id: "devices",
    nav: "devices",
    title: "activation, deactivation, and device limits.",
    body: (
      <>
        <p>
          A monthly license runs on up to 2 devices at a time; lifetime runs on up to 3. Deactivate a device inside
          PatchTray to free its slot for another machine.
        </p>
        <p>
          If a device is gone — reinstalled, sold, or broken — and you cannot deactivate it, use key recovery to
          clear every activation at once. Write in if recovery does not resolve it.
        </p>
      </>
    ),
  },
  {
    id: "billing",
    nav: "billing",
    title: "subscriptions, renewals, refunds, and disputes.",
    body: (
      <>
        <p>
          Cancelling stops future charges and leaves Pro active through the period you already paid for. Refund
          eligibility, what a refund does to your license, and why emailing beats opening a payment dispute are all
          covered in the <a href="/refunds">refund policy</a>.
        </p>
        <p>
          For anything about billing, include the purchase email address. Do not include card numbers — support
          cannot use them and should not receive them.
        </p>
      </>
    ),
  },
  {
    id: "install",
    nav: "download and install",
    title: "download and installation problems.",
    body: (
      <>
        <p>
          Start from the <a href="/download">download page</a> for the current build and requirements, and the{" "}
          <a href="/guide">guide</a> for first-run setup. PatchTray needs Windows and a working ASIO driver.
        </p>
        <p>For anything audio-related, these four details resolve most reports:</p>
        <ul>
          <li>your Windows version;</li>
          <li>the ASIO driver and device you are using;</li>
          <li>the PatchTray version shown in the app;</li>
          <li>exactly what PatchTray reported — the status text or error, word for word.</li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    nav: "security and privacy",
    title: "security reports and privacy requests.",
    body: (
      <>
        <p>
          Report a suspected vulnerability by email rather than in public, and give enough detail to reproduce it.
          Reports are read and acknowledged; PatchTray does not currently run a paid bounty programme.
        </p>
        <p>
          For access, export, or deletion of your data, write from the address you bought with and say what you
          want. The <a href="/privacy">privacy policy</a> covers what is held and how long it is kept.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    nav: "write to us",
    title: "send it here.",
    body: (
      <>
        <p>
          Messages go to the support inbox and are answered by email, so use an address you can read replies at.
          Everything above applies — the purchase email and a description are enough, and key material is not.
        </p>
        <SupportContactForm />
        <div className="legal-contact">
          <p>
            support · <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
          </p>
          <p>
            refunds · <a href="/refunds">refund and dispute policy</a>
          </p>
          <p>
            privacy · <a href="/privacy">what is stored, and for how long</a>
          </p>
        </div>
      </>
    ),
  },
];

export function SupportPage() {
  return (
    <DocPage
      page="support"
      label="patchtray / support"
      heading={
        <>
          something wrong?
          <br />
          start here.
        </>
      }
      lead={`Licenses, activation, downloads, and billing — the common paths are below. If none of them fit, write to ${siteConfig.supportEmail}.`}
      sections={sections}
    />
  );
}
