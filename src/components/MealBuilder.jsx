import { SLOTS, ITEMS_BY_ID } from "../data/menu.js";
import ItemSelect from "./ItemSelect.jsx";
import ChefBuilds from "./ChefBuilds.jsx";

export default function MealBuilder({
  goalKey,
  slots,
  extras,
  label,
  onSlot,
  onExtra,
  onAddExtra,
  onRemoveExtra,
  onLabel,
  onApplyBuild,
  onClear,
}) {
  return (
    <section className="card glass">
      <div className="card-head">
        <h2>What did you order?</h2>
        <span className="step">Step 2</span>
      </div>
      <p className="muted" style={{ marginBottom: 14 }}>
        Build it slot by slot, or start from a chef's build and tweak any swaps.
        Figures update live on the right.
      </p>

      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        <ChefBuilds goalKey={goalKey} onApply={onApplyBuild} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <input
              type="text"
              value={label}
              placeholder="Name this meal (optional)"
              onChange={(e) => onLabel(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClear}>
            Clear all
          </button>
        </div>
      </div>

      <div className="slots">
        {SLOTS.map((slot) => {
          const id = slots[slot.key];
          const item = id ? ITEMS_BY_ID[id] : null;
          return (
            <div className="slot" key={slot.key}>
              <label className="s-label" htmlFor={`slot-${slot.key}`}>
                <b>{slot.label}</b>
                <span>{slot.hint}</span>
              </label>
              <ItemSelect
                id={`slot-${slot.key}`}
                value={id}
                cats={slot.cats}
                onChange={(v) => onSlot(slot.key, v)}
              />
              <div className={`s-kcal${item ? "" : " empty"}`}>
                {item ? `${item.kcal} kcal` : "—"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-head" style={{ margin: "22px 0 10px" }}>
        <h2 style={{ fontSize: "1rem" }}>Extra items</h2>
        <button className="btn btn-ghost btn-sm" onClick={onAddExtra}>
          + Add another item
        </button>
      </div>
      {extras.length === 0 ? (
        <p className="faint" style={{ fontSize: "0.85rem" }}>
          An extra egg, side or sauce? Add it here.
        </p>
      ) : (
        <div className="extras">
          {extras.map((id, idx) => {
            const item = id ? ITEMS_BY_ID[id] : null;
            return (
              <div className="extra-row" key={idx}>
                <ItemSelect
                  value={id}
                  onChange={(v) => onExtra(idx, v)}
                  placeholder="Choose an item…"
                />
                <div className={`s-kcal${item ? "" : " empty"}`}>
                  {item ? `${item.kcal} kcal` : "—"}
                </div>
                <button
                  className="chip-remove"
                  onClick={() => onRemoveExtra(idx)}
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
