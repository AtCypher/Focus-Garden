/**
 * Typed access to the Grove database. Implements the Persistence adapter used by the app store and
 * provides loadAll() for hydration. Everything here is the only code that touches IndexedDB, so a
 * sync backend can be layered on later by wrapping these functions.
 */
import type { AppData, Persistence } from '@/app/store/appStore';
import { emptyData } from '@/app/store/appStore';
import type { AchievementProgress, Settings, StreakState, Wallet } from '@/types';
import { getDB } from './db';

export async function loadAll(): Promise<AppData> {
  const db = await getDB();
  const defaults = emptyData();
  const [sessions, plants, tags, decorations, wallet, settings, achievements, streak] =
    await Promise.all([
      db.getAll('sessions'),
      db.getAll('plants'),
      db.getAll('tags'),
      db.getAll('decorations'),
      db.get('kv', 'wallet') as Promise<Wallet | undefined>,
      db.get('kv', 'settings') as Promise<Settings | undefined>,
      db.get('kv', 'achievements') as Promise<AchievementProgress[] | undefined>,
      db.get('kv', 'streak') as Promise<StreakState | undefined>,
    ]);
  // A brand-new database (nothing stored yet) is seeded with the default tags so they persist and
  // export. An existing database keeps whatever tags the user has, even none.
  const brandNew = tags.length === 0 && sessions.length === 0 && settings === undefined;
  if (brandNew) {
    const tx = db.transaction('tags', 'readwrite');
    await Promise.all([...defaults.tags.map((t) => tx.store.put(t)), tx.done]);
  }
  return {
    sessions: sessions.sort((a, b) => a.endedAt.localeCompare(b.endedAt)),
    plants: plants.sort((a, b) => a.grownAt.localeCompare(b.grownAt)),
    tags: brandNew ? defaults.tags : tags,
    decorations,
    wallet: wallet ?? defaults.wallet,
    // Merge so settings added in later versions get their defaults.
    settings: {
      ...defaults.settings,
      ...(settings ?? {}),
      pomodoro: { ...defaults.settings.pomodoro, ...(settings?.pomodoro ?? {}) },
    },
    achievements: achievements ?? defaults.achievements,
    streak: streak ?? defaults.streak,
  };
}

export const idbPersistence: Persistence = {
  async putSession(s) {
    await (await getDB()).put('sessions', s);
  },
  async putPlant(p) {
    await (await getDB()).put('plants', p);
  },
  async putPlants(list) {
    const tx = (await getDB()).transaction('plants', 'readwrite');
    await Promise.all([...list.map((p) => tx.store.put(p)), tx.done]);
  },
  async putTag(t) {
    await (await getDB()).put('tags', t);
  },
  async deleteTag(id) {
    await (await getDB()).delete('tags', id);
  },
  async putDecoration(d) {
    await (await getDB()).put('decorations', d);
  },
  async deleteDecoration(id) {
    await (await getDB()).delete('decorations', id);
  },
  async putWallet(w) {
    await (await getDB()).put('kv', w, 'wallet');
  },
  async putSettings(s) {
    await (await getDB()).put('kv', s, 'settings');
  },
  async putAchievements(a) {
    await (await getDB()).put('kv', a, 'achievements');
  },
  async putStreak(s) {
    await (await getDB()).put('kv', s, 'streak');
  },
  async replaceAll(data) {
    const db = await getDB();
    const tx = db.transaction(['sessions', 'plants', 'tags', 'decorations', 'kv'], 'readwrite');
    await Promise.all([
      tx.objectStore('sessions').clear(),
      tx.objectStore('plants').clear(),
      tx.objectStore('tags').clear(),
      tx.objectStore('decorations').clear(),
      tx.objectStore('kv').clear(),
    ]);
    await Promise.all([
      ...data.sessions.map((s) => tx.objectStore('sessions').put(s)),
      ...data.plants.map((p) => tx.objectStore('plants').put(p)),
      ...data.tags.map((t) => tx.objectStore('tags').put(t)),
      ...data.decorations.map((d) => tx.objectStore('decorations').put(d)),
      tx.objectStore('kv').put(data.wallet, 'wallet'),
      tx.objectStore('kv').put(data.settings, 'settings'),
      tx.objectStore('kv').put(data.achievements, 'achievements'),
      tx.objectStore('kv').put(data.streak, 'streak'),
      tx.done,
    ]);
  },
  async clearAll() {
    const db = await getDB();
    const tx = db.transaction(['sessions', 'plants', 'tags', 'decorations', 'kv'], 'readwrite');
    await Promise.all([
      tx.objectStore('sessions').clear(),
      tx.objectStore('plants').clear(),
      tx.objectStore('tags').clear(),
      tx.objectStore('decorations').clear(),
      tx.objectStore('kv').clear(),
      tx.done,
    ]);
  },
};
