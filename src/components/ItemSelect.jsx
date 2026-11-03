import Select from "./Select.jsx";
import { ITEMS, CATEGORIES } from "../data/menu.js";

/**
 * Menu-item picker built on the custom <Select>.
 * @param cats  optional array of category keys to restrict to (default: all)
 */
export default function ItemSelect({
  value,
  onChange,
  cats,
  placeholder = "Not selected",
  id,
  title = "Choose an item",
}) {
  const allowed = cats && cats.length ? cats : Object.keys(CATEGORIES);
  const groups = allowed
    .map((cat) => ({
      label: CATEGORIES[cat],
      options: ITEMS.filter((i) => i.cat === cat).map((i) => ({
        value: i.id,
        label: i.name,
        meta: `${i.por ? i.por + " · " : ""}${i.kcal} kcal`,
        badge: i.keto === "yes" ? "keto" : null,
        keywords: `${cat} ${(i.tags || []).join(" ")} ${i.keto === "yes" ? "keto" : ""}`,
      })),
    }))
    .filter((g) => g.options.length);

  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      groups={groups}
      placeholder={placeholder}
      ariaLabel={title}
      title={title}
    />
  );
}
