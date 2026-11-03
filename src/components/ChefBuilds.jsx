import Select from "./Select.jsx";
import { BUILDS } from "../data/menu.js";

/**
 * Quick-fill from a chef build (custom dropdown). Picking one fills all
 * slots (handled in App). It's an action, so it keeps no persistent value.
 */
export default function ChefBuilds({ goalKey, onApply }) {
  const forGoal = BUILDS.filter((b) => b.goal === goalKey);
  const others = BUILDS.filter((b) => b.goal !== goalKey);

  const mk = (b, withGoal) => ({
    value: b.code,
    label: `${b.code} · ${b.name}`,
    meta: withGoal ? `${b.style} · ${b.goal}` : b.style,
    keywords: `${b.goal} ${b.style} ${b.name}`,
  });

  const groups = [
    { label: `${goalKey} builds`, options: forGoal.map((b) => mk(b, false)) },
    { label: "Other goals", options: others.map((b) => mk(b, true)) },
  ].filter((g) => g.options.length);

  const handle = (code) => {
    if (!code) return;
    const build = BUILDS.find((b) => b.code === code);
    if (build) onApply(build);
  };

  return (
    <Select
      value=""
      onChange={handle}
      groups={groups}
      placeholder="Fill in a chef's build…"
      clearable={false}
      ariaLabel="Fill in a chef's build"
      title="Choose a chef's build"
    />
  );
}
