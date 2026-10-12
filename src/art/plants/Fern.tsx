import { num, type FormProps } from './common';

export function Fern({ palette, params, detail, wilted }: FormProps) {
  const fronds = num(params, 'fronds', 5);
  const total = fronds + Math.round(detail * 2);
  const droop = wilted ? 35 : 0;
  return (
    <g>
      {Array.from({ length: total }, (_, i) => {
        const a = -70 + (140 / (total - 1)) * i + (wilted ? (i % 2 ? 6 : -6) : 0);
        const len = 80 + Math.cos(((i - (total - 1) / 2) / total) * Math.PI) * 40;
        const fill = i % 2 ? palette.primary : palette.secondary;
        return (
          <g key={i} transform={`rotate(${a + (a > 0 ? droop : -droop)})`}>
            <path
              d={`M0 0 C-10 ${-len * 0.3} -12 ${-len * 0.7} 0 ${-len} C12 ${-len * 0.7} 10 ${-len * 0.3} 0 0 Z`}
              fill={fill}
            />
            {[0.2, 0.35, 0.5, 0.65, 0.8].map((t) => (
              <path
                key={t}
                d={`M0 ${-len * t} l-9 ${-6} M0 ${-len * t} l9 ${-6}`}
                stroke={palette.accent}
                strokeWidth="1.2"
                opacity="0.6"
              />
            ))}
            <path d={`M0 0 L0 ${-len}`} stroke={palette.stem} strokeWidth="1.5" opacity="0.6" />
          </g>
        );
      })}
    </g>
  );
}
