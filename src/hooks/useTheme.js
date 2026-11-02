import { useEffect, useState } from "react";

const KEY = "bketo-theme";

/** Theme: "light" | "dark" | "system". Persists per-viewer, falls back safely. */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(KEY) || "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* storage may be blocked — ignore */
    }
  }, [theme]);

  const cycle = () =>
    setTheme((t) => (t === "light" ? "dark" : t === "dark" ? "system" : "light"));

  return { theme, setTheme, cycle };
}
