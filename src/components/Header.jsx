import { useTheme } from "../hooks/useTheme.js";

function ThemeIcon({ theme }) {
  if (theme === "light")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" fill="currentColor" />
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="12"
            y1="2.5"
            x2="12"
            y2="5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            transform={`rotate(${i * 45} 12 12)`}
          />
        ))}
      </svg>
    );
  if (theme === "dark")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5Z"
          fill="currentColor"
        />
      </svg>
    );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3.8a8.2 8.2 0 0 1 0 16.4Z" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  const { theme, cycle } = useTheme();
  return (
    <header className="header glass">
      <span className="brandmark">
        <img src="./logo.png" alt="BKETO" />
      </span>
      <div className="title">
        <b>Calorie Counter</b>
        <span>Seminyak · Bali</span>
      </div>
      <div className="spacer" />
      <button
        className="icon-btn"
        onClick={cycle}
        title={`Theme: ${theme} (click to change)`}
        aria-label={`Theme: ${theme}. Click to change.`}
      >
        <ThemeIcon theme={theme} />
      </button>
    </header>
  );
}
