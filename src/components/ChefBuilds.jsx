import { BUILDS, GOALS } from "../data/menu.js";

/**
 * Quick-fill from a chef build. Filters to the current goal, but lets the
 * user browse every build. Picking one fills all slots (handled in App).
 */
export default function ChefBuilds({ goalKey, onApply }) {
  const forGoal = BUILDS.filter((b) => b.goal === goalKey);
  const others = BUILDS.filter((b) => b.goal !== goalKey);

  const handle = (e) => {
    const code = e.target.value;
    if (!code) return;
    const build = BUILDS.find((b) => b.code === code);
    if (build) onApply(build);
    e.target.value = "";
  };

  return (
    <div className="builds-bar">
      <div className="select-wrap">
        <select aria-label="Fill in a chef build" defaultValue="" onChange={handle}>
          <option value="">Fill in a chef's build…</option>
          <optgroup label={`${goalKey} builds`}>
            {forGoal.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code} · {b.name} — {b.style}
              </option>
            ))}
          </optgroup>
          <optgroup label="Other goals">
            {others.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code} · {b.name} ({b.goal})
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    </div>
  );
}
