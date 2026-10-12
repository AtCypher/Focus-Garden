import { num, str, type FormProps } from './common';

export function Flower({ palette, params, detail, wilted }: FormProps) {
  const petals = num(params, 'petals', 8);
  const shape = str(params, 'petal', 'round');
  const stemH = 95;
  const droop = wilted ? 55 : 0;
  const headY = -stemH;
  const open = detail; // 0 = bud, 1 = open flower
  const petalLen = shape === 'cup' ? 26 : 24;

  const petal = (i: number) => {
    const angle = (360 / petals) * i;
    const spread = 6 + open * (petalLen - 6);
    const fill = i % 2 ? palette.primary : palette.secondary;
    switch (shape) {
      case 'pointed':
        return (
          <path
            key={i}
            d={`M0 0 L-6 ${-spread * 0.45} L0 ${-spread} L6 ${-spread * 0.45} Z`}
            transform={`rotate(${angle})`}
            fill={fill}
          />
        );
      case 'cup':
        return (
          <circle
            key={i}
            cx="0"
            cy={-spread * 0.55}
            r={8 + open * 8}
            transform={`rotate(${angle})`}
            fill={fill}
            opacity="0.95"
          />
        );
      default:
        return (
          <ellipse
            key={i}
            cx="0"
            cy={-spread * 0.6}
            rx={5 + open * 3}
            ry={spread * 0.6}
            transform={`rotate(${angle})`}
            fill={fill}
          />
        );
    }
  };

  return (
    <g>
      <path
        d={`M0 0 Q${wilted ? -14 : 4} ${-stemH * 0.5} 0 ${-stemH}`}
        stroke={palette.stem}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <g transform="translate(0 -34) rotate(-40)">
        <ellipse cx="-16" cy="0" rx="17" ry="7" fill={palette.stem} />
      </g>
      <g transform="translate(0 -56) rotate(40)">
        <ellipse cx="16" cy="0" rx="15" ry="6" fill={palette.stem} opacity="0.9" />
      </g>
      <g transform={`translate(0 ${headY}) rotate(${droop})`}>
        <g transform={`translate(0 ${wilted ? 10 : 0})`}>
          {Array.from({ length: petals }, (_, i) => petal(i))}
          <circle cx="0" cy="0" r={6 + open * 5} fill={palette.accent} />
          <circle cx="-2" cy="-2" r={2 + open * 1.5} fill="#ffffff" opacity="0.35" />
        </g>
      </g>
    </g>
  );
}
