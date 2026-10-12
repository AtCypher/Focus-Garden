import { rng, str, type FormProps } from './common';

export function Mushroom({ palette, params, detail, wilted, seed }: FormProps) {
  const cap = str(params, 'cap', 'bell');
  const rand = rng(seed);
  const tilt = wilted ? -12 : 0;

  const one = (x: number, scale: number, key: number) => (
    <g key={key} transform={`translate(${x} 0) scale(${scale}) rotate(${tilt})`}>
      <rect x="-9" y="-56" width="18" height="56" rx="8" fill={palette.stem} />
      <path d="M-8 -50 h16" stroke={palette.secondary} strokeWidth="1.5" opacity="0.3" />
      {cap === 'flat' && (
        <>
          <ellipse cx="0" cy="-54" rx="44" ry="12" fill={palette.secondary} />
          <ellipse cx="0" cy="-58" rx="44" ry="14" fill={palette.primary} />
        </>
      )}
      {cap === 'bell' && (
        <>
          <path d="M-40 -50 a40 38 0 0 1 80 0 Z" fill={palette.primary} />
          <path d="M-40 -50 h80 a4 4 0 0 1 0 8 h-80 a4 4 0 0 1 0 -8 Z" fill={palette.secondary} />
        </>
      )}
      {cap === 'funnel' && (
        <>
          <path d="M-42 -74 Q0 -60 42 -74 L24 -48 Q0 -40 -24 -48 Z" fill={palette.primary} />
          <path d="M-42 -74 Q0 -86 42 -74 Q0 -62 -42 -74 Z" fill={palette.secondary} />
        </>
      )}
      <g opacity={detail}>
        {[-20, -2, 16].map((sx, i) => (
          <circle
            key={sx}
            cx={sx}
            cy={cap === 'flat' ? -60 : cap === 'bell' ? -70 + (i % 2) * 10 : -72}
            r={4 - (i % 2)}
            fill={palette.accent}
          />
        ))}
      </g>
    </g>
  );

  const extra = Math.round(detail * 2);
  return (
    <g>
      {one(0, 1, 0)}
      {extra >= 1 && one(-34 - rand() * 6, 0.55, 1)}
      {extra >= 2 && one(32 + rand() * 6, 0.45, 2)}
    </g>
  );
}
