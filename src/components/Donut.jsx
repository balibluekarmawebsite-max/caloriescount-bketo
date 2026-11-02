/**
 * Macro-calorie split donut (protein / fat / carbs).
 * Mirrors the original tool: segments sized by kcal from each macro.
 */
export default function Donut({ split, size = 104, stroke = 16 }) {
  const { pk, fk, ck, s } = split.raw;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const segs = [
    { v: pk, color: "var(--m-protein)" },
    { v: fk, color: "var(--m-fat)" },
    { v: ck, color: "var(--m-carbs)" },
  ];
  const has = s > 1;
  let offset = 0;

  return (
    <svg
      className="donut"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Calories from protein ${split.protein}%, fat ${split.fat}%, carbs ${split.carbs}%`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--field-bg)"
        strokeWidth={stroke}
      />
      {has &&
        segs.map((seg, idx) => {
          const len = (seg.v / s) * C;
          const el = (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dasharray .45s ease, stroke-dashoffset .45s ease" }}
            />
          );
          offset += len;
          return el;
        })}
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        fontSize="0.62rem"
        fill="var(--text-faint)"
        style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
      >
        split
      </text>
      <text
        x="50%"
        y="63%"
        textAnchor="middle"
        fontSize="0.9rem"
        fontWeight="700"
        fill="var(--text)"
      >
        {has ? `${split.protein}%` : "—"}
      </text>
    </svg>
  );
}
