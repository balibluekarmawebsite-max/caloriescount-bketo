import { useState } from "react";
import { normPhone, waUrl, buildSummary } from "../lib/calc.js";

export default function WhatsAppCard({ ids, goalKey, label, phone, onPhone }) {
  const [copied, setCopied] = useState("");
  const hasMeal = ids.length > 0;
  const norm = normPhone(phone);
  // Only flag an error once the user has typed a real number beyond the
  // country prefix — a lone "+62" shouldn't look like a mistake.
  const subscriberDigits = phone.replace(/\D/g, "").replace(/^62/, "");
  const invalid = norm === null && subscriberDigits.length > 0;
  const summary = buildSummary({ ids, goalKey, label });
  const url = hasMeal ? waUrl(phone, summary) : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied("Summary copied to clipboard");
    } catch {
      setCopied("Press and hold to copy, or select the text");
    }
    setTimeout(() => setCopied(""), 2600);
  };

  return (
    <section className="card glass">
      <div className="card-head">
        <h2>Send to WhatsApp</h2>
        <span className="step">Step 3</span>
      </div>
      <p className="muted" style={{ marginBottom: 10 }}>
        WhatsApp opens with your summary ready — just tap send to save it.
        The number stays on your device.
      </p>

      <div className="wa-field">
        <label htmlFor="wa-phone">WhatsApp number</label>
        <input
          id="wa-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          placeholder="+62 812 3456 7890"
          onChange={(e) => onPhone(e.target.value)}
        />
        <span className={`wa-hint${invalid ? " err" : ""}`}>
          {invalid
            ? "Hmm, that number looks off. Try 0812…, 812…, or +44 7700 900123."
            : "Indonesian numbers can start 0 or 812. Add + for other countries."}
        </span>
      </div>

      <div className="wa-actions">
        <a
          className="btn btn-wa"
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!url}
          onClick={(e) => {
            if (!url) e.preventDefault();
          }}
        >
          {norm ? `Open WhatsApp to +${norm}` : "Open WhatsApp with my summary"}
        </a>
        <button className="btn btn-ghost" onClick={copy} disabled={!hasMeal}>
          Copy summary instead
        </button>
        <div className="copied">{copied}</div>
      </div>
    </section>
  );
}
