export type CompanionMood =
  'idle' | 'watering' | 'humming' | 'dozing' | 'sad' | 'happy' | 'worried';

export interface CompanionProps {
  mood?: CompanionMood;
  outfitId?: string;
  size?: number;
  className?: string;
  /** Accessible name, e.g. "Pip, watering". */
  label?: string;
}

const BODY = '#cfe8a8';
const BODY_SHADE = '#a9cf7c';
const LEAF = '#5b8c48';
const LEAF_DARK = '#457036';
const INK = '#2a3a2c';
const CAN = '#7fa6b8';
const CAN_DARK = '#5e8698';

/**
 * Pip, the gardener: a round seedling sprite with a watering can. Original design.
 * Animations are CSS classes defined in styles.css (cmp-*) and stop under prefers-reduced-motion.
 */
export function Companion({
  mood = 'idle',
  outfitId = 'none',
  size = 120,
  className = '',
  label,
}: CompanionProps) {
  const eyesClosed = mood === 'dozing';
  const sad = mood === 'sad';
  const worried = mood === 'worried';
  const happy = mood === 'happy';
  const bodyAnim =
    mood === 'happy'
      ? 'cmp-bounce'
      : mood === 'dozing'
        ? 'cmp-breathe'
        : mood === 'sad'
          ? ''
          : 'cmp-bob';

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={label ?? `Companion, ${mood}`}
      overflow="visible"
    >
      {/* shadow */}
      <ellipse cx="60" cy="106" rx="26" ry="5" fill="#000" opacity="0.08" />

      <g className={bodyAnim} style={{ transformOrigin: '60px 100px' }}>
        {/* feet */}
        <ellipse cx="48" cy="102" rx="9" ry="4" fill={BODY_SHADE} />
        <ellipse cx="72" cy="102" rx="9" ry="4" fill={BODY_SHADE} />

        {/* body */}
        <ellipse cx="60" cy="72" rx="32" ry="30" fill={BODY} />
        <path d="M34 80 Q60 110 86 80 Q60 96 34 80Z" fill={BODY_SHADE} opacity="0.7" />

        {/* sprout on head */}
        <g
          className={sad || worried ? 'cmp-droop' : ''}
          style={{ transformOrigin: '60px 44px' }}
          opacity={outfitId === 'beanie' ? 0 : 1}
        >
          <path
            d="M60 44 Q58 30 60 22"
            stroke={LEAF_DARK}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M60 30 Q48 26 46 16 Q58 16 60 30Z" fill={LEAF} />
          <path d="M60 26 Q70 20 74 10 Q62 12 60 26Z" fill={LEAF_DARK} />
        </g>

        {/* outfit */}
        {outfitId === 'strawhat' && (
          <g>
            <ellipse cx="60" cy="46" rx="30" ry="7" fill="#e3c27a" />
            <path d="M44 46 Q46 30 60 30 Q74 30 76 46Z" fill="#edd39a" />
            <path d="M46 42 h28" stroke="#c9507c" strokeWidth="3" />
          </g>
        )}
        {outfitId === 'scarf' && (
          <path d="M34 82 Q60 96 86 82 L84 90 Q60 104 36 90Z" fill="#e4779f" />
        )}
        {outfitId === 'beanie' && (
          <g>
            <path d="M34 50 Q36 26 60 26 Q84 26 86 50 Z" fill="#3ea6cd" />
            <rect x="32" y="46" width="56" height="8" rx="4" fill="#2d85a7" />
            <circle cx="60" cy="24" r="4" fill="#f4f1e8" />
          </g>
        )}
        {outfitId === 'glasses' && (
          <g fill="none" stroke={INK} strokeWidth="1.8">
            <circle cx="49" cy="66" r="7" />
            <circle cx="71" cy="66" r="7" />
            <path d="M56 66 h8" />
          </g>
        )}

        {/* eyes */}
        {eyesClosed ? (
          <g stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M44 66 q5 3 10 0" />
            <path d="M66 66 q5 3 10 0" />
          </g>
        ) : (
          <g fill={INK}>
            <circle cx="49" cy={worried ? 65 : 66} r={happy ? 3.6 : 3} />
            <circle cx="71" cy={worried ? 65 : 66} r={happy ? 3.6 : 3} />
            <circle cx="50" cy="65" r="1" fill="#fff" />
            <circle cx="72" cy="65" r="1" fill="#fff" />
          </g>
        )}
        {worried && (
          <g stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none">
            <path d="M44 58 l8 2" />
            <path d="M76 58 l-8 2" />
          </g>
        )}
        {/* blush */}
        <circle cx="42" cy="74" r="4" fill="#f0a3c0" opacity={sad ? 0.3 : 0.55} />
        <circle cx="78" cy="74" r="4" fill="#f0a3c0" opacity={sad ? 0.3 : 0.55} />
        {/* mouth */}
        {sad ? (
          <path
            d="M54 82 q6 -4 12 0"
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        ) : happy ? (
          <path d="M52 78 q8 9 16 0 Z" fill={INK} />
        ) : worried ? (
          <path d="M55 80 h10" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path
            d="M54 78 q6 5 12 0"
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* watering can in the right hand */}
        <g
          className={mood === 'watering' ? 'cmp-pour' : ''}
          style={{ transformOrigin: '92px 86px' }}
        >
          <path d="M84 78 h18 v14 a4 4 0 0 1 -4 4 h-10 a4 4 0 0 1 -4 -4Z" fill={CAN} />
          <path d="M84 84 l-8 -8 l3 -3 l8 8Z" fill={CAN_DARK} />
          <path d="M90 78 q3 -8 8 0" stroke={CAN_DARK} strokeWidth="2.5" fill="none" />
          <circle cx="76" cy="74" r="3" fill={CAN_DARK} />
          {mood === 'watering' && (
            <g fill="#6cc4e2">
              <circle className="cmp-drop" cx="72" cy="80" r="1.8" />
              <circle className="cmp-drop cmp-delay-1" cx="68" cy="78" r="1.5" />
              <circle className="cmp-drop cmp-delay-2" cx="75" cy="84" r="1.4" />
            </g>
          )}
        </g>
      </g>

      {/* humming notes */}
      {mood === 'humming' && (
        <g fill={LEAF_DARK} fontSize="12" fontFamily="serif">
          <text className="cmp-float" x="90" y="52">
            ♪
          </text>
          <text className="cmp-float cmp-delay-1" x="98" y="40">
            ♫
          </text>
        </g>
      )}
      {mood === 'dozing' && (
        <g fill={INK} fontSize="11" fontFamily="sans-serif" opacity="0.7">
          <text className="cmp-float" x="88" y="48">
            z
          </text>
          <text className="cmp-float cmp-delay-1" x="96" y="38">
            z
          </text>
        </g>
      )}
      {happy && (
        <g fill="#f3c969">
          <path className="cmp-twinkle" d="M20 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z" />
          <path
            className="cmp-twinkle cmp-delay-1"
            d="M100 30 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5Z"
          />
        </g>
      )}
    </svg>
  );
}
