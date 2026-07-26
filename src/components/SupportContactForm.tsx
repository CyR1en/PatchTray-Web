import { useEffect, useId, useRef, useState } from "react";
import { hasValue, siteConfig } from "../config";

/** Must match the `TOPICS` set in `api/support.js`. */
const TOPICS = [
  "license not received",
  "lost key or recovery",
  "activation or device limit",
  "billing, refund, or dispute",
  "download or install",
  "security or privacy",
  "something else",
] as const;

const MIN_MESSAGE_CHARS = 20;
const MAX_MESSAGE_CHARS = 5000;

/** Mirrors `KEY_SHAPED` in `api/support.js`; the server rejects these too. */
const KEY_SHAPED = /\b[A-Z0-9]{4,6}(?:-[A-Z0-9]{4,6}){3,}\b/i;

type Status = "idle" | "sending" | "sent" | "error";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Loads the Turnstile script once, on the only page that needs it. */
function useTurnstileScript(enabled: boolean) {
  const [ready, setReady] = useState(() => Boolean(window.turnstile));

  useEffect(() => {
    if (!enabled || ready) return;

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT}"]`);
    const script = existing ?? document.createElement("script");
    const onLoad = () => setReady(true);

    script.addEventListener("load", onLoad);
    if (!existing) {
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      document.head.append(script);
    }

    return () => script.removeEventListener("load", onLoad);
  }, [enabled, ready]);

  return ready;
}

const ERROR_COPY: Record<string, string> = {
  "rate limited": "That is a few messages in a short window. Give it an hour, or email us directly.",
  "key material":
    "That looks like a license key. Remove it and describe the problem instead — support never needs your key.",
  "verification failed": "The verification check did not pass. Reload the page and try once more.",
  unconfigured: "The form is not available right now. Please email us directly.",
};

export function SupportContactForm() {
  const siteKey = siteConfig.turnstileSiteKey;
  const enabled = hasValue(siteKey);
  const scriptReady = useTurnstileScript(enabled);

  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [token, setToken] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const fieldId = useId();

  useEffect(() => {
    if (!scriptReady || !widgetRef.current || widgetId.current) return;

    widgetId.current = window.turnstile?.render(widgetRef.current, {
      sitekey: siteKey,
      theme: "dark",
      callback: (value: string) => setToken(value),
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    });
  }, [scriptReady, siteKey]);

  // Without a site key there is no safe way to accept submissions, so the page
  // shows the mailto path on its own rather than a form that cannot send.
  if (!enabled) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const message = String(data.get("message") ?? "");

    if (KEY_SHAPED.test(message)) {
      setStatus("error");
      setError(ERROR_COPY["key material"]);
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const result = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          topic: String(data.get("topic") ?? ""),
          message,
          turnstileToken: token,
        }),
      });

      // An explicit `ok` from our own JSON is the only success signal. A bare
      // 200 is not enough: if this route were ever misrouted, the SPA rewrite
      // would answer with the HTML page and a "sent" that never sent.
      const payload = await result.json().catch(() => null);
      if (!result.ok || payload?.ok !== true) {
        throw new Error(typeof payload?.error === "string" ? payload.error : "failed");
      }

      setStatus("sent");
      form.reset();
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : "failed";
      setStatus("error");
      setError(ERROR_COPY[reason] ?? "That did not send. Try again, or email us directly.");
    } finally {
      // Turnstile tokens are single-use; the next attempt needs a fresh one.
      window.turnstile?.reset(widgetId.current);
      setToken("");
    }
  }

  if (status === "sent") {
    return (
      <div className="support-form__done" role="status">
        <p>
          <span className="state-square state-square--green" aria-hidden="true" /> message sent
        </p>
        <p>
          It will be read and answered by email. There is no guaranteed response time — if a few days pass, reply
          to your own message rather than sending a new one.
        </p>
      </div>
    );
  }

  return (
    <form className="support-form" onSubmit={handleSubmit} noValidate>
      <div className="support-form__field">
        <label htmlFor={`${fieldId}-email`}>your purchase email</label>
        <input
          id={`${fieldId}-email`}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="the address you used at checkout"
        />
      </div>

      <div className="support-form__field">
        <label htmlFor={`${fieldId}-topic`}>what is this about</label>
        <select id={`${fieldId}-topic`} name="topic" required defaultValue={TOPICS[0]}>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <div className="support-form__field">
        <label htmlFor={`${fieldId}-message`}>what happened</label>
        <textarea
          id={`${fieldId}-message`}
          name="message"
          required
          rows={7}
          minLength={MIN_MESSAGE_CHARS}
          maxLength={MAX_MESSAGE_CHARS}
          placeholder="What you were doing, what PatchTray reported, and anything you already tried."
          aria-describedby={`${fieldId}-warning`}
        />
        <p className="support-form__warning" id={`${fieldId}-warning`}>
          Do not paste a license key, recovery code, password, or card number. Messages containing key material are
          rejected rather than delivered.
        </p>
      </div>

      <div className="support-form__verify" ref={widgetRef} />

      {status === "error" ? (
        <p className="support-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="support-form__actions">
        <button className="button button--primary" type="submit" disabled={status === "sending" || !token}>
          {status === "sending" ? "[ sending… ]" : "[ send to support ]"}
        </button>
        <p>
          or email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> directly
        </p>
      </div>
    </form>
  );
}
