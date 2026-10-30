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
    case 'pumpkin':
      return (
        <g>
          <ellipse cx="0" cy="-10" rx="18" ry="14" fill="#e8872e" />
          <path
            d="M-8 -22 Q-8 -2 -8 2 M0 -24 V3 M8 -22 Q8 -2 8 2"
            stroke="#c96a1a"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M0 -24 q2 -8 8 -9"
            stroke="#5e8c3a"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="14" cy="-2" rx="9" ry="7" fill="#f0a24a" />
        </g>
      );
    case 'snowman':
      return (
        <g>
          <circle cx="0" cy="-10" r="14" fill="#f6f9fc" />
          <circle cx="0" cy="-30" r="10" fill="#f6f9fc" />
          <circle cx="-3" cy="-32" r="1.5" fill="#2a3a2c" />
          <circle cx="3" cy="-32" r="1.5" fill="#2a3a2c" />
          <path d="M0 -29 l7 2 -7 2 Z" fill="#e8872e" />
          <path
            d="M-12 -40 h24 M-8 -40 v-8 h16 v8"
            stroke="#2a3a2c"
            strokeWidth="3"
            fill="#2a3a2c"
          />
          <path d="M-8 -22 q8 4 16 0" stroke="#c9507c" strokeWidth="3" fill="none" />
        </g>
      );
    case 'maypole':
      return (
        <g>
          <rect x="-2" y="-64" width="4" height="64" fill="#b98d63" />
          <circle cx="0" cy="-64" r="5" fill="#f0a3c0" />
          {['#e4779f', '#3ea6cd', '#e9b23c', '#5b8c48'].map((c, i) => (
            <path
              key={c}
              d={`M0 -62 Q${(i - 1.5) * 14} -30 ${(i - 1.5) * 18} 0`}
              stroke={c}
              strokeWidth="2.5"
              fill="none"
            />
          ))}
        </g>
      );
    case 'bonfire':
      return (
        <g>
          <path
            d="M-18 0 l10 -6 M18 0 l-10 -6 M-14 2 l28 -4"
            stroke="#714a30"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M0 -6 C-14 -16 -8 -30 0 -40 C8 -30 14 -16 0 -6 Z" fill="#e8872e" />
          <path d="M0 -8 C-7 -14 -4 -24 0 -30 C4 -24 7 -14 0 -8 Z" fill="#f3c969" />
          <ellipse cx="0" cy="2" rx="24" ry="10" fill="#ffd166" opacity="0.25" />
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
