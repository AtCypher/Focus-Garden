/** Small icons for Pip's finds. Drawn in a 40x40 box. */
export function FindArt({
  id,
  size = 40,
  className = '',
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden>
      {art(id)}
    </svg>
  );
}

function art(id: string) {
  switch (id) {
    case 'feather':
      return (
        <g>
          <path d="M10 32 C14 18 22 10 32 8 C30 18 24 28 12 32 Z" fill="#9aa39c" />
          <path d="M11 31 L30 10" stroke="#5b6b5e" strokeWidth="1.5" />
        </g>
      );
    case 'stone':
      return <ellipse cx="20" cy="22" rx="13" ry="9" fill="#a7a9a3" />;
    case 'acorn':
      return (
        <g>
          <ellipse cx="20" cy="24" rx="8" ry="10" fill="#a7764a" />
          <path d="M10 18 Q20 10 30 18 Q20 22 10 18Z" fill="#6b4a3a" />
          <path d="M20 10 v-4" stroke="#6b4a3a" strokeWidth="2" />
        </g>
      );
    case 'shell':
      return (
        <g>
          <circle cx="20" cy="21" r="11" fill="#e2d0b4" />
          <path
            d="M20 21 m-7 0 a7 7 0 1 1 14 0 a4 4 0 1 1 -8 0 a2 2 0 1 1 4 0"
            stroke="#b98d63"
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      );
    case 'pinecone':
      return (
        <g fill="#8d5f3b">
          <ellipse cx="20" cy="22" rx="8" ry="12" />
          {[14, 19, 24, 29].map((y) => (
            <path
              key={y}
              d={`M13 ${y} q7 -3 14 0`}
              stroke="#5d3e2b"
              strokeWidth="1.5"
              fill="none"
            />
          ))}
        </g>
      );
    case 'button':
      return (
        <g>
          <circle cx="20" cy="20" r="11" fill="#c9a24a" />
          <circle cx="16" cy="18" r="1.5" fill="#7a5c1a" />
          <circle cx="24" cy="18" r="1.5" fill="#7a5c1a" />
          <circle cx="16" cy="23" r="1.5" fill="#7a5c1a" />
          <circle cx="24" cy="23" r="1.5" fill="#7a5c1a" />
        </g>
      );
    case 'marble':
      return (
        <g>
          <circle cx="20" cy="20" r="11" fill="#6cc4e2" />
          <path d="M12 16 q8 -8 16 2" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.7" />
        </g>
      );
    case 'seedpacket':
      return (
        <g>
          <rect x="11" y="8" width="18" height="24" rx="2" fill="#f1e8da" stroke="#b98d63" />
          <circle cx="20" cy="19" r="5" fill="#9ccb6b" />
        </g>
      );
    case 'bottlecap':
      return (
        <g>
          <circle cx="20" cy="20" r="11" fill="#e4553f" />
          <circle cx="20" cy="20" r="7" fill="#f4f1e8" />
        </g>
      );
    case 'key':
      return (
        <g stroke="#c9a24a" strokeWidth="3" fill="none" strokeLinecap="round">
          <circle cx="14" cy="16" r="5" />
          <path d="M18 19 l12 12 M26 27 l3 -3 M23 24 l3 -3" />
        </g>
      );
    case 'clover':
      return (
        <g fill="#5b8c48">
          <circle cx="15" cy="15" r="6" />
          <circle cx="25" cy="15" r="6" />
          <circle cx="15" cy="25" r="6" />
          <circle cx="25" cy="25" r="6" />
          <path d="M20 26 v8" stroke="#457036" strokeWidth="2" />
        </g>
      );
    case 'egg':
      return (
        <g>
          <path d="M12 24 a8 10 0 0 1 16 0 l-3 4 l-3 -3 l-2 3 l-3 -3 l-2 3 Z" fill="#a9dff0" />
          <circle cx="17" cy="22" r="1" fill="#6cc4e2" />
          <circle cx="23" cy="24" r="1" fill="#6cc4e2" />
        </g>
      );
    default:
      return <circle cx="20" cy="20" r="8" fill="#9aa39c" />;
  }
}
