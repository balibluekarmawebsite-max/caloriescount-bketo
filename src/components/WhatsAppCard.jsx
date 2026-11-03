import { useEffect, useState } from "react";
import { BKETO } from "../data/menu.js";
import Select from "./Select.jsx";
import DatePicker from "./DatePicker.jsx";
import {
  normPhone,
  waUrl,
  waUrlTo,
  buildSummary,
  buildReservation,
  buildOrderPayload,
  validEmail,
} from "../lib/calc.js";

const TABS = [
  { key: "reserve", label: "Reserve" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
];

const pad2 = (n) => String(n).padStart(2, "0");

// Reservation service hours & rules.
const SERVICE = { startMin: 11 * 60, endMin: 22 * 60, step: 30, bufferMin: 30 };
const BOOK_AHEAD_DAYS = 60;

function dateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function todayDate() {
  return dateStr(new Date());
}
function maxDate() {
  const d = new Date();
  d.setDate(d.getDate() + BOOK_AHEAD_DAYS);
  return dateStr(d);
}
function allSlots() {
  const out = [];
  for (let m = SERVICE.startMin; m <= SERVICE.endMin; m += SERVICE.step) {
    out.push(`${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`);
  }
  return out;
}
/** 24h "HH:MM" -> "7:30 PM". */
function to12h(hm) {
  if (!hm) return "";
  const [h, m] = hm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
/** Slots for a date; today hides already-passed slots (+ buffer). */
function slotsForDate(ds) {
  const slots = allSlots();
  if (ds !== todayDate()) return slots;
  const now = new Date();
  const cutoff = now.getHours() * 60 + now.getMinutes() + SERVICE.bufferMin;
  return slots.filter((hm) => {
    const [h, m] = hm.split(":").map(Number);
    return h * 60 + m >= cutoff;
  });
}
/** Unambiguous "Fri, 05/11/2026". */
function formatDateDMY(ds) {
  if (!ds) return "";
  const d = new Date(`${ds}T00:00`);
  if (isNaN(d.getTime())) return ds;
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
/** Default date + first available slot (rolls to tomorrow once today is done). */
function defaultDateTime() {
  const today = todayDate();
  const todaySlots = slotsForDate(today);
  if (todaySlots.length) return { date: today, time: todaySlots[0] };
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return { date: dateStr(d), time: allSlots()[0] };
}

export default function WhatsAppCard({ ids, goalKey, label, phone, onPhone }) {
  const [tab, setTab] = useState("reserve");
  const [guests, setGuests] = useState("1");
  const [date, setDate] = useState(() => defaultDateTime().date);
  const [time, setTime] = useState(() => defaultDateTime().time);

  // Keep the chosen slot valid when the date changes (e.g. today's slots pass).
  useEffect(() => {
    const avail = slotsForDate(date);
    setTime((cur) => (avail.includes(cur) ? cur : avail[0] || ""));
  }, [date]);

  const availSlots = slotsForDate(date);
  const timeGroups = [
    { label: "", options: availSlots.map((hm) => ({ value: hm, label: to12h(hm) })) },
  ];
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
      const order = buildOrderPayload({ ids, goalKey, label });
      order.reservation = {
        guests: String(guests || "").trim(),
        date: formatDateDMY(date),
        time: to12h(time),
      };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email.trim(), order }),
      });
      const j = await res.json().catch(() => ({ ok: false }));
      if (res.ok && j.ok) {
        setEmailState("sent");
        setTimeout(() => setEmailState((s) => (s === "sent" ? "idle" : s)), 5000);
      } else {
        setEmailState("error");
        setEmailErr(j.error || "Could not send");
      }
    } catch {
      setEmailState("error");
      setEmailErr("Network error — please try again");
    }
  };

  // --- Reserve (to BKETO) ---
  const reservationMsg = buildReservation({
    ids,
    goalKey,
    label,
    restaurant: BKETO.name,
    guests,
    dateText: formatDateDMY(date),
    timeText: to12h(time),
  });
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
          <div className="res-fields">
            <div className="wa-field">
              <label htmlFor="res-guests">Guests</label>
              <input
                id="res-guests"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="e.g. 2"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
            <div className="wa-field">
              <label>Date</label>
              <DatePicker
                value={date}
                onChange={setDate}
                min={todayDate()}
                max={maxDate()}
                ariaLabel="Reservation date"
                title="Choose a date"
              />
            </div>
            <div className="wa-field">
              <label>Time</label>
              <Select
                value={time}
                onChange={setTime}
                groups={timeGroups}
                placeholder={availSlots.length ? "Pick a time" : "No times left"}
                clearable={false}
                searchable={false}
                ariaLabel="Preferred time"
                title="Choose a time"
              />
            </div>
          </div>
          <span className="wa-hint" style={{ marginTop: -4 }}>
            {availSlots.length
              ? "Pre-filled with now — tap to change the date or time."
              : "No slots left today — pick another date."}
          </span>
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
            Email the order to yourself or a guest — sent straight from <b>{BKETO.name}</b>,
            no mail app needed.
          </p>
          <div className="wa-field">
            <label htmlFor="order-email">Email address</label>
            <div className={`input-wrap${emailInvalid ? " err" : ""}`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
                <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                id="order-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                placeholder="name@email.com"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailState("idle");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canEmail) sendEmail();
                }}
              />
            </div>
            <span className={`wa-hint${emailInvalid ? " err" : ""}`}>
              {emailInvalid
                ? "Hmm, that email doesn’t look right."
                : "Sent from BKETO Bali — it lands right in the inbox."}
            </span>
          </div>
          <div className="wa-actions">
            <button
              className={`btn btn-primary email-send is-${emailState}`}
              onClick={sendEmail}
              disabled={!canEmail}
            >
              <span className="es-icon" aria-hidden="true">
                {emailState === "sending" && <span className="spinner" />}
                {emailState === "sent" && (
                  <svg className="check-anim" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" />
                    <path d="M7 12.4l3.3 3.3L17 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {(emailState === "idle" || emailState === "error") && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3.2 11.3 20 4.2a.6.6 0 0 1 .8.8l-7.1 16.8a.6.6 0 0 1-1.1 0l-2.6-6.3a.6.6 0 0 0-.3-.3L3.2 12.4a.6.6 0 0 1 0-1.1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="es-label">
                {emailState === "sending"
                  ? "Sending…"
                  : emailState === "sent"
                  ? "Email sent!"
                  : emailState === "error"
                  ? "Try again"
                  : "Email my order"}
              </span>
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => copy(buildSummary({ ids, goalKey, label }).replace(/\*/g, ""))}
              disabled={!hasMeal}
            >
              Copy order summary
            </button>
            <div className={`copied${emailState === "error" ? " err" : ""}`} aria-live="polite">
              {emailState === "sent"
                ? `Order emailed to ${email.trim()} ✓`
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
