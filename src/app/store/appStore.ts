/**
 * Application data store (Zustand). Holds every persisted entity in memory and mirrors each change
 * to the storage layer through the `persistence` adapter, which is injected at startup so this
 * module stays testable without IndexedDB.
 */
import { create } from 'zustand';
import type {
  AchievementProgress,
  Decoration,
  DecorationKind,
  Plant,
  Session,
  Settings,
  StreakState,
  Tag,
  TilePosition,
  Wallet,
} from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_STREAK, DEFAULT_TAGS, DEFAULT_WALLET } from '@/data/defaults';
import { newId } from '@/lib/id';

export interface AppData {
  sessions: Session[];
  plants: Plant[];
  tags: Tag[];
  decorations: Decoration[];
  wallet: Wallet;
  settings: Settings;
  achievements: AchievementProgress[];
  streak: StreakState;
}

/** What the storage layer must implement. Every method may be async and fire-and-forget. */
export interface Persistence {
  putSession(s: Session): Promise<void>;
  putPlant(p: Plant): Promise<void>;
  putPlants(p: Plant[]): Promise<void>;
  putTag(t: Tag): Promise<void>;
  deleteTag(id: string): Promise<void>;
  putDecoration(d: Decoration): Promise<void>;
  deleteDecoration(id: string): Promise<void>;
  putWallet(w: Wallet): Promise<void>;
  putSettings(s: Settings): Promise<void>;
  putAchievements(a: AchievementProgress[]): Promise<void>;
  putStreak(s: StreakState): Promise<void>;
  replaceAll(data: AppData): Promise<void>;
  clearAll(): Promise<void>;
}

const noopPersistence: Persistence = {
  putSession: async () => {},
  putPlant: async () => {},
  putPlants: async () => {},
  putTag: async () => {},
  deleteTag: async () => {},
  putDecoration: async () => {},
  deleteDecoration: async () => {},
  putWallet: async () => {},
  putSettings: async () => {},
  putAchievements: async () => {},
  putStreak: async () => {},
  replaceAll: async () => {},
  clearAll: async () => {},
};

let persistence: Persistence = noopPersistence;

export function setPersistence(p: Persistence): void {
  persistence = p;
}

function persist(promise: Promise<unknown>): void {
  promise.catch((err) => console.error('[grove] persistence error', err));
}

export interface AppState extends AppData {
  hydrated: boolean;
  hydrate(data: Partial<AppData>): void;
  updateSettings(patch: Partial<Settings>): void;
  recordSession(session: Session, plant: Plant | null): void;
  updateSessionNote(sessionId: string, note: string): void;
  addDew(amount: number): void;
  spendDew(amount: number): boolean;
  buySpecies(speciesId: string, cost: number): boolean;
  grantSpecies(speciesId: string): void;
  buyDecoration(kind: DecorationKind, cost: number): boolean;
  placeDecoration(kind: DecorationKind, tile: TilePosition): Decoration | null;
  moveDecoration(id: string, tile: TilePosition): void;
  removeDecoration(id: string): void;
  movePlant(id: string, tile: TilePosition | null): void;
  addTag(name: string, color: string): Tag;
  updateTag(id: string, patch: Partial<Pick<Tag, 'name' | 'color'>>): void;
  deleteTag(id: string): void;
  setAchievements(list: AchievementProgress[]): void;
  setStreak(streak: StreakState): void;
  addStreakFreeze(count: number): void;
  useStreakFreeze(): boolean;
  importAll(data: AppData): void;
  resetAll(): void;
}

export function emptyData(): AppData {
  return {
    sessions: [],
    plants: [],
    tags: DEFAULT_TAGS.map((t) => ({ ...t })),
    decorations: [],
    wallet: {
      ...DEFAULT_WALLET,
      ownedSpeciesIds: [...DEFAULT_WALLET.ownedSpeciesIds],
      ownedDecorations: {},
    },
    settings: { ...DEFAULT_SETTINGS, pomodoro: { ...DEFAULT_SETTINGS.pomodoro } },
    achievements: [],
    streak: { ...DEFAULT_STREAK, frozenDays: [] },
  };
}

