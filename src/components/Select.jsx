import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** True when the viewport is phone-sized. */
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

/**
 * Accessible custom dropdown.
 * - Mobile: slides up as a bottom sheet with search + large touch rows.
 * - Desktop: a popover anchored under the trigger.
 *
 * groups: [{ label, options: [{ value, label, meta?, badge?, keywords? }] }]
 */
export default function Select({
  value,
  onChange,
  groups,
  placeholder = "Not selected",
  searchable = true,
  clearable = true,
  id,
  ariaLabel,
  title = "Select",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const isMobile = useIsMobile();

  const selected = useMemo(() => {
    for (const g of groups) for (const o of g.options) if (o.value === value) return o;
    return null;
  }, [groups, value]);

  const fgroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        options: g.options.filter(
          (o) =>
            o.label.toLowerCase().includes(q) ||
            (o.meta || "").toLowerCase().includes(q) ||
            (o.keywords || "").toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.options.length);
  }, [groups, query]);

  const flat = useMemo(() => fgroups.flatMap((g) => g.options), [fgroups]);

  // Position the desktop popover against the trigger (re-run on scroll/resize
  // so it follows the trigger instead of detaching).
  const place = useCallback(() => {
    if (isMobile || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const width = Math.max(r.width, 240);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    const spaceBelow = window.innerHeight - r.bottom - 12;
    const spaceAbove = r.top - 12;
    const useAbove = spaceBelow < 260 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(342, Math.max(spaceBelow, spaceAbove));
    setPos(
      useAbove
        ? { bottom: window.innerHeight - r.top + 6, left, width, maxHeight }
        : { top: r.bottom + 6, left, width, maxHeight }
    );
  }, [isMobile]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(
      () => searchRef.current && searchRef.current.focus({ preventScroll: true }),
      40
    );
    const prevOverflow = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";
    const onScroll = () => {
      if (!isMobile) place();
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(flat.length - 1, a + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      } else if (e.key === "Enter" && active >= 0 && flat[active]) {
        e.preventDefault();
        pick(flat[active].value);
      }
    };
    // Only react to page scroll, not scrolling inside the list (no capture).
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, isMobile, flat, active, place]);

  const openMenu = () => {
    setQuery("");
    setActive(-1);
    setOpen(true);
  };
  const pick = (v) => {
    onChange(v);
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
          className={`sel-panel ${isMobile ? "sheet" : "popover"}`}
          style={
            !isMobile && pos
              ? {
                  top: pos.top,
                  bottom: pos.bottom,
                  left: pos.left,
                  width: pos.width,
                  maxHeight: pos.maxHeight,
                }
              : undefined
          }
          role="listbox"
          aria-label={ariaLabel || title}
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
          {searchable && (
            <div className="sel-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search…"
                aria-label="Search options"
              />
            </div>
          )}
          <div className="sel-list">
            {clearable && (
              <button
                role="option"
                aria-selected={!value}
                className={`sel-opt${!value ? " is-sel" : ""}`}
                onClick={() => pick("")}
              >
                <span className="sel-opt-main">
                  <span className="sel-opt-name faint">{placeholder}</span>
                </span>
                {!value && <span className="sel-check">✓</span>}
              </button>
            )}
            {fgroups.length === 0 && <div className="sel-empty">No matches</div>}
            {fgroups.map((g) => (
              <div className="sel-group" key={g.label}>
                {g.label && <div className="sel-glabel">{g.label}</div>}
                {g.options.map((o) => {
                  const idx = flat.indexOf(o);
                  return (
                    <button
                      key={o.value}
                      role="option"
                      aria-selected={o.value === value}
                      className={`sel-opt${o.value === value ? " is-sel" : ""}${
                        idx === active ? " is-active" : ""
                      }`}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => pick(o.value)}
                    >
                      <span className="sel-opt-main">
                        <span className="sel-opt-name">{o.label}</span>
                        {o.meta && <span className="sel-opt-meta">{o.meta}</span>}
                      </span>
                      {o.badge && <span className="sel-badge">{o.badge}</span>}
                      {o.value === value && <span className="sel-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            ))}
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
        className={`sel-trigger${selected ? "" : " is-placeholder"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || title}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <span className="sel-value">{selected ? selected.label : placeholder}</span>
        <svg className="sel-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {panel}
    </div>
  );
}
