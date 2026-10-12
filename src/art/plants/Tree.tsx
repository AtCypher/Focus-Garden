import { rng, str, type FormProps } from './common';

export function Tree({ palette, params, detail, wilted, seed }: FormProps) {
  const canopy = str(params, 'canopy', 'round');
  const rand = rng(seed);
  const lean = wilted ? 14 : 0;
  const trunkH = canopy === 'palm' ? 110 : canopy === 'conical' ? 40 : 60;
  const fruit: { x: number; y: number }[] = [];
  for (let i = 0; i < 7; i++) fruit.push({ x: (rand() - 0.5) * 80, y: -trunkH - 20 - rand() * 50 });

  const trunk = (
    <path
      d={`M-7 0 Q-4 ${-trunkH * 0.5} ${lean ? -2 : -3} ${-trunkH} L${3 + lean * 0.2} ${-trunkH} Q4 ${-trunkH * 0.5} 7 0 Z`}
      fill={palette.stem}
    />
  );

  let top: JSX.Element;
  switch (canopy) {
    case 'conical':
      top = (
        <g transform={`translate(0 ${-trunkH}) rotate(${lean})`}>
          <path d="M0 -120 L-52 -10 L52 -10 Z" fill={palette.secondary} />
          <path d="M0 -118 L-40 -40 L40 -40 Z" fill={palette.primary} />
          <path d="M0 -120 L-32 -70 L32 -70 Z" fill={palette.accent} opacity="0.5" />
          <path d="M0 -92 L-44 -10 L44 -10 Z" fill={palette.primary} opacity="0.9" />
          <path d="M0 -60 L-52 -8 L52 -8 Z" fill={palette.secondary} opacity="0.9" />
        </g>
      );
      break;
    case 'layered':
      top = (
        <g transform={`translate(0 ${-trunkH}) rotate(${lean})`}>
          <ellipse cx="0" cy="-10" rx="56" ry="20" fill={palette.secondary} />
          <ellipse cx="4" cy="-36" rx="44" ry="18" fill={palette.primary} />
          <ellipse cx="-3" cy="-60" rx="30" ry="15" fill={palette.primary} />
          <ellipse cx="2" cy="-78" rx="16" ry="10" fill={palette.accent} opacity="0.6" />
        </g>
      );
      break;
    case 'weeping':
      top = (
        <g transform={`translate(0 ${-trunkH}) rotate(${lean})`}>
          <ellipse cx="0" cy="-30" rx="58" ry="34" fill={palette.secondary} />
          <ellipse cx="-6" cy="-40" rx="44" ry="26" fill={palette.primary} />
          {[-50, -36, -20, -4, 12, 28, 44].map((x, i) => (
            <path
              key={x}
              d={`M${x} -30 q${i % 2 ? 6 : -6} 30 ${i % 2 ? 2 : -2} ${56 + (i % 3) * 8}`}
              stroke={i % 2 ? palette.primary : palette.accent}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </g>
      );
      break;
    case 'palm':
      top = (
        <g transform={`translate(0 ${-trunkH}) rotate(${lean})`}>
          {[-150, -110, -70, -30, 10, 50, 90].map((a, i) => (
            <g key={a} transform={`rotate(${a})`}>
              <path
                d="M0 0 Q30 -14 62 -6 Q40 4 24 6 Q12 10 0 0 Z"
                fill={i % 2 ? palette.primary : palette.secondary}
              />
              <path
                d="M2 0 Q30 -10 58 -5"
                stroke={palette.secondary}
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
              />
            </g>
          ))}
          <circle cx="0" cy="2" r="7" fill={palette.stem} />
          <g opacity={detail}>
            <circle cx="-6" cy="8" r="4" fill={palette.accent} />
            <circle cx="4" cy="10" r="4" fill={palette.accent} />
          </g>
        </g>
      );
      break;
    case 'broad':
      top = (
        <g transform={`translate(0 ${-trunkH}) rotate(${lean})`}>
          <circle cx="-34" cy="-14" r="30" fill={palette.secondary} />
          <circle cx="34" cy="-14" r="30" fill={palette.secondary} />
          <circle cx="-14" cy="-44" r="32" fill={palette.primary} />
          <circle cx="20" cy="-40" r="34" fill={palette.primary} />
          <circle cx="2" cy="-18" r="30" fill={palette.primary} />
          <circle cx="8" cy="-62" r="18" fill={palette.accent} opacity="0.35" />
        </g>
      );
      break;
    default:
      top = (
        <g transform={`translate(0 ${-trunkH}) rotate(${lean})`}>
          <circle cx="-22" cy="-16" r="28" fill={palette.secondary} />
          <circle cx="22" cy="-16" r="28" fill={palette.secondary} />
          <circle cx="0" cy="-38" r="34" fill={palette.primary} />
          <circle cx="-10" cy="-52" r="14" fill={palette.accent} opacity="0.25" />
        </g>
      );
  }

  const showFruit = canopy !== 'conical' && canopy !== 'palm' && !wilted;
  return (
    <g>
      {trunk}
      {top}
      {showFruit && (
        <g opacity={detail} transform={`rotate(${lean})`}>
          {fruit.map((f, i) => (
            <circle
              key={i}
              cx={f.x}
              cy={f.y}
              r={canopy === 'broad' && palette.accent === '#9a7a3f' ? 3 : 4.5}
              fill={palette.accent}
            />
          ))}
        </g>
      )}
    </g>
  );
}