export const useAppStore = create<AppState>()((set, get) => ({
  ...emptyData(),
  hydrated: false,

  hydrate(data) {
    set({ ...data, hydrated: true });
  },

  updateSettings(patch) {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    persist(persistence.putSettings(settings));
  },

  recordSession(session, plant) {
    const sessions = [...get().sessions, session];
    const plants = plant ? [...get().plants, plant] : get().plants;
    set({ sessions, plants });
    persist(persistence.putSession(session));
    if (plant) persist(persistence.putPlant(plant));
    if (session.dewEarned > 0) get().addDew(session.dewEarned);
  },

  updateSessionNote(sessionId, note) {
    const sessions = get().sessions.map((s) => (s.id === sessionId ? { ...s, note } : s));
    set({ sessions });
    const s = sessions.find((x) => x.id === sessionId);
    if (s) persist(persistence.putSession(s));
  },

  addDew(amount) {
    const w = get().wallet;
    const wallet = { ...w, dew: w.dew + amount, totalEarned: w.totalEarned + Math.max(0, amount) };
    set({ wallet });
    persist(persistence.putWallet(wallet));
  },

  spendDew(amount) {
    const w = get().wallet;
    if (w.dew < amount) return false;
    const wallet = { ...w, dew: w.dew - amount };
    set({ wallet });
    persist(persistence.putWallet(wallet));
    return true;
  },

  buySpecies(speciesId, cost) {
    const w = get().wallet;
    if (w.ownedSpeciesIds.includes(speciesId) || w.dew < cost) return false;
    const wallet = { ...w, dew: w.dew - cost, ownedSpeciesIds: [...w.ownedSpeciesIds, speciesId] };
    set({ wallet });
    persist(persistence.putWallet(wallet));
    return true;
  },

  grantSpecies(speciesId) {
    const w = get().wallet;
    if (w.ownedSpeciesIds.includes(speciesId)) return;
    const wallet = { ...w, ownedSpeciesIds: [...w.ownedSpeciesIds, speciesId] };
    set({ wallet });
    persist(persistence.putWallet(wallet));
  },

  buyDecoration(kind, cost) {
    const w = get().wallet;
    if (w.dew < cost) return false;
    const owned = { ...w.ownedDecorations, [kind]: (w.ownedDecorations[kind] ?? 0) + 1 };
    const wallet = { ...w, dew: w.dew - cost, ownedDecorations: owned };
    set({ wallet });
    persist(persistence.putWallet(wallet));
    return true;
  },

  placeDecoration(kind, tile) {
    const w = get().wallet;
    const available =
      (w.ownedDecorations[kind] ?? 0) - get().decorations.filter((d) => d.kind === kind).length;
    if (available <= 0) return null;
    const deco: Decoration = { id: newId(), kind, tile, placedAt: new Date().toISOString() };
    set({ decorations: [...get().decorations, deco] });
    persist(persistence.putDecoration(deco));
    return deco;
  },

  moveDecoration(id, tile) {
    const decorations = get().decorations.map((d) => (d.id === id ? { ...d, tile } : d));
    set({ decorations });
    const d = decorations.find((x) => x.id === id);
    if (d) persist(persistence.putDecoration(d));
  },

  removeDecoration(id) {
    set({ decorations: get().decorations.filter((d) => d.id !== id) });
    persist(persistence.deleteDecoration(id));
  },

  movePlant(id, tile) {
    const plants = get().plants.map((p) => (p.id === id ? { ...p, tile } : p));
    set({ plants });
    const p = plants.find((x) => x.id === id);
    if (p) persist(persistence.putPlant(p));
  },

  addTag(name, color) {
    const tag: Tag = { id: newId(), name: name.trim(), color, createdAt: new Date().toISOString() };
    set({ tags: [...get().tags, tag] });
    persist(persistence.putTag(tag));
    return tag;
  },

  updateTag(id, patch) {
    const tags = get().tags.map((t) => (t.id === id ? { ...t, ...patch } : t));
    set({ tags });
    const t = tags.find((x) => x.id === id);
    if (t) persist(persistence.putTag(t));
  },

  deleteTag(id) {
    // Sessions keep their history; they just lose the tag.
    const sessions = get().sessions.map((s) => (s.tagId === id ? { ...s, tagId: null } : s));
    const changed = sessions.filter((s, i) => s !== get().sessions[i]);
    const settings =
      get().settings.defaultTagId === id
        ? { ...get().settings, defaultTagId: null }
        : get().settings;
    set({ tags: get().tags.filter((t) => t.id !== id), sessions, settings });
    persist(persistence.deleteTag(id));
    changed.forEach((s) => persist(persistence.putSession(s)));
    if (settings !== get().settings) persist(persistence.putSettings(settings));
  },

  setAchievements(list) {
    set({ achievements: list });
    persist(persistence.putAchievements(list));
  },

  setStreak(streak) {
    set({ streak });
    persist(persistence.putStreak(streak));
  },

  addStreakFreeze(count) {
    const wallet = { ...get().wallet, streakFreezes: get().wallet.streakFreezes + count };
    set({ wallet });
    persist(persistence.putWallet(wallet));
  },

  useStreakFreeze() {
    const w = get().wallet;
    if (w.streakFreezes <= 0) return false;
    const wallet = { ...w, streakFreezes: w.streakFreezes - 1 };
    set({ wallet });
    persist(persistence.putWallet(wallet));
    return true;
  },

  importAll(data) {
    set({ ...data, hydrated: true });
    persist(persistence.replaceAll(data));
  },

  resetAll() {
    set({ ...emptyData(), hydrated: true });
    persist(persistence.clearAll());
  },
}));

/** Pick plain data out of the store (for export). */
export function selectData(state: AppState): AppData {
  return {
    sessions: state.sessions,
    plants: state.plants,
    tags: state.tags,
    decorations: state.decorations,
    wallet: state.wallet,
    settings: state.settings,
    achievements: state.achievements,
    streak: state.streak,
  };
}
