import type { DecorationKind } from '@/types';

/** Small isometric-ish decorations drawn around (0,0) = tile centre on the ground. */
export function DecorationArt({ kind }: { kind: DecorationKind }) {
  switch (kind) {
    case 'bench':
      return (
        <g>
          <rect x="-18" y="-14" width="36" height="6" rx="2" fill="#a7764a" />
          <rect x="-18" y="-24" width="36" height="5" rx="2" fill="#b98d63" />
          <path d="M-14 -8 v8 M14 -8 v8 M-14 -19 v5 M14 -19 v5" stroke="#714a30" strokeWidth="3" />
        </g>
      );
    case 'lantern':
      return (
        <g>
          <rect x="-2" y="-40" width="4" height="40" fill="#5d3e2b" />
          <rect x="-8" y="-50" width="16" height="14" rx="3" fill="#e9b23c" />
          <rect x="-6" y="-48" width="12" height="10" rx="2" fill="#fff3c4" />
          <path d="M-9 -50 h18 l-3 -5 h-12 Z" fill="#5d3e2b" />
          <ellipse cx="0" cy="0" rx="18" ry="9" fill="#ffe08a" opacity="0.35" />
        </g>
      );
    case 'path':
      return (
        <g>
          <path d="M-30 0 L0 -15 L30 0 L0 15 Z" fill="#d8c3a0" />
          <circle cx="-8" cy="-2" r="3" fill="#c3ab83" />
          <circle cx="8" cy="3" r="3.5" fill="#c3ab83" />
          <circle cx="0" cy="-8" r="2.5" fill="#c3ab83" />
        </g>
      );
    case 'fence':
      return (
        <g>
          {[-22, -8, 6, 20].map((x) => (
            <rect
              key={x}
              x={x}
              y={-24 + Math.abs(x) * 0.2}
              width="4"
              height="24"
              rx="1"
              fill="#b98d63"
            />
          ))}
          <path d="M-22 -18 L24 -10 M-22 -9 L24 -1" stroke="#a7764a" strokeWidth="3" />
        </g>
      );
    case 'rock':
      return (
        <g>
          <ellipse cx="2" cy="-2" rx="18" ry="11" fill="#9aa3a0" />
          <path d="M-14 -4 Q-6 -20 10 -14 Q20 -8 14 -2 Z" fill="#b7bfbb" />
          <ellipse cx="-14" cy="2" rx="7" ry="4" fill="#8e9794" />
        </g>
      );
    case 'shed':
      return (
        <g>
          <path d="M-28 -6 L0 8 L0 -34 L-28 -48 Z" fill="#b98d63" />
          <path d="M0 8 L28 -6 L28 -48 L0 -34 Z" fill="#a7764a" />
          <path d="M-32 -46 L0 -30 L32 -46 L0 -62 Z" fill="#714a30" />
          <path d="M-32 -46 L0 -30 L0 -36 L-30 -51 Z" fill="#5d3e2b" />
          <rect x="8" y="-32" width="10" height="20" transform="skewY(-26)" fill="#5d3e2b" />
          <rect x="-22" y="-30" width="8" height="8" transform="skewY(26)" fill="#bfe0f7" />
        </g>
      );
    case 'birdbath':
      return (
        <g>
          <ellipse cx="0" cy="-4" rx="10" ry="4" fill="#8e9794" />
          <rect x="-3" y="-26" width="6" height="22" fill="#9aa3a0" />
          <ellipse cx="0" cy="-28" rx="18" ry="7" fill="#b7bfbb" />
          <ellipse cx="0" cy="-29" rx="13" ry="4.5" fill="#7fc3e0" />
        </g>
      );
  }
}
