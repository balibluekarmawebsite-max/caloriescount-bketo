import { GOALS, GOAL_ORDER } from "../data/menu.js";

const ACCENT = {
  Shredding: "var(--shred)",
  Maintaining: "var(--maintain)",
  Bulking: "var(--bulk)",
};

export default function GoalSelector({ goalKey, onPick }) {
  return (
    <section className="card glass">
      <div className="card-head">
        <h2>Choose your goal</h2>
        <span className="step">Step 1</span>
      </div>
      <div className="goals" role="radiogroup" aria-label="Goal">
        {GOAL_ORDER.map((key) => {
          const g = GOALS[key];
          return (
            <button
              key={key}
              className="goal"
              role="radio"
              aria-checked={goalKey === key}
              data-active={goalKey === key}
              style={{ "--accent": ACCENT[key] }}
              onClick={() => onPick(key)}
            >
              <div className="dot" />
              <div className="g-name">{key}</div>
              <div className="g-note">{g.tagline}</div>
              <div className="g-short">{g.short}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
