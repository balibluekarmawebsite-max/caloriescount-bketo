import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

function useIsMobile() {
  const q = "(max-width: 639px)";
  const [m, setM] = useState(
    () => typeof window !== "undefined" && window.matchMedia(q).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(q);
    const h = (e) => setM(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return m;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad2 = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
function parseISO(s) {
  const [y, m, d] = String(s).split("-").map(Number);
  return { y, m: m - 1, d };
}
function todayISO() {
  const d = new Date();
  return iso(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 6-week grid (42 cells) for a month, Monday-first. */
function buildCells(y, m) {
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7; // 0 = Monday
  const prevDays = new Date(y, m, 0).getDate();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    const pm = m - 1 < 0 ? 11 : m - 1;
    const py = m - 1 < 0 ? y - 1 : y;
    cells.push({ y: py, m: pm, d: prevDays - i, muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ y, m, d, muted: false });
  let nd = 1;
  while (cells.length < 42) {
    const nm = m + 1 > 11 ? 0 : m + 1;
    const ny = m + 1 > 11 ? y + 1 : y;
    cells.push({ y: ny, m: nm, d: nd++, muted: true });
  }
  return cells;
}

/** DD/MM/YYYY for the trigger. */
function fmtTrigger(v) {
  if (!v) return "";
  const { y, m, d } = parseISO(v);
  return `${pad2(d)}/${pad2(m + 1)}/${y}`;
}

/**
 * Custom calendar date picker — tap opens a month grid (no typing).
 * value/onChange use ISO YYYY-MM-DD. min/max are ISO strings (inclusive).
 */
export default function DatePicker({
  value,
  onChange,
  min,
  max,
  id,
  ariaLabel = "Choose a date",
  title = "Choose a date",
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const isMobile = useIsMobile();
  const tISO = todayISO();

  const [view, setView] = useState(() => {
    const s = value ? parseISO(value) : parseISO(tISO);
    return { y: s.y, m: s.m };
  });

  useEffect(() => {
    if (open) {
      const s = value ? parseISO(value) : parseISO(tISO);
      setView({ y: s.y, m: s.m });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const place = useCallback(() => {
    if (isMobile || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const width = 320;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    const spaceBelow = window.innerHeight - r.bottom - 12;
    const spaceAbove = r.top - 12;
    const useAbove = spaceBelow < 340 && spaceAbove > spaceBelow;
    setPos(
      useAbove
        ? { bottom: window.innerHeight - r.top + 6, left, width }
        : { top: r.bottom + 6, left, width }
    );
  }, [isMobile]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";
    const onScroll = () => !isMobile && place();
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, isMobile, place]);

  const cells = useMemo(() => buildCells(view.y, view.m), [view]);
  const firstOfView = iso(view.y, view.m, 1);
  const lastOfView = iso(view.y, view.m, new Date(view.y, view.m + 1, 0).getDate());
  const canPrev = !min || firstOfView > min;
  const canNext = !max || lastOfView < max;

  const goPrev = () =>
    canPrev && setView((v) => (v.m - 1 < 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const goNext = () =>
    canNext && setView((v) => (v.m + 1 > 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const pick = (cellISO) => {
    onChange(cellISO);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const panel =
    open &&
    createPortal(
      <div
        className={`sel-backdrop ${isMobile ? "mobile" : "desktop"}`}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div
          className={`sel-panel dp-panel ${isMobile ? "sheet" : "popover"}`}
          style={!isMobile && pos ? { top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width } : undefined}
          role="dialog"
          aria-label={ariaLabel}
        >
          {isMobile && (
            <div className="sel-head">
              <span className="sel-grab" />
              <b>{title}</b>
              <button className="sel-close" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
          )}
          <div className="dp">
            <div className="dp-head">
              <button className="dp-nav" onClick={goPrev} disabled={!canPrev} aria-label="Previous month">
                ‹
              </button>
              <div className="dp-title">
                {MONTHS[view.m]} {view.y}
              </div>
              <button className="dp-nav" onClick={goNext} disabled={!canNext} aria-label="Next month">
                ›
              </button>
            </div>
            <div className="dp-grid dp-wd" aria-hidden="true">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="dp-grid" role="grid">
              {cells.map((c, i) => {
                const cISO = iso(c.y, c.m, c.d);
                const disabled = (min && cISO < min) || (max && cISO > max);
                const selected = value === cISO;
                const isToday = cISO === tISO;
                return (
                  <button
                    key={i}
                    className={`dp-day${c.muted ? " muted" : ""}${selected ? " sel" : ""}${
                      isToday && !selected ? " today" : ""
                    }`}
                    disabled={disabled}
                    onClick={() => pick(cISO)}
                  >
                    {c.d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="sel">
      <button
        type="button"
        ref={triggerRef}
        id={id}
        className={`sel-trigger${value ? "" : " is-placeholder"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sel-value">{value ? fmtTrigger(value) : "Select date"}</span>
        <svg className="sel-chev" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="2" />
          <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {panel}
    </div>
  );
}
