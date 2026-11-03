// Calorie + macro math for the BKETO Calorie Counter.
// Mirrors the original tool exactly:
//   4 kcal / g protein, 4 kcal / g net carb, 9 kcal / g fat, 2 kcal / g fibre.
//   net carbs = total carbs - fibre.

import { ITEMS_BY_ID, GOALS } from "../data/menu.js";

/** Sum macros for a list of item ids (duplicates allowed). */
export function totals(ids) {
  const t = { kcal: 0, p: 0, f: 0, c: 0, fib: 0, net: 0, count: 0, byCat: {} };
  ids.forEach((id) => {
    const i = ITEMS_BY_ID[id];
    if (!i) return;
    t.kcal += i.kcal;
    t.p += i.p;
    t.f += i.f;
    t.c += i.c;
    t.fib += i.fib;
    t.net += i.net;
    t.count += 1;
    const ck = i.cat === "dressing" ? "sauce" : i.cat;
    t.byCat[ck] = (t.byCat[ck] || 0) + i.kcal;
  });
  return t;
}

/** How the meal fits the chosen goal. Returns null for an empty meal. */
export function fit(t, goalKey) {
  const G = GOALS[goalKey];
  if (!G || !t.count) return null;
  if (t.net > G.net) return { cls: "bad", text: "Above keto carb limit" };
  if (t.kcal < G.kcal[0]) return { cls: "warn", text: `Under ${goalKey.toLowerCase()} range` };
  if (t.kcal > G.kcal[1]) return { cls: "warn", text: `Over ${goalKey.toLowerCase()} range` };
  if (t.p < G.p[0]) return { cls: "warn", text: "Low protein for this goal" };
  return { cls: "good", text: "On target" };
}

/** Share of calories from protein / fat / carbs, as whole percentages. */
export function pctSplit(t) {
  const pk = t.p * 4;
  const fk = t.f * 9;
  const ck = t.net * 4;
  const s = pk + fk + ck || 1;
  return {
    protein: Math.round((pk / s) * 100),
    fat: Math.round((fk / s) * 100),
    carbs: Math.round((ck / s) * 100),
    raw: { pk, fk, ck, s },
  };
}

/**
 * Normalise a phone number for wa.me.
 * Returns a digits-only international number, "" when empty, or null when invalid.
 * Indonesian defaults: a leading 0 is replaced with 62.
 */
export function normPhone(raw) {
  let d = (raw || "").trim();
  const intl = d.startsWith("+");
  d = d.replace(/\D/g, "");
  if (!d) return "";
  if (intl) return d.length >= 8 && d.length <= 15 ? d : null;
  if (d.startsWith("62")) return d.length >= 10 && d.length <= 15 ? d : null;
  if (d.startsWith("0")) d = d.slice(1);
  return d.length >= 8 && d.length <= 13 ? "62" + d : null;
}

// Status marker emoji for WhatsApp (minimal, by goal fit).
const STATUS_EMOJI = { good: "✅", warn: "⚠️", bad: "⚠️" };

/** Ingredient bullet lines for WhatsApp. */
function ingredientLines(ids) {
  return ids
    .map((id) => {
      const i = ITEMS_BY_ID[id];
      if (!i) return null;
      const por = i.por ? ` (${i.por})` : "";
      return `• ${i.name}${por} — ${i.kcal} kcal`;
    })
    .filter(Boolean)
    .join("\n");
}

/** Nutrition summary block for WhatsApp. */
function nutritionBlock(ids, goalKey) {
  const t = totals(ids);
  const f = fit(t, goalKey);
  const split = pctSplit(t);
  const out = [
    "📊 *Nutrition summary*",
    `*Total: ${t.kcal} kcal*`,
    `Protein ${t.p} g · Fat ${t.f} g · Net carbs ${t.net} g · Fibre ${t.fib} g`,
    `Calories from protein ${split.protein}% · fat ${split.fat}% · carbs ${split.carbs}%`,
  ];
  if (f) out.push(`${STATUS_EMOJI[f.cls] || ""} ${f.text}`.trim());
  return out.join("\n");
}

function dishAndGoal(goalKey, label) {
  const G = GOALS[goalKey];
  const dish = label && label.trim() ? label.trim() : "My BKETO meal";
  const goalLine = `${goalKey}${G ? ` · ${G.short}` : ""}`;
  return { dish, goalLine };
}

/** Clean, scannable WhatsApp order summary (the guest's own copy). */
export function buildSummary({ ids, goalKey, label }) {
  const { dish, goalLine } = dishAndGoal(goalKey, label);
  return [
    `🧾 *${dish}*`,
    goalLine,
    "",
    ingredientLines(ids),
    "",
    nutritionBlock(ids, goalKey),
    "",
    "_Estimates per menu portion · BKETO Bali, Seminyak_",
  ].join("\n");
}

/** wa.me deep link, or null when the number is invalid / empty. */
export function waUrl(phone, text) {
  const n = normPhone(phone);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

/** wa.me link to a fixed international number (digits only). */
export function waUrlTo(digits, text) {
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** A reservation message addressed to the BKETO restaurant. */
export function buildReservation({ ids, goalKey, label, restaurant, guests, when }) {
  const { dish, goalLine } = dishAndGoal(goalKey, label);
  const name = restaurant || "BKETO Bali";
  const g = (guests && String(guests).trim()) || "__";
  const w = (when && String(when).trim()) || "__";
  return [
    `👋 Hi ${name}! I'd like to order and reserve a table.`,
    "",
    `🍽️ *${dish}*`,
    goalLine,
    "",
    ingredientLines(ids),
    "",
    nutritionBlock(ids, goalKey),
    "",
    "🗓️ *Reservation*",
    `Guests: ${g} · Preferred time: ${w}`,
    "",
    "🙏 Could you please confirm my reservation? Thank you!",
  ].join("\n");
}

/** Simple email validity check. */
export function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

/** Structured order data for the HTML email template. */
export function buildOrderPayload({ ids, goalKey, label }) {
  const t = totals(ids);
  const G = GOALS[goalKey];
  const f = fit(t, goalKey);
  const split = pctSplit(t);
  const items = ids
    .map((id) => {
      const i = ITEMS_BY_ID[id];
      return i ? { name: i.name, por: i.por || "", kcal: i.kcal } : null;
    })
    .filter(Boolean);
  return {
    label: label || "",
    goal: goalKey,
    goalShort: G ? G.short : "",
    items,
    totals: { kcal: t.kcal, p: t.p, f: t.f, net: t.net, fib: t.fib },
    split: { protein: split.protein, fat: split.fat, carbs: split.carbs },
    status: f ? { text: f.text, cls: f.cls } : null,
  };
}

/** mailto: link carrying the order summary, or null when the email is invalid. */
export function mailtoUrl(email, { ids, goalKey, label }) {
  if (!validEmail(email)) return null;
  const subject = `My BKETO order${label ? ` — ${label}` : ""}`;
  // Plain text reads better in email without the WhatsApp markdown asterisks.
  const body = buildSummary({ ids, goalKey, label }).replace(/\*/g, "");
  return `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export const fmt = (n) => (Number.isFinite(n) ? n.toLocaleString("en-US") : "0");
