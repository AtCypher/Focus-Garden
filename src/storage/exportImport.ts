/**
 * JSON export and import. The export carries a schemaVersion so future versions can migrate old
 * files. Import validates the structure field by field and never throws on bad input: it returns a
 * list of human-readable problems instead.
 */
import type { AppData } from '@/app/store/appStore';
import { emptyData } from '@/app/store/appStore';
import type { ExportFile, Plant, Session, Tag } from '@/types';
import { SPECIES_BY_ID } from '@/data/species';

export const EXPORT_SCHEMA_VERSION = 1;

type Json = Record<string, unknown>;

/** Upgraders for older export files: EXPORT_MIGRATIONS[n] converts version n+1 to n+2. */
export const EXPORT_MIGRATIONS: Array<(file: Json) => Json> = [];

export function buildExport(data: AppData, now = new Date()): ExportFile {
  return {
    app: 'grove',
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    sessions: data.sessions,
    plants: data.plants,
    tags: data.tags,
    decorations: data.decorations,
    wallet: data.wallet,
    settings: data.settings,
    achievements: data.achievements,
    streak: data.streak,
  };
}

export function serializeExport(data: AppData, now = new Date()): string {
  return JSON.stringify(buildExport(data, now), null, 2);
}

export function exportFilename(now = new Date()): string {
  const d = now.toISOString().slice(0, 10);
  return `grove-backup-${d}.json`;
}

export type ImportResult =
  { ok: true; data: AppData; summary: ImportSummary } | { ok: false; errors: string[] };

export interface ImportSummary {
  sessions: number;
  plants: number;
  tags: number;
  decorations: number;
  dew: number;
  exportedAt: string;
  schemaVersion: number;
}

const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const isIso = (v: unknown): v is string => isStr(v) && !Number.isNaN(Date.parse(v));
const oneOf =
  <T extends string>(...values: T[]) =>
  (v: unknown): v is T =>
    isStr(v) && (values as string[]).includes(v);

function checkSession(s: unknown, i: number, errors: string[]): s is Session {
  const at = `sessions[${i}]`;
  if (!isObj(s)) {
    errors.push(`${at} is not an object`);
    return false;
  }
  const ok =
    isStr(s.id) &&
    isIso(s.startedAt) &&
    isIso(s.endedAt) &&
    isNum(s.plannedMinutes) &&
    isNum(s.actualMinutes) &&
    oneOf('countdown', 'pomodoro', 'stopwatch')(s.mode) &&
    oneOf('gentle', 'standard', 'deep')(s.strictness) &&
    isStr(s.speciesId) &&
    (s.tagId === null || isStr(s.tagId)) &&
    oneOf('completed', 'wilted', 'cancelled')(s.outcome) &&
    isStr(s.note) &&
    isNum(s.dewEarned) &&
    (s.round === null || isNum(s.round));
  if (!ok) errors.push(`${at} has missing or invalid fields`);
  return ok;
}

function checkPlant(p: unknown, i: number, errors: string[]): p is Plant {
  const at = `plants[${i}]`;
  if (!isObj(p)) {
    errors.push(`${at} is not an object`);
    return false;
  }
  const tileOk = p.tile === null || (isObj(p.tile) && isNum(p.tile.col) && isNum(p.tile.row));
  const ok =
    isStr(p.id) &&
    isStr(p.sessionId) &&
    isStr(p.speciesId) &&
    oneOf('standard', 'mature', 'ancient')(p.variant) &&
    oneOf('meadow', 'orchard', 'wetland', 'forest', 'desert', 'alpine', 'tropical')(p.biome) &&
    isBool(p.wilted) &&
    isIso(p.grownAt) &&
    tileOk;
  if (!ok) errors.push(`${at} has missing or invalid fields`);
  else if (!SPECIES_BY_ID[p.speciesId as string])
    errors.push(`${at} references unknown species "${String(p.speciesId)}"`);
  return ok;
}

function checkTag(t: unknown, i: number, errors: string[]): t is Tag {
  const ok = isObj(t) && isStr(t.id) && isStr(t.name) && isStr(t.color) && isIso(t.createdAt);
  if (!ok) errors.push(`tags[${i}] has missing or invalid fields`);
  return ok;
}

export function parseImport(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, errors: ['The file is not valid JSON.'] };
  }
  if (!isObj(raw)) return { ok: false, errors: ['The file does not contain a Grove backup.'] };
  if (raw.app !== 'grove')
    return { ok: false, errors: ['This is not a Grove backup (missing "app": "grove").'] };
  if (!isNum(raw.schemaVersion))
    return { ok: false, errors: ['The backup has no schema version.'] };
  if (raw.schemaVersion > EXPORT_SCHEMA_VERSION) {
    return {
      ok: false,
      errors: [
        `This backup was made by a newer Grove (schema ${raw.schemaVersion}). Update the app first.`,
      ],
    };
  }
  let file: Json = raw;
  for (let v = raw.schemaVersion; v < EXPORT_SCHEMA_VERSION; v++)
    file = EXPORT_MIGRATIONS[v - 1](file);

  const errors: string[] = [];
  const sessions = Array.isArray(file.sessions)
    ? file.sessions
    : (errors.push('sessions is missing'), []);
  const plants = Array.isArray(file.plants) ? file.plants : (errors.push('plants is missing'), []);
  const tags = Array.isArray(file.tags) ? file.tags : (errors.push('tags is missing'), []);
  const decorations = Array.isArray(file.decorations) ? file.decorations : [];
  sessions.forEach((s, i) => checkSession(s, i, errors));
  plants.forEach((p, i) => checkPlant(p, i, errors));
  tags.forEach((t, i) => checkTag(t, i, errors));
  if (!isObj(file.wallet) || !isNum(file.wallet.dew) || !Array.isArray(file.wallet.ownedSpeciesIds))
    errors.push('wallet is missing or invalid');
  if (!isObj(file.settings)) errors.push('settings is missing');
  if (errors.length) return { ok: false, errors: errors.slice(0, 10) };

  const defaults = emptyData();
  const wallet = file.wallet as AppData['wallet'];
  const settings = file.settings as Partial<AppData['settings']>;
  const data: AppData = {
    sessions: sessions as Session[],
    plants: plants as Plant[],
    tags: tags as Tag[],
    decorations: decorations as AppData['decorations'],
    wallet: {
      ...defaults.wallet,
      ...wallet,
      ownedSpeciesIds: Array.from(
        new Set([...defaults.wallet.ownedSpeciesIds, ...wallet.ownedSpeciesIds.filter(isStr)]),
      ),
      ownedDecorations: isObj(wallet.ownedDecorations)
        ? (wallet.ownedDecorations as AppData['wallet']['ownedDecorations'])
        : {},
    },
    settings: {
      ...defaults.settings,
      ...settings,
      pomodoro: { ...defaults.settings.pomodoro, ...(settings.pomodoro ?? {}) },
    },
    achievements: Array.isArray(file.achievements)
      ? (file.achievements as AppData['achievements'])
      : [],
    streak: isObj(file.streak)
      ? ({ ...defaults.streak, ...file.streak } as AppData['streak'])
      : defaults.streak,
  };
  return {
    ok: true,
    data,
    summary: {
      sessions: data.sessions.length,
      plants: data.plants.length,
      tags: data.tags.length,
      decorations: data.decorations.length,
      dew: data.wallet.dew,
      exportedAt: isStr(file.exportedAt) ? file.exportedAt : '',
      schemaVersion: raw.schemaVersion,
    },
  };
}

/** Trigger a browser download of a text file. */
export function downloadText(filename: string, text: string, type = 'application/json'): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
