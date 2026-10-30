/**
 * IndexedDB schema and migrations. Bump DB_VERSION and append a migration whenever the stored
 * shape changes. Migrations run in order inside the upgrade transaction and must be idempotent for
 * the version they target.
 */
import {
  openDB,
  type DBSchema,
  type IDBPDatabase,
  type IDBPTransaction,
  type StoreNames,
} from 'idb';
import type {
  AchievementProgress,
  Decoration,
  Plant,
  ProgressState,
  Session,
  Settings,
  StreakState,
  Tag,
  Task,
  Wallet,
} from '@/types';

export const DB_NAME = 'grove';
export const DB_VERSION = 2;

export interface GroveSchema extends DBSchema {
  sessions: { key: string; value: Session; indexes: { byEndedAt: string } };
  plants: { key: string; value: Plant; indexes: { bySession: string } };
  tags: { key: string; value: Tag };
  decorations: { key: string; value: Decoration };
  tasks: { key: string; value: Task };
  kv: {
    key: 'wallet' | 'settings' | 'achievements' | 'streak' | 'progress';
    value: Wallet | Settings | AchievementProgress[] | StreakState | ProgressState;
  };
}

export type GroveDB = IDBPDatabase<GroveSchema>;
type UpgradeTx = IDBPTransaction<GroveSchema, StoreNames<GroveSchema>[], 'versionchange'>;

export type Migration = (db: GroveDB, tx: UpgradeTx) => void;

/** MIGRATIONS[n] upgrades the database TO version n+1. */
export const MIGRATIONS: Migration[] = [
  // v1: initial stores
  (db) => {
    const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
    sessions.createIndex('byEndedAt', 'endedAt');
    const plants = db.createObjectStore('plants', { keyPath: 'id' });
    plants.createIndex('bySession', 'sessionId');
    db.createObjectStore('tags', { keyPath: 'id' });
    db.createObjectStore('decorations', { keyPath: 'id' });
    db.createObjectStore('kv');
  },
  // v2: tasks (ticked off during sessions). Progress lives in kv and needs no store.
  (db) => {
    db.createObjectStore('tasks', { keyPath: 'id' });
  },
];

if (MIGRATIONS.length !== DB_VERSION) {
  throw new Error(`DB_VERSION is ${DB_VERSION} but there are ${MIGRATIONS.length} migrations`);
}

/** Apply migrations from oldVersion (exclusive) to newVersion (inclusive). Exported for tests. */
export function runMigrations(
  db: GroveDB,
  tx: UpgradeTx,
  oldVersion: number,
  newVersion: number,
): number[] {
  const applied: number[] = [];
  for (let v = oldVersion; v < newVersion; v++) {
    MIGRATIONS[v](db, tx);
    applied.push(v + 1);
  }
  return applied;
}

let dbPromise: Promise<GroveDB> | null = null;

export function getDB(): Promise<GroveDB> {
  if (!dbPromise) {
    dbPromise = openDB<GroveSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, tx) {
        runMigrations(db, tx, oldVersion, newVersion ?? DB_VERSION);
      },
      blocked() {
        console.warn('[grove] database upgrade blocked by another tab');
      },
      blocking() {
        // Another tab wants to upgrade: close so it can proceed. The page reloads data on focus.
        dbPromise?.then((db) => db.close());
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

/** Test helper: forget the cached connection (e.g. after deleting the database). */
export function resetDBForTests(): void {
  dbPromise = null;
}
