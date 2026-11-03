import { totals, fit, fmt } from "../lib/calc.js";

/**
 * Sticky bottom bar shown only on phones, so the live calorie total and goal
 * status stay visible while building (the full summary is further down).
 */
export default function MobileSummaryBar({ ids, goalKey, onOpen }) {
  const t = totals(ids);
  const f = fit(t, goalKey);
  return (
    <div className="mbar glass" role="status">
      <div className="mbar-main">
        <span className="mbar-kcal">{fmt(t.kcal)}</span>
        <span className="mbar-unit">kcal</span>
      </div>
      {f ? (
        <span className={`mbar-status ${f.cls}`}>
          <span className="d" />
          {f.text}
        </span>
      ) : (
        <span className="mbar-status empty">
          <span className="d" />
          {t.count ? "" : "Add items"}
        </span>
      )}
      <button className="mbar-btn" onClick={onOpen}>
        Summary
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
