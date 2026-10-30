/** Tiny wildlife sprites for the garden. Drawn around (0,0) = the ground point of a tile. */
export function VisitorArt({ id, className = '' }: { id: string; className?: string }) {
  switch (id) {
    case 'bee':
      return (
        <g className={className} transform="translate(0 -28)">
          <ellipse cx="0" cy="0" rx="5" ry="3.5" fill="#f3c969" />
          <path d="M-2 -3 v6 M1 -3 v6" stroke="#2a3a2c" strokeWidth="1.2" />
          <ellipse cx="-2" cy="-4" rx="3" ry="2" fill="#ffffff" opacity="0.8" />
          <ellipse cx="2" cy="-4" rx="3" ry="2" fill="#ffffff" opacity="0.8" />
        </g>
      );
    case 'hedgehog':
      return (
        <g>
          <ellipse cx="0" cy="-5" rx="9" ry="6" fill="#7a5c3a" />
          <path
            d="M-8 -8 l2 -4 l2 4 l2 -4 l2 4 l2 -4 l2 4"
            stroke="#4d3425"
            strokeWidth="1.5"
            fill="none"
          />
          <ellipse cx="8" cy="-3" rx="4" ry="2.5" fill="#c9a27a" />
          <circle cx="11" cy="-3" r="1" fill="#2a3a2c" />
        </g>
      );
    case 'robin':
      return (
        <g transform="translate(0 -4)">
          <ellipse cx="0" cy="-5" rx="5" ry="4" fill="#8a6f52" />
          <circle cx="4" cy="-8" r="3" fill="#8a6f52" />
          <ellipse cx="1" cy="-4" rx="3" ry="2.5" fill="#e4553f" />
          <path d="M7 -8 l3 1 -3 1Z" fill="#e9b23c" />
          <path d="M-1 -1 v3 M2 -1 v3" stroke="#2a3a2c" strokeWidth="1" />
        </g>
      );
    case 'squirrel':
      return (
        <g>
          <ellipse cx="0" cy="-6" rx="5" ry="5" fill="#c4521f" />
          <circle cx="5" cy="-10" r="3" fill="#c4521f" />
          <path d="M-5 -8 q-8 -8 -2 -16 q4 6 3 12" fill="#c4521f" />
          <circle cx="6" cy="-11" r="0.8" fill="#2a3a2c" />
        </g>
      );
    case 'frog':
      return (
        <g>
          <ellipse cx="0" cy="-4" rx="6" ry="4" fill="#5aa66a" />
          <circle cx="-3" cy="-8" r="2" fill="#5aa66a" />
          <circle cx="3" cy="-8" r="2" fill="#5aa66a" />
          <circle cx="-3" cy="-8" r="0.8" fill="#2a3a2c" />
          <circle cx="3" cy="-8" r="0.8" fill="#2a3a2c" />
        </g>
      );
    case 'heron':
      return (
        <g>
          <ellipse cx="0" cy="-12" rx="6" ry="4" fill="#8fa3b5" />
          <path d="M4 -14 q4 -10 2 -20" stroke="#8fa3b5" strokeWidth="2.5" fill="none" />
          <circle cx="6" cy="-34" r="2.5" fill="#8fa3b5" />
          <path d="M8 -34 l6 1 -6 1Z" fill="#e9b23c" />
          <path d="M-1 -8 v8 M2 -8 v8" stroke="#2a3a2c" strokeWidth="1" />
        </g>
      );
    case 'fox':
      return (
        <g>
          <ellipse cx="0" cy="-6" rx="9" ry="5" fill="#e8872e" />
          <circle cx="8" cy="-10" r="4" fill="#e8872e" />
          <path d="M6 -13 l1 -4 l2 3 M9 -13 l2 -4 l1 4" fill="#e8872e" />
          <path
            d="M-8 -6 q-8 2 -6 8"
            stroke="#e8872e"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="10" cy="-10" r="0.8" fill="#2a3a2c" />
        </g>
      );
    case 'deer':
      return (
        <g>
          <ellipse cx="0" cy="-14" rx="10" ry="6" fill="#b98d63" />
          <path d="M-7 -9 v9 M-3 -9 v9 M3 -9 v9 M7 -9 v9" stroke="#8d5f3b" strokeWidth="2" />
          <path
            d="M8 -16 q4 -6 2 -12"
            stroke="#b98d63"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="11" cy="-28" r="3.5" fill="#b98d63" />
          <path d="M10 -31 l-2 -6 M12 -31 l2 -6" stroke="#6b4a3a" strokeWidth="1.5" />
        </g>
      );
    case 'owl':
      return (
        <g transform="translate(0 -30)">
          <ellipse cx="0" cy="0" rx="6" ry="8" fill="#7a5c3a" />
          <circle cx="-2.5" cy="-3" r="2.2" fill="#f4f1e8" />
          <circle cx="2.5" cy="-3" r="2.2" fill="#f4f1e8" />
          <circle cx="-2.5" cy="-3" r="1" fill="#2a3a2c" />
          <circle cx="2.5" cy="-3" r="1" fill="#2a3a2c" />
          <path d="M0 -1 l1.5 2 -3 0Z" fill="#e9b23c" />
        </g>
      );
    case 'lizard':
      return (
        <g>
          <path
            d="M-10 -2 q6 -6 12 -2 q4 2 8 -2"
            stroke="#7fb57a"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="11" cy="-5" r="2.5" fill="#7fb57a" />
        </g>
      );
    case 'goat':
      return (
        <g>
          <ellipse cx="0" cy="-12" rx="9" ry="6" fill="#f4f1e8" />
          <path d="M-6 -8 v8 M-2 -8 v8 M2 -8 v8 M6 -8 v8" stroke="#c9c4ba" strokeWidth="2" />
          <circle cx="10" cy="-18" r="4" fill="#f4f1e8" />
          <path
            d="M9 -21 q-2 -5 1 -7 M12 -21 q2 -5 -1 -7"
            stroke="#8d8f85"
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      );
    case 'parrot':
      return (
        <g transform="translate(0 -26)">
          <ellipse cx="0" cy="0" rx="4" ry="7" fill="#e4553f" />
          <circle cx="1" cy="-7" r="3" fill="#e4553f" />
          <path d="M-2 2 q-5 6 -3 12" stroke="#3ea6cd" strokeWidth="2.5" fill="none" />
          <path d="M3 -8 l4 1 -4 2Z" fill="#2a3a2c" />
          <ellipse cx="-1" cy="0" rx="2" ry="4" fill="#f3c969" />
        </g>
      );
    default:
      return null;
  }
}
