import { rng, str, type FormProps } from './common';

export function Shrub({ palette, params, detail, wilted, seed }: FormProps) {
  const shape = str(params, 'shape', 'mound');
  const rand = rng(seed);
  const sag = wilted ? 10 : 0;

  if (shape === 'spiky') {
    const stems = 9;
    return (
      <g>
        <ellipse cx="0" cy="-8" rx="36" ry="14" fill={palette.stem} opacity="0.9" />
        {Array.from({ length: stems }, (_, i) => {
          const x = -32 + (64 / (stems - 1)) * i;
          const h = 60 + Math.sin(i * 1.7) * 18 + rand() * 10;
          const tilt = (x / 32) * (18 + sag);
          return (
            <g key={i} transform={`translate(${x} -8) rotate(${tilt})`}>
              <path
                d={`M0 0 L0 ${-h}`}
                stroke={palette.stem}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <g opacity={0.35 + detail * 0.65}>
                {[0, 1, 2, 3].map((k) => (
                  <ellipse
                    key={k}
                    cx="0"
                    cy={-h + 4 + k * 7}
                    rx={4.5 - k * 0.4}
                    ry="4"
                    fill={k % 2 ? palette.primary : palette.accent}
                  />
                ))}
              </g>
              <ellipse
                cx="-4"
                cy={-h * 0.5}
                rx="6"
                ry="2.5"
                transform={`rotate(-30 -4 ${-h * 0.5})`}
                fill={palette.secondary}
              />
            </g>
          );
        })}
      </g>
    );
  }

  if (shape === 'hedge') {
    return (
      <g>
        <rect x="-50" y="-64" width="100" height="64" rx="18" fill={palette.secondary} />
        <rect x="-44" y="-70" width="88" height="58" rx="18" fill={palette.primary} />
        <g opacity={detail}>
          {[-30, -10, 12, 32].map((x, i) => (
            <circle key={x} cx={x} cy={-50 + (i % 2) * 12} r="4" fill={palette.accent} />
          ))}
        </g>
      </g>
    );
  }

  // mound (default)
  const blobs = [
    { x: -30, y: -22, r: 24 },
    { x: 30, y: -22, r: 24 },
    { x: -10, y: -40, r: 26 },
    { x: 16, y: -38, r: 24 },
    { x: 0, y: -20, r: 26 },
  ];
  const berries = Array.from({ length: 8 }, () => ({
    x: (rand() - 0.5) * 70,
    y: -14 - rand() * 44,
  }));
  return (
    <g transform={`translate(0 ${sag})`}>
      <path
        d="M-8 0 L-4 -30 M8 0 L4 -30"
        stroke={palette.stem}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {blobs.map((b, i) => (
        <circle
          key={i}
          cx={b.x}
          cy={b.y}
          r={b.r}
          fill={i < 2 ? palette.secondary : palette.primary}
        />
      ))}
      <g opacity={detail}>
        {berries.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r="4" fill={palette.accent} />
        ))}
      </g>
    </g>
  );
}
