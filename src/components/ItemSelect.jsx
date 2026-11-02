import { ITEMS, CATEGORIES } from "../data/menu.js";

/**
 * A grouped <select> of menu items.
 * @param cats  optional array of category keys to restrict to (default: all)
 */
export default function ItemSelect({ value, onChange, cats, placeholder = "Not selected", id }) {
  const allowed = cats && cats.length ? cats : Object.keys(CATEGORIES);
  const groups = allowed
    .map((cat) => ({
      cat,
      label: CATEGORIES[cat],
      items: ITEMS.filter((i) => i.cat === cat),
    }))
    .filter((g) => g.items.length);

  return (
    <div className="select-wrap">
      <select id={id} value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {groups.map((g) => (
          <optgroup key={g.cat} label={g.label}>
            {g.items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
                {i.por ? ` (${i.por})` : ""} · {i.kcal} kcal
                {i.keto === "yes" ? " · keto" : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
