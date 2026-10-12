/**
 * Grove data model. Everything persisted in IndexedDB is described here.
 * Keep this file framework-free: it is shared by the pure session engine, the storage layer and
 * the UI, and a future native wrapper or sync backend should be able to reuse it unchanged.
 */

/** ISO-8601 timestamp string, always UTC ("2026-10-12T20:59:00.000Z"). */
export type ISODate = string;

/** Local calendar day key, "YYYY-MM-DD" in the user's time zone. */
export type DayKey = string;

export type TimerMode = 'countdown' | 'pomodoro' | 'stopwatch';

export type Strictness = 'gentle' | 'standard' | 'deep';

export type SessionOutcome = 'completed' | 'wilted' | 'cancelled';

export type Biome = 'meadow' | 'orchard' | 'wetland' | 'forest' | 'desert' | 'alpine' | 'tropical';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

/** Size variant of a grown plant, decided by session length. */
export type PlantVariant = 'standard' | 'mature' | 'ancient';

export type GrowthStage = 'seed' | 'sprout' | 'sapling' | 'full';

export interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Number of focus blocks before a long break. */
  roundsBeforeLongBreak: number;
}

export interface Session {
  id: string;
  startedAt: ISODate;
  endedAt: ISODate;
  /** Minutes the user planned to focus (for stopwatch: 0). */
  plannedMinutes: number;
  /** Minutes actually focused, excluding pauses. Rounded down to whole minutes. */
  actualMinutes: number;
  mode: TimerMode;
  strictness: Strictness;
  speciesId: string;
  tagId: string | null;
  outcome: SessionOutcome;
  note: string;
  /** Dew earned by this session (0 for wilted/cancelled). */
  dewEarned: number;
  /** Pomodoro round number (1-based) when mode is pomodoro, else null. */
  round: number | null;
}

export interface TilePosition {
  col: number;
  row: number;
}

export interface Plant {
  id: string;
  sessionId: string;
  speciesId: string;
  variant: PlantVariant;
  biome: Biome;
  wilted: boolean;
  grownAt: ISODate;
  /** Null when the biome was full at the time of growing (shown as overflow). */
  tile: TilePosition | null;
}

export type UnlockCondition =
  | { kind: 'starter' }
  | { kind: 'dew'; cost: number }
  | { kind: 'totalHours'; hours: number }
  | { kind: 'streak'; days: number }
  | { kind: 'sessionMinutes'; minutes: number }
  | { kind: 'sessions'; count: number }
  | { kind: 'gardenLevel'; level: number };

/** How the species is drawn. Each form is a parametric SVG renderer in src/art. */
export type ArtForm = 'tree' | 'flower' | 'shrub' | 'cactus' | 'mushroom' | 'fern';

export interface SpeciesPalette {
  /** Main foliage / petal colour. */
  primary: string;
  /** Darker shade of the foliage. */
  secondary: string;
  /** Highlight, bloom or fruit colour. */
  accent: string;
  /** Trunk, stem or stalk colour. */
  stem: string;
}

export interface Species {
  id: string;
  name: string;
  biome: Biome;
  rarity: Rarity;
  unlock: UnlockCondition;
  /** Dew cost to buy. 0 when the species unlocks by milestone or is a starter. */
  dewCost: number;
  flavour: string;
  form: ArtForm;
  palette: SpeciesPalette;
  /** Form-specific shape tweaks, e.g. { canopy: 'conical' }. Optional. */
  params?: Record<string, string | number>;
}

export interface Tag {
  id: string;
  name: string;
  /** Hex colour. */
  color: string;
  createdAt: ISODate;
}

export type DecorationKind = 'bench' | 'lantern' | 'path' | 'fence' | 'rock' | 'shed' | 'birdbath';

export interface Decoration {
  id: string;
  kind: DecorationKind;
  tile: TilePosition;
  placedAt: ISODate;
}

export interface Wallet {
  dew: number;
  /** Lifetime dew earned (never decreases). */
  totalEarned: number;
  ownedSpeciesIds: string[];
  /** Decoration kinds purchased; each purchase lets the user place one decoration. */
  ownedDecorations: Partial<Record<DecorationKind, number>>;
  ownedOutfitIds: string[];
  streakFreezes: number;
}

export type ThemePreference = 'system' | 'light' | 'dark';

export type AmbientSound = 'none' | 'rain' | 'forest' | 'cafe' | 'stream' | 'brown';

export interface Settings {
  companionName: string;
  companionOutfitId: string;
  defaultStrictness: Strictness;
  defaultMode: TimerMode;
  defaultMinutes: number;
  defaultSpeciesId: string;
  defaultTagId: string | null;
  pomodoro: PomodoroConfig;
  dailyGoalMinutes: number;
  theme: ThemePreference;
  seasons: boolean;
  ambientSound: AmbientSound;
  ambientVolume: number;
  chime: boolean;
  haptics: boolean;
  wakeLock: boolean;
  notifications: boolean;
  onboardingDone: boolean;
}

export interface AchievementProgress {
  id: string;
  /** Current progress value, in the unit of the achievement target. */
  value: number;
  unlockedAt: ISODate | null;
}

/** Streak state derived from sessions but persisted so freezes are remembered. */
export interface StreakState {
  current: number;
  best: number;
  /** Day keys on which a streak freeze was consumed. */
  frozenDays: DayKey[];
  /** Day key of the last evaluated day. */
  lastEvaluated: DayKey | null;
}

/** Shape of the exported JSON file. */
export interface ExportFile {
  app: 'grove';
  schemaVersion: number;
  exportedAt: ISODate;
  sessions: Session[];
  plants: Plant[];
  tags: Tag[];
  decorations: Decoration[];
  wallet: Wallet;
  settings: Settings;
  achievements: AchievementProgress[];
  streak: StreakState;
}
