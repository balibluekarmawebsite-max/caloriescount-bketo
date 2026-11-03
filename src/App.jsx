import { useMemo, useState } from "react";
import { SLOTS, ITEMS_BY_ID } from "./data/menu.js";
import Header from "./components/Header.jsx";
import GoalSelector from "./components/GoalSelector.jsx";
import MealBuilder from "./components/MealBuilder.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
import WhatsAppCard from "./components/WhatsAppCard.jsx";
import MobileSummaryBar from "./components/MobileSummaryBar.jsx";
import Footnote from "./components/Footnote.jsx";

const emptySlots = () =>
  SLOTS.reduce((acc, s) => ({ ...acc, [s.key]: "" }), {});

export default function App() {
  const [goalKey, setGoalKey] = useState("Maintaining");
  const [slots, setSlots] = useState(emptySlots);
  const [extras, setExtras] = useState([]);
  const [label, setLabel] = useState("");
  const [phone, setPhone] = useState("+62 ");

  const setSlot = (key, id) => setSlots((s) => ({ ...s, [key]: id }));

  const setExtra = (idx, id) =>
    setExtras((xs) => xs.map((x, i) => (i === idx ? id : x)));
  const addExtra = () => setExtras((xs) => [...xs, ""]);
  const removeExtra = (idx) => setExtras((xs) => xs.filter((_, i) => i !== idx));

  const clearAll = () => {
    setSlots(emptySlots());
    setExtras([]);
    setLabel("");
  };

  // Fill every slot greedily from a chef build; leftovers become extras.
  const applyBuild = (build) => {
    const pool = [...build.items];
    const next = emptySlots();
    for (const slot of SLOTS) {
      const idx = pool.findIndex((id) => {
        const it = ITEMS_BY_ID[id];
        return it && slot.cats.includes(it.cat);
      });
      if (idx >= 0) {
        next[slot.key] = pool[idx];
        pool.splice(idx, 1);
      }
    }
    setGoalKey(build.goal);
    setSlots(next);
    setExtras(pool);
    setLabel(build.name);
  };

  // Chosen ids = filled slots (in slot order) + filled extras.
  const ids = useMemo(() => {
    const slotIds = SLOTS.map((s) => slots[s.key]).filter(Boolean);
    return [...slotIds, ...extras.filter(Boolean)];
  }, [slots, extras]);

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <span />
      </div>

      <div className="shell">
        <Header />

        <section className="hero glass" style={{ marginBottom: 18 }}>
          <h1>Count the calories in your BKETO meal</h1>
          <p>
            Pick a goal, choose what you ordered, and watch your calories and
            macros update live. Happy with it? Send the summary to WhatsApp.
          </p>
          <div className="steps">
            <span className="pill">
              <b>1</b> Choose a goal
            </span>
            <span className="pill">
              <b>2</b> Build your meal
            </span>
            <span className="pill">
              <b>3</b> Share to WhatsApp
            </span>
          </div>
        </section>

        <div className="grid">
          <div className="stack">
            <GoalSelector goalKey={goalKey} onPick={setGoalKey} />
            <MealBuilder
              goalKey={goalKey}
              slots={slots}
              extras={extras}
              label={label}
              onSlot={setSlot}
              onExtra={setExtra}
              onAddExtra={addExtra}
              onRemoveExtra={removeExtra}
              onLabel={setLabel}
              onApplyBuild={applyBuild}
              onClear={clearAll}
            />
          </div>

          <div className="col-summary stack" id="summary">
            <SummaryPanel ids={ids} goalKey={goalKey} />
            <WhatsAppCard
              ids={ids}
              goalKey={goalKey}
              label={label}
              phone={phone}
              onPhone={setPhone}
            />
          </div>
        </div>

        <Footnote />
      </div>

      <MobileSummaryBar
        ids={ids}
        goalKey={goalKey}
        onOpen={() =>
          document
            .getElementById("summary")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />
    </>
  );
}
