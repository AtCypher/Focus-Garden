/** Background and ambient scenery layers for the garden, keyed by garden features. */
import type { GardenFeature } from '@/data/gardenLevels';

interface Props {
  features: GardenFeature[];
  box: { minX: number; maxX: number; minY: number; maxY: number };
  night: boolean;
  /** Stable pseudo-random seed so ambient elements do not jump between renders. */
  seed?: number;
}

function series(n: number, seed: number) {
  const out: number[] = [];
  let s = seed || 1;
  for (let i = 0; i < n; i++) {
    s = (s * 48271) % 2147483647;
    out.push(s / 2147483647);
  }
  return out;
}

export function SceneryBack({ features, box, night, seed = 7 }: Props) {
  const w = box.maxX - box.minX;
  const has = (f: GardenFeature) => features.includes(f);
  const r = series(40, seed);
  const horizon = box.minY + 40;
  return (
    <g>
      {has('nightSky') && night && (
        <g>
          {r.slice(0, 24).map((v, i) => (
            <circle
              key={i}
              cx={box.minX + v * w}
              cy={box.minY - 120 + r[(i + 7) % 40] * 150}
              r={0.8 + (i % 3) * 0.5}
              fill="#fff"
              opacity={0.5 + (i % 4) * 0.12}
            />
          ))}
          <circle cx={box.maxX - 80} cy={box.minY - 90} r="16" fill="#f4f1e8" opacity="0.9" />
          <circle cx={box.maxX - 88} cy={box.minY - 96} r="14" fill="#1f2b4a" opacity="0.6" />
        </g>
      )}
      {has('hills') && (
        <g>
          <ellipse
            cx={box.minX + w * 0.25}
            cy={horizon}
            rx={w * 0.4}
            ry="60"
            fill={night ? '#2f4a3a' : '#9bc48a'}
          />
          <ellipse
            cx={box.minX + w * 0.72}
            cy={horizon + 6}
            rx={w * 0.42}
            ry="52"
            fill={night ? '#27402f' : '#86b377'}
          />
        </g>
      )}
      {has('snowcaps') && (
        <g>
          <path
            d={`M${box.minX + w * 0.55} ${horizon} l60 -110 l60 110 Z`}
            fill={night ? '#3b4a5e' : '#8fa3b5'}
          />
          <path
            d={`M${box.minX + w * 0.55 + 60} ${horizon - 110} l-18 34 l10 -6 l8 10 l8 -10 l10 6 Z`}
            fill="#f4f7fb"
          />
          <path
            d={`M${box.minX + w * 0.68} ${horizon} l48 -84 l48 84 Z`}
            fill={night ? '#34435a' : '#7d91a5'}
          />
          <path
            d={`M${box.minX + w * 0.68 + 48} ${horizon - 84} l-14 26 l8 -4 l6 8 l6 -8 l8 4 Z`}
            fill="#f4f7fb"
          />
        </g>
      )}
      {has('stream') && (
        <path
          d={`M${box.minX - 20} ${horizon + 20} C${box.minX + w * 0.3} ${horizon + 50}, ${box.minX + w * 0.5} ${horizon - 10}, ${box.maxX + 20} ${horizon + 30}`}
          stroke={night ? '#3f5f8a' : '#7fc3e0'}
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
      )}
      {has('birds') && !night && (
        <g
          className="gd-drift"
          fill="none"
          stroke="#3b4a3e"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d={`M${box.minX + w * 0.3} ${box.minY - 40} q6 -6 12 0 q6 -6 12 0`} />
          <path d={`M${box.minX + w * 0.36} ${box.minY - 26} q5 -5 10 0 q5 -5 10 0`} />
          <path d={`M${box.minX + w * 0.42} ${box.minY - 48} q5 -5 10 0 q5 -5 10 0`} />
        </g>
      )}
    </g>
  );
}

export function SceneryFront({ features, box, night, seed = 11 }: Props) {
  const w = box.maxX - box.minX;
  const has = (f: GardenFeature) => features.includes(f);
  const r = series(30, seed);
  return (
    <g>
      {has('pond') && (
        <g transform={`translate(${box.maxX - 70} ${box.maxY - 30})`}>
          <ellipse cx="0" cy="0" rx="58" ry="26" fill={night ? '#2d4f72' : '#8ccfe8'} />
          <ellipse
            cx="-8"
            cy="-4"
            rx="40"
            ry="16"
            fill={night ? '#3a6390' : '#a9dff0'}
            opacity="0.8"
          />
          <ellipse cx="18" cy="6" rx="8" ry="4" fill="#5aa66a" />
          <ellipse cx="-24" cy="8" rx="7" ry="3.5" fill="#5aa66a" />
          <circle cx="-22" cy="6" r="2.5" fill="#f6c6d8" />
        </g>
      )}
      {has('path') && (
        <g fill="#d8c3a0" stroke="#c3ab83" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse
              key={i}
              cx={box.minX + 20 + i * 26}
              cy={box.maxY + 10 + Math.sin(i) * 6 - i * 4}
              rx="12"
              ry="6"
            />
          ))}
        </g>
      )}
      {has('butterflies') && !night && (
        <g>
          {[0, 1, 2].map((i) => (
            <g
              key={i}
              className="gd-flutter"
              style={{ animationDelay: `${i * 0.7}s` }}
              transform={`translate(${box.minX + 40 + r[i] * (w - 80)} ${box.minY + 20 + r[i + 5] * 60})`}
            >
              <path
                d="M0 0 q-6 -8 -10 -2 q-2 5 4 5 Z"
                fill={['#f0a3c0', '#f3c969', '#a9dff0'][i]}
              />
              <path d="M0 0 q6 -8 10 -2 q2 5 -4 5 Z" fill={['#e4779f', '#e9b23c', '#6cc4e2'][i]} />
            </g>
          ))}
        </g>
      )}
      {has('fireflies') && night && (
        <g>
          {r.slice(10, 22).map((v, i) => (
            <circle
              key={i}
              className="gd-glow"
              style={{ animationDelay: `${(i % 5) * 0.5}s` }}
              cx={box.minX + 20 + v * (w - 40)}
              cy={box.minY + 10 + r[(i + 3) % 30] * (box.maxY - box.minY - 20)}
              r="2"
              fill="#f3e58a"
            />
          ))}
        </g>
      )}
    </g>
  );
}
