import { useState } from "react";
import { BKETO } from "../data/menu.js";
import {
  normPhone,
  waUrl,
  waUrlTo,
  buildSummary,
  buildReservation,
  validEmail,
} from "../lib/calc.js";

const TABS = [
  { key: "reserve", label: "Reserve" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
];

export default function WhatsAppCard({ ids, goalKey, label, phone, onPhone }) {
  const [tab, setTab] = useState("reserve");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState("");
  const [emailState, setEmailState] = useState("idle"); // idle|sending|sent|error
  const [emailErr, setEmailErr] = useState("");
  const hasMeal = ids.length > 0;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("Copied to clipboard");
    } catch {
      setCopied("Press and hold to copy the text");
    }
    setTimeout(() => setCopied(""), 2600);
  };

  const sendEmail = async () => {
    if (!hasMeal || !validEmail(email)) return;
    setEmailState("sending");
    try {
      const endpoint = new URL("api/send-order.php", window.location.href).toString();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email.trim(),
          label,
          summary: buildSummary({ ids, goalKey, label }).replace(/\*/g, ""),
        }),
      });
      const j = await res.json().catch(() => ({ ok: false }));
      if (res.ok && j.ok) setEmailState("sent");
      else {
        setEmailState("error");
        setEmailErr(j.error || "Could not send");
      }
    } catch {
      setEmailState("error");
      setEmailErr("Network error — please try again");
    }
  };

  // --- Reserve (to BKETO) ---
  const reservationMsg = buildReservation({ ids, goalKey, label, restaurant: BKETO.name });
  const reserveUrl = hasMeal ? waUrlTo(BKETO.whatsapp, reservationMsg) : null;

  // --- WhatsApp a copy (to guest) ---
  const norm = normPhone(phone);
  const subscriberDigits = phone.replace(/\D/g, "").replace(/^62/, "");
  const phoneInvalid = norm === null && subscriberDigits.length > 0;
  const selfSummary = buildSummary({ ids, goalKey, label });
  const selfUrl = hasMeal ? waUrl(phone, selfSummary) : null;

  // --- Email a copy ---
  const emailInvalid = email.length > 0 && !validEmail(email);
  const canEmail = hasMeal && validEmail(email) && emailState !== "sending";

  return (
    <section className="card glass">
      <div className="card-head">
        <h2>Save or send your order</h2>
        <span className="step">Step 3</span>
      </div>

      <div className="seg" role="tablist" aria-label="What to do with your order">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`seg-btn${tab === t.key ? " active" : ""}`}
            onClick={() => {
              setTab(t.key);
              setCopied("");
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!hasMeal && (
        <p className="muted" style={{ marginTop: 14 }}>
          Add a few items to your meal first, then reserve or save it here.
        </p>
      )}

      {/* ---------- Reserve at BKETO ---------- */}
      {tab === "reserve" && (
        <div className="tabpane">
          <p className="muted">
            Send your order straight to <b>{BKETO.name}</b> on WhatsApp to request a
            reservation. They’ll reply to confirm.
          </p>
          <div className="dest-chip">
            <span className="dot-wa" />
            {BKETO.name} · {BKETO.whatsappDisplay}
          </div>
          <div className="wa-actions">
            <a
              className="btn btn-wa"
              href={reserveUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!reserveUrl}
              onClick={(e) => {
                if (!reserveUrl) e.preventDefault();
              }}
            >
              Reserve on WhatsApp
            </a>
            <button className="btn btn-ghost" onClick={() => copy(reservationMsg)} disabled={!hasMeal}>
              Copy reservation text
            </button>
            <div className="copied">{copied}</div>
          </div>
        </div>
      )}

      {/* ---------- WhatsApp a copy to the guest ---------- */}
      {tab === "whatsapp" && (
        <div className="tabpane">
          <p className="muted">
            Send the order summary to your own WhatsApp to keep a record. The number
            stays on your device.
          </p>
          <div className="wa-field">
            <label htmlFor="wa-phone">Your WhatsApp number</label>
            <input
              id="wa-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              placeholder="+62 812 3456 7890"
              onChange={(e) => onPhone(e.target.value)}
            />
            <span className={`wa-hint${phoneInvalid ? " err" : ""}`}>
              {phoneInvalid
                ? "That number looks off. Try 0812…, 812…, or +44 7700 900123."
                : "Indonesian numbers can start 0 or 812. Add + for other countries."}
            </span>
          </div>
          <div className="wa-actions">
            <a
              className="btn btn-wa"
              href={selfUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!selfUrl}
              onClick={(e) => {
                if (!selfUrl) e.preventDefault();
              }}
            >
              {norm ? `Open WhatsApp to +${norm}` : "Open WhatsApp with my order"}
            </a>
            <button className="btn btn-ghost" onClick={() => copy(selfSummary)} disabled={!hasMeal}>
              Copy order summary
            </button>
            <div className="copied">{copied}</div>
          </div>
        </div>
      )}

      {/* ---------- Email a copy ---------- */}
      {tab === "email" && (
        <div className="tabpane">
          <p className="muted">
            Email the order summary to yourself or a guest. Opens your mail app with
            everything filled in — just hit send.
          </p>
          <div className="wa-field">
            <label htmlFor="order-email">Email address</label>
            <input
              id="order-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailState("idle");
              }}
            />
            <span className={`wa-hint${emailInvalid ? " err" : ""}`}>
              {emailInvalid
                ? "That email doesn’t look right."
                : "We send it from BKETO Bali — your order lands in the inbox."}
            </span>
          </div>
          <div className="wa-actions">
            <button className="btn btn-primary" onClick={sendEmail} disabled={!canEmail}>
              {emailState === "sending" ? "Sending…" : "Email my order"}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => copy(buildSummary({ ids, goalKey, label }).replace(/\*/g, ""))}
              disabled={!hasMeal}
            >
              Copy order summary
            </button>
            <div className={`copied${emailState === "error" ? " err" : ""}`}>
              {emailState === "sent"
                ? `Sent to ${email.trim()} ✓`
                : emailState === "error"
                ? emailErr || "Could not send"
                : copied}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
