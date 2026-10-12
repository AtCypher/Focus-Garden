import { str, type FormProps } from './common';

export function Cactus({ palette, params, detail, wilted }: FormProps) {
  const shape = str(params, 'shape', 'barrel');
  const lean = wilted ? 10 : 0;

  if (shape === 'saguaro') {
    return (
      <g transform={`rotate(${lean})`}>
        <rect x="-14" y="-130" width="28" height="130" rx="14" fill={palette.primary} />
        <path
          d="M-40 -60 v-30 a12 12 0 0 1 24 0 v10"
          stroke={palette.primary}
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M40 -40 v-45 a12 12 0 0 0 -24 0 v10"
          stroke={palette.primary}
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />
        {[-7, 0, 7].map((x) => (
          <path
            key={x}
            d={`M${x} -124 v120`}
            stroke={palette.secondary}
            strokeWidth="1.5"
            opacity="0.7"
          />
        ))}
        <g opacity={detail}>
          <circle cx="0" cy="-132" r="7" fill={palette.accent} />
          <circle cx="-40" cy="-92" r="5" fill={palette.accent} />
        </g>
      </g>
    );
  }

  if (shape === 'prickly') {
    const pads = [
      { x: 0, y: -28, rx: 26, ry: 30, rot: 0 },
      { x: -28, y: -66, rx: 20, ry: 26, rot: -30 },
      { x: 26, y: -70, rx: 20, ry: 25, rot: 25 },
      { x: 2, y: -96, rx: 16, ry: 20, rot: 5 },
    ];
    return (
      <g transform={`rotate(${lean})`}>
        {pads.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}>
            <ellipse
              cx="0"
              cy="0"
              rx={p.rx}
              ry={p.ry}
              fill={i % 2 ? palette.primary : palette.secondary}
            />
            {[-8, 0, 8].map((dx) => (
              <circle
                key={dx}
                cx={dx}
                cy={-4 + (dx % 16) / 2}
                r="1.6"
                fill={palette.accent}
                opacity="0.6"
              />
            ))}
          </g>
        ))}
        <g opacity={detail}>
          <circle cx="-30" cy="-94" r="7" fill={palette.accent} />
          <circle cx="8" cy="-118" r="7" fill={palette.accent} />
          <circle cx="30" cy="-96" r="6" fill={palette.accent} />
        </g>
      </g>
    );
  }

  // barrel (default)
  return (
    <g transform={`rotate(${lean})`}>
      <ellipse cx="0" cy="-44" rx="40" ry="46" fill={palette.primary} />
      {[-30, -18, -6, 6, 18, 30].map((x) => (
        <path
          key={x}
          d={`M${x} -86 Q${x * 1.15} -44 ${x} -2`}
          stroke={palette.secondary}
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
      ))}
      {[-30, -18, -6, 6, 18, 30].map((x) =>
        [-70, -50, -30, -12].map((y) => (
          <path
            key={`${x}${y}`}
            d={`M${x - 3} ${y} l6 0 M${x} ${y - 3} l0 6`}
            stroke="#f5f0dc"
            strokeWidth="1"
            opacity="0.8"
          />
        )),
      )}
      <g opacity={detail}>
        <circle cx="0" cy="-92" r="9" fill={palette.accent} />
        <circle cx="0" cy="-92" r="4" fill="#fff6d6" />
      </g>
    </g>
  );
}
