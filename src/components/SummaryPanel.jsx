import { ITEMS_BY_ID, GOALS } from "../data/menu.js";
import { totals, fit, pctSplit, fmt } from "../lib/calc.js";
import Donut from "./Donut.jsx";

const MACROS = [
  { key: "p", label: "Protein", color: "var(--m-protein)", unit: "g" },
  { key: "f", label: "Fat", color: "var(--m-fat)", unit: "g" },
  { key: "net", label: "Net carbs", color: "var(--m-carbs)", unit: "g" },
  { key: "fib", label: "Fibre", color: "var(--m-fibre)", unit: "g" },
];

export default function SummaryPanel({ ids, goalKey }) {
  const t = totals(ids);
  const f = fit(t, goalKey);
  const split = pctSplit(t);
  const G = GOALS[goalKey];
  const maxG = Math.max(t.p, t.f, t.net, t.fib, 1);
  const hasMeal = t.count > 0;

  return (
    <section className="card glass summary">
      <div className="card-head">
        <h2>Your meal</h2>
        <span className="step">Live</span>
      </div>

      <div className="total">
        <span className="num">{fmt(t.kcal)}</span>
        <span className="unit">kcal</span>
        <span className="cat-note">
          {hasMeal ? `${t.count} item${t.count > 1 ? "s" : ""}` : "nothing yet"}
        </span>
      </div>

      {f ? (
        <div className={`status ${f.cls}`}>
          <span className="d" />
          {f.text}
        </div>
      ) : (
        <div className="status empty">
          <span className="d" />
          Pick items to see how they fit {goalKey}
        </div>
      )}

      <div className="split">
        <Donut split={split} />
        <div className="legend">
          <div className="row">
            <span className="sw" style={{ background: "var(--m-protein)" }} />
            <span className="lbl">Protein</span>
            <span className="val">{split.protein}%</span>
          </div>
          <div className="row">
            <span className="sw" style={{ background: "var(--m-fat)" }} />
            <span className="lbl">Fat</span>
            <span className="val">{split.fat}%</span>
          </div>
          <div className="row">
            <span className="sw" style={{ background: "var(--m-carbs)" }} />
            <span className="lbl">Carbs</span>
            <span className="val">{split.carbs}%</span>
          </div>
        </div>
      </div>

      <div className="macros">
        {MACROS.map((m) => (
          <div className="macro" key={m.key}>
            <div className="mh">
              <span>{m.label}</span>
              <span className="mv">
                {t[m.key]} {m.unit}
              </span>
            </div>
            <div className="track">
              <i
                style={{
                  width: `${(t[m.key] / maxG) * 100}%`,
                  background: m.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="goal-target">
        {goalKey} target: {G.short} · keep net carbs under {G.net} g
      </div>

      {hasMeal ? (
        <div className="items-list">
          {ids.map((id, idx) => {
            const i = ITEMS_BY_ID[id];
            if (!i) return null;
            return (
              <div className="li" key={`${id}-${idx}`}>
                <span className="nm">
                  {i.name}
                  {i.por ? ` · ${i.por}` : ""}
                </span>
                <span className="kc">{i.kcal} kcal</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty-note">
          Your chosen items will be listed here with their calories.
        </p>
      )}
    </section>
  );
}
