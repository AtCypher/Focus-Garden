import type { Biome } from '@/types';
import type { Season } from '@/features/garden/daylight';

interface Props {
  biome: Biome;
  width: number;
  height: number;
  night: boolean;
  restoration: number;
}

/** Background props for a bed, drawn behind the plants: fences, a pond, rocks, a tree line. */
export function BedScenery({ biome, width, height, night, restoration }: Props) {
  const groundY = height - 64;
  const dim = night ? 0.6 : 1;
  const faded = restoration < 0.25;
  const o = (v: number) => (faded ? v * 0.5 : v);
  switch (biome) {
    case 'meadow':
      return (
        <g opacity={dim}>
          {[20, 60, 100, 140].map((x) => (
            <g key={x} opacity={o(0.9)}>
              <rect x={x} y={groundY - 22} width="4" height="24" rx="1" fill="#b98d63" />
            </g>
          ))}
          <path
            d={`M18 ${groundY - 16} H146 M18 ${groundY - 8} H146`}
            stroke="#a7764a"
            strokeWidth="3"
            opacity={o(0.9)}
          />
          {[260, 300, 340, 380].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={groundY - 30 - (i % 2) * 6}
              r="3"
              fill={['#f0a3c0', '#f3c969', '#a9dff0', '#e4779f'][i]}
              opacity={o(0.9)}
            />
          ))}
        </g>
      );
    case 'orchard':
      return (
        <g opacity={dim}>
          <path
            d={`M${width - 150} ${groundY - 10} H${width - 20}`}
            stroke="#a7764a"
            strokeWidth="3"
            opacity={o(1)}
          />
          {[width - 150, width - 110, width - 70, width - 30].map((x) => (
            <rect
              key={x}
              x={x}
              y={groundY - 26}
              width="4"
              height="26"
              fill="#b98d63"
              opacity={o(1)}
            />
          ))}
          <g transform={`translate(30 ${groundY - 6})`} opacity={o(1)}>
            <path d="M-14 0 h28 l-3 -14 h-22 Z" fill="#c9a24a" />
            <circle cx="-5" cy="-16" r="4" fill="#e4553f" />
            <circle cx="5" cy="-17" r="4" fill="#e4553f" />
          </g>
        </g>
      );
    case 'wetland':
      return (
        <g opacity={dim}>
          <ellipse
            cx={width - 80}
            cy={groundY - 2}
            rx="64"
            ry="14"
            fill={night ? '#2d4f72' : '#8ccfe8'}
            opacity={o(0.9)}
          />
          <ellipse
            cx={width - 90}
            cy={groundY - 4}
            rx="40"
            ry="8"
            fill={night ? '#3a6390' : '#a9dff0'}
            opacity={o(0.8)}
          />
          {[30, 42, 54].map((x, i) => (
            <path
              key={x}
              d={`M${x} ${groundY} q${i % 2 ? 3 : -3} -20 0 -36`}
              stroke="#5aa66a"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity={o(1)}
            />
          ))}
          <ellipse cx="42" cy={groundY - 36} rx="4" ry="9" fill="#8d5f3b" opacity={o(1)} />
        </g>
      );
    case 'forest':
      return (
        <g opacity={dim}>
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M${i * 48 + 10} ${groundY - 20} l22 -60 l22 60 Z`}
              fill={night ? '#1f3a2a' : '#3f6e3c'}
              opacity={o(0.5)}
            />
          ))}
          <g transform={`translate(${width - 40} ${groundY - 4})`} opacity={o(1)}>
            <ellipse cx="0" cy="0" rx="14" ry="6" fill="#6b4a3a" />
            <ellipse cx="0" cy="-3" rx="14" ry="6" fill="#8d5f3b" />
            <circle cx="0" cy="-3" r="7" fill="#c9a27a" />
          </g>
        </g>
      );
    case 'desert':
      return (
        <g opacity={dim}>
          <ellipse cx="60" cy={groundY - 4} rx="26" ry="12" fill="#c9a27a" opacity={o(1)} />
          <ellipse cx="88" cy={groundY - 2} rx="14" ry="7" fill="#b98d63" opacity={o(1)} />
          <path
            d={`M${width - 120} ${groundY - 30} q20 -30 40 0 q20 -24 48 -4`}
            stroke="#d9b989"
            strokeWidth="2"
            fill="none"
            opacity={o(0.8)}
          />
          <path
            d={`M${width - 60} ${groundY - 8} l-6 -30 M${width - 60} ${groundY - 20} l8 -6`}
            stroke="#6fa86a"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={o(1)}
          />
        </g>
      );
    case 'alpine':
      return (
        <g opacity={dim}>
          <path
            d={`M20 ${groundY - 10} l40 -70 l40 70 Z`}
            fill={night ? '#3b4a5e' : '#8fa3b5'}
            opacity={o(0.6)}
          />
          <path
            d={`M60 ${groundY - 80} l-12 22 l6 -4 l6 8 l6 -8 l6 4 Z`}
            fill="#f4f7fb"
            opacity={o(0.9)}
          />
          <ellipse cx={width - 60} cy={groundY - 4} rx="28" ry="10" fill="#9aa3a0" opacity={o(1)} />
          <ellipse
            cx={width - 66}
            cy={groundY - 10}
            rx="14"
            ry="6"
            fill="#f4f7fb"
            opacity={o(0.9)}
          />
        </g>
      );
    case 'tropical':
      return (
        <g opacity={dim}>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${20 + i * 26} ${groundY} Q${40 + i * 26} ${groundY - 60} ${80 + i * 26} ${groundY - 70} Q${50 + i * 26} ${groundY - 40} ${20 + i * 26} ${groundY} Z`}
              fill={i % 2 ? '#357f49' : '#4fae68'}
              opacity={o(0.8)}
            />
          ))}
          <circle cx={width - 50} cy={groundY - 46} r="6" fill="#e9c46a" opacity={o(1)} />
          <circle cx={width - 36} cy={groundY - 40} r="6" fill="#e9c46a" opacity={o(1)} />
        </g>
      );
  }
}

/** Seasonal weather on a bed: petals in spring, butterflies in summer, leaves in autumn, snow in winter. */
export function SeasonOverlay({
  season,
  width,
  height,
}: {
  season: Season;
  width: number;
  height: number;
}) {
  const n = 10;
  const items = Array.from({ length: n }, (_, i) => ({
    x: ((i * 97) % width) + 10,
    y: ((i * 61) % (height - 60)) + 10,
    d: (i % 5) * 0.6,
  }));
  if (season === 'winter')
    return (
      <g>
        <path
          d={`M0 ${height - 66} Q${width / 2} ${height - 84} ${width} ${height - 66} L${width} ${height - 58} Q${width / 2} ${height - 74} 0 ${height - 58} Z`}
          fill="#f4f7fb"
          opacity="0.85"
        />
        {items.map((p, i) => (
          <circle
            key={i}
            className="gd-fall"
            style={{ animationDelay: `${p.d}s` }}
            cx={p.x}
            cy={p.y}
            r={2 + (i % 2)}
            fill="#ffffff"
            opacity="0.9"
          />
        ))}
      </g>
    );
  if (season === 'autumn')
    return (
      <g>
        {items.map((p, i) => (
          <ellipse
            key={i}
            className="gd-fall"
            style={{ animationDelay: `${p.d}s` }}
            cx={p.x}
            cy={p.y}
            rx="4"
            ry="2.5"
            transform={`rotate(${i * 37} ${p.x} ${p.y})`}
            fill={['#e8872e', '#c4521f', '#f6c04a'][i % 3]}
            opacity="0.9"
          />
        ))}
      </g>
    );
  if (season === 'spring')
    return (
      <g>
        {items.slice(0, 7).map((p, i) => (
          <ellipse
            key={i}
            className="gd-fall"
            style={{ animationDelay: `${p.d}s` }}
            cx={p.x}
            cy={p.y}
            rx="3"
            ry="2"
            fill="#f6c6d8"
            opacity="0.9"
          />
        ))}
      </g>
    );
  return (
    <g>
      {items.slice(0, 3).map((p, i) => (
        <g
          key={i}
          className="gd-flutter"
          style={{ animationDelay: `${i * 0.7}s` }}
          transform={`translate(${p.x} ${p.y})`}
        >
          <path d="M0 0 q-6 -8 -10 -2 q-2 5 4 5 Z" fill={['#f0a3c0', '#f3c969', '#a9dff0'][i]} />
          <path d="M0 0 q6 -8 10 -2 q2 5 -4 5 Z" fill={['#e4779f', '#e9b23c', '#6cc4e2'][i]} />
        </g>
      ))}
    </g>
  );
}
